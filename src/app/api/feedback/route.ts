import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { feedbackSchema, parseJson } from '@/lib/validation'
import { clientKey, rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const limiter = rateLimit(clientKey(req, 'feedback', auth.userId), 5, 60 * 60_000)
  if (!limiter.allowed) return NextResponse.json({ error: 'Limite de mensagens atingido' }, { status: 429 })
  const parsed = parseJson(feedbackSchema, await req.json())
  if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const feedback = await prisma.feedback.create({ data: { userId: auth.userId, ...parsed.data } })
  return NextResponse.json(feedback, { status: 201 })
}
