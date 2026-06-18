import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter ao menos 6 caracteres' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        attributes: { create: {} },
      },
      select: { id: true, name: true, email: true, level: true }
    })

    // Assign special missions
    const specialMissions = await prisma.mission.findMany({ where: { type: 'SPECIAL' } })
    const dailyMissions = await prisma.mission.findMany({ where: { type: 'DAILY' } })
    const weeklyMissions = await prisma.mission.findMany({ where: { type: 'WEEKLY' } })
    const allMissions = [...specialMissions, ...dailyMissions, ...weeklyMissions]

    await prisma.userMission.createMany({
      data: allMissions.map(m => ({ userId: user.id, missionId: m.id }))
    })

    const token = signToken({ userId: user.id, email: user.email })

    const res = NextResponse.json({ user, message: 'Conta criada com sucesso!' }, { status: 201 })
    res.cookies.set('ascend-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
