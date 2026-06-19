import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { comparePassword, getAuthUser } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function DELETE(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { password } = await req.json()
  const user = await prisma.user.findUnique({ where: { id: auth.userId } })
  if (!user || !password || !(await comparePassword(password, user.passwordHash))) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 403 })
  }
  await prisma.user.delete({ where: { id: auth.userId } })
  const cookieStore = await cookies()
  cookieStore.delete('ascend-token')
  return NextResponse.json({ ok: true })
}
