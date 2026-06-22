/**
 * Módulo de Academia / Fitness — progressão, metas e atividades.
 */

export const FITNESS_GOAL_TYPES: Record<string, { label: string; unit: string; icon: string }> = {
  WEIGHT:    { label: 'Peso corporal',  unit: 'kg',   icon: '⚖️' },
  LOAD:      { label: 'Carga',          unit: 'kg',   icon: '🏋️' },
  REPS:      { label: 'Repetições',     unit: 'reps', icon: '🔁' },
  DISTANCE:  { label: 'Distância',      unit: 'km',   icon: '🏃' },
  TIME:      { label: 'Tempo',          unit: 'min',  icon: '⏱️' },
  FREQUENCY: { label: 'Frequência',     unit: 'dias', icon: '📅' },
  MEASURE:   { label: 'Medida corporal', unit: 'cm',  icon: '📏' },
}

export const MUSCLE_GROUPS: Record<string, { label: string; color: string }> = {
  PEITO:  { label: 'Peito',   color: '#ef4444' },
  COSTAS: { label: 'Costas',  color: '#3b82f6' },
  PERNA:  { label: 'Perna',   color: '#8b5cf6' },
  OMBRO:  { label: 'Ombro',   color: '#f59e0b' },
  BRACO:  { label: 'Braço',   color: '#22c55e' },
  CORE:   { label: 'Core',    color: '#14b8a6' },
  CARDIO: { label: 'Cardio',  color: '#ec4899' },
  OUTRO:  { label: 'Outro',   color: '#94a3b8' },
}

export const EXERCISE_TYPES: Record<string, { label: string; icon: string }> = {
  STRENGTH:   { label: 'Musculação',     icon: '🏋️' },
  BODYWEIGHT: { label: 'Peso do corpo',  icon: '🤸' },
  CARDIO:     { label: 'Cardio',         icon: '🏃' },
}

/** Sugestões de exercícios de academia para criação rápida. */
export const DEFAULT_EXERCISES: { name: string; muscleGroup: string; type: string; unit: string }[] = [
  { name: 'Supino reto',        muscleGroup: 'PEITO',  type: 'STRENGTH', unit: 'kg' },
  { name: 'Agachamento',        muscleGroup: 'PERNA',  type: 'STRENGTH', unit: 'kg' },
  { name: 'Leg press',          muscleGroup: 'PERNA',  type: 'STRENGTH', unit: 'kg' },
  { name: 'Desenvolvimento',    muscleGroup: 'OMBRO',  type: 'STRENGTH', unit: 'kg' },
  { name: 'Remada',             muscleGroup: 'COSTAS', type: 'STRENGTH', unit: 'kg' },
  { name: 'Rosca direta',       muscleGroup: 'BRACO',  type: 'STRENGTH', unit: 'kg' },
  { name: 'Tríceps',            muscleGroup: 'BRACO',  type: 'STRENGTH', unit: 'kg' },
  { name: 'Puxada',             muscleGroup: 'COSTAS', type: 'STRENGTH', unit: 'kg' },
  { name: 'Cadeira extensora',  muscleGroup: 'PERNA',  type: 'STRENGTH', unit: 'kg' },
]

/** Atividades livres (sem aparelhos). */
export const FREE_ACTIVITIES: { key: string; label: string; icon: string; unit: string }[] = [
  { key: 'flexoes',    label: 'Flexões',          icon: '💪', unit: 'reps' },
  { key: 'abdominais', label: 'Abdominais',       icon: '🔥', unit: 'reps' },
  { key: 'barras',     label: 'Barras',           icon: '🤸', unit: 'reps' },
  { key: 'agachamento',label: 'Agachamento livre', icon: '🦵', unit: 'reps' },
  { key: 'prancha',    label: 'Prancha',          icon: '🧘', unit: 'min' },
  { key: 'corrida',    label: 'Corrida',          icon: '🏃', unit: 'km' },
  { key: 'caminhada',  label: 'Caminhada',        icon: '🚶', unit: 'km' },
  { key: 'pedal',      label: 'Pedal',            icon: '🚴', unit: 'km' },
  { key: 'natacao',    label: 'Natação',          icon: '🏊', unit: 'm' },
]

export const INTENSITY_LEVELS: Record<string, { label: string; color: string }> = {
  LEVE:     { label: 'Leve',     color: '#22c55e' },
  MODERADA: { label: 'Moderada', color: '#f59e0b' },
  INTENSA:  { label: 'Intensa',  color: '#ef4444' },
}

export const FITNESS_GOAL_STATUS: Record<string, { label: string; color: string }> = {
  ACTIVE:    { label: 'Ativa',     color: '#6366f1' },
  COMPLETED: { label: 'Concluída', color: '#22c55e' },
  PAUSED:    { label: 'Pausada',   color: '#94a3b8' },
}

/**
 * Progresso de uma meta física (0..100).
 * Suporta metas de aumento (target > start) e de redução (target < start, ex.: perder peso).
 */
export function fitnessGoalProgress(start: number, current: number, target: number): number {
  if (start === target) return current >= target ? 100 : 0
  const pct = ((current - start) / (target - start)) * 100
  return Math.max(0, Math.min(100, Math.round(pct)))
}

/** Variação percentual de carga entre dois valores. */
export function loadEvolution(first: number, latest: number): number {
  if (first <= 0) return 0
  return Math.round(((latest - first) / first) * 100)
}
