import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { comparePassword, signToken } from '@/lib/auth'
import { loginSchema, parseJson } from '@/lib/validation'
import { clientKey, rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const limiter = rateLimit(clientKey(req, 'login'), 8, 15 * 60_000)
  if (!limiter.allowed) return NextResponse.json({ error: 'Muitas tentativas. Aguarde antes de tentar novamente.' }, { status: 429 })
  try {
    const parsed = parseJson(loginSchema, await req.json())
    if (!parsed.data) return NextResponse.json({ error: 'E-mail ou senha inválidos' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email }, include: { selectedClass: true } })
    if (!user || !(await comparePassword(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }
    const { passwordHash: _passwordHash, ...safeUser } = user
    const response = NextResponse.json({ user: safeUser })
    response.cookies.set('ascend-token', signToken({ userId: user.id, email: user.email }), {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
      path: '/', maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Não foi possível entrar agora' }, { status: 500 })
  }
}
