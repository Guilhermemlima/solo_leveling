import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { INVESTMENT_ASSETS, FINANCE_DISCLAIMER } from '@/lib/finance'

/** Biblioteca de ativos simulados (configurável em lib/finance.ts). */
export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  return NextResponse.json({ assets: INVESTMENT_ASSETS, disclaimer: FINANCE_DISCLAIMER })
}
