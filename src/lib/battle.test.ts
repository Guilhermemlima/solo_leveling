import { describe, expect, it } from 'vitest'
import { battleRewards, deriveStats, makeBot } from './battle'

describe('arena', () => {
  it('gera bots progressivamente mais fortes', () => {
    const easy = deriveStats(makeBot(5, 'EASY')).power
    const medium = deriveStats(makeBot(5, 'MEDIUM')).power
    const hard = deriveStats(makeBot(5, 'HARD')).power
    expect(easy).toBeLessThan(medium)
    expect(medium).toBeLessThan(hard)
  })

  it('derrota nunca remove nível e dá consolação mínima', () => {
    expect(battleRewards({ playerLevel: 10, won: false, type: 'BOT' })).toEqual({
      xp: 5, essences: 0, points: 0,
    })
  })
})
