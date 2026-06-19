import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { SPECIALIZATIONS } from '@/lib/specializations'

export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const body = await req.json()
  const specialization = SPECIALIZATIONS.some(item => item.key === body.specialization)
    ? body.specialization
    : undefined
  const updated = await prisma.user.update({
    where: { id: auth.userId },
    data: {
      ...(typeof body.penaltiesEnabled === 'boolean' ? { penaltiesEnabled: body.penaltiesEnabled } : {}),
      ...(typeof body.notificationsEnabled === 'boolean' ? { notificationsEnabled: body.notificationsEnabled } : {}),
      ...(specialization ? { specialization } : {}),
    },
    select: { penaltiesEnabled: true, notificationsEnabled: true, specialization: true },
  })
  return NextResponse.json(updated)
}
