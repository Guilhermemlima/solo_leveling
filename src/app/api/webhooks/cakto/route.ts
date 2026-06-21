import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

// Mapeamento: nome do produto no Cakto → planKey interno
// Configure os nomes exatos dos seus produtos no painel da Cakto
const PLAN_MAP: Record<string, string> = {
  mensal:    'mensal',
  anual:     'anual',
  vitalicio: 'vitalicio',
  fundador:  'vitalicio',
  'ascend system — mensal':    'mensal',
  'ascend system — anual':     'anual',
  'ascend system — fundador':  'vitalicio',
  'ascend system - mensal':    'mensal',
  'ascend system - anual':     'anual',
  'ascend system - fundador':  'vitalicio',
}

function resolvePlan(productName: string, productId?: string): string {
  const name = productName.toLowerCase()
  for (const [key, plan] of Object.entries(PLAN_MAP)) {
    if (name.includes(key)) return plan
  }
  // fallback por env var: CAKTO_PRODUCT_MENSAL=id1, CAKTO_PRODUCT_ANUAL=id2, etc.
  if (productId) {
    if (productId === process.env.CAKTO_PRODUCT_MENSAL)    return 'mensal'
    if (productId === process.env.CAKTO_PRODUCT_ANUAL)     return 'anual'
    if (productId === process.env.CAKTO_PRODUCT_FUNDADOR)  return 'vitalicio'
  }
  return 'anual'
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.CAKTO_WEBHOOK_SECRET
  if (!secret) return true // sem secret configurado, aceita tudo (não recomendado em produção)
  if (!signature) return false
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  // Verificação de assinatura
  const signature = req.headers.get('x-cakto-signature') ?? req.headers.get('x-webhook-signature')
  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  // Suporte a múltiplos formatos de webhook da Cakto
  const event: string = payload.event ?? payload.type ?? ''
  const approvedEvents = ['purchase.approved', 'order.approved', 'payment.approved', 'subscription.activated', 'sale.approved']
  if (!approvedEvents.some(e => event.includes(e.split('.')[1] ?? e))) {
    // Evento que não é de aprovação — responde 200 mas não processa
    return NextResponse.json({ ok: true, ignored: true })
  }

  // Extração dos dados (formatos diferentes da Cakto)
  const data = payload.data ?? payload.order ?? payload.purchase ?? payload
  const customer = data.customer ?? data.subscriber ?? data.buyer ?? {}
  const product  = data.product ?? data.item ?? {}

  const email: string | undefined = customer.email?.toLowerCase()?.trim()
  const name:  string | undefined = customer.name?.trim()
  const orderId: string | undefined = data.id ?? data.order_id ?? data.purchase_id
  const planKey = resolvePlan(product.name ?? '', product.id)

  if (!email || !email.includes('@')) {
    console.error('[Cakto webhook] Email inválido:', email)
    return NextResponse.json({ error: 'Email do comprador não encontrado' }, { status: 400 })
  }

  // Se usuário já existe → apenas registra a compra (acesso já está ativo)
  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existingUser) {
    console.log(`[Cakto] Usuário já cadastrado: ${email}`)
    return NextResponse.json({ ok: true, existing: true })
  }

  // Cria ou atualiza o PendingMember para esse e-mail
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
  const pending = await prisma.pendingMember.upsert({
    where: { email },
    update: { name, planKey, orderId, expiresAt, token: crypto.randomUUID() },
    create: { email, name, planKey, orderId, expiresAt },
  })

  // URL de registro com o token pré-validado
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ascendsystem.com.br'
  const registerUrl = `${baseUrl}/register?token=${pending.token}&email=${encodeURIComponent(email)}`

  console.log(`[Cakto] PendingMember criado: ${email} | plano: ${planKey} | link: ${registerUrl}`)

  // TODO: quando tiver serviço de e-mail, enviar registerUrl para o comprador
  // await sendWelcomeEmail(email, name, registerUrl)

  return NextResponse.json({ ok: true, registerUrl })
}
