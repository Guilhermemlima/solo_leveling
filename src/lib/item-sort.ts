/** Ordenação e filtro padronizados de itens por raridade. */

export const RARITY_ORDER = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'] as const

/** Opções do filtro (Todos + cada raridade, da mais forte para a mais fraca no chip). */
export const RARITY_FILTERS: { value: string; label: string }[] = [
  { value: '',          label: 'Todos' },
  { value: 'MYTHIC',    label: 'Mítico' },
  { value: 'LEGENDARY', label: 'Lendário' },
  { value: 'EPIC',      label: 'Épico' },
  { value: 'RARE',      label: 'Raro' },
  { value: 'UNCOMMON',  label: 'Incomum' },
  { value: 'COMMON',    label: 'Comum' },
]

export type SortDir = 'asc' | 'desc' // asc = mais fraco→forte (E no topo); desc = mais forte→fraco

export function rarityRank(r: string | null | undefined): number {
  const i = RARITY_ORDER.indexOf((r ?? '') as typeof RARITY_ORDER[number])
  return i < 0 ? 0 : i
}

/** Filtra por raridade (vazio = todas) e ordena por raridade, com bônus/upgrade como desempate. */
export function filterSortItems<T>(
  items: T[],
  opts: {
    rarity: string
    dir: SortDir
    getRarity: (i: T) => string
    getBonus?: (i: T) => number
  }
): T[] {
  const { rarity, dir, getRarity, getBonus } = opts
  const list = rarity ? items.filter(i => getRarity(i) === rarity) : [...items]
  list.sort((a, b) => {
    const ra = rarityRank(getRarity(a))
    const rb = rarityRank(getRarity(b))
    if (ra !== rb) return dir === 'desc' ? rb - ra : ra - rb
    const ba = getBonus?.(a) ?? 0
    const bb = getBonus?.(b) ?? 0
    return dir === 'desc' ? bb - ba : ba - bb
  })
  return list
}
