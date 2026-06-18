import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { penaltiesEnabled } = await req.json()

  const updated = await prisma.user.update({
    where: { id: auth.userId },
    data: { ...(typeof penaltiesEnabled === 'boolean' ? { penaltiesEnabled } : {}) },
    select: { penaltiesEnabled: true },
  })

  return NextResponse.json(updated)
}
