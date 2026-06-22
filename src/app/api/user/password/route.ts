import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { comparePassword, hashPassword, getAuthUser } from '@/lib/auth'
import { clientKey, rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const limiter = rateLimit(clientKey(req, 'change-password', auth.userId), 5, 15 * 60_000)
  if (!limiter.allowed) return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' }, { status: 429 })

  const { currentPassword, newPassword } = await req.json().catch(() => ({}))
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Informe a senha atual e a nova senha' }, { status: 400 })
  }
  if (typeof newPassword !== 'string' || newPassword.length < 8 || !/\d/.test(newPassword)) {
    return NextResponse.json({ error: 'A nova senha deve ter ao menos 8 caracteres e 1 número' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { passwordHash: true } })
  if (!user || !(await comparePassword(currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 403 })
  }
  if (await comparePassword(newPassword, user.passwordHash)) {
    return NextResponse.json({ error: 'A nova senha deve ser diferente da atual' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: auth.userId },
    data: { passwordHash: await hashPassword(newPassword) },
  })

  return NextResponse.json({ ok: true, message: 'Senha alterada com sucesso' })
}
