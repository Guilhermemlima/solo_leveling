import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth'
import { parseJson, registerSchema } from '@/lib/validation'
import { clientKey, rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const limiter = rateLimit(clientKey(req, 'register'), 5, 60 * 60_000)
  if (!limiter.allowed) return NextResponse.json({ error: 'Muitas contas criadas neste dispositivo' }, { status: 429 })

  const body = await req.json()
  const parsed = parseJson(registerSchema, body)
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { name, email, password } = parsed.data
  const token: string | undefined = body.token

  // Verificar token de compra obrigatório
  if (!token) {
    return NextResponse.json(
      { error: 'Acesso permitido apenas após a compra de um plano. Escolha seu plano na página inicial.' },
      { status: 403 }
    )
  }
  const pending = await prisma.pendingMember.findUnique({ where: { token } })
  if (!pending) {
    return NextResponse.json({ error: 'Convite inválido ou já utilizado.' }, { status: 403 })
  }
  if (pending.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Seu convite expirou. Entre em contato com o suporte.' }, { status: 403 })
  }
  if (pending.email !== email.toLowerCase().trim()) {
    return NextResponse.json({ error: 'O e-mail não corresponde ao convite de compra.' }, { status: 403 })
  }

  if (await prisma.user.findUnique({ where: { email } })) {
    return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 })
  }

  try {
    const missions = await prisma.mission.findMany({ where: { minDayUnlock: 0 }, select: { id: true } })
    const user = await prisma.$transaction(async tx => {
      const created = await tx.user.create({
        data: {
          name, email, passwordHash: await hashPassword(password),
          attributes: { create: {} },
          userMissions: { create: missions.map(m => ({ missionId: m.id })) },
        },
        select: { id: true, name: true, email: true, level: true, onboardingCompleted: true },
      })
      await tx.pendingMember.delete({ where: { token } })
      return created
    })

    const response = NextResponse.json({ user, message: 'Conta criada com sucesso' }, { status: 201 })
    response.cookies.set('ascend-token', signToken({ userId: user.id, email: user.email }), {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
      path: '/', maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Não foi possível criar a conta' }, { status: 500 })
  }
}
