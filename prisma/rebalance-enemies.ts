/**
 * Rebalanceamento do Bestiário: ajusta HP/ATK/DEF dos inimigos para uma
 * curva de poder suave e ALCANÇÁVEL — o teto de poder de um jogador é
 * ~12.700, então o Rank S precisa ficar por volta de ~11k (desafiador,
 * mas vencível no máximo), e cada rank um degrau coerente abaixo.
 *
 * Determinístico/idempotente. Execução: npx tsx prisma/rebalance-enemies.ts
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Stats base por rank (não-chefe). Chefe recebe bônus.
const BANDS: Record<string, { hp: number; atk: number; def: number }> = {
  E: { hp: 380,   atk: 42,   def: 18 },
  D: { hp: 1000,  atk: 110,  def: 60 },
  C: { hp: 2400,  atk: 240,  def: 140 },
  B: { hp: 5000,  atk: 450,  def: 280 },
  A: { hp: 8000,  atk: 720,  def: 480 },
  S: { hp: 11500, atk: 1150, def: 780 },
}
const RANK_CRIT: Record<string, number> = { E: 0.03, D: 0.05, C: 0.08, B: 0.12, A: 0.18, S: 0.25 }

function combatPower(hp: number, atk: number, def: number, crit: number): number {
  return Math.round(hp * 0.5 + atk * 3 + def * 2 + crit * 100)
}
function hash(s: string): number { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h }

async function main() {
  const enemies = await prisma.enemy.findMany()
  const rows: string[] = []
  for (const e of enemies) {
    const band = BANDS[e.rank]
    if (!band) continue
    // chefe: +20% HP, +12% ATK/DEF. Variação leve por nome p/ não ficarem idênticos.
    const bossHp = e.isBoss ? 1.20 : 1.0
    const bossA = e.isBoss ? 1.12 : 1.0
    const jit = 1 + ((hash(e.name) % 9) - 4) / 100 // ±4%
    const hp = Math.round(band.hp * bossHp * jit)
    const atk = Math.round(band.atk * bossA * jit)
    const def = Math.round(band.def * bossA * jit)
    const power = combatPower(hp, atk, def, RANK_CRIT[e.rank] ?? 0.05)

    if (hp !== e.hp || atk !== e.attack || def !== e.defense || power !== e.recommendedPower) {
      await prisma.enemy.update({ where: { id: e.id }, data: { hp, attack: atk, defense: def, recommendedPower: power } })
      rows.push(`${e.rank} ${e.name.slice(0,24).padEnd(24)} HP ${String(e.hp).padStart(5)}→${String(hp).padStart(5)} ATK ${String(e.attack).padStart(4)}→${String(atk).padStart(4)} DEF ${String(e.defense).padStart(4)}→${String(def).padStart(4)} | poder ${String(e.recommendedPower).padStart(5)}→${String(power).padStart(5)}`)
    }
  }
  console.log(rows.join('\n'))
  console.log(`\n✅ ${rows.length} inimigos rebalanceados.`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
