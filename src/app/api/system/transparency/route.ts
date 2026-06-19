import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { XP_REWARDS, ESSENCE_REWARDS, ATTRIBUTE_GAINS } from '@/lib/game-logic'
import { RANKS } from '@/lib/ranks'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  return NextResponse.json({
    levels: {
      formula: 'XP necessário = 100 + nível atual × 50',
      taskXp: XP_REWARDS,
      taskEssences: ESSENCE_REWARDS,
      levelUpEssences: 50,
    },
    attributes: ATTRIBUTE_GAINS,
    combat: {
      hp: '80 + Vitalidade × 6 + Nível × 12 + bônus de equipamentos',
      attack: '10 + Força × 1,6 + Foco × 0,9 + Inteligência × 0,6',
      defense: '6 + Disciplina × 1,1 + Vitalidade × 0,7 + Sabedoria × 0,4',
      critical: '3% + (Carisma + Criatividade) × 1,2%, limitado a 45%',
    },
    ranks: RANKS,
  })
}
