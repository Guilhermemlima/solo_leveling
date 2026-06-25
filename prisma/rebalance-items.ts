/**
 * Rebalanceamento de equipamentos: garante progressão consistente de
 * valores e preços por raridade. Determinístico e idempotente (recalcula
 * a partir da raridade/slot, não do valor atual) — pode rodar quantas vezes quiser.
 *
 * Afeta apenas SLOTS DE EQUIPAMENTO (arma, armadura, escudo, peças).
 * Acessórios/relíquias/livros/consumíveis (anel, amuleto, bracelete, medalha,
 * livro, relíquia) NÃO são tocados — mantêm seus bônus especiais.
 *
 * Execução: npx tsx prisma/rebalance-items.ts
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Faixas de valor por raridade (não se sobrepõem e crescem sempre)
const BANDS: Record<string, [number, number]> = {
  COMMON:    [40, 60],
  UNCOMMON:  [70, 95],
  RARE:      [105, 140],
  EPIC:      [150, 195],
  LEGENDARY: [205, 245],
  MYTHIC:    [255, 320],
}

// Multiplicador de preço por raridade (preço = valor * k)
const PRICE_K: Record<string, number> = {
  COMMON: 2, UNCOMMON: 4, RARE: 7, EPIC: 15, LEGENDARY: 28, MYTHIC: 46,
}

// Posição do slot dentro da faixa (peças menores ficam no piso, conjunto/arma no topo)
const SLOT_FACTOR: Record<string, number> = {
  BOOTS: 0.15, HELMET: 0.28, PANTS: 0.45, SHIELD: 0.62, CHESTPLATE: 0.72, WEAPON: 0.85, ARMOR: 0.95,
}

const GEAR_TYPES = ['WEAPON', 'ARMOR', 'SHIELD', 'CHESTPLATE', 'HELMET', 'PANTS', 'BOOTS']

function hash(s: string): number {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

async function main() {
  const items = await prisma.equipment.findMany({
    select: { id: true, name: true, type: true, rarity: true, bonusType: true, bonusValue: true, price: true },
  })

  let changed = 0
  const rows: string[] = []
  for (const it of items) {
    if (!GEAR_TYPES.includes(it.type)) continue
    const band = BANDS[it.rarity]
    if (!band) continue

    const factor = SLOT_FACTOR[it.type] ?? 0.7
    const jitter = (hash(it.name) % 7) - 3 // -3..+3 para variar sem quebrar a ordem
    const value = clamp(Math.round(band[0] + (band[1] - band[0]) * factor) + jitter, band[0], band[1])
    const bonusType = it.type === 'WEAPON' ? 'ATTACK' : 'DEFENSE'
    const price = Math.round(value * (PRICE_K[it.rarity] ?? 5))

    if (value !== it.bonusValue || bonusType !== it.bonusType || price !== it.price) {
      await prisma.equipment.update({ where: { id: it.id }, data: { bonusValue: value, bonusType, price } })
      rows.push(`${it.rarity.padEnd(10)} ${it.type.padEnd(10)} ${String(it.bonusValue).padStart(4)}→${String(value).padStart(4)}  $${String(it.price).padStart(5)}→$${String(price).padStart(5)}  ${it.name}`)
      changed++
    }
  }

  rows.sort()
  console.log(rows.join('\n'))
  console.log(`\n✅ ${changed} itens rebalanceados (de ${items.length}). Acessórios/consumíveis intactos.`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
