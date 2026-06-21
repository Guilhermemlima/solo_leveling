import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { analyzeAttributes } from '@/lib/ai-advisor'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      attributes: {
        select: {
          strength: true, vitality: true, intelligence: true,
          focus: true, discipline: true, wisdom: true,
          charisma: true, creativity: true,
        },
      },
    },
  })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const result = analyzeAttributes((user.attributes ?? {}) as Record<string, number>)
  return NextResponse.json(result)
}
