import { describe, expect, it } from 'vitest'
import { getRank, rankProgress, rankUpReward } from './ranks'

describe('patentes', () => {
  it('vai de E a S nas faixas definidas', () => {
    expect(getRank(0).tier).toBe('E')
    expect(getRank(90).tier).toBe('C')
    expect(getRank(750).tier).toBe('S')
  })

  it('recompensa apenas promoções', () => {
    expect(rankUpReward(29, 30)?.tier).toBe('D')
    expect(rankUpReward(30, 29)).toBeNull()
    expect(rankProgress(60)).toBe(50)
  })
})
