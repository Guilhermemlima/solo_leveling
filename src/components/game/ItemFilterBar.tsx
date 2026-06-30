'use client'
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react'
import { RARITY_FILTERS, type SortDir } from '@/lib/item-sort'
import { RARITY_COLORS } from '@/lib/game-logic'

interface Props {
  rarity: string
  setRarity: (r: string) => void
  dir: SortDir
  setDir: (d: SortDir) => void
}

/** Barra de filtro por raridade + botão de ordenação (forte↔fraco). */
export function ItemFilterBar({ rarity, setRarity, dir, setDir }: Props) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap mb-4">
      {RARITY_FILTERS.map(f => {
        const active = rarity === f.value
        const color = f.value ? RARITY_COLORS[f.value] : '#a78bfa'
        return (
          <button
            key={f.value || 'all'}
            onClick={() => setRarity(f.value)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors"
            style={active
              ? { background: `${color}22`, color, borderColor: `${color}66` }
              : { background: 'rgba(30,41,59,0.4)', color: '#94a3b8', borderColor: 'rgba(51,65,85,0.5)' }}
          >
            {f.label}
          </button>
        )
      })}
      <button
        onClick={() => setDir(dir === 'desc' ? 'asc' : 'desc')}
        className="ml-auto flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-700/50 bg-slate-800/40 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        title="Alternar ordenação"
      >
        {dir === 'desc'
          ? <><ArrowDownWideNarrow size={13} /> Mais forte</>
          : <><ArrowUpNarrowWide size={13} /> Mais fraco</>}
      </button>
    </div>
  )
}
