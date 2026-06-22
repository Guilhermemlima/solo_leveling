import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email().max(255).transform(value => value.toLowerCase()),
  password: z.string().min(6).max(128),
})

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255).transform(value => value.toLowerCase()),
  password: z
    .string()
    .min(8, 'Senha deve ter ao menos 8 caracteres')
    .max(128)
    .refine(p => /\d/.test(p), { message: 'Senha deve conter ao menos um número' }),
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
  availableMinutes: z.coerce.number().int().min(5).max(1440),
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

// ─────────────────────────────────────────────────────────────
// FINANÇAS
// ─────────────────────────────────────────────────────────────

export const financialGoalSchema = z.object({
  name: z.string().trim().min(2).max(80),
  targetAmount: z.coerce.number().min(0).max(1_000_000_000),
  currentAmount: z.coerce.number().min(0).max(1_000_000_000).optional().default(0),
  monthlyContribution: z.coerce.number().min(0).max(10_000_000).optional().default(0),
  category: z.enum(['INVESTMENT', 'EMERGENCY', 'RETIREMENT', 'GOAL', 'CUSTOM']).optional().default('INVESTMENT'),
  targetDate: z.string().datetime().or(z.string().date()).optional().nullable(),
})

export const financialGoalUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  targetAmount: z.coerce.number().min(0).max(1_000_000_000).optional(),
  currentAmount: z.coerce.number().min(0).max(1_000_000_000).optional(),
  monthlyContribution: z.coerce.number().min(0).max(10_000_000).optional(),
  category: z.enum(['INVESTMENT', 'EMERGENCY', 'RETIREMENT', 'GOAL', 'CUSTOM']).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED']).optional(),
  targetDate: z.string().datetime().or(z.string().date()).optional().nullable(),
})

export const contributionSchema = z.object({
  goalId: z.string().trim().min(1).max(40).optional().nullable(),
  amount: z.coerce.number().positive().max(1_000_000_000),
  assetType: z.string().trim().max(40).optional().nullable(),
  source: z.string().trim().max(80).optional().nullable(),
  notes: z.string().trim().max(300).optional().nullable(),
  date: z.string().datetime().or(z.string().date()).optional().nullable(),
})

export const simulationSchema = z.object({
  initialAmount: z.coerce.number().min(0).max(1_000_000_000),
  monthlyContribution: z.coerce.number().min(0).max(10_000_000),
  annualRate: z.coerce.number().min(0).max(100),
  durationMonths: z.coerce.number().int().min(1).max(1200),
  assetType: z.string().trim().max(40).optional().nullable(),
  persist: z.boolean().optional().default(false),
})

// ─────────────────────────────────────────────────────────────
// FITNESS
// ─────────────────────────────────────────────────────────────

export const fitnessGoalSchema = z.object({
  name: z.string().trim().min(2).max(80),
  type: z.enum(['WEIGHT', 'LOAD', 'REPS', 'DISTANCE', 'TIME', 'FREQUENCY', 'MEASURE']).optional().default('WEIGHT'),
  currentValue: z.coerce.number().min(0).max(1_000_000).optional().default(0),
  startValue: z.coerce.number().min(0).max(1_000_000).optional(),
  targetValue: z.coerce.number().min(0).max(1_000_000),
  unit: z.string().trim().max(10).optional().default('kg'),
  deadline: z.string().datetime().or(z.string().date()).optional().nullable(),
})

export const fitnessGoalUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  currentValue: z.coerce.number().min(0).max(1_000_000).optional(),
  targetValue: z.coerce.number().min(0).max(1_000_000).optional(),
  unit: z.string().trim().max(10).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED']).optional(),
  deadline: z.string().datetime().or(z.string().date()).optional().nullable(),
})

export const measurementSchema = z.object({
  weight: z.coerce.number().min(0).max(500).optional().nullable(),
  waist: z.coerce.number().min(0).max(300).optional().nullable(),
  chest: z.coerce.number().min(0).max(300).optional().nullable(),
  arm: z.coerce.number().min(0).max(150).optional().nullable(),
  leg: z.coerce.number().min(0).max(200).optional().nullable(),
  hip: z.coerce.number().min(0).max(300).optional().nullable(),
  bodyFat: z.coerce.number().min(0).max(100).optional().nullable(),
  notes: z.string().trim().max(300).optional().nullable(),
  date: z.string().datetime().or(z.string().date()).optional().nullable(),
}).refine(
  d => d.weight != null || d.waist != null || d.chest != null || d.arm != null || d.leg != null || d.hip != null || d.bodyFat != null,
  { message: 'Informe ao menos uma medida' }
)

export const exerciseSchema = z.object({
  name: z.string().trim().min(2).max(60),
  muscleGroup: z.enum(['PEITO', 'COSTAS', 'PERNA', 'OMBRO', 'BRACO', 'CORE', 'CARDIO', 'OUTRO']).optional().nullable(),
  type: z.enum(['STRENGTH', 'BODYWEIGHT', 'CARDIO']).optional().default('STRENGTH'),
  unit: z.string().trim().max(10).optional().default('kg'),
})

export const workoutSchema = z.object({
  exerciseId: z.string().trim().min(1).max(40).optional().nullable(),
  activity: z.string().trim().max(60).optional().nullable(),
  weight: z.coerce.number().min(0).max(2000).optional().nullable(),
  reps: z.coerce.number().int().min(0).max(10000).optional().nullable(),
  sets: z.coerce.number().int().min(0).max(100).optional().nullable(),
  distance: z.coerce.number().min(0).max(100000).optional().nullable(),
  duration: z.coerce.number().int().min(0).max(100000).optional().nullable(),
  calories: z.coerce.number().int().min(0).max(100000).optional().nullable(),
  intensity: z.enum(['LEVE', 'MODERADA', 'INTENSA']).optional().nullable(),
  notes: z.string().trim().max(300).optional().nullable(),
  date: z.string().datetime().or(z.string().date()).optional().nullable(),
}).refine(
  d => !!d.exerciseId || !!d.activity,
  { message: 'Selecione um exercício ou informe a atividade' }
)

export function parseJson<T>(schema: z.ZodType<T>, value: unknown) {
  const result = schema.safeParse(value)
  if (result.success) return { data: result.data, error: null }
  return {
    data: null,
    error: result.error.issues[0]?.message || 'Dados inválidos',
  }
}
