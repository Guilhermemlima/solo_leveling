import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const memberships = await prisma.groupMember.findMany({
    where: { userId: auth.userId },
    include: {
      group: {
        include: {
          members: { include: { user: { select: { id: true, name: true, level: true, avatarUrl: true } } } },
          challenges: {
            where: { endsAt: { gte: new Date() } },
            include: { contributions: true },
          },
        },
      },
    },
  })
  return NextResponse.json(memberships)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const body = await req.json()
  if (body.action === 'join') {
    const group = await prisma.group.findUnique({ where: { inviteCode: String(body.inviteCode || '').toUpperCase() } })
    if (!group) return NextResponse.json({ error: 'Código de convite inválido' }, { status: 404 })
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: group.id, userId: auth.userId } },
      update: {},
      create: { groupId: group.id, userId: auth.userId },
    })
    return NextResponse.json({ ok: true })
  }

  const name = String(body.name || '').trim()
  if (name.length < 3 || name.length > 60) {
    return NextResponse.json({ error: 'Nome deve ter entre 3 e 60 caracteres' }, { status: 400 })
  }
  const inviteCode = crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()
  const endsAt = new Date()
  endsAt.setDate(endsAt.getDate() + 7)
  const group = await prisma.group.create({
    data: {
      name,
      description: String(body.description || '').slice(0, 300) || null,
      inviteCode,
      members: { create: { userId: auth.userId, role: 'OWNER' } },
      challenges: {
        create: {
          title: 'Ascensão Coletiva',
          description: 'Concluam tarefas juntos durante esta semana.',
          target: 50,
          reward: 100,
          endsAt,
        },
      },
    },
  })
  return NextResponse.json(group, { status: 201 })
}
