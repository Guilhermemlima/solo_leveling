import { describe, expect, it } from 'vitest'
import { onboardingSchema, taskSchema } from './validation'

describe('validação', () => {
  it('rejeita tarefa sem título', () => {
    expect(taskSchema.safeParse({ title: '', category: 'WORK', difficulty: 'EASY' }).success).toBe(false)
  })

  it('impede onboarding sem objetivos', () => {
    expect(onboardingSchema.safeParse({
      goals: [], availableMinutes: 30, experienceLevel: 'BEGINNER',
      availableEquipment: ['NONE'], specialization: 'ARCHITECT', timezone: 'America/Sao_Paulo',
    }).success).toBe(false)
  })
})
