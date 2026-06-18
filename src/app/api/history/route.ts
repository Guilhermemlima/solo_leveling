import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const history = await prisma.activityHistory.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: 'desc' },
    take: 100
  })

  return NextResponse.json(history)
}
