import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const missions = await prisma.userMission.findMany({
    where: { userId: auth.userId },
    include: { mission: { include: { itemReward: true } } },
    orderBy: { assignedAt: 'desc' }
  })

  return NextResponse.json(missions)
}
