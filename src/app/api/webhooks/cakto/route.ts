import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import crypto from 'crypto'

const PLAN_MAP: Record<string, string> = {
      mensal: 'mensal',
      anual: 'anual',
      vitalicio: 'vitalicio',
      fundador: 'vitalicio',
      'ascend system — mensal': 'mensal',
      'ascend system — anual': 'anual',
      'ascend system — fundador': 'vitalicio',
      'ascend system - mensal': 'mensal',
      'ascend system - anual': 'anual',
      'ascend system - fundador': 'vitalicio',
}

function resolvePlan(productName: string, productId?: string): string {
      const name = productName.toLowerCase()
      for (const [key, plan] of Object.entries(PLAN_MAP)) {
              if (name.includes(key)) return plan
      }
      if (productId) {
              if (productId === process.env.CAKTO_PRODUCT_MENSAL) return 'mensal'
              if (productId === process.env.CAKTO_PRODUCT_ANUAL) return 'anual'
              if (productId === process.env.CAKTO_PRODUCT_FUNDADOR) return 'vitalicio'
      }
      return 'anual'
}

function verifySignature(rawBody: string, signature: string | null): boolean {
      const secret = process.env.CAKTO_WEBHOOK_SECRET
      if (!secret) return true
      if (!signature) return false
      const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

function generateEasyPassword(): string {
      const words = [
              'gato', 'leao', 'lobo', 'aqua', 'fogo', 'vento', 'terra', 'sol', 'lua', 'star',
              'azul', 'verde', 'ouro', 'prata', 'neve', 'rio', 'mar', 'ceu', 'hero', 'vida',
              'alma', 'base', 'core', 'nova', 'mega', 'ultra', 'top', 'max', 'zen', 'rex'
            ]
      const w1 = words[Math.floor(Math.random() * words.length)]
      const w2 = words[Math.floor(Math.random() * words.length)]
      const num = Math.floor(Math.random() * 90) + 10
      return `${w1}${num}${w2}`
}

async function sendWelcomeEmail(email: string, name: string, password: string): Promise<void> {
      const resendKey = process.env.RESEND_API_KEY
      if (!resendKey || resendKey === 'CONFIGURE_RESEND_API_KEY_AQUI') {
              console.warn('[Cakto webhook] RESEND_API_KEY nao configurada — email nao enviado')
              return
      }

  const firstName = name?.split(' ')[0] || 'Guerreiro'
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.ascendsystem.com.br').replace(/\/$/, '')
      const loginUrl = `${appUrl}/login`

  const html = `<!DOCTYPE html>
  <html lang="pt-BR">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao Ascend System</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 20px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);border-radius:16px;overflow:hidden;border:1px solid rgba(139,92,246,0.3);">
  <tr>
  <td style="padding:40px 40px 20px;text-align:center;background:linear-gradient(135deg,rgba(139,92,246,0.2),rgba(59,130,246,0.2));">
  <div style="font-size:32px;font-weight:900;letter-spacing:3px;color:#ffffff;text-transform:uppercase;">&#9889; ASCEND SYSTEM</div>
  <div style="color:rgba(139,92,246,1);font-size:13px;letter-spacing:5px;text-transform:uppercase;margin-top:6px;">Desperte. Cumpra as missoes. Torne-se mais forte.</div>
  </td>
  </tr>
  <tr>
  <td style="padding:30px 40px;">
  <p style="color:#e2e8f0;font-size:18px;margin:0 0 16px;">Ola, <strong style="color:#a78bfa;">${firstName}</strong>! &#127881;</p>
  <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 24px;">
  Seu acesso ao <strong style="color:#ffffff;">Ascend System</strong> foi <strong style="color:#34d399;">ativado com sucesso</strong>! Sua jornada de evolucao comeca agora.
  </p>
  <div style="background:rgba(0,0,0,0.4);border:1px solid rgba(139,92,246,0.4);border-radius:12px;padding:24px;margin:24px 0;">
  <div style="color:#a78bfa;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;font-weight:700;">&#128274; Suas Credenciais de Acesso</div>
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="padding:8px 0;">
  <span style="color:#64748b;font-size:13px;display:block;margin-bottom:4px;">E-mail:</span>
  <span style="color:#e2e8f0;font-size:16px;font-weight:600;background:rgba(139,92,246,0.1);padding:8px 12px;border-radius:6px;display:block;letter-spacing:0.5px;">${email}</span>
  </td></tr>
  <tr><td style="padding:8px 0;">
  <span style="color:#64748b;font-size:13px;display:block;margin-bottom:4px;">Senha temporaria:</span>
  <span style="color:#fbbf24;font-size:22px;font-weight:700;background:rgba(251,191,36,0.1);padding:10px 16px;border-radius:6px;display:block;letter-spacing:3px;font-family:monospace;">${password}</span>
  </td></tr>
  <tr><td style="padding:8px 0;">
  <span style="color:#64748b;font-size:13px;display:block;margin-bottom:4px;">Site de acesso:</span>
  <a href="${loginUrl}" style="color:#60a5fa;font-size:15px;font-weight:600;background:rgba(59,130,246,0.1);padding:8px 12px;border-radius:6px;display:block;letter-spacing:0.5px;text-decoration:none;">${loginUrl}</a>
  </td></tr>
  </table>
  </div>
  <div style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:8px;padding:12px 16px;margin:0 0 24px;">
  <p style="color:#fbbf24;font-size:13px;margin:0;">&#9888;&#65039; <strong>Importante:</strong> Esta e uma senha temporaria. Apos o primeiro acesso, recomendamos que voce altere sua senha nas configuracoes do perfil.</p>
  </div>
  <div style="text-align:center;margin:28px 0;">
  <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">&#128640; Entrar no Sistema Agora</a>
  </div>
  <p style="color:#64748b;font-size:13px;line-height:1.6;margin:24px 0 0;">
  Se tiver alguma duvida, entre em contato: <a href="mailto:guilhermemulinarelima@gmail.com" style="color:#a78bfa;">guilhermemulinarelima@gmail.com</a>
  </p>
  </td>
  </tr>
  <tr>
  <td style="padding:20px 40px;background:rgba(0,0,0,0.3);text-align:center;">
  <p style="color:#475569;font-size:12px;margin:0;">&#169; 2026 Ascend System. Todos os direitos reservados.</p>
  </td>
  </tr>
  </table>
  </td></tr>
  </table>
  </body>
  </html>`

  try {
          const res = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                                'Authorization': `Bearer ${resendKey}`,
                                'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                                from: 'Ascend System <noreply@ascendsystem.com.br>',
                                to: [email],
                                subject: '&#9889; Bem-vindo ao Ascend System — Suas credenciais de acesso',
                                html,
                    }),
          })
          if (!res.ok) {
                    const err = await res.text()
                    console.error('[Cakto webhook] Erro ao enviar email via Resend:', err)
          } else {
                    console.log(`[Cakto webhook] Email enviado com sucesso para: ${email}`)
          }
  } catch (err) {
          console.error('[Cakto webhook] Falha ao enviar email:', err)
  }
}

export async function POST(req: NextRequest) {
      const rawBody = await req.text()

  const signature = req.headers.get('x-cakto-signature') ?? req.headers.get('x-webhook-signature')
      if (!verifySignature(rawBody, signature)) {
              return NextResponse.json({ error: 'Assinatura invalida' }, { status: 401 })
      }

  let payload: any
      try {
              payload = JSON.parse(rawBody)
      } catch {
              return NextResponse.json({ error: 'Payload invalido' }, { status: 400 })
      }

  const event: string = payload.event ?? payload.type ?? ''
      const approvedEvents = ['purchase.approved', 'order.approved', 'payment.approved', 'subscription.activated', 'sale.approved']
      if (!approvedEvents.some(e => event.includes(e.split('.')[1] ?? e))) {
              return NextResponse.json({ ok: true, ignored: true })
      }

  const data = payload.data ?? payload.order ?? payload.purchase ?? payload
      const customer = data.customer ?? data.subscriber ?? data.buyer ?? {}
            const product = data.product ?? data.item ?? {}

                  const email: string | undefined = customer.email?.toLowerCase()?.trim()
      const name: string | undefined = customer.name?.trim() ?? 'Guerreiro'
      const orderId: string | undefined = data.id ?? data.order_id ?? data.purchase_id
      const planKey = resolvePlan(product.name ?? '', product.id)

  if (!email || !email.includes('@')) {
          console.error('[Cakto webhook] Email invalido:', email)
          return NextResponse.json({ error: 'Email do comprador nao encontrado' }, { status: 400 })
  }

  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } })
      if (existingUser) {
              console.log(`[Cakto] Usuario ja cadastrado: ${email}`)
              return NextResponse.json({ ok: true, existing: true })
      }

  const tempPassword = generateEasyPassword()
      const passwordHash = await hashPassword(tempPassword)

  try {
          const missions = await prisma.mission.findMany({ where: { minDayUnlock: 0 }, select: { id: true } })
          await prisma.$transaction(async tx => {
                    await tx.user.create({
                                data: {
                                              name: name ?? 'Guerreiro',
                                              email,
                                              passwordHash,
                                              attributes: { create: {} },
                                              userMissions: { create: missions.map(m => ({ missionId: m.id })) },
                                },
                    })
                    await tx.pendingMember.deleteMany({ where: { email } })
          })

        console.log(`[Cakto] Usuario criado: ${email} | plano: ${planKey}`)
          await sendWelcomeEmail(email, name ?? 'Guerreiro', tempPassword)

        return NextResponse.json({ ok: true, created: true })
  } catch (error) {
          console.error('[Cakto webhook] Erro ao criar usuario:', error)
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          const pending = await prisma.pendingMember.upsert({
                    where: { email },
                    update: { name, planKey, orderId, expiresAt, token: crypto.randomUUID() },
                    create: { email, name, planKey, orderId, expiresAt },
          })
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.ascendsystem.com.br'
          const registerUrl = `${baseUrl}/register?token=${pending.token}&email=${encodeURIComponent(email)}`
          console.log(`[Cakto] Fallback PendingMember: ${email} | link: ${registerUrl}`)
          return NextResponse.json({ ok: true, fallback: true, registerUrl })
  }
}
