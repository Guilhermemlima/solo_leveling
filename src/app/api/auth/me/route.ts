import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: {
      selectedClass: true,
      attributes: true,
      userAchievements: { include: { achievement: true }, orderBy: { unlockedAt: 'desc' }, take: 5 },
    }
  })

  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const { passwordHash: _, ...safeUser } = user
  return NextResponse.json(safeUser)
}
