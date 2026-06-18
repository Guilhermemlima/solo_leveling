'use client'
import { getRank } from '@/lib/ranks'

interface Props {
  points: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const SIZES = {
  sm: { box: 'w-7 h-7 text-sm', label: 'text-xs' },
  md: { box: 'w-10 h-10 text-lg', label: 'text-sm' },
  lg: { box: 'w-16 h-16 text-3xl', label: 'text-base' },
}

/** Selo da patente (E→S) com a letra estilizada na cor do tier. */
export function RankBadge({ points, size = 'md', showLabel = false }: Props) {
  const rank = getRank(points)
  const s = SIZES[size]

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${s.box} rounded-xl flex items-center justify-center font-black shrink-0`}
        style={{
          color: rank.color,
          background: `${rank.color}18`,
          border: `1.5px solid ${rank.color}55`,
          boxShadow: `0 0 14px ${rank.color}33`,
        }}
      >
        {rank.tier}
      </div>
      {showLabel && (
        <span className={`${s.label} font-semibold`} style={{ color: rank.color }}>
          {rank.label}
        </span>
      )}
    </div>
  )
}
