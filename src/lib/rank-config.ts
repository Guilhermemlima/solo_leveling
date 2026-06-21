export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SPECIAL'

export const RANK_CONFIG: Record<Rank, {
  label: string
  color: string
  bg: string
  border: string
  glow: string
  multiplier: number
}> = {
  E: {
    label: 'E',
    color: '#9ca3af',
    bg: '#1f2937',
    border: '#374151',
    glow: '#6b728040',
    multiplier: 1,
  },
  D: {
    label: 'D',
    color: '#4ade80',
    bg: '#14532d',
    border: '#166534',
    glow: '#4ade8040',
    multiplier: 1.5,
  },
  C: {
    label: 'C',
    color: '#22d3ee',
    bg: '#164e63',
    border: '#155e75',
    glow: '#22d3ee40',
    multiplier: 2.5,
  },
  B: {
    label: 'B',
    color: '#a78bfa',
    bg: '#2e1065',
    border: '#4c1d95',
    glow: '#a78bfa40',
    multiplier: 4,
  },
  A: {
    label: 'A',
    color: '#fbbf24',
    bg: '#1c1917',
    border: '#78350f',
    glow: '#fbbf2440',
    multiplier: 7,
  },
  S: {
    label: 'S',
    color: '#c084fc',
    bg: '#1a0030',
    border: '#6d28d9',
    glow: '#c084fc60',
    multiplier: 12,
  },
  SPECIAL: {
    label: 'ESPECIAL',
    color: '#f59e0b',
    bg: '#1a0030',
    border: '#9333ea',
    glow: '#f59e0b80',
    multiplier: 20,
  },
}

export function getRankConfig(rank: string) {
  return RANK_CONFIG[rank as Rank] ?? RANK_CONFIG.E
}
