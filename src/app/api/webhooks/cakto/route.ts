import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { sendAccessEmail, generateTemporaryPassword, planLabel } from '@/lib/resend'
import crypto from 'crypto'

// ── Mapeamento produto/oferta Cakto → plano interno ──
const PLAN_MAP: Record<string, string> = {
  mensal: 'mensal',
  anual: 'anual',
  vitalicio: 'vitalicio',
  fundador: 'vitalicio',
}

function resolvePlan(productName: string, offerName?: string, productId?: string): string {
  const haystack = `${productName} ${offerName ?? ''}`.toLowerCase()
  if (haystack.includes('fundador') || haystack.includes('vitalic')) return 'vitalicio'
  if (haystack.includes('anual')) return 'anual'
  if (haystack.includes('mensal')) return 'mensal'
  for (const [key, plan] of Object.entries(PLAN_MAP)) {
    if (haystack.includes(key)) return plan
  }
  if (productId) {
    if (productId === process.env.CAKTO_PRODUCT_MENSAL) return 'mensal'
    if (productId === process.env.CAKTO_PRODUCT_ANUAL) return 'anual'
    if (productId === process.env.CAKTO_PRODUCT_FUNDADOR) return 'vitalicio'
  }
  return 'anual'
}

// ── Validação de assinatura (se a Cakto fornecer secret) ──
function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.CAKTO_WEBHOOK_SECRET
  if (!secret) return true // sem secret configurado, aceita (recomenda-se configurar em produção)
  if (!signature) return false
  try {
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
    const a = Buffer.from(signature)
    const b = Buffer.from(expected)
    return a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

// ── Eventos de pagamento aprovado ──
const APPROVED_KEYWORDS = ['approved', 'activated', 'paid', 'completed', 'aprovad']
function isApprovedEvent(event: string, status?: string): boolean {
  const e = `${event} ${status ?? ''}`.toLowerCase()
  return APPROVED_KEYWORDS.some(k => e.includes(k))
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  // 1) Assinatura
  const signature = req.headers.get('x-cakto-signature') ?? req.headers.get('x-webhook-signature')
  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  // 2) Payload
  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const data = payload.data ?? payload.order ?? payload.purchase ?? payload
  const customer = data.customer ?? data.subscriber ?? data.buyer ?? {}
  const product = data.product ?? data.item ?? {}

  const event: string = payload.event ?? payload.type ?? ''
  const status: string = data.status ?? payload.status ?? ''
  const transactionId: string | undefined =
    data.id ?? data.transaction_id ?? data.order_id ?? data.purchase_id ?? payload.id
  const eventId: string | undefined = payload.event_id ?? payload.id

  // 3) Ignora eventos que não sejam pagamento aprovado
  if (!isApprovedEvent(event, status)) {
    return NextResponse.json({ ok: true, ignored: true, reason: 'evento não é pagamento aprovado' })
  }

  const email: string | undefined = customer.email?.toLowerCase()?.trim()
  const name: string = customer.name?.trim() || 'Guerreiro'
  const planKey = resolvePlan(product.name ?? '', data.offer?.name ?? product.offer ?? '', product.id)

  // 4) E-mail válido obrigatório
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

    // ── 6a) Usuário JÁ existe → apenas atualiza o plano (não reenvia senha) ──
    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          plan: planKey,
          paymentStatus: 'APPROVED',
          caktoTransactionId: transactionId ?? null,
          caktoProductName: product.name ?? null,
          purchaseDate: new Date(),
        },
      })
      console.log(`[Cakto] Plano atualizado para usuário existente: ${email} → ${planKey}`)
      await recordWebhook({ eventId, transactionId, email, status: 'processed', action: 'updated', emailStatus: 'sent', rawBody })
      return NextResponse.json({ ok: true, updated: true })
    }

    // ── 6b) Usuário NOVO → cria com senha temporária forte ──
    const tempPassword = generateTemporaryPassword()
    const passwordHash = await hashPassword(tempPassword)
    const missions = await prisma.mission.findMany({ where: { minDayUnlock: 0 }, select: { id: true } })

    await prisma.$transaction(async tx => {
      await tx.user.create({
        data: {
          name, email, passwordHash,
          plan: planKey,
          paymentStatus: 'APPROVED',
          caktoTransactionId: transactionId ?? null,
          caktoProductName: product.name ?? null,
          purchaseDate: new Date(),
          accessEmailStatus: 'pending',
          attributes: { create: {} },
          userMissions: { create: missions.map(m => ({ missionId: m.id })) },
        },
      })
      await tx.pendingMember.deleteMany({ where: { email } })
    })
    console.log(`[Cakto] Usuário criado: ${email} | plano: ${planKey}`)

    // 7) Envia e-mail de acesso (não quebra o webhook se falhar)
    const sent = await sendAccessEmail({
      name, email, temporaryPassword: tempPassword, appUrl, planName: planLabel(planKey),
    })
    const emailStatus = sent.ok ? 'sent' : 'failed'
    await prisma.user.update({ where: { email }, data: { accessEmailStatus: emailStatus } }).catch(() => {})
    if (sent.ok) console.log(`[Cakto] E-mail de acesso enviado: ${email}`)
    else console.error(`[Cakto] Falha ao enviar e-mail de acesso: ${email} (${sent.error})`)

    // 8) Registra processamento (idempotência + auditoria)
    await recordWebhook({ eventId, transactionId, email, status: 'processed', action: 'created', emailStatus, rawBody })

    return NextResponse.json({ ok: true, created: true, emailStatus })
  } catch (error) {
    console.error('[Cakto] Erro ao processar pagamento:', error)
    // Fallback: convite via token para o comprador concluir o cadastro
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const pending = await prisma.pendingMember.upsert({
      where: { email },
      update: { name, planKey, orderId: transactionId, expiresAt, token: crypto.randomUUID() },
      create: { email, name, planKey, orderId: transactionId, expiresAt },
    }).catch(() => null)
    await recordWebhook({ eventId, transactionId, email, status: 'error', action: 'fallback', rawBody })
    const registerUrl = pending ? `${appUrl}/register?token=${pending.token}&email=${encodeURIComponent(email)}` : null
    return NextResponse.json({ ok: true, fallback: true, registerUrl })
  }
}

// ── Registro de webhook processado (auditoria + dedup) ──
async function recordWebhook(p: {
  eventId?: string; transactionId?: string; email?: string
  status: string; action: string; emailStatus?: string; rawBody: string
}) {
  try {
    await prisma.processedWebhook.create({
      data: {
        provider: 'cakto',
        eventId: p.eventId ?? null,
        transactionId: p.transactionId ?? null,
        email: p.email ?? null,
        status: p.status,
        action: p.action,
        emailStatus: p.emailStatus ?? null,
        rawPayload: p.rawBody.slice(0, 8000), // limita tamanho
      },
    })
  } catch (e) {
    // Não falha o webhook por causa do log (ex.: colisão de unique em retry)
    console.warn('[Cakto] Não foi possível registrar webhook:', (e as Error).message.split('\n')[0])
  }
}
