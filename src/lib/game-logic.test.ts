import { describe, expect, it } from 'vitest'
import { calculateLevelUp, classXpMultiplier, xpForLevel } from './game-logic'

describe('progressão', () => {
  it('aumenta o custo de XP por nível', () => {
    expect(xpForLevel(1)).toBe(150)
    expect(xpForLevel(10)).toBe(600)
  })

  it('preserva XP excedente em múltiplos level ups', () => {
    const result = calculateLevelUp(1, 140, 400)
    expect(result.level).toBe(3)
    expect(result.currentXp).toBe(190)
    expect(result.levelUps).toEqual([2, 3])
  })

  it('aplica bônus somente à categoria da classe', () => {
    expect(classXpMultiplier('WORK', 12, 'WORK', false)).toBeCloseTo(1.12)
    expect(classXpMultiplier('WORK', 12, 'STUDY', false)).toBe(1)
  })
})
