import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: {
      attributes: true,
      tasks: { include: { subtasks: true, executions: true } },
      userMissions: { include: { mission: true } },
      inventory: { include: { equipment: true } },
      userAchievements: { include: { achievement: true } },
      activityHistory: true,
      battles: true,
      feedback: true,
      groupMemberships: { include: { group: true } },
    },
  })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  const { passwordHash: _passwordHash, ...safeUser } = user
  return new NextResponse(JSON.stringify({ exportedAt: new Date(), user: safeUser }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="ascend-data.json"',
    },
  })
}
