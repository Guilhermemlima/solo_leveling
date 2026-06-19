import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email().max(255).transform(value => value.toLowerCase()),
  password: z.string().min(6).max(128),
})

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2).max(80),
})

export const taskSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(800).optional().nullable(),
  category: z.enum([
    'HEALTH', 'TRAINING', 'STUDY', 'WORK', 'FINANCE',
    'SPIRITUALITY', 'SOCIAL', 'HOME', 'PERSONAL_DEVELOPMENT', 'CREATIVITY',
  ]),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXTREME']),
  recurrence: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY']).default('ONCE'),
  dueDate: z.string().datetime().or(z.string().date()).optional().nullable(),
  targetValue: z.coerce.number().positive().max(1_000_000).optional().nullable(),
  targetUnit: z.string().trim().max(30).optional().nullable(),
  estimatedMinutes: z.coerce.number().int().min(1).max(1440).optional().nullable(),
  isTemplate: z.boolean().optional().default(false),
  templateName: z.string().trim().max(80).optional().nullable(),
  subtasks: z.array(z.string().trim().min(1).max(120)).max(20).optional().default([]),
})

export const completionSchema = z.object({
  actualValue: z.coerce.number().min(0).max(1_000_000).optional().nullable(),
  durationMinutes: z.coerce.number().int().min(0).max(1440).optional().nullable(),
  perceivedDifficulty: z.coerce.number().int().min(1).max(5).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
})

export const onboardingSchema = z.object({
  goals: z.array(z.enum([
    'HEALTH', 'TRAINING', 'STUDY', 'WORK', 'FINANCE',
    'SPIRITUALITY', 'SOCIAL', 'HOME', 'PERSONAL_DEVELOPMENT', 'CREATIVITY',
  ])).min(1).max(5),
  availableMinutes: z.coerce.number().int().min(10).max(240),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  availableEquipment: z.array(z.string().trim().min(1).max(50)).max(20),
  healthNotes: z.string().trim().max(500).optional().nullable(),
  specialization: z.enum(['VANGUARD', 'SCHOLAR', 'ARCHITECT', 'HARMONIZER']),
  timezone: z.string().trim().min(3).max(80),
})

export const feedbackSchema = z.object({
  category: z.enum(['BUG', 'IDEA', 'SUPPORT', 'OTHER']),
  message: z.string().trim().min(10).max(2000),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
})

export function parseJson<T>(schema: z.ZodType<T>, value: unknown) {
  const result = schema.safeParse(value)
  if (result.success) return { data: result.data, error: null }
  return {
    data: null,
    error: result.error.issues[0]?.message || 'Dados inválidos',
  }
}
