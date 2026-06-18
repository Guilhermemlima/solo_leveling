import { PrismaClient, TaskCategory, TaskDifficulty, TaskRecurrence, MissionType, EquipType, Rarity } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Ascend System...')

  // Classes
  const classes = await Promise.all([
    prisma.class.upsert({ where: { name: 'Aprendiz da Disciplina' }, update: {}, create: { name: 'Aprendiz da Disciplina', description: 'O começo de toda grande jornada. Bônus em consistência diária.', icon: '🌱', bonusType: 'DAILY', bonusValue: 5, color: '#22c55e' } }),
    prisma.class.upsert({ where: { name: 'Caçador de Hábitos' }, update: {}, create: { name: 'Caçador de Hábitos', description: 'Especialista em criar e manter hábitos poderosos. Bônus em tarefas recorrentes.', icon: '🎯', bonusType: 'HABIT', bonusValue: 10, color: '#f59e0b' } }),
    prisma.class.upsert({ where: { name: 'Estrategista' }, update: {}, create: { name: 'Estrategista', description: 'Planejamento e execução são suas armas. Bônus em tarefas de trabalho.', icon: '♟️', bonusType: 'WORK', bonusValue: 10, color: '#3b82f6' } }),
    prisma.class.upsert({ where: { name: 'Guardião da Saúde' }, update: {}, create: { name: 'Guardião da Saúde', description: 'Corpo e mente em harmonia. Bônus em tarefas de saúde e treino.', icon: '🛡️', bonusType: 'HEALTH', bonusValue: 15, color: '#10b981' } }),
    prisma.class.upsert({ where: { name: 'Mestre do Foco' }, update: {}, create: { name: 'Mestre do Foco', description: 'Concentração absoluta em cada tarefa. Bônus em produtividade.', icon: '🔮', bonusType: 'FOCUS', bonusValue: 12, color: '#8b5cf6' } }),
    prisma.class.upsert({ where: { name: 'Arquiteto do Conhecimento' }, update: {}, create: { name: 'Arquiteto do Conhecimento', description: 'Construtor de sabedoria e habilidades. Bônus em tarefas de estudo.', icon: '📚', bonusType: 'STUDY', bonusValue: 15, color: '#6366f1' } }),
    prisma.class.upsert({ where: { name: 'Guerreiro da Consistência' }, update: {}, create: { name: 'Guerreiro da Consistência', description: 'A constância é sua maior força. Bônus por streak diário.', icon: '⚔️', bonusType: 'STREAK', bonusValue: 20, color: '#ef4444' } }),
    prisma.class.upsert({ where: { name: 'Explorador da Evolução' }, update: {}, create: { name: 'Explorador da Evolução', description: 'Sempre buscando o próximo nível. Bônus em XP geral.', icon: '🚀', bonusType: 'XP', bonusValue: 8, color: '#f97316' } }),
  ])
  console.log(`✅ ${classes.length} classes criadas`)

  // Equipment
  const equipment = await Promise.all([
    prisma.equipment.upsert({ where: { name: 'Lâmina da Disciplina' }, update: {}, create: { name: 'Lâmina da Disciplina', description: 'Uma arma forjada pela consistência inabalável.', type: EquipType.WEAPON, rarity: Rarity.RARE, bonusType: 'DISCIPLINE', bonusValue: 10, price: 150, icon: '⚔️' } }),
    prisma.equipment.upsert({ where: { name: 'Armadura do Foco' }, update: {}, create: { name: 'Armadura do Foco', description: 'Proteção contra distrações e procrastinação.', type: EquipType.ARMOR, rarity: Rarity.EPIC, bonusType: 'FOCUS', bonusValue: 15, price: 300, icon: '🛡️' } }),
    prisma.equipment.upsert({ where: { name: 'Anel da Consistência' }, update: {}, create: { name: 'Anel da Consistência', description: 'Amplifica o poder do streak diário.', type: EquipType.RING, rarity: Rarity.UNCOMMON, bonusType: 'STREAK', bonusValue: 5, price: 80, icon: '💍' } }),
    prisma.equipment.upsert({ where: { name: 'Botas da Velocidade' }, update: {}, create: { name: 'Botas da Velocidade', description: 'Acelera a conclusão de tarefas de rotina.', type: EquipType.BOOTS, rarity: Rarity.COMMON, bonusType: 'SPEED', bonusValue: 5, price: 50, icon: '👟' } }),
    prisma.equipment.upsert({ where: { name: 'Livro da Sabedoria' }, update: {}, create: { name: 'Livro da Sabedoria', description: 'Contém os segredos do conhecimento eterno.', type: EquipType.BOOK, rarity: Rarity.EPIC, bonusType: 'WISDOM', bonusValue: 20, price: 400, icon: '📖' } }),
    prisma.equipment.upsert({ where: { name: 'Medalha da Persistência' }, update: {}, create: { name: 'Medalha da Persistência', description: 'Conquistada após superar grandes desafios.', type: EquipType.MEDAL, rarity: Rarity.RARE, bonusType: 'PERSISTENCE', bonusValue: 12, price: 200, icon: '🏅' } }),
    prisma.equipment.upsert({ where: { name: 'Amuleto da Clareza' }, update: {}, create: { name: 'Amuleto da Clareza', description: 'Mantém a mente clara e os objetivos definidos.', type: EquipType.AMULET, rarity: Rarity.UNCOMMON, bonusType: 'CLARITY', bonusValue: 8, price: 100, icon: '🔮' } }),
    prisma.equipment.upsert({ where: { name: 'Escudo da Rotina' }, update: {}, create: { name: 'Escudo da Rotina', description: 'Protege sua consistência contra o caos do dia a dia.', type: EquipType.ARMOR, rarity: Rarity.COMMON, bonusType: 'ROUTINE', bonusValue: 3, price: 30, icon: '🔰' } }),
    prisma.equipment.upsert({ where: { name: 'Relíquia da Evolução' }, update: {}, create: { name: 'Relíquia da Evolução', description: 'Um artefato lendário que amplifica todo o crescimento.', type: EquipType.RELIC, rarity: Rarity.LEGENDARY, bonusType: 'ALL', bonusValue: 25, price: 1000, icon: '✨' } }),
    prisma.equipment.upsert({ where: { name: 'Coroa do Ápice' }, update: {}, create: { name: 'Coroa do Ápice', description: 'O símbolo máximo de evolução pessoal. Apenas os mais dedicados a conquistam.', type: EquipType.RELIC, rarity: Rarity.MYTHIC, bonusType: 'ALL', bonusValue: 50, price: 5000, icon: '👑' } }),
    prisma.equipment.upsert({ where: { name: 'Espada da Força Interior' }, update: {}, create: { name: 'Espada da Força Interior', description: 'Forjada com determinação pura e esforço inabalável.', type: EquipType.WEAPON, rarity: Rarity.LEGENDARY, bonusType: 'STRENGTH', bonusValue: 30, price: 800, icon: '🗡️' } }),
    prisma.equipment.upsert({ where: { name: 'Bracelete da Vitalidade' }, update: {}, create: { name: 'Bracelete da Vitalidade', description: 'Aumenta a energia e disposição para enfrentar novos desafios.', type: EquipType.RING, rarity: Rarity.RARE, bonusType: 'VITALITY', bonusValue: 18, price: 250, icon: '⚡' } }),
  ])
  console.log(`✅ ${equipment.length} equipamentos criados`)

  // Achievements
  const achievements = await Promise.all([
    prisma.achievement.upsert({ where: { name: 'Primeiro Passo' }, update: {}, create: { name: 'Primeiro Passo', description: 'Conclua sua primeira tarefa', icon: '👣', requirementType: 'TASKS_COMPLETED', requirementValue: 1 } }),
    prisma.achievement.upsert({ where: { name: 'Iniciante Promissor' }, update: {}, create: { name: 'Iniciante Promissor', description: 'Alcance o nível 5', icon: '⭐', requirementType: 'LEVEL', requirementValue: 5 } }),
    prisma.achievement.upsert({ where: { name: 'Disciplina de Ferro' }, update: {}, create: { name: 'Disciplina de Ferro', description: 'Mantenha 7 dias de sequência', icon: '🔥', requirementType: 'STREAK', requirementValue: 7 } }),
    prisma.achievement.upsert({ where: { name: 'Evolução Constante' }, update: {}, create: { name: 'Evolução Constante', description: 'Complete 50 tarefas', icon: '📈', requirementType: 'TASKS_COMPLETED', requirementValue: 50 } }),
    prisma.achievement.upsert({ where: { name: 'Mestre da Rotina' }, update: {}, create: { name: 'Mestre da Rotina', description: 'Complete 100 tarefas', icon: '🏆', requirementType: 'TASKS_COMPLETED', requirementValue: 100 } }),
    prisma.achievement.upsert({ where: { name: 'Lenda da Consistência' }, update: {}, create: { name: 'Lenda da Consistência', description: 'Mantenha 100 dias de streak', icon: '💎', requirementType: 'STREAK', requirementValue: 100 } }),
    prisma.achievement.upsert({ where: { name: 'Acumulador de XP' }, update: {}, create: { name: 'Acumulador de XP', description: 'Acumule 1.000 XP', icon: '💫', requirementType: 'TOTAL_XP', requirementValue: 1000 } }),
    prisma.achievement.upsert({ where: { name: 'Guerreiro Ascendente' }, update: {}, create: { name: 'Guerreiro Ascendente', description: 'Alcance o nível 10', icon: '⚔️', requirementType: 'LEVEL', requirementValue: 10 } }),
    prisma.achievement.upsert({ where: { name: 'Lenda Viva' }, update: {}, create: { name: 'Lenda Viva', description: 'Alcance o nível 25', icon: '👑', requirementType: 'LEVEL', requirementValue: 25 } }),
    prisma.achievement.upsert({ where: { name: 'Semana Perfeita' }, update: {}, create: { name: 'Semana Perfeita', description: 'Mantenha 14 dias de sequência', icon: '🌟', requirementType: 'STREAK', requirementValue: 14 } }),
    prisma.achievement.upsert({ where: { name: 'Um Mês de Glória' }, update: {}, create: { name: 'Um Mês de Glória', description: 'Mantenha 30 dias de sequência', icon: '🎖️', requirementType: 'STREAK', requirementValue: 30 } }),
    prisma.achievement.upsert({ where: { name: 'Milionário de XP' }, update: {}, create: { name: 'Milionário de XP', description: 'Acumule 10.000 XP', icon: '🌠', requirementType: 'TOTAL_XP', requirementValue: 10000 } }),
  ])
  console.log(`✅ ${achievements.length} conquistas criadas`)

  // Missions
  const missions = await Promise.all([
    // Daily
    prisma.mission.upsert({ where: { id: 'daily-001' }, update: {}, create: { id: 'daily-001', title: 'Guerreiro Diário', description: 'Complete 3 tarefas hoje', type: MissionType.DAILY, requirementType: 'DAILY_TASKS', requirementValue: 3, xpReward: 50, essenceReward: 20 } }),
    prisma.mission.upsert({ where: { id: 'daily-002' }, update: {}, create: { id: 'daily-002', title: 'Corpo em Ação', description: 'Conclua uma tarefa de saúde ou treino', type: MissionType.DAILY, requirementType: 'CATEGORY_HEALTH_TRAINING', requirementValue: 1, xpReward: 30, essenceReward: 15 } }),
    prisma.mission.upsert({ where: { id: 'daily-003' }, update: {}, create: { id: 'daily-003', title: 'Mente Afiada', description: 'Conclua uma tarefa de estudo', type: MissionType.DAILY, requirementType: 'CATEGORY_STUDY', requirementValue: 1, xpReward: 30, essenceReward: 15 } }),
    prisma.mission.upsert({ where: { id: 'daily-004' }, update: {}, create: { id: 'daily-004', title: 'Colheita de XP', description: 'Ganhe 50 XP em um dia', type: MissionType.DAILY, requirementType: 'DAILY_XP', requirementValue: 50, xpReward: 25, essenceReward: 10 } }),
    // Weekly
    prisma.mission.upsert({ where: { id: 'weekly-001' }, update: {}, create: { id: 'weekly-001', title: 'Semana Produtiva', description: 'Complete 20 tarefas esta semana', type: MissionType.WEEKLY, requirementType: 'WEEKLY_TASKS', requirementValue: 20, xpReward: 200, essenceReward: 100 } }),
    prisma.mission.upsert({ where: { id: 'weekly-002' }, update: {}, create: { id: 'weekly-002', title: 'Atleta da Semana', description: 'Treine 3 vezes esta semana', type: MissionType.WEEKLY, requirementType: 'WEEKLY_TRAINING', requirementValue: 3, xpReward: 150, essenceReward: 75 } }),
    prisma.mission.upsert({ where: { id: 'weekly-003' }, update: {}, create: { id: 'weekly-003', title: 'Estudioso Dedicado', description: 'Estude 5 vezes esta semana', type: MissionType.WEEKLY, requirementType: 'WEEKLY_STUDY', requirementValue: 5, xpReward: 150, essenceReward: 75 } }),
    // Special
    prisma.mission.upsert({ where: { id: 'special-001' }, update: {}, create: { id: 'special-001', title: 'O Começo', description: 'Conclua sua primeira tarefa', type: MissionType.SPECIAL, requirementType: 'TASKS_COMPLETED', requirementValue: 1, xpReward: 100, essenceReward: 50 } }),
    prisma.mission.upsert({ where: { id: 'special-002' }, update: {}, create: { id: 'special-002', title: 'Ascensão Inicial', description: 'Alcance o nível 5', type: MissionType.SPECIAL, requirementType: 'LEVEL', requirementValue: 5, xpReward: 500, essenceReward: 200 } }),
    prisma.mission.upsert({ where: { id: 'special-003' }, update: {}, create: { id: 'special-003', title: 'Centenário das Tarefas', description: 'Complete 100 tarefas', type: MissionType.SPECIAL, requirementType: 'TASKS_COMPLETED', requirementValue: 100, xpReward: 2000, essenceReward: 1000 } }),
  ])
  console.log(`✅ ${missions.length} missões criadas`)

  // Test user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const testUser = await prisma.user.upsert({
    where: { email: 'teste@ascend.com' },
    update: {},
    create: {
      name: 'Ascendente Teste',
      email: 'teste@ascend.com',
      passwordHash: hashedPassword,
      level: 3,
      currentXp: 120,
      totalXp: 620,
      essences: 350,
      currentStreak: 5,
      bestStreak: 5,
      lastActiveDate: new Date(),
      selectedClassId: classes[4].id,
      attributes: {
        create: {
          strength: 8,
          intelligence: 15,
          discipline: 12,
          focus: 18,
          vitality: 6,
          charisma: 4,
          wisdom: 10,
          creativity: 7,
        }
      }
    }
  })

  // Example tasks for test user
  await Promise.all([
    prisma.task.create({ data: { userId: testUser.id, title: 'Meditar por 10 minutos', description: 'Prática diária de mindfulness', category: TaskCategory.SPIRITUALITY, difficulty: TaskDifficulty.EASY, recurrence: TaskRecurrence.DAILY, xpReward: 10, essenceReward: 5, status: 'PENDING' } }),
    prisma.task.create({ data: { userId: testUser.id, title: 'Treinar na academia', description: 'Treino de força completo', category: TaskCategory.TRAINING, difficulty: TaskDifficulty.HARD, recurrence: TaskRecurrence.DAILY, xpReward: 50, essenceReward: 25, status: 'PENDING' } }),
    prisma.task.create({ data: { userId: testUser.id, title: 'Estudar programação', description: 'Estudar Next.js e TypeScript por 1h', category: TaskCategory.STUDY, difficulty: TaskDifficulty.MEDIUM, recurrence: TaskRecurrence.DAILY, xpReward: 25, essenceReward: 12, status: 'PENDING' } }),
    prisma.task.create({ data: { userId: testUser.id, title: 'Ler 30 páginas', description: 'Leitura de desenvolvimento pessoal', category: TaskCategory.PERSONAL_DEVELOPMENT, difficulty: TaskDifficulty.EASY, recurrence: TaskRecurrence.DAILY, xpReward: 10, essenceReward: 5, status: 'COMPLETED', completedAt: new Date() } }),
    prisma.task.create({ data: { userId: testUser.id, title: 'Revisar finanças do mês', description: 'Analisar gastos e investimentos', category: TaskCategory.FINANCE, difficulty: TaskDifficulty.MEDIUM, recurrence: TaskRecurrence.MONTHLY, xpReward: 25, essenceReward: 12, status: 'PENDING' } }),
  ])

  // Assign missions to test user
  await Promise.all(missions.slice(0, 5).map(m =>
    prisma.userMission.upsert({
      where: { userId_missionId: { userId: testUser.id, missionId: m.id } },
      update: {},
      create: { userId: testUser.id, missionId: m.id, progress: 0, status: 'ACTIVE' }
    })
  ))

  // Give some inventory items
  await Promise.all([
    prisma.inventory.create({ data: { userId: testUser.id, equipmentId: equipment[0].id, isEquipped: true } }),
    prisma.inventory.create({ data: { userId: testUser.id, equipmentId: equipment[2].id, isEquipped: false } }),
  ])

  console.log(`✅ Usuário de teste criado: teste@ascend.com / admin123`)

  // Rivais para a Arena (jogadores de nível próximo)
  const rivals = [
    { name: 'Kael Vortex', email: 'kael@ascend.com', level: 3, str: 14, int: 6, dis: 10, foc: 8, vit: 12, cha: 5, wis: 4, cre: 3, points: 45 },
    { name: 'Nyx Sombra', email: 'nyx@ascend.com', level: 4, str: 8, int: 16, dis: 11, foc: 14, vit: 7, cha: 9, wis: 12, cre: 10, points: 80 },
    { name: 'Bran Tempes', email: 'bran@ascend.com', level: 2, str: 10, int: 8, dis: 7, foc: 6, vit: 10, cha: 6, wis: 5, cre: 4, points: 20 },
  ]
  const rivalPass = await bcrypt.hash('rival123', 12)
  for (const r of rivals) {
    await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: {
        name: r.name,
        email: r.email,
        passwordHash: rivalPass,
        level: r.level,
        totalXp: r.level * 200,
        essences: 100,
        arenaPoints: r.points,
        arenaWins: Math.floor(r.points / 15),
        attributes: {
          create: { strength: r.str, intelligence: r.int, discipline: r.dis, focus: r.foc, vitality: r.vit, charisma: r.cha, wisdom: r.wis, creativity: r.cre },
        },
      },
    })
  }
  console.log(`✅ ${rivals.length} rivais da Arena criados`)

  console.log('🎮 Seed concluído com sucesso!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
