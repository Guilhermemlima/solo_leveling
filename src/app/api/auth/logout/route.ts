import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ message: 'Logout realizado' })
  res.cookies.delete('ascend-token')
  return res
}
