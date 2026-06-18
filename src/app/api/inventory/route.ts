import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const inventory = await prisma.inventory.findMany({
    where: { userId: auth.userId },
    include: { equipment: true },
    orderBy: { acquiredAt: 'desc' }
  })

  return NextResponse.json(inventory)
}
