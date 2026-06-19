export function currentSeason(date = new Date()) {
  const year = date.getUTCFullYear()
  const quarter = Math.floor(date.getUTCMonth() / 3)
  const startsAt = new Date(Date.UTC(year, quarter * 3, 1))
  const endsAt = new Date(Date.UTC(year, quarter * 3 + 3, 1))
  const roman = ['I', 'II', 'III', 'IV'][quarter]
  return {
    key: `${year}-Q${quarter + 1}`,
    name: `Temporada ${roman} · ${year}`,
    startsAt,
    endsAt,
  }
}

export const SEASON_REWARDS = [
  { position: 1, title: 'Lenda da Temporada', essences: 1000, icon: '👑' },
  { position: 3, title: 'Elite da Temporada', essences: 500, icon: '🏆' },
  { position: 10, title: 'Competidor de Elite', essences: 200, icon: '🥇' },
  { position: 50, title: 'Desafiante', essences: 75, icon: '⚔️' },
]
