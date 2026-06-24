/**
 * Seed idempotente das conquistas/títulos dos módulos de Finanças e Academia.
 * Execução: npx tsx prisma/seed-modules.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ACHIEVEMENTS = [
  // ── FINANÇAS ──
  { name: 'Aprendiz Financeiro',    description: 'Registre seu primeiro aporte',           icon: '🪙', requirementType: 'FINANCE_CONTRIBUTIONS',  requirementValue: 1 },
  { name: 'Primeiro Plano',         description: 'Crie sua primeira meta financeira',       icon: '📝', requirementType: 'FINANCE_GOALS_CREATED',   requirementValue: 1 },
  { name: 'Investidor Consistente', description: 'Registre 10 aportes',                     icon: '💹', requirementType: 'FINANCE_CONTRIBUTIONS',  requirementValue: 10 },
  { name: 'Disciplina de Aço',      description: 'Registre 30 aportes',                     icon: '🏅', requirementType: 'FINANCE_CONTRIBUTIONS',  requirementValue: 30 },
  { name: 'Guardião da Reserva',    description: 'Conclua uma meta financeira',             icon: '🛡️', requirementType: 'FINANCE_GOAL_COMPLETED', requirementValue: 1 },
  { name: 'Patrimônio em Ascensão', description: 'Acumule R$ 1.000 investidos',             icon: '💰', requirementType: 'FINANCE_TOTAL_INVESTED', requirementValue: 1000 },
  { name: 'Grande Investidor',      description: 'Acumule R$ 10.000 investidos',            icon: '🏦', requirementType: 'FINANCE_TOTAL_INVESTED', requirementValue: 10000 },

  // ── ACADEMIA ──
  { name: 'Primeiro Treino',        description: 'Registre seu primeiro treino',           icon: '💪', requirementType: 'FITNESS_WORKOUTS',       requirementValue: 1 },
  { name: 'Discípulo da Força',     description: 'Registre 10 treinos',                     icon: '🏋️', requirementType: 'FITNESS_WORKOUTS',       requirementValue: 10 },
  { name: 'Atleta em Evolução',     description: 'Registre 30 treinos',                     icon: '🔥', requirementType: 'FITNESS_WORKOUTS',       requirementValue: 30 },
  { name: 'Quebrador de Recordes',  description: 'Bata 5 recordes pessoais',                icon: '💥', requirementType: 'FITNESS_PR',             requirementValue: 5 },
  { name: 'Corpo em Ascensão',      description: 'Conclua uma meta física',                 icon: '🌟', requirementType: 'FITNESS_GOAL_COMPLETED', requirementValue: 1 },
  { name: 'Monitor Corporal',       description: 'Registre 5 medições corporais',           icon: '📏', requirementType: 'FITNESS_MEASUREMENTS',   requirementValue: 5 },

  // ── PLANO / FUNDADOR (concedida na compra, não por threshold) ──
  { name: 'Fundador',               description: 'Apoiou o Ascend System adquirindo um plano', icon: '👑', requirementType: 'FOUNDER',              requirementValue: 999999 },
]

async function main() {
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { name: a.name },
      update: { description: a.description, icon: a.icon, requirementType: a.requirementType, requirementValue: a.requirementValue },
      create: a,
    })
  }
  console.log(`✅ ${ACHIEVEMENTS.length} conquistas de módulos garantidas`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
