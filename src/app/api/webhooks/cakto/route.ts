import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { sendAccessEmail, generateTemporaryPassword, planLabel } from '@/lib/resend'
import { grantPlanRewards } from '@/lib/plan-rewards'
import crypto from 'crypto'

// ── Mapeamento produto/oferta Cakto → plano interno ──────────────────────────
const PLAN_MAP: Record<string, string> = {
  mensal:   'mensal',
  anual:    'anual',
  vitalicio:'vitalicio',
  fundador: 'vitalicio',
}

function resolvePlan(productName: string, offerName?: string, productId?: string): string {
  const haystack = `${productName} ${offerName ?? ''}`.toLowerCase()
  if (haystack.includes('fundador') || haystack.includes('vitalic')) return 'vitalicio'
  if (haystack.includes('anual'))   return 'anual'
  if (haystack.includes('mensal'))  return 'mensal'
  for (const [key, plan] of Object.entries(PLAN_MAP)) {
    if (haystack.includes(key)) return plan
  }
  if (productId) {
    if (productId === process.env.CAKTO_PRODUCT_MENSAL)   return 'mensal'
    if (productId === process.env.CAKTO_PRODUCT_ANUAL)    return 'anual'
    if (productId === process.env.CAKTO_PRODUCT_FUNDADOR) return 'vitalicio'
  }
  return 'anual'
}

// Comparação resistente a timing attack
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return crypto.timingSafeEqual(ba, bb)
}

/**
 * Validação de origem do webhook Cakto.
 *
 * Estratégia multicamadas (tolerante ao formato real da Cakto):
 * 1) Token estático no header (x-cakto-signature / x-webhook-signature / authorization)
 * 2) Campo secret/token no corpo JSON
 * 3) HMAC-SHA256 do corpo bruto (hex)
 * 4) Token estático como query param (?token=SECRET) — para plataformas sem suporte a headers
 *
 * Se CAKTO_WEBHOOK_SECRET não estiver configurado → aceita tudo (modo dev).
 */
function verifyOrigin(
  rawBody: string,
  headerSig: string | null,
  queryToken: string | null,
  payload: unknown,
): boolean {
  const secret = process.env.CAKTO_WEBHOOK_SECRET
  if (!secret) return true // sem secret configurado → modo aberto

  const p = payload as Record<string, unknown>

  // 1) Token estático em header
  if (headerSig) {
    const clean = headerSig.replace(/^Bearer\s+/i, '').trim()
    if (safeEqual(clean, secret)) return true
  }

  // 2) Token como query parameter
  if (queryToken && safeEqual(queryToken, secret)) return true

  // 3) Secret/token dentro do corpo
  const bodySecret = p?.secret ?? p?.token ?? (p?.data as any)?.secret ?? p?.webhook_secret
  if (typeof bodySecret === 'string' && safeEqual(bodySecret, secret)) return true

  // 4) HMAC-SHA256 do corpo bruto (assinatura calculada)
  if (headerSig) {
    try {
      const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
      if (safeEqual(headerSig.trim(), expected)) return true
      // também tenta com prefixo "sha256="
      if (safeEqual(headerSig.replace(/^sha256=/i, '').trim(), expected)) return true
    } catch { /* ignore */ }
  }

  return false
}

// ── Eventos que indicam pagamento aprovado ────────────────────────────────────
const APPROVED_KEYWORDS = ['approved', 'activated', 'paid', 'completed', 'aprovad', 'purchase_approved']
function isApprovedEvent(event: string, status?: string): boolean {
  const e = `${event} ${status ?? ''}`.toLowerCase()
  return APPROVED_KEYWORDS.some(k => e.includes(k))
}

// ── Handler principal ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  // 1) Parse do payload
  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  // 2) Validação de origem (multicamadas)
  const signature =
    req.headers.get('x-cakto-signature') ??
    req.headers.get('x-webhook-signature') ??
    req.headers.get('authorization')
  const queryToken = req.nextUrl.searchParams.get('token')

  if (!verifyOrigin(rawBody, signature, queryToken, payload)) {
    // Diagnóstico: registra headers + corpo para identificar formato real da Cakto
    try {
      const headersObj: Record<string, string> = {}
      req.headers.forEach((v, k) => { headersObj[k] = v })
      await prisma.processedWebhook.create({
        data: {
          provider: 'cakto', status: 'auth_failed', action: 'signature_mismatch',
          email: (payload as any)?.data?.customer?.email ?? (payload as any)?.customer?.email ?? null,
          rawPayload: JSON.stringify({ headers: headersObj, body: payload }).slice(0, 8000),
        },
      })
    } catch { /* não falha por causa do log */ }
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  const p = payload as Record<string, unknown>
  const data     = (p.data ?? p.order ?? p.purchase ?? p) as Record<string, unknown>
  const customer = (data.customer ?? data.subscriber ?? data.buyer ?? {}) as Record<string, unknown>
  const product  = (data.product  ?? data.item ?? {})  as Record<string, unknown>

  const event:         string = String(p.event ?? p.type ?? '')
  const status:        string = String(data.status ?? p.status ?? '')
  const transactionId: string | undefined =
    String(data.id ?? data.transaction_id ?? data.order_id ?? data.purchase_id ?? p.id ?? '').trim() || undefined
  const eventId: string | undefined =
    String(p.event_id ?? p.id ?? '').trim() || undefined

  // 3) Ignora eventos que não sejam pagamento aprovado
  if (!isApprovedEvent(event, status)) {
    return NextResponse.json({ ok: true, ignored: true, reason: 'evento não é pagamento aprovado' })
  }

  const email: string | undefined = String(customer.email ?? '').toLowerCase().trim() || undefined
  const name:  string = String(customer.name ?? '').trim() || 'Guerreiro'
  const planKey = resolvePlan(
    String(product.name ?? ''),
    String((data.offer as any)?.name ?? product.offer ?? ''),
    String(product.id ?? ''),
  )

  // 4) E-mail válido é obrigatório
  if (!email || !email.includes('@')) {
    console.error('[Cakto] Pagamento aprovado sem e-mail válido:', email)
    await recordWebhook({ eventId, transactionId, email, status: 'error', action: 'no_email', rawBody })
    return NextResponse.json({ error: 'E-mail do comprador não encontrado' }, { status: 400 })
  }

  // 5) Idempotência — já processamos esta transação?
  if (transactionId) {
    const seen = await prisma.processedWebhook.findFirst({
      where: { provider: 'cakto', transactionId },
    })
    if (seen) {
      console.log(`[Cakto] Webhook duplicado ignorado (tx ${transactionId})`)
      return NextResponse.json({ ok: true, duplicate: true })
    }
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.ascendsystem.com.br').replace(/\/$/, '')

  try {
    const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } })

    // ── 6a) Usuário JÁ existe → atualiza plano e reenvia e-mail de acesso com nova senha ──
    if (existingUser) {
      // Gera nova senha temporária para o usuário existente ter acesso imediato
      const tempPassword = generateTemporaryPassword()
      const passwordHash = await hashPassword(tempPassword)

      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          plan:               planKey,
          paymentStatus:      'APPROVED',
          caktoTransactionId: transactionId ?? null,
          caktoProductName:   String(product.name ?? '') || null,
          purchaseDate:       new Date(),
          passwordHash,
          accessEmailStatus:  'pending',
        },
      })
      console.log(`[Cakto] Plano atualizado para usuário existente: ${email} → ${planKey}`)

      // Recompensas de boas-vindas do plano (dedup por transactionId garante 1x por compra)
      await grantPlanRewards(existingUser.id, planKey).catch(() => {})

      // Envia e-mail com novos dados de acesso
      const sent = await sendAccessEmail({
        name, email, temporaryPassword: tempPassword,
        appUrl, planName: planLabel(planKey),
      })
      const emailStatus = sent.ok ? 'sent' : 'failed'
      await prisma.user.update({ where: { id: existingUser.id }, data: { accessEmailStatus: emailStatus } }).catch(() => {})
      if (sent.ok) console.log(`[Cakto] E-mail de acesso reenviado: ${email}`)
      else         console.error(`[Cakto] Falha ao reenviar e-mail: ${email} (HTTP ${sent.error})`)

      await recordWebhook({ eventId, transactionId, email, status: 'processed', action: 'updated', emailStatus, rawBody })
      return NextResponse.json({ ok: true, updated: true, emailStatus })
    }

    // ── 6b) Usuário NOVO → cria conta com senha temporária segura ──
    const tempPassword = generateTemporaryPassword()
    const passwordHash = await hashPassword(tempPassword)
    const missions = await prisma.mission.findMany({ where: { minDayUnlock: 0 }, select: { id: true } })

    const createdUser = await prisma.$transaction(async tx => {
      const u = await tx.user.create({
        data: {
          name, email, passwordHash,
          plan:               planKey,
          paymentStatus:      'APPROVED',
          caktoTransactionId: transactionId ?? null,
          caktoProductName:   String(product.name ?? '') || null,
          purchaseDate:       new Date(),
          accessEmailStatus:  'pending',
          attributes:  { create: {} },
          userMissions: { create: missions.map(m => ({ missionId: m.id })) },
        },
        select: { id: true },
      })
      await tx.pendingMember.deleteMany({ where: { email } })
      return u
    })
    console.log(`[Cakto] Usuário criado: ${email} | plano: ${planKey}`)

    // Recompensas de boas-vindas do plano
    await grantPlanRewards(createdUser.id, planKey).catch(() => {})

    // 7) Envia e-mail de acesso (não quebra o webhook se falhar)
    const sent = await sendAccessEmail({
      name, email, temporaryPassword: tempPassword,
      appUrl, planName: planLabel(planKey),
    })
    const emailStatus = sent.ok ? 'sent' : 'failed'
    await prisma.user.update({ where: { email }, data: { accessEmailStatus: emailStatus } }).catch(() => {})
    if (sent.ok) console.log(`[Cakto] E-mail de acesso enviado: ${email}`)
    else         console.error(`[Cakto] Falha ao enviar e-mail: ${email} (HTTP ${sent.error})`)

    // 8) Registra processamento (idempotência + auditoria)
    await recordWebhook({ eventId, transactionId, email, status: 'processed', action: 'created', emailStatus, rawBody })
    return NextResponse.json({ ok: true, created: true, emailStatus })

  } catch (error) {
    console.error('[Cakto] Erro ao processar pagamento:', error)
    // Fallback: cria convite por token para o comprador concluir o cadastro manualmente
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const pending = await prisma.pendingMember.upsert({
      where:  { email },
      update: { name, planKey, orderId: transactionId, expiresAt, token: crypto.randomUUID() },
      create: { email, name, planKey, orderId: transactionId, expiresAt },
    }).catch(() => null)
    await recordWebhook({ eventId, transactionId, email, status: 'error', action: 'fallback', rawBody })
    const registerUrl = pending
      ? `${appUrl}/register?token=${pending.token}&email=${encodeURIComponent(email)}`
      : null
    return NextResponse.json({ ok: true, fallback: true, registerUrl })
  }
}

// ── Registro de webhook (auditoria + idempotência) ────────────────────────────
async function recordWebhook(p: {
  eventId?: string; transactionId?: string; email?: string
  status: string;  action: string;          emailStatus?: string; rawBody: string
}) {
  try {
    await prisma.processedWebhook.create({
      data: {
        provider:       'cakto',
        eventId:        p.eventId        ?? null,
        transactionId:  p.transactionId  ?? null,
        email:          p.email          ?? null,
        status:         p.status,
        action:         p.action,
        emailStatus:    p.emailStatus    ?? null,
        rawPayload:     p.rawBody.slice(0, 8000),
      },
    })
  } catch (e) {
    console.warn('[Cakto] Não foi possível registrar webhook:', (e as Error).message.split('\n')[0])
  }
}
