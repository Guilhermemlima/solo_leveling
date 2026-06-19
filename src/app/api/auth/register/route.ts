import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth'
import { parseJson, registerSchema } from '@/lib/validation'
import { clientKey, rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const limiter = rateLimit(clientKey(req, 'register'), 5, 60 * 60_000)
  if (!limiter.allowed) return NextResponse.json({ error: 'Muitas contas criadas neste dispositivo' }, { status: 429 })
  const parsed = parseJson(registerSchema, await req.json())
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { name, email, password } = parsed.data
  if (await prisma.user.findUnique({ where: { email } })) {
    return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 })
  }
  try {
    const missions = await prisma.mission.findMany({ select: { id: true } })
    const user = await prisma.user.create({
      data: {
        name, email, passwordHash: await hashPassword(password),
        attributes: { create: {} },
        userMissions: { create: missions.map(mission => ({ missionId: mission.id })) },
      },
      select: { id: true, name: true, email: true, level: true, onboardingCompleted: true },
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
