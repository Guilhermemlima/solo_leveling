import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ valid: false, error: 'Token ausente' }, { status: 400 })

  const pending = await prisma.pendingMember.findUnique({ where: { token } })
  if (!pending) return NextResponse.json({ valid: false, error: 'Convite inválido ou já utilizado' }, { status: 404 })
  if (pending.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, error: 'Convite expirado. Entre em contato com o suporte.' }, { status: 410 })
  }

  return NextResponse.json({ valid: true, email: pending.email, name: pending.name, planKey: pending.planKey })
}
