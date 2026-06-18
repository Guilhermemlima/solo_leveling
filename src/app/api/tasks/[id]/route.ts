import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params
  const task = await prisma.task.findFirst({ where: { id, userId: auth.userId } })
  if (!task) return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })

  await prisma.task.delete({ where: { id } })
  return NextResponse.json({ message: 'Tarefa excluída' })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params
  const task = await prisma.task.findFirst({ where: { id, userId: auth.userId } })
  if (!task) return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.task.update({ where: { id }, data: body })
  return NextResponse.json(updated)
}
