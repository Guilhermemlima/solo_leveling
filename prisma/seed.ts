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

    // === ESCUDOS (Catálogo de Armas) ===
    prisma.equipment.upsert({ where: { name: 'Escudo do Rei das Sombras' }, update: {}, create: { name: 'Escudo do Rei das Sombras', description: 'Forjado nas profundezas das trevas, irradia poder sombrio. DEF +260, HP +650, Bloqueio +20%.', type: EquipType.ARMOR, rarity: Rarity.MYTHIC, bonusType: 'DEFENSE', bonusValue: 260, price: 8000, icon: '🛡️' } }),
    prisma.equipment.upsert({ where: { name: 'Escudo do Guardião Fantasma' }, update: {}, create: { name: 'Escudo do Guardião Fantasma', description: 'Escudo etéreo que atravessa ataques físicos. DEF +185, Defesa +16%, Mana +40, Bloqueio +14%.', type: EquipType.ARMOR, rarity: Rarity.EPIC, bonusType: 'DEFENSE', bonusValue: 185, price: 2800, icon: '🛡️' } }),
    prisma.equipment.upsert({ where: { name: 'Bastião do Guardião Lunar' }, update: {}, create: { name: 'Bastião do Guardião Lunar', description: 'Escudo imbuído com energia da lua. DEF +138, HP +240, Resistência Mágica +10%.', type: EquipType.ARMOR, rarity: Rarity.RARE, bonusType: 'DEFENSE', bonusValue: 138, price: 950, icon: '🛡️' } }),
    prisma.equipment.upsert({ where: { name: 'Escudo de Ferro Rúnico' }, update: {}, create: { name: 'Escudo de Ferro Rúnico', description: 'Ferro temperado com runas antigas. DEF +92, HP +150, Bloqueio +8%, Resistência +6%.', type: EquipType.ARMOR, rarity: Rarity.UNCOMMON, bonusType: 'DEFENSE', bonusValue: 92, price: 320, icon: '🛡️' } }),
    prisma.equipment.upsert({ where: { name: 'Escudo do Iniciante' }, update: {}, create: { name: 'Escudo do Iniciante', description: 'Escudo básico para novos caçadores. DEF +50, HP +70, Bloqueio +4%.', type: EquipType.ARMOR, rarity: Rarity.COMMON, bonusType: 'DEFENSE', bonusValue: 50, price: 80, icon: '🛡️' } }),

    // === ARMADURAS — Catálogo Página 1 ===
    prisma.equipment.upsert({ where: { name: 'Armadura do Eclipse Abissal' }, update: {}, create: { name: 'Armadura do Eclipse Abissal', description: 'Forjada no coração de um eclipse sombrio. DEF +220, AGI +35, Mana +80, Resistência Sombria +25%.', type: EquipType.ARMOR, rarity: Rarity.MYTHIC, bonusType: 'DEFENSE', bonusValue: 220, price: 9000, icon: '🥋' } }),
    prisma.equipment.upsert({ where: { name: 'Couraça do Caçador Sombrio' }, update: {}, create: { name: 'Couraça do Caçador Sombrio', description: 'Armadura leve para caçadores das trevas. DEF +170, HP +450, Precisão +15, Furtividade +12%.', type: EquipType.ARMOR, rarity: Rarity.EPIC, bonusType: 'DEFENSE', bonusValue: 170, price: 3200, icon: '🥋' } }),
    prisma.equipment.upsert({ where: { name: 'Peitoral do Guardião Lunar' }, update: {}, create: { name: 'Peitoral do Guardião Lunar', description: 'Proteção imbuída pela luz da lua. DEF +125, Mana +40, Resistência Mágica +14%, Vitalidade +10.', type: EquipType.ARMOR, rarity: Rarity.RARE, bonusType: 'DEFENSE', bonusValue: 125, price: 1100, icon: '🥋' } }),
    prisma.equipment.upsert({ where: { name: 'Armadura de Ferro Rúnico' }, update: {}, create: { name: 'Armadura de Ferro Rúnico', description: 'Ferro forjado com runas protetoras. DEF +90, HP +220, Vitalidade +10, Bloqueio +8%.', type: EquipType.ARMOR, rarity: Rarity.UNCOMMON, bonusType: 'DEFENSE', bonusValue: 90, price: 380, icon: '🥋' } }),
    prisma.equipment.upsert({ where: { name: 'Colete do Iniciante das Ruínas' }, update: {}, create: { name: 'Colete do Iniciante das Ruínas', description: 'Colete encontrado nas ruínas. DEF +55, Stamina +80, Sorte +3, Recuperação +4/s.', type: EquipType.ARMOR, rarity: Rarity.COMMON, bonusType: 'DEFENSE', bonusValue: 55, price: 90, icon: '🥋' } }),

    // === ARMADURAS — Catálogo Página 4 ===
    prisma.equipment.upsert({ where: { name: 'Couraça do Dragão Obsidiano' }, update: {}, create: { name: 'Couraça do Dragão Obsidiano', description: 'Escamas de dragão obsidiano convertidas em armadura. DEF +240, Resistência a Fogo +25%, Força +28, HP +500.', type: EquipType.ARMOR, rarity: Rarity.MYTHIC, bonusType: 'DEFENSE', bonusValue: 240, price: 9500, icon: '🐉' } }),
    prisma.equipment.upsert({ where: { name: 'Armadura do General Fantasma' }, update: {}, create: { name: 'Armadura do General Fantasma', description: 'Usada por generais fantasmas em batalhas lendárias. DEF +175, Liderança +10, Defesa +15%, Mana +35.', type: EquipType.ARMOR, rarity: Rarity.EPIC, bonusType: 'DEFENSE', bonusValue: 175, price: 3500, icon: '👻' } }),
    prisma.equipment.upsert({ where: { name: 'Peitoral da Chama Sombria' }, update: {}, create: { name: 'Peitoral da Chama Sombria', description: 'Forjado nas chamas das profundezas. DEF +118, Dano de Fogo +12%, Resistência +10%, HP +170.', type: EquipType.ARMOR, rarity: Rarity.RARE, bonusType: 'DEFENSE', bonusValue: 118, price: 980, icon: '🔥' } }),
    prisma.equipment.upsert({ where: { name: 'Colete do Rastreador de Masmorras' }, update: {}, create: { name: 'Colete do Rastreador de Masmorras', description: 'Leve e discreto para explorar masmorras. DEF +82, Visão +12, Stamina +70, Furtividade +5%.', type: EquipType.ARMOR, rarity: Rarity.UNCOMMON, bonusType: 'DEFENSE', bonusValue: 82, price: 290, icon: '🗺️' } }),
    prisma.equipment.upsert({ where: { name: 'Armadura Simples do Desperto' }, update: {}, create: { name: 'Armadura Simples do Desperto', description: 'Primeira armadura de quem acabou de despertar. DEF +45, HP +100, Recuperação +5/s, Resistência +4%.', type: EquipType.ARMOR, rarity: Rarity.COMMON, bonusType: 'DEFENSE', bonusValue: 45, price: 60, icon: '⚙️' } }),
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
    update: { onboardingCompleted: true, specialization: 'ARCHITECT' },
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
      onboardingCompleted: true,
      specialization: 'ARCHITECT',
      goals: ['WORK', 'STUDY', 'HEALTH'],
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
    prisma.inventory.upsert({
      where: { userId_equipmentId: { userId: testUser.id, equipmentId: equipment[0].id } },
      update: { isEquipped: true },
      create: { userId: testUser.id, equipmentId: equipment[0].id, isEquipped: true },
    }),
    prisma.inventory.upsert({
      where: { userId_equipmentId: { userId: testUser.id, equipmentId: equipment[2].id } },
      update: {},
      create: { userId: testUser.id, equipmentId: equipment[2].id, isEquipped: false },
    }),
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
      update: { onboardingCompleted: true },
      create: {
        name: r.name,
        email: r.email,
        passwordHash: rivalPass,
        level: r.level,
        totalXp: r.level * 200,
        essences: 100,
        arenaPoints: r.points,
        arenaWins: Math.floor(r.points / 15),
        onboardingCompleted: true,
        attributes: {
          create: { strength: r.str, intelligence: r.int, discipline: r.dis, focus: r.foc, vitality: r.vit, charisma: r.cha, wisdom: r.wis, creativity: r.cre },
        },
      },
    })
  }
  console.log(`✅ ${rivals.length} rivais da Arena criados`)

  // Caixas de recompensa (Chi Navy)
  const chests = [
    { key: 'CHEST_E', name: 'Caixa Rank E', rank: 'E', description: 'Uma caixa simples dos primeiros despertares.', icon: '📦' },
    { key: 'CHEST_D', name: 'Caixa Rank D', rank: 'D', description: 'Recompensas modestas para caçadores iniciantes.', icon: '🎁' },
    { key: 'CHEST_C', name: 'Caixa Rank C', rank: 'C', description: 'Brilho médio. Pode conter itens incomuns ou raros.', icon: '🧰' },
    { key: 'CHEST_B', name: 'Caixa Rank B', rank: 'B', description: 'Energia arcana intensa. Itens raros e épicos.', icon: '💎' },
    { key: 'CHEST_A', name: 'Caixa Rank A', rank: 'A', description: 'Partículas de poder. Itens épicos e lendários.', icon: '🏆' },
    { key: 'CHEST_S', name: 'Caixa Rank S', rank: 'S', description: 'Explosão de aura. Itens lendários e míticos.', icon: '👑' },
    { key: 'CHEST_SPECIAL', name: 'Caixa Especial', rank: 'SPECIAL', description: 'Um portal roxo de runas. Recompensa garantida e rara.', icon: '🔮' },
  ]
  for (const c of chests) {
    await prisma.chest.upsert({ where: { key: c.key }, update: {}, create: c })
  }
  console.log(`✅ ${chests.length} caixas criadas`)

  // Dá algumas caixas ao usuário de teste para demonstração
  const eChest = await prisma.chest.findUnique({ where: { key: 'CHEST_E' } })
  const cChest = await prisma.chest.findUnique({ where: { key: 'CHEST_C' } })
  const sChest = await prisma.chest.findUnique({ where: { key: 'CHEST_S' } })
  if (eChest && cChest && sChest) {
    await prisma.userChest.upsert({ where: { userId_chestId: { userId: testUser.id, chestId: eChest.id } }, update: { quantity: 3 }, create: { userId: testUser.id, chestId: eChest.id, quantity: 3, source: 'SEED' } })
    await prisma.userChest.upsert({ where: { userId_chestId: { userId: testUser.id, chestId: cChest.id } }, update: { quantity: 2 }, create: { userId: testUser.id, chestId: cChest.id, quantity: 2, source: 'SEED' } })
    await prisma.userChest.upsert({ where: { userId_chestId: { userId: testUser.id, chestId: sChest.id } }, update: { quantity: 1 }, create: { userId: testUser.id, chestId: sChest.id, quantity: 1, source: 'SEED' } })
  }
  console.log(`✅ Caixas de demonstração entregues ao usuário de teste`)

  // Inimigos do Bestiário (PvE) — baseados nos catálogos visuais
  const enemies = [
    // Rank E — Ameaças Comuns
    {
      key: 'skeleton',
      name: 'Esqueleto das Minas',
      rank: 'E', type: 'Soldado Fraco', isBoss: false,
      hp: 620, attack: 78, defense: 42,
      weakness: 'Sagrado', resistance: 'Sombrio',
      specialMechanic: 'Reanima ossos ao perder metade do HP.',
      recommendedPower: 80,
      drops: 'Essências, Caixa Rank E',
      icon: '💀',
    },
    // Rank D — Invasores
    {
      key: 'goblin',
      name: 'Goblin de Portal',
      rank: 'D', type: 'Invasor', isBoss: false,
      hp: 1120, attack: 132, defense: 68,
      weakness: 'Fogo', resistance: 'Sombrio',
      specialMechanic: 'Chama reforços fracos a cada 3 turnos.',
      recommendedPower: 180,
      drops: 'Essências, Caixa Rank D',
      icon: '👺',
    },
    {
      key: 'dark_wolf',
      name: 'Lobo Sombrio',
      rank: 'D', type: 'Predador', isBoss: false,
      hp: 1650, attack: 168, defense: 84,
      weakness: 'Luz', resistance: 'Gelo',
      specialMechanic: 'Ataques rápidos em sequência causam sangramento.',
      recommendedPower: 210,
      drops: 'Essências, Caixa Rank D',
      icon: '🐺',
    },
    // Rank C — Ameaças de Elite
    {
      key: 'crystal_spider',
      name: 'Aranha Cristalina',
      rank: 'C', type: 'Caçador Venenoso', isBoss: false,
      hp: 2480, attack: 212, defense: 116,
      weakness: 'Contundente', resistance: 'Perfuração',
      specialMechanic: 'Teias cristalinas reduzem a velocidade do caçador.',
      recommendedPower: 400,
      drops: 'Caixa Rank C, cristais arcanos',
      icon: '🕷️',
    },
    {
      key: 'mist_mage',
      name: 'Mago da Névoa',
      rank: 'C', type: 'Conjurador', isBoss: false,
      hp: 3200, attack: 268, defense: 148,
      weakness: 'Físico', resistance: 'Mágico',
      specialMechanic: 'Conjura explosões arcanas em área a cada 2 turnos.',
      recommendedPower: 480,
      drops: 'Caixa Rank C, essência mágica',
      icon: '🧙',
    },
    // Rank B — Guardião Amaldiçoado (Elite)
    {
      key: 'corrupted_knight',
      name: 'Cavaleiro Corrompido',
      rank: 'B', type: 'Guardião Amaldiçoado', isBoss: false,
      hp: 5480, attack: 412, defense: 236,
      weakness: 'Luz', resistance: 'Sombrio',
      specialMechanic: 'Postura defensiva: reduz 40% do dano recebido por 2 turnos.',
      recommendedPower: 980,
      drops: 'Caixa Rank B, Espada da Ruína, Armadura Fragmentada',
      icon: '⚔️',
    },
    // Rank A — Chefes de Elite
    {
      key: 'void_assassin',
      name: 'Assassino do Vazio',
      rank: 'A', type: 'Assassino', isBoss: false,
      hp: 8500, attack: 620, defense: 280,
      weakness: 'Luz', resistance: 'Sombrio',
      specialMechanic: 'Passos no Vazio: Teleporta-se para as sombras e executa um golpe fatal nas costas.',
      recommendedPower: 1800,
      drops: 'Caixa Rank A, lâmina sombria, manto do vazio',
      icon: '🗡️',
    },
    {
      key: 'rune_golem',
      name: 'Golem Rúnico',
      rank: 'A', type: 'Tanque', isBoss: false,
      hp: 12000, attack: 420, defense: 580,
      weakness: 'Arcano', resistance: 'Físico',
      specialMechanic: 'Runa Ancestral: Acumula energia rúnica e libera um pulso que reduz a DEF dos caçadores.',
      recommendedPower: 2200,
      drops: 'Caixa Rank A, núcleo rúnico, fragmento de pedra mágica',
      icon: '🗿',
    },
    {
      key: 'shadow_chimera',
      name: 'Quimera Sombria',
      rank: 'A', type: 'Fera', isBoss: false,
      hp: 10500, attack: 580, defense: 340,
      weakness: 'Gelo', resistance: 'Fogo',
      specialMechanic: 'Fúria das Três Almas: Alterna entre seus ataques elementais imprevisíveis.',
      recommendedPower: 2400,
      drops: 'Caixa Rank A, penas da quimera, essência mítica',
      icon: '🐉',
    },
    // Rank S — Chefes Supremos
    {
      key: 'night_spider_queen',
      name: 'Rainha das Aranhas Noturnas',
      rank: 'S', type: 'Invocadora', isBoss: true,
      hp: 22000, attack: 820, defense: 620,
      weakness: 'Fogo', resistance: 'Veneno',
      specialMechanic: 'Teia da Dominação: Invoca aranhas sombrias e aprisiona caçadores na teia amaldiçoada.',
      recommendedPower: 4500,
      drops: 'Caixa Especial, arma Rank S, seda das trevas, cristal noturno',
      icon: '🕸️',
    },
    {
      key: 'crimson_monarch',
      name: 'Monarca da Ruína Carmesim',
      rank: 'S', type: 'Soberano', isBoss: true,
      hp: 35000, attack: 1200, defense: 900,
      weakness: 'Luz / Sagrado', resistance: 'Sombrio / Fogo / Maldição',
      specialMechanic: 'Cataclismo Carmesim: Abre fendas de ruína que corrompem o campo de batalha. 3 fases.',
      recommendedPower: 8000,
      drops: 'Caixa Especial, Lâmina da Ruína Eterna Rank S, Essência Mítica, Núcleo de Ascensão',
      icon: '👁️',
    },
  ]
  for (const e of enemies) {
    await prisma.enemy.upsert({ where: { key: e.key }, update: e, create: e })
  }
  console.log(`✅ ${enemies.length} inimigos do bestiário criados`)

  console.log('🎮 Seed concluído com sucesso!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
