import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { sendAccessEmail, generateTemporaryPassword, planLabel } from '@/lib/resend'

/**
 * Reenvio manual do e-mail de acesso (gera NOVA senha temporária).
 * Protegido por header `x-admin-key` == ADMIN_RESEND_KEY.
 *
 * Uso:
 *   curl -X POST https://app/api/admin/resend-access \
 *     -H "x-admin-key: <ADMIN_RESEND_KEY>" \
 *     -H "Content-Type: application/json" \
 *     -d '{"email":"comprador@email.com"}'
 */
export async function POST(req: NextRequest) {
  const adminKey = process.env.ADMIN_RESEND_KEY
  if (!adminKey) {
    return NextResponse.json({ error: 'ADMIN_RESEND_KEY não configurada no servidor' }, { status: 503 })
  }
  if (req.headers.get('x-admin-key') !== adminKey) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { email } = await req.json().catch(() => ({}))
  const normalized = typeof email === 'string' ? email.toLowerCase().trim() : ''
  if (!normalized || !normalized.includes('@')) {
    return NextResponse.json({ error: 'Informe um e-mail válido' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: normalized }, select: { id: true, name: true, plan: true } })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.ascendsystem.com.br').replace(/\/$/, '')
  const tempPassword = generateTemporaryPassword()

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(tempPassword), accessEmailStatus: 'pending' },
  })

  const sent = await sendAccessEmail({
    name: user.name, email: normalized, temporaryPassword: tempPassword,
    appUrl, planName: planLabel(user.plan),
  })

  await prisma.user.update({
    where: { id: user.id },
    data: { accessEmailStatus: sent.ok ? 'sent' : 'failed' },
  }).catch(() => {})

  if (!sent.ok) {
    return NextResponse.json({ ok: false, error: `Falha no envio: ${sent.error}` }, { status: 502 })
  }
  // Nunca retorna a senha no corpo da resposta — ela vai apenas por e-mail.
  return NextResponse.json({ ok: true, message: `E-mail de acesso reenviado para ${normalized}` })
}
