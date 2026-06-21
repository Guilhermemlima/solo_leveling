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
    prisma.equipment.upsert({ where: { name: 'Anel da Consistência' }, update: { imageUrl: '/assets/items/accessories/anel-da-consistencia.png', price: 250, description: 'Um anel mágico que simboliza disciplina, equilíbrio e constância.' }, create: { name: 'Anel da Consistência', description: 'Um anel mágico que simboliza disciplina, equilíbrio e constância.', type: EquipType.RING, rarity: Rarity.UNCOMMON, bonusType: 'STREAK', bonusValue: 5, price: 250, icon: '💍', imageUrl: '/assets/items/accessories/anel-da-consistencia.png' } }),
    prisma.equipment.upsert({ where: { name: 'Botas da Velocidade' }, update: { imageUrl: '/assets/items/boots/botas-da-velocidade.png', price: 150, description: 'Botas leves e reforçadas, feitas para aumentar mobilidade e agilidade.' }, create: { name: 'Botas da Velocidade', description: 'Botas leves e reforçadas, feitas para aumentar mobilidade e agilidade.', type: EquipType.BOOTS, rarity: Rarity.COMMON, bonusType: 'SPEED', bonusValue: 5, price: 150, icon: '👟', imageUrl: '/assets/items/boots/botas-da-velocidade.png' } }),
    prisma.equipment.upsert({ where: { name: 'Livro da Sabedoria' }, update: { imageUrl: '/assets/items/books/livro-da-sabedoria.png', price: 1200, description: 'Um grimório épico repleto de conhecimento arcano e energia ancestral.' }, create: { name: 'Livro da Sabedoria', description: 'Um grimório épico repleto de conhecimento arcano e energia ancestral.', type: EquipType.BOOK, rarity: Rarity.EPIC, bonusType: 'WISDOM', bonusValue: 20, price: 1200, icon: '📖', imageUrl: '/assets/items/books/livro-da-sabedoria.png' } }),
    prisma.equipment.upsert({ where: { name: 'Medalha da Persistência' }, update: { imageUrl: '/assets/items/accessories/medalha-da-persistencia.png', price: 650, description: 'Uma medalha rara concedida àqueles que resistem, insistem e continuam evoluindo.' }, create: { name: 'Medalha da Persistência', description: 'Uma medalha rara concedida àqueles que resistem, insistem e continuam evoluindo.', type: EquipType.MEDAL, rarity: Rarity.RARE, bonusType: 'PERSISTENCE', bonusValue: 12, price: 650, icon: '🏅', imageUrl: '/assets/items/accessories/medalha-da-persistencia.png' } }),
    prisma.equipment.upsert({ where: { name: 'Amuleto da Clareza' }, update: { imageUrl: '/assets/items/accessories/amuleto-da-clareza.png', price: 280, description: 'Um amuleto cristalino que favorece foco, lucidez e percepção.' }, create: { name: 'Amuleto da Clareza', description: 'Um amuleto cristalino que favorece foco, lucidez e percepção.', type: EquipType.AMULET, rarity: Rarity.UNCOMMON, bonusType: 'CLARITY', bonusValue: 8, price: 280, icon: '🔮', imageUrl: '/assets/items/accessories/amuleto-da-clareza.png' } }),
    prisma.equipment.upsert({ where: { name: 'Escudo da Rotina' }, update: {}, create: { name: 'Escudo da Rotina', description: 'Protege sua consistência contra o caos do dia a dia.', type: EquipType.ARMOR, rarity: Rarity.COMMON, bonusType: 'ROUTINE', bonusValue: 3, price: 30, icon: '🔰' } }),
    prisma.equipment.upsert({ where: { name: 'Relíquia da Evolução' }, update: { imageUrl: '/assets/items/relics/reliquia-da-evolucao.png', price: 3000, description: 'Uma relíquia lendária ligada à ascensão, transformação e crescimento contínuo.' }, create: { name: 'Relíquia da Evolução', description: 'Uma relíquia lendária ligada à ascensão, transformação e crescimento contínuo.', type: EquipType.RELIC, rarity: Rarity.LEGENDARY, bonusType: 'ALL', bonusValue: 25, price: 3000, icon: '✨', imageUrl: '/assets/items/relics/reliquia-da-evolucao.png' } }),
    prisma.equipment.upsert({ where: { name: 'Coroa do Ápice' }, update: { imageUrl: '/assets/items/relics/coroa-do-apice.png', price: 6000, description: 'Uma relíquia mítica que representa o ápice da evolução e da conquista.' }, create: { name: 'Coroa do Ápice', description: 'Uma relíquia mítica que representa o ápice da evolução e da conquista.', type: EquipType.RELIC, rarity: Rarity.MYTHIC, bonusType: 'ALL', bonusValue: 50, price: 6000, icon: '👑', imageUrl: '/assets/items/relics/coroa-do-apice.png' } }),
    prisma.equipment.upsert({ where: { name: 'Espada da Força Interior' }, update: {}, create: { name: 'Espada da Força Interior', description: 'Forjada com determinação pura e esforço inabalável.', type: EquipType.WEAPON, rarity: Rarity.LEGENDARY, bonusType: 'STRENGTH', bonusValue: 30, price: 800, icon: '🗡️' } }),
    prisma.equipment.upsert({ where: { name: 'Bracelete da Vitalidade' }, update: { imageUrl: '/assets/items/accessories/bracelete-da-vitalidade.png', price: 600, type: EquipType.BRACELET, description: 'Um bracelete raro que pulsa energia vital e fortalece a resistência do usuário.' }, create: { name: 'Bracelete da Vitalidade', description: 'Um bracelete raro que pulsa energia vital e fortalece a resistência do usuário.', type: EquipType.BRACELET, rarity: Rarity.RARE, bonusType: 'VITALITY', bonusValue: 18, price: 600, icon: '⚡', imageUrl: '/assets/items/accessories/bracelete-da-vitalidade.png' } }),

    // === ESCUDOS (Catálogo de Armas) ===
    prisma.equipment.upsert({ where: { name: 'Escudo do Rei das Sombras' }, update: { imageUrl: '/assets/shields/escudo-supremo-do-nucleo-ascendente-rank-s.png' }, create: { name: 'Escudo do Rei das Sombras', description: 'Forjado nas profundezas das trevas, irradia poder sombrio. DEF +260, HP +650, Bloqueio +20%.', type: EquipType.ARMOR, rarity: Rarity.MYTHIC, bonusType: 'DEFENSE', bonusValue: 260, price: 8000, icon: '🛡️', imageUrl: '/assets/shields/escudo-supremo-do-nucleo-ascendente-rank-s.png' } }),
    prisma.equipment.upsert({ where: { name: 'Escudo do Guardião Fantasma' }, update: { imageUrl: '/assets/shields/escudo-da-barreira-sombria-rank-b.png' }, create: { name: 'Escudo do Guardião Fantasma', description: 'Escudo etéreo que atravessa ataques físicos. DEF +185, Defesa +16%, Mana +40, Bloqueio +14%.', type: EquipType.ARMOR, rarity: Rarity.EPIC, bonusType: 'DEFENSE', bonusValue: 185, price: 2800, icon: '🛡️', imageUrl: '/assets/shields/escudo-da-barreira-sombria-rank-b.png' } }),
    prisma.equipment.upsert({ where: { name: 'Bastião do Guardião Lunar' }, update: { imageUrl: '/assets/shields/escudo-runico-de-ciano-rank-c.png' }, create: { name: 'Bastião do Guardião Lunar', description: 'Escudo imbuído com energia da lua. DEF +138, HP +240, Resistência Mágica +10%.', type: EquipType.ARMOR, rarity: Rarity.RARE, bonusType: 'DEFENSE', bonusValue: 138, price: 950, icon: '🛡️', imageUrl: '/assets/shields/escudo-runico-de-ciano-rank-c.png' } }),
    prisma.equipment.upsert({ where: { name: 'Escudo de Ferro Rúnico' }, update: { imageUrl: '/assets/shields/escudo-do-vigia-de-ferro-rank-d.png' }, create: { name: 'Escudo de Ferro Rúnico', description: 'Ferro temperado com runas antigas. DEF +92, HP +150, Bloqueio +8%, Resistência +6%.', type: EquipType.ARMOR, rarity: Rarity.UNCOMMON, bonusType: 'DEFENSE', bonusValue: 92, price: 320, icon: '🛡️', imageUrl: '/assets/shields/escudo-do-vigia-de-ferro-rank-d.png' } }),
    prisma.equipment.upsert({ where: { name: 'Escudo do Iniciante' }, update: { imageUrl: '/assets/shields/escudo-de-madeira-rachada-rank-e.png' }, create: { name: 'Escudo do Iniciante', description: 'Escudo básico para novos caçadores. DEF +50, HP +70, Bloqueio +4%.', type: EquipType.ARMOR, rarity: Rarity.COMMON, bonusType: 'DEFENSE', bonusValue: 50, price: 80, icon: '🛡️', imageUrl: '/assets/shields/escudo-de-madeira-rachada-rank-e.png' } }),

    // === ARMADURAS — Catálogo Página 1 ===
    prisma.equipment.upsert({ where: { name: 'Armadura do Eclipse Abissal' }, update: { imageUrl: '/assets/armors/rank-s/chestplate.png' }, create: { name: 'Armadura do Eclipse Abissal', description: 'Forjada no coração de um eclipse sombrio. DEF +220, AGI +35, Mana +80, Resistência Sombria +25%.', type: EquipType.ARMOR, rarity: Rarity.MYTHIC, bonusType: 'DEFENSE', bonusValue: 220, price: 9000, icon: '🥋', imageUrl: '/assets/armors/rank-s/chestplate.png' } }),
    prisma.equipment.upsert({ where: { name: 'Couraça do Caçador Sombrio' }, update: { imageUrl: '/assets/armors/rank-b/chestplate.png' }, create: { name: 'Couraça do Caçador Sombrio', description: 'Armadura leve para caçadores das trevas. DEF +170, HP +450, Precisão +15, Furtividade +12%.', type: EquipType.ARMOR, rarity: Rarity.EPIC, bonusType: 'DEFENSE', bonusValue: 170, price: 3200, icon: '🥋', imageUrl: '/assets/armors/rank-b/chestplate.png' } }),
    prisma.equipment.upsert({ where: { name: 'Peitoral do Guardião Lunar' }, update: { imageUrl: '/assets/armors/rank-c/chestplate.png' }, create: { name: 'Peitoral do Guardião Lunar', description: 'Proteção imbuída pela luz da lua. DEF +125, Mana +40, Resistência Mágica +14%, Vitalidade +10.', type: EquipType.ARMOR, rarity: Rarity.RARE, bonusType: 'DEFENSE', bonusValue: 125, price: 1100, icon: '🥋', imageUrl: '/assets/armors/rank-c/chestplate.png' } }),
    prisma.equipment.upsert({ where: { name: 'Armadura de Ferro Rúnico' }, update: { imageUrl: '/assets/armors/rank-d/chestplate.png' }, create: { name: 'Armadura de Ferro Rúnico', description: 'Ferro forjado com runas protetoras. DEF +90, HP +220, Vitalidade +10, Bloqueio +8%.', type: EquipType.ARMOR, rarity: Rarity.UNCOMMON, bonusType: 'DEFENSE', bonusValue: 90, price: 380, icon: '🥋', imageUrl: '/assets/armors/rank-d/chestplate.png' } }),
    prisma.equipment.upsert({ where: { name: 'Colete do Iniciante das Ruínas' }, update: { imageUrl: '/assets/armors/rank-e/chestplate.png' }, create: { name: 'Colete do Iniciante das Ruínas', description: 'Colete encontrado nas ruínas. DEF +55, Stamina +80, Sorte +3, Recuperação +4/s.', type: EquipType.ARMOR, rarity: Rarity.COMMON, bonusType: 'DEFENSE', bonusValue: 55, price: 90, icon: '🥋', imageUrl: '/assets/armors/rank-e/chestplate.png' } }),

    // === ARMADURAS — Catálogo Página 4 ===
    prisma.equipment.upsert({ where: { name: 'Couraça do Dragão Obsidiano' }, update: { imageUrl: '/assets/armors/rank-s/chestplate.png' }, create: { name: 'Couraça do Dragão Obsidiano', description: 'Escamas de dragão obsidiano convertidas em armadura. DEF +240, Resistência a Fogo +25%, Força +28, HP +500.', type: EquipType.ARMOR, rarity: Rarity.MYTHIC, bonusType: 'DEFENSE', bonusValue: 240, price: 9500, icon: '🐉', imageUrl: '/assets/armors/rank-s/chestplate.png' } }),
    prisma.equipment.upsert({ where: { name: 'Armadura do General Fantasma' }, update: { imageUrl: '/assets/armors/rank-b/chestplate.png' }, create: { name: 'Armadura do General Fantasma', description: 'Usada por generais fantasmas em batalhas lendárias. DEF +175, Liderança +10, Defesa +15%, Mana +35.', type: EquipType.ARMOR, rarity: Rarity.EPIC, bonusType: 'DEFENSE', bonusValue: 175, price: 3500, icon: '👻', imageUrl: '/assets/armors/rank-b/chestplate.png' } }),
    prisma.equipment.upsert({ where: { name: 'Peitoral da Chama Sombria' }, update: { imageUrl: '/assets/armors/rank-c/chestplate.png' }, create: { name: 'Peitoral da Chama Sombria', description: 'Forjado nas chamas das profundezas. DEF +118, Dano de Fogo +12%, Resistência +10%, HP +170.', type: EquipType.ARMOR, rarity: Rarity.RARE, bonusType: 'DEFENSE', bonusValue: 118, price: 980, icon: '🔥', imageUrl: '/assets/armors/rank-c/chestplate.png' } }),
    prisma.equipment.upsert({ where: { name: 'Colete do Rastreador de Masmorras' }, update: { imageUrl: '/assets/armors/rank-d/chestplate.png' }, create: { name: 'Colete do Rastreador de Masmorras', description: 'Leve e discreto para explorar masmorras. DEF +82, Visão +12, Stamina +70, Furtividade +5%.', type: EquipType.ARMOR, rarity: Rarity.UNCOMMON, bonusType: 'DEFENSE', bonusValue: 82, price: 290, icon: '🗺️', imageUrl: '/assets/armors/rank-d/chestplate.png' } }),
    prisma.equipment.upsert({ where: { name: 'Armadura Simples do Desperto' }, update: { imageUrl: '/assets/armors/rank-e/chestplate.png' }, create: { name: 'Armadura Simples do Desperto', description: 'Primeira armadura de quem acabou de despertar. DEF +45, HP +100, Recuperação +5/s, Resistência +4%.', type: EquipType.ARMOR, rarity: Rarity.COMMON, bonusType: 'DEFENSE', bonusValue: 45, price: 60, icon: '⚙️', imageUrl: '/assets/armors/rank-e/chestplate.png' } }),

    // === ESPADAS — Catálogo Página 1 ===
    prisma.equipment.upsert({ where: { name: 'Espada do Monarca do Eclipse' }, update: { imageUrl: '/assets/weapons/swords/lamina-suprema-da-ascensao-rank-s.png' }, create: { name: 'Espada do Monarca do Eclipse', description: 'ATK +245, Crítico +22%, Dano Sombrio +20%, AGI +18, Perfuração +15%.', type: EquipType.WEAPON, rarity: Rarity.MYTHIC, bonusType: 'ATTACK', bonusValue: 245, price: 8500, icon: '⚔️', imageUrl: '/assets/weapons/swords/lamina-suprema-da-ascensao-rank-s.png' } }),
    prisma.equipment.upsert({ where: { name: 'Espada da Tempestade Violeta' }, update: { imageUrl: '/assets/weapons/swords/lamina-da-fenda-sombria-rank-b.png' }, create: { name: 'Espada da Tempestade Violeta', description: 'ATK +185, Velocidade +16, Dano Elétrico +12%, Precisão +10.', type: EquipType.WEAPON, rarity: Rarity.EPIC, bonusType: 'ATTACK', bonusValue: 185, price: 2600, icon: '⚔️', imageUrl: '/assets/weapons/swords/lamina-da-fenda-sombria-rank-b.png' } }),
    prisma.equipment.upsert({ where: { name: 'Lâmina do Guardião Lunar' }, update: { imageUrl: '/assets/weapons/swords/espada-runica-de-ciano-rank-c.png' }, create: { name: 'Lâmina do Guardião Lunar', description: 'ATK +132, Mana +35, Crítico +8%, Resistência Mágica +10%.', type: EquipType.WEAPON, rarity: Rarity.RARE, bonusType: 'ATTACK', bonusValue: 132, price: 900, icon: '🗡️', imageUrl: '/assets/weapons/swords/espada-runica-de-ciano-rank-c.png' } }),
    prisma.equipment.upsert({ where: { name: 'Sabre Rúnico do Vigia' }, update: {}, create: { name: 'Sabre Rúnico do Vigia', description: 'ATK +88, AGI +8, Precisão +6, Sangramento +4%.', type: EquipType.WEAPON, rarity: Rarity.UNCOMMON, bonusType: 'ATTACK', bonusValue: 88, price: 300, icon: '🗡️' } }),
    prisma.equipment.upsert({ where: { name: 'Espada do Recruta Desperto' }, update: {}, create: { name: 'Espada do Recruta Desperto', description: 'ATK +46, Stamina +40, Precisão +2, Recuperação +2/s.', type: EquipType.WEAPON, rarity: Rarity.COMMON, bonusType: 'ATTACK', bonusValue: 46, price: 70, icon: '🗡️' } }),

    // === ARCOS — Catálogo Página 2 ===
    prisma.equipment.upsert({ where: { name: 'Arco do Eclipse Abissal' }, update: { imageUrl: '/assets/weapons/bows/arco-do-eclipse-ascendente-rank-s.png' }, create: { name: 'Arco do Eclipse Abissal', description: 'ATK +238, Crítico +24%, Alcance +18%, Penetração +14%, AGI +20.', type: EquipType.WEAPON, rarity: Rarity.MYTHIC, bonusType: 'ATTACK', bonusValue: 238, price: 8200, icon: '🏹', imageUrl: '/assets/weapons/bows/arco-do-eclipse-ascendente-rank-s.png' } }),
    prisma.equipment.upsert({ where: { name: 'Arco da Tempestade Sombria' }, update: { imageUrl: '/assets/weapons/bows/arco-da-sombra-perfurante-rank-b.png' }, create: { name: 'Arco da Tempestade Sombria', description: 'ATK +176, Velocidade +18, Dano Elétrico +10%, Precisão +12.', type: EquipType.WEAPON, rarity: Rarity.EPIC, bonusType: 'ATTACK', bonusValue: 176, price: 2500, icon: '🏹', imageUrl: '/assets/weapons/bows/arco-da-sombra-perfurante-rank-b.png' } }),
    prisma.equipment.upsert({ where: { name: 'Arco do Lobo Espiritual' }, update: { imageUrl: '/assets/weapons/bows/arco-da-mira-arcana-rank-c.png' }, create: { name: 'Arco do Lobo Espiritual', description: 'ATK +128, HP +120, Crítico +8%, AGI +12.', type: EquipType.WEAPON, rarity: Rarity.RARE, bonusType: 'ATTACK', bonusValue: 128, price: 850, icon: '🏹', imageUrl: '/assets/weapons/bows/arco-da-mira-arcana-rank-c.png' } }),
    prisma.equipment.upsert({ where: { name: 'Arco Rúnico do Explorador' }, update: { imageUrl: '/assets/weapons/bows/arco-do-vigia-silencioso-rank-d.png' }, create: { name: 'Arco Rúnico do Explorador', description: 'ATK +84, Mobilidade +8, Mana +20, Precisão +5.', type: EquipType.WEAPON, rarity: Rarity.UNCOMMON, bonusType: 'ATTACK', bonusValue: 84, price: 280, icon: '🏹', imageUrl: '/assets/weapons/bows/arco-do-vigia-silencioso-rank-d.png' } }),
    prisma.equipment.upsert({ where: { name: 'Arco Simples do Aspirante' }, update: { imageUrl: '/assets/weapons/bows/arco-de-madeira-rustica-rank-e.png' }, create: { name: 'Arco Simples do Aspirante', description: 'ATK +40, Stamina +35, Precisão +2, Evasão +3%.', type: EquipType.WEAPON, rarity: Rarity.COMMON, bonusType: 'ATTACK', bonusValue: 40, price: 65, icon: '🏹', imageUrl: '/assets/weapons/bows/arco-de-madeira-rustica-rank-e.png' } }),

    // === ARMADURAS — Catálogo Página 2 ===
    prisma.equipment.upsert({ where: { name: 'Vestes do Monarca da Noite' }, update: { imageUrl: '/assets/armors/rank-s/chestplate.png' }, create: { name: 'Vestes do Monarca da Noite', description: 'DEF +205, Mana +120, Regeneração +18/s, Resistência Sombria +30%, Recarga -10%.', type: EquipType.ARMOR, rarity: Rarity.MYTHIC, bonusType: 'DEFENSE', bonusValue: 205, price: 8800, icon: '🥷', imageUrl: '/assets/armors/rank-s/chestplate.png' } }),
    prisma.equipment.upsert({ where: { name: 'Armadura da Tempestade Roxa' }, update: { imageUrl: '/assets/armors/rank-b/chestplate.png' }, create: { name: 'Armadura da Tempestade Roxa', description: 'DEF +160, Velocidade +22, Evasão +15%, Dano Elétrico +12%.', type: EquipType.ARMOR, rarity: Rarity.EPIC, bonusType: 'DEFENSE', bonusValue: 160, price: 3000, icon: '🥋', imageUrl: '/assets/armors/rank-b/chestplate.png' } }),
    prisma.equipment.upsert({ where: { name: 'Couraça do Lobo Espiritual' }, update: { imageUrl: '/assets/armors/rank-c/chestplate.png' }, create: { name: 'Couraça do Lobo Espiritual', description: 'DEF +120, Crítico +10%, AGI +14, HP +180.', type: EquipType.ARMOR, rarity: Rarity.RARE, bonusType: 'DEFENSE', bonusValue: 120, price: 1000, icon: '🥋', imageUrl: '/assets/armors/rank-c/chestplate.png' } }),
    prisma.equipment.upsert({ where: { name: 'Manto do Vigia Arcano' }, update: { imageUrl: '/assets/armors/rank-d/chestplate.png' }, create: { name: 'Manto do Vigia Arcano', description: 'DEF +85, Mana +60, Recarga -8%, Resistência Arcana +9%.', type: EquipType.ARMOR, rarity: Rarity.UNCOMMON, bonusType: 'DEFENSE', bonusValue: 85, price: 310, icon: '🧥', imageUrl: '/assets/armors/rank-d/chestplate.png' } }),
    prisma.equipment.upsert({ where: { name: 'Armadura de Couro Sombrio' }, update: { imageUrl: '/assets/armors/rank-e/chestplate.png' }, create: { name: 'Armadura de Couro Sombrio', description: 'DEF +50, Furtividade +6%, Stamina +60, Evasão +4%.', type: EquipType.ARMOR, rarity: Rarity.COMMON, bonusType: 'DEFENSE', bonusValue: 50, price: 75, icon: '🥋', imageUrl: '/assets/armors/rank-e/chestplate.png' } }),

    // === ARMADURAS — Catálogo Página 3 ===
    prisma.equipment.upsert({ where: { name: 'Placas do Rei das Sombras' }, update: { imageUrl: '/assets/armors/rank-s/chestplate.png' }, create: { name: 'Placas do Rei das Sombras', description: 'DEF +230, HP +600, Dano Sombrio +20%, Controle de Sombras +1, Resistência +18%.', type: EquipType.ARMOR, rarity: Rarity.MYTHIC, bonusType: 'DEFENSE', bonusValue: 230, price: 9200, icon: '👑', imageUrl: '/assets/armors/rank-s/chestplate.png' } }),
    prisma.equipment.upsert({ where: { name: 'Cota do Sentinela do Vazio' }, update: { imageUrl: '/assets/armors/rank-b/chestplate.png' }, create: { name: 'Cota do Sentinela do Vazio', description: 'DEF +165, Resistência +18%, Precisão +12, Mana +35.', type: EquipType.ARMOR, rarity: Rarity.EPIC, bonusType: 'DEFENSE', bonusValue: 165, price: 3100, icon: '🥋', imageUrl: '/assets/armors/rank-b/chestplate.png' } }),
    prisma.equipment.upsert({ where: { name: 'Armadura do Berserker Noturno' }, update: { imageUrl: '/assets/armors/rank-c/chestplate.png' }, create: { name: 'Armadura do Berserker Noturno', description: 'DEF +130, Força +20, HP +250, Taxa Crítica +8%.', type: EquipType.ARMOR, rarity: Rarity.RARE, bonusType: 'DEFENSE', bonusValue: 130, price: 1050, icon: '⚙️', imageUrl: '/assets/armors/rank-c/chestplate.png' } }),
    prisma.equipment.upsert({ where: { name: 'Traje do Explorador de Portais' }, update: { imageUrl: '/assets/armors/rank-d/chestplate.png' }, create: { name: 'Traje do Explorador de Portais', description: 'DEF +88, Mobilidade +10, Mana +25, Resistência Elemental +8%.', type: EquipType.ARMOR, rarity: Rarity.UNCOMMON, bonusType: 'DEFENSE', bonusValue: 88, price: 330, icon: '🥋', imageUrl: '/assets/armors/rank-d/chestplate.png' } }),
    prisma.equipment.upsert({ where: { name: 'Jaqueta do Recruta Caçador' }, update: { imageUrl: '/assets/armors/rank-e/chestplate.png' }, create: { name: 'Jaqueta do Recruta Caçador', description: 'DEF +48, HP +120, Agilidade +5, Recuperação +3/s.', type: EquipType.ARMOR, rarity: Rarity.COMMON, bonusType: 'DEFENSE', bonusValue: 48, price: 72, icon: '🧥', imageUrl: '/assets/armors/rank-e/chestplate.png' } }),

    // === ESCUDOS com imagem (Rank E→S) ===
    prisma.equipment.upsert({ where: { name: 'Escudo de Madeira Rachada' }, update: { imageUrl: '/assets/shields/escudo-de-madeira-rachada-rank-e.png' }, create: { name: 'Escudo de Madeira Rachada', description: 'Escudo básico de madeira rachada. DEF +30, Bloqueio +3%.', type: EquipType.SHIELD, rarity: Rarity.COMMON, bonusType: 'defense', bonusValue: 30, price: 40, icon: '🛡️', imageUrl: '/assets/shields/escudo-de-madeira-rachada-rank-e.png', rank: 'E' } }),
    prisma.equipment.upsert({ where: { name: 'Escudo do Vigia de Ferro' }, update: { imageUrl: '/assets/shields/escudo-do-vigia-de-ferro-rank-d.png' }, create: { name: 'Escudo do Vigia de Ferro', description: 'Ferro robusto forjado para patrulheiros. DEF +68, HP +90, Bloqueio +5%.', type: EquipType.SHIELD, rarity: Rarity.UNCOMMON, bonusType: 'defense', bonusValue: 68, price: 180, icon: '🛡️', imageUrl: '/assets/shields/escudo-do-vigia-de-ferro-rank-d.png', rank: 'D' } }),
    prisma.equipment.upsert({ where: { name: 'Escudo Rúnico de Ciano' }, update: { imageUrl: '/assets/shields/escudo-runico-de-ciano-rank-c.png' }, create: { name: 'Escudo Rúnico de Ciano', description: 'Runas de proteção ciano gravadas no aço. DEF +112, HP +160, Bloqueio +8%.', type: EquipType.SHIELD, rarity: Rarity.RARE, bonusType: 'defense', bonusValue: 112, price: 650, icon: '🛡️', imageUrl: '/assets/shields/escudo-runico-de-ciano-rank-c.png', rank: 'C' } }),
    prisma.equipment.upsert({ where: { name: 'Escudo da Barreira Sombria' }, update: { imageUrl: '/assets/shields/escudo-da-barreira-sombria-rank-b.png' }, create: { name: 'Escudo da Barreira Sombria', description: 'Barreira de energia sombria condensada. DEF +168, HP +280, Bloqueio +13%, Resistência Sombria +10%.', type: EquipType.SHIELD, rarity: Rarity.EPIC, bonusType: 'defense', bonusValue: 168, price: 2200, icon: '🛡️', imageUrl: '/assets/shields/escudo-da-barreira-sombria-rank-b.png', rank: 'B' } }),
    prisma.equipment.upsert({ where: { name: 'Escudo do Guardião Astral' }, update: { imageUrl: '/assets/shields/escudo-do-guardiao-astral-rank-a.png' }, create: { name: 'Escudo do Guardião Astral', description: 'Escudo imbuído com poder astral. DEF +228, HP +420, Bloqueio +17%, Resistência Mágica +15%.', type: EquipType.SHIELD, rarity: Rarity.LEGENDARY, bonusType: 'defense', bonusValue: 228, price: 5800, icon: '🛡️', imageUrl: '/assets/shields/escudo-do-guardiao-astral-rank-a.png', rank: 'A' } }),
    prisma.equipment.upsert({ where: { name: 'Escudo Supremo do Núcleo Ascendente' }, update: { imageUrl: '/assets/shields/escudo-supremo-do-nucleo-ascendente-rank-s.png' }, create: { name: 'Escudo Supremo do Núcleo Ascendente', description: 'Forjado no núcleo da ascensão. DEF +310, HP +600, Bloqueio +22%, Reflete 8% do dano.', type: EquipType.SHIELD, rarity: Rarity.MYTHIC, bonusType: 'defense', bonusValue: 310, price: 12000, icon: '🛡️', imageUrl: '/assets/shields/escudo-supremo-do-nucleo-ascendente-rank-s.png', rank: 'S' } }),

    // === CAJADOS com imagem (Rank E→S) ===
    prisma.equipment.upsert({ where: { name: 'Cajado de Madeira Antiga' }, update: { imageUrl: '/assets/weapons/staffs/cajado-de-madeira-antiga-rank-e.png', bonusType: 'ATTACK', bonusValue: 28 }, create: { name: 'Cajado de Madeira Antiga', description: 'Cajado simples cortado de uma árvore ancestral. ATK +28, Mana +20.', type: EquipType.WEAPON, rarity: Rarity.COMMON, bonusType: 'ATTACK', bonusValue: 28, price: 45, icon: '🪄', imageUrl: '/assets/weapons/staffs/cajado-de-madeira-antiga-rank-e.png', rank: 'E' } }),
    prisma.equipment.upsert({ where: { name: 'Cajado do Aprendiz Arcano' }, update: { imageUrl: '/assets/weapons/staffs/cajado-do-aprendiz-arcano-rank-d.png', bonusType: 'ATTACK', bonusValue: 62 }, create: { name: 'Cajado do Aprendiz Arcano', description: 'Canaliza energia arcana para aprendizes. ATK +62, Mana +55, Inteligência +4.', type: EquipType.WEAPON, rarity: Rarity.UNCOMMON, bonusType: 'ATTACK', bonusValue: 62, price: 190, icon: '🪄', imageUrl: '/assets/weapons/staffs/cajado-do-aprendiz-arcano-rank-d.png', rank: 'D' } }),
    prisma.equipment.upsert({ where: { name: 'Cajado da Mana Ciano' }, update: { imageUrl: '/assets/weapons/staffs/cajado-da-mana-ciano-rank-c.png', bonusType: 'ATTACK', bonusValue: 105 }, create: { name: 'Cajado da Mana Ciano', description: 'Cristal ciano que amplifica magia. ATK +105, Mana +110, Regeneração +8/s.', type: EquipType.WEAPON, rarity: Rarity.RARE, bonusType: 'ATTACK', bonusValue: 105, price: 720, icon: '🪄', imageUrl: '/assets/weapons/staffs/cajado-da-mana-ciano-rank-c.png', rank: 'C' } }),
    prisma.equipment.upsert({ where: { name: 'Cajado da Névoa Sombria' }, update: { imageUrl: '/assets/weapons/staffs/cajado-da-nevoa-sombria-rank-b.png', bonusType: 'ATTACK', bonusValue: 158 }, create: { name: 'Cajado da Névoa Sombria', description: 'Envolto em névoa sombria permanente. ATK +158, Mana +180, Dano Sombrio +12%.', type: EquipType.WEAPON, rarity: Rarity.EPIC, bonusType: 'ATTACK', bonusValue: 158, price: 2400, icon: '🪄', imageUrl: '/assets/weapons/staffs/cajado-da-nevoa-sombria-rank-b.png', rank: 'B' } }),
    prisma.equipment.upsert({ where: { name: 'Cajado do Orbe Astral' }, update: { imageUrl: '/assets/weapons/staffs/cajado-do-orbe-astral-rank-a.png', bonusType: 'ATTACK', bonusValue: 215 }, create: { name: 'Cajado do Orbe Astral', description: 'Orbe astral que distorce a realidade. ATK +215, Mana +280, Crítico Mágico +15%.', type: EquipType.WEAPON, rarity: Rarity.LEGENDARY, bonusType: 'ATTACK', bonusValue: 215, price: 6200, icon: '🪄', imageUrl: '/assets/weapons/staffs/cajado-do-orbe-astral-rank-a.png', rank: 'A' } }),
    prisma.equipment.upsert({ where: { name: 'Cajado do Núcleo Eterno' }, update: { imageUrl: '/assets/weapons/staffs/cajado-do-nucleo-eterno-rank-s.png', bonusType: 'ATTACK', bonusValue: 298 }, create: { name: 'Cajado do Núcleo Eterno', description: 'O cajado mais poderoso já forjado. ATK +298, Mana +450, Todos os danos mágicos +20%.', type: EquipType.WEAPON, rarity: Rarity.MYTHIC, bonusType: 'ATTACK', bonusValue: 298, price: 14000, icon: '🪄', imageUrl: '/assets/weapons/staffs/cajado-do-nucleo-eterno-rank-s.png', rank: 'S' } }),

    // === MACHADOS com imagem (Rank E→S) ===
    prisma.equipment.upsert({ where: { name: 'Machado de Ferro Bruto' }, update: { imageUrl: '/assets/weapons/axes/machado-de-ferro-bruto-rank-e.png', bonusType: 'ATTACK', bonusValue: 38 }, create: { name: 'Machado de Ferro Bruto', description: 'Ferro bruto sem refinamento. ATK +38, Força +3.', type: EquipType.WEAPON, rarity: Rarity.COMMON, bonusType: 'ATTACK', bonusValue: 38, price: 55, icon: '🪓', imageUrl: '/assets/weapons/axes/machado-de-ferro-bruto-rank-e.png', rank: 'E' } }),
    prisma.equipment.upsert({ where: { name: 'Machado do Quebrador de Pedra' }, update: { imageUrl: '/assets/weapons/axes/machado-do-quebrador-de-pedra-rank-d.png', bonusType: 'ATTACK', bonusValue: 78 }, create: { name: 'Machado do Quebrador de Pedra', description: 'Destrói pedras e inimigos igualmente. ATK +78, Força +6, Perfuração +5%.', type: EquipType.WEAPON, rarity: Rarity.UNCOMMON, bonusType: 'ATTACK', bonusValue: 78, price: 210, icon: '🪓', imageUrl: '/assets/weapons/axes/machado-do-quebrador-de-pedra-rank-d.png', rank: 'D' } }),
    prisma.equipment.upsert({ where: { name: 'Machado Rúnico de Combate' }, update: { imageUrl: '/assets/weapons/axes/machado-runico-de-combate-rank-c.png', bonusType: 'ATTACK', bonusValue: 120 }, create: { name: 'Machado Rúnico de Combate', description: 'Runas de combate gravadas no aço. ATK +120, Força +10, Crítico +6%.', type: EquipType.WEAPON, rarity: Rarity.RARE, bonusType: 'ATTACK', bonusValue: 120, price: 780, icon: '🪓', imageUrl: '/assets/weapons/axes/machado-runico-de-combate-rank-c.png', rank: 'C' } }),
    prisma.equipment.upsert({ where: { name: 'Machado da Ruptura Sombria' }, update: { imageUrl: '/assets/weapons/axes/machado-da-ruptura-sombria-rank-b.png', bonusType: 'ATTACK', bonusValue: 172 }, create: { name: 'Machado da Ruptura Sombria', description: 'Rompe armaduras com energia sombria. ATK +172, Força +16, Perfuração +12%.', type: EquipType.WEAPON, rarity: Rarity.EPIC, bonusType: 'ATTACK', bonusValue: 172, price: 2600, icon: '🪓', imageUrl: '/assets/weapons/axes/machado-da-ruptura-sombria-rank-b.png', rank: 'B' } }),
    prisma.equipment.upsert({ where: { name: 'Machado do Titã Arcano' }, update: { imageUrl: '/assets/weapons/axes/machado-do-tita-arcano-rank-a.png', bonusType: 'ATTACK', bonusValue: 235 }, create: { name: 'Machado do Titã Arcano', description: 'Poder de titã canalizado em aço arcano. ATK +235, Força +24, Dano de Área +10%.', type: EquipType.WEAPON, rarity: Rarity.LEGENDARY, bonusType: 'ATTACK', bonusValue: 235, price: 6800, icon: '🪓', imageUrl: '/assets/weapons/axes/machado-do-tita-arcano-rank-a.png', rank: 'A' } }),
    prisma.equipment.upsert({ where: { name: 'Machado da Ruína Ascendente' }, update: { imageUrl: '/assets/weapons/axes/machado-da-ruina-ascendente-rank-s.png', bonusType: 'ATTACK', bonusValue: 320 }, create: { name: 'Machado da Ruína Ascendente', description: 'Forjado com a essência da ruína. ATK +320, Força +35, Desmonta defesas em 15%.', type: EquipType.WEAPON, rarity: Rarity.MYTHIC, bonusType: 'ATTACK', bonusValue: 320, price: 15000, icon: '🪓', imageUrl: '/assets/weapons/axes/machado-da-ruina-ascendente-rank-s.png', rank: 'S' } }),

    // === ADAGAS com imagem (Rank E→S) ===
    prisma.equipment.upsert({ where: { name: 'Adaga Enferrujada' }, update: { imageUrl: '/assets/weapons/daggers/adaga-enferrujada-rank-e.png', bonusType: 'ATTACK', bonusValue: 22 }, create: { name: 'Adaga Enferrujada', description: 'Faca velha e enferrujada. ATK +22, AGI +3, Veneno +2%.', type: EquipType.WEAPON, rarity: Rarity.COMMON, bonusType: 'ATTACK', bonusValue: 22, price: 35, icon: '🗡️', imageUrl: '/assets/weapons/daggers/adaga-enferrujada-rank-e.png', rank: 'E' } }),
    prisma.equipment.upsert({ where: { name: 'Adaga do Passo Rápido' }, update: { imageUrl: '/assets/weapons/daggers/adaga-do-passo-rapido-rank-d.png', bonusType: 'ATTACK', bonusValue: 55 }, create: { name: 'Adaga do Passo Rápido', description: 'Leveza extrema para ataques rápidos. ATK +55, AGI +8, Evasão +4%.', type: EquipType.WEAPON, rarity: Rarity.UNCOMMON, bonusType: 'ATTACK', bonusValue: 55, price: 160, icon: '🗡️', imageUrl: '/assets/weapons/daggers/adaga-do-passo-rapido-rank-d.png', rank: 'D' } }),
    prisma.equipment.upsert({ where: { name: 'Adaga do Corte Ciano' }, update: { imageUrl: '/assets/weapons/daggers/adaga-do-corte-ciano-rank-c.png', bonusType: 'ATTACK', bonusValue: 98 }, create: { name: 'Adaga do Corte Ciano', description: 'Lâmina imbuída com energia ciano. ATK +98, Crítico +10%, Veneno +6%.', type: EquipType.WEAPON, rarity: Rarity.RARE, bonusType: 'ATTACK', bonusValue: 98, price: 600, icon: '🗡️', imageUrl: '/assets/weapons/daggers/adaga-do-corte-ciano-rank-c.png', rank: 'C' } }),
    prisma.equipment.upsert({ where: { name: 'Adaga do Vazio Silencioso' }, update: { imageUrl: '/assets/weapons/daggers/adaga-do-vazio-silencioso-rank-b.png', bonusType: 'ATTACK', bonusValue: 148 }, create: { name: 'Adaga do Vazio Silencioso', description: 'Golpeia sem fazer barulho. ATK +148, Crítico +16%, Furtividade +14%.', type: EquipType.WEAPON, rarity: Rarity.EPIC, bonusType: 'ATTACK', bonusValue: 148, price: 2000, icon: '🗡️', imageUrl: '/assets/weapons/daggers/adaga-do-vazio-silencioso-rank-b.png', rank: 'B' } }),
    prisma.equipment.upsert({ where: { name: 'Adaga da Lua Arcana' }, update: { imageUrl: '/assets/weapons/daggers/adaga-da-lua-arcana-rank-a.png', bonusType: 'ATTACK', bonusValue: 205 }, create: { name: 'Adaga da Lua Arcana', description: 'Forjada sob luz lunar arcana. ATK +205, Crítico +22%, Dano Lunar +15%.', type: EquipType.WEAPON, rarity: Rarity.LEGENDARY, bonusType: 'ATTACK', bonusValue: 205, price: 5500, icon: '🗡️', imageUrl: '/assets/weapons/daggers/adaga-da-lua-arcana-rank-a.png', rank: 'A' } }),
    prisma.equipment.upsert({ where: { name: 'Adaga do Julgamento Sombrio' }, update: { imageUrl: '/assets/weapons/daggers/adaga-do-julgamento-sombrio-rank-s.png', bonusType: 'ATTACK', bonusValue: 285 }, create: { name: 'Adaga do Julgamento Sombrio', description: 'Execução instantânea dos inimigos mais fracos. ATK +285, Crítico +30%, Execução +8%.', type: EquipType.WEAPON, rarity: Rarity.MYTHIC, bonusType: 'ATTACK', bonusValue: 285, price: 13000, icon: '🗡️', imageUrl: '/assets/weapons/daggers/adaga-do-julgamento-sombrio-rank-s.png', rank: 'S' } }),

    // === ARCOS com imagem (Rank E→S) ===
    prisma.equipment.upsert({ where: { name: 'Arco de Madeira Rústica' }, update: { imageUrl: '/assets/weapons/bows/arco-de-madeira-rustica-rank-e.png', bonusType: 'ATTACK', bonusValue: 26 }, create: { name: 'Arco de Madeira Rústica', description: 'Arco simples de madeira rústica. ATK +26, Alcance +10%.', type: EquipType.WEAPON, rarity: Rarity.COMMON, bonusType: 'ATTACK', bonusValue: 26, price: 38, icon: '🏹', imageUrl: '/assets/weapons/bows/arco-de-madeira-rustica-rank-e.png', rank: 'E' } }),
    prisma.equipment.upsert({ where: { name: 'Arco do Vigia Silencioso' }, update: { imageUrl: '/assets/weapons/bows/arco-do-vigia-silencioso-rank-d.png', bonusType: 'ATTACK', bonusValue: 60 }, create: { name: 'Arco do Vigia Silencioso', description: 'Disparo silencioso sem alertar inimigos. ATK +60, Precisão +8, Furtividade +5%.', type: EquipType.WEAPON, rarity: Rarity.UNCOMMON, bonusType: 'ATTACK', bonusValue: 60, price: 170, icon: '🏹', imageUrl: '/assets/weapons/bows/arco-do-vigia-silencioso-rank-d.png', rank: 'D' } }),
    prisma.equipment.upsert({ where: { name: 'Arco da Mira Arcana' }, update: { imageUrl: '/assets/weapons/bows/arco-da-mira-arcana-rank-c.png', bonusType: 'ATTACK', bonusValue: 102 }, create: { name: 'Arco da Mira Arcana', description: 'Mira guiada por energia arcana. ATK +102, Precisão +14, Crítico +7%.', type: EquipType.WEAPON, rarity: Rarity.RARE, bonusType: 'ATTACK', bonusValue: 102, price: 650, icon: '🏹', imageUrl: '/assets/weapons/bows/arco-da-mira-arcana-rank-c.png', rank: 'C' } }),
    prisma.equipment.upsert({ where: { name: 'Arco da Sombra Perfurante' }, update: { imageUrl: '/assets/weapons/bows/arco-da-sombra-perfurante-rank-b.png', bonusType: 'ATTACK', bonusValue: 155 }, create: { name: 'Arco da Sombra Perfurante', description: 'Flechas que perfuram armaduras como sombra. ATK +155, Penetração +14%, Crítico +12%.', type: EquipType.WEAPON, rarity: Rarity.EPIC, bonusType: 'ATTACK', bonusValue: 155, price: 2100, icon: '🏹', imageUrl: '/assets/weapons/bows/arco-da-sombra-perfurante-rank-b.png', rank: 'B' } }),
    prisma.equipment.upsert({ where: { name: 'Arco do Céu Astral' }, update: { imageUrl: '/assets/weapons/bows/arco-do-ceu-astral-rank-a.png', bonusType: 'ATTACK', bonusValue: 210 }, create: { name: 'Arco do Céu Astral', description: 'Disparos astrais que ignoram distância. ATK +210, Alcance +30%, Dano Astral +18%.', type: EquipType.WEAPON, rarity: Rarity.LEGENDARY, bonusType: 'ATTACK', bonusValue: 210, price: 5800, icon: '🏹', imageUrl: '/assets/weapons/bows/arco-do-ceu-astral-rank-a.png', rank: 'A' } }),
    prisma.equipment.upsert({ where: { name: 'Arco do Eclipse Ascendente' }, update: { imageUrl: '/assets/weapons/bows/arco-do-eclipse-ascendente-rank-s.png', bonusType: 'ATTACK', bonusValue: 292 }, create: { name: 'Arco do Eclipse Ascendente', description: 'O arco mais poderoso do Sistema. ATK +292, Crítico +28%, Penetração +20%, AGI +25.', type: EquipType.WEAPON, rarity: Rarity.MYTHIC, bonusType: 'ATTACK', bonusValue: 292, price: 13500, icon: '🏹', imageUrl: '/assets/weapons/bows/arco-do-eclipse-ascendente-rank-s.png', rank: 'S' } }),

    // === ESPADAS com imagem (Rank C, B, A, S — E e D sem imagem disponível) ===
    prisma.equipment.upsert({ where: { name: 'Espada Rúnica de Ciano' }, update: { imageUrl: '/assets/weapons/swords/espada-runica-de-ciano-rank-c.png', bonusType: 'ATTACK', bonusValue: 115 }, create: { name: 'Espada Rúnica de Ciano', description: 'Runas cianas gravam lâmina de aço. ATK +115, Mana +30, Crítico +8%.', type: EquipType.WEAPON, rarity: Rarity.RARE, bonusType: 'ATTACK', bonusValue: 115, price: 700, icon: '⚔️', imageUrl: '/assets/weapons/swords/espada-runica-de-ciano-rank-c.png', rank: 'C' } }),
    prisma.equipment.upsert({ where: { name: 'Lâmina da Fenda Sombria' }, update: { imageUrl: '/assets/weapons/swords/lamina-da-fenda-sombria-rank-b.png', bonusType: 'ATTACK', bonusValue: 165 }, create: { name: 'Lâmina da Fenda Sombria', description: 'Abre fendas no espaço com cada corte. ATK +165, Dano Sombrio +14%, Crítico +11%.', type: EquipType.WEAPON, rarity: Rarity.EPIC, bonusType: 'ATTACK', bonusValue: 165, price: 2300, icon: '⚔️', imageUrl: '/assets/weapons/swords/lamina-da-fenda-sombria-rank-b.png', rank: 'B' } }),
    prisma.equipment.upsert({ where: { name: 'Espada do Arauto Arcano' }, update: { imageUrl: '/assets/weapons/swords/espada-do-arauto-arcano-rank-a.png', bonusType: 'ATTACK', bonusValue: 225 }, create: { name: 'Espada do Arauto Arcano', description: 'Arma dos arautos do poder arcano. ATK +225, Dano Arcano +18%, Força +22.', type: EquipType.WEAPON, rarity: Rarity.LEGENDARY, bonusType: 'ATTACK', bonusValue: 225, price: 6000, icon: '⚔️', imageUrl: '/assets/weapons/swords/espada-do-arauto-arcano-rank-a.png', rank: 'A' } }),
    prisma.equipment.upsert({ where: { name: 'Lâmina Suprema da Ascensão' }, update: { imageUrl: '/assets/weapons/swords/lamina-suprema-da-ascensao-rank-s.png', bonusType: 'ATTACK', bonusValue: 310 }, create: { name: 'Lâmina Suprema da Ascensão', description: 'A lâmina definitiva do Sistema de Ascensão. ATK +310, Crítico +25%, Todos os atributos +10.', type: EquipType.WEAPON, rarity: Rarity.MYTHIC, bonusType: 'ATTACK', bonusValue: 310, price: 14500, icon: '⚔️', imageUrl: '/assets/weapons/swords/lamina-suprema-da-ascensao-rank-s.png', rank: 'S' } }),

    // === LANÇAS com imagem (Rank E→S) ===
    prisma.equipment.upsert({ where: { name: 'Lança de Ferro Simples' }, update: { imageUrl: '/assets/weapons/spears/lanca-de-ferro-simples-rank-e.png', bonusType: 'ATTACK', bonusValue: 32 }, create: { name: 'Lança de Ferro Simples', description: 'Lança básica de ferro sem refinamento. ATK +32, Alcance +15%.', type: EquipType.WEAPON, rarity: Rarity.COMMON, bonusType: 'ATTACK', bonusValue: 32, price: 42, icon: '🔱', imageUrl: '/assets/weapons/spears/lanca-de-ferro-simples-rank-e.png', rank: 'E' } }),
    prisma.equipment.upsert({ where: { name: 'Lança do Guarda Desperto' }, update: { imageUrl: '/assets/weapons/spears/lanca-do-guarda-desperto-rank-d.png', bonusType: 'ATTACK', bonusValue: 72 }, create: { name: 'Lança do Guarda Desperto', description: 'Usada pelos guardas dos portais. ATK +72, Alcance +18%, HP +60.', type: EquipType.WEAPON, rarity: Rarity.UNCOMMON, bonusType: 'ATTACK', bonusValue: 72, price: 195, icon: '🔱', imageUrl: '/assets/weapons/spears/lanca-do-guarda-desperto-rank-d.png', rank: 'D' } }),
    prisma.equipment.upsert({ where: { name: 'Lança Rúnica Azul' }, update: { imageUrl: '/assets/weapons/spears/lanca-runica-azul-rank-c.png', bonusType: 'ATTACK', bonusValue: 118 }, create: { name: 'Lança Rúnica Azul', description: 'Runas azuis aumentam o alcance e dano. ATK +118, Mana +40, Alcance +22%.', type: EquipType.WEAPON, rarity: Rarity.RARE, bonusType: 'ATTACK', bonusValue: 118, price: 720, icon: '🔱', imageUrl: '/assets/weapons/spears/lanca-runica-azul-rank-c.png', rank: 'C' } }),
    prisma.equipment.upsert({ where: { name: 'Lança da Penumbra' }, update: { imageUrl: '/assets/weapons/spears/lanca-da-penumbra-rank-b.png', bonusType: 'ATTACK', bonusValue: 172 }, create: { name: 'Lança da Penumbra', description: 'Perfura alvos com sombras. ATK +172, Dano Sombrio +12%, Perfuração +10%.', type: EquipType.WEAPON, rarity: Rarity.EPIC, bonusType: 'ATTACK', bonusValue: 172, price: 2400, icon: '🔱', imageUrl: '/assets/weapons/spears/lanca-da-penumbra-rank-b.png', rank: 'B' } }),
    prisma.equipment.upsert({ where: { name: 'Lança Celestial do Arauto' }, update: { imageUrl: '/assets/weapons/spears/lanca-celestial-do-arauto-rank-a.png', bonusType: 'ATTACK', bonusValue: 232 }, create: { name: 'Lança Celestial do Arauto', description: 'Lança dos arautos celestes. ATK +232, Dano Sagrado +20%, Alcance +35%.', type: EquipType.WEAPON, rarity: Rarity.LEGENDARY, bonusType: 'ATTACK', bonusValue: 232, price: 6500, icon: '🔱', imageUrl: '/assets/weapons/spears/lanca-celestial-do-arauto-rank-a.png', rank: 'A' } }),
    prisma.equipment.upsert({ where: { name: 'Lança Divina da Ascensão' }, update: { imageUrl: '/assets/weapons/spears/lanca-divina-da-ascensao-rank-s.png', bonusType: 'ATTACK', bonusValue: 315 }, create: { name: 'Lança Divina da Ascensão', description: 'Arma divina do Sistema de Ascensão. ATK +315, Dano +25%, Alcance +40%, Força +30.', type: EquipType.WEAPON, rarity: Rarity.MYTHIC, bonusType: 'ATTACK', bonusValue: 315, price: 14800, icon: '🔱', imageUrl: '/assets/weapons/spears/lanca-divina-da-ascensao-rank-s.png', rank: 'S' } }),

    // === ITENS ESPECIAIS / CONSUMÍVEIS com imagem ===
    prisma.equipment.upsert({ where: { name: 'Cristal de EXP' }, update: { imageUrl: '/assets/items/cristal-de-exp.png' }, create: { name: 'Cristal de EXP', description: 'Cristal que libera experiência pura acumulada. Concede XP bônus ao usar.', type: EquipType.RELIC, rarity: Rarity.RARE, bonusType: 'xp', bonusValue: 50, price: 120, icon: '💠', imageUrl: '/assets/items/cristal-de-exp.png' } }),
    prisma.equipment.upsert({ where: { name: 'Kit de Reparo' }, update: { imageUrl: '/assets/items/kit-de-reparo.png' }, create: { name: 'Kit de Reparo', description: 'Restaura a durabilidade de qualquer equipamento para 100%.', type: EquipType.RELIC, rarity: Rarity.UNCOMMON, bonusType: 'durability', bonusValue: 100, price: 80, icon: '🔧', imageUrl: '/assets/items/kit-de-reparo.png' } }),
    prisma.equipment.upsert({ where: { name: 'Moeda do Sistema' }, update: { imageUrl: '/assets/items/moeda.png' }, create: { name: 'Moeda do Sistema', description: 'Moeda oficial do Sistema de Ascensão. Pode ser trocada na loja.', type: EquipType.MEDAL, rarity: Rarity.COMMON, bonusType: 'gold', bonusValue: 1, price: 1, icon: '🪙', imageUrl: '/assets/items/moeda.png' } }),
    prisma.equipment.upsert({ where: { name: 'Núcleo de Ascensão' }, update: { imageUrl: '/assets/items/nucleo-de-ascensao.png' }, create: { name: 'Núcleo de Ascensão', description: 'Fragmento do núcleo primordial. Necessário para evoluções de rank.', type: EquipType.RELIC, rarity: Rarity.EPIC, bonusType: 'ascension', bonusValue: 1, price: 800, icon: '🔮', imageUrl: '/assets/items/nucleo-de-ascensao.png' } }),
    prisma.equipment.upsert({ where: { name: 'Pedra de Aprimoramento' }, update: { imageUrl: '/assets/items/pedra-de-aprimoramento.png' }, create: { name: 'Pedra de Aprimoramento', description: 'Aumenta o nível de upgrade de um equipamento em 1.', type: EquipType.RELIC, rarity: Rarity.RARE, bonusType: 'upgrade', bonusValue: 1, price: 200, icon: '💎', imageUrl: '/assets/items/pedra-de-aprimoramento.png' } }),
    prisma.equipment.upsert({ where: { name: 'Poção de Mana' }, update: { imageUrl: '/assets/items/pocao-de-mana.png' }, create: { name: 'Poção de Mana', description: 'Restaura 50% da mana máxima instantaneamente.', type: EquipType.RELIC, rarity: Rarity.COMMON, bonusType: 'mana', bonusValue: 50, price: 30, icon: '🧪', imageUrl: '/assets/items/pocao-de-mana.png' } }),
    prisma.equipment.upsert({ where: { name: 'Poção de Vitalidade' }, update: { imageUrl: '/assets/items/pocao-de-vitalidade.png' }, create: { name: 'Poção de Vitalidade', description: 'Restaura 50% do HP máximo instantaneamente.', type: EquipType.RELIC, rarity: Rarity.COMMON, bonusType: 'vitality', bonusValue: 50, price: 30, icon: '🧪', imageUrl: '/assets/items/pocao-de-vitalidade.png' } }),
    prisma.equipment.upsert({ where: { name: 'Runa de Força' }, update: { imageUrl: '/assets/items/runa-de-forca.png' }, create: { name: 'Runa de Força', description: 'Runa ancestral que amplifica a força temporariamente.', type: EquipType.BOOK, rarity: Rarity.UNCOMMON, bonusType: 'strength', bonusValue: 8, price: 95, icon: '📜', imageUrl: '/assets/items/runa-de-forca.png' } }),

    // ── Rank E Armors ──────────────────────────────────────────────────────────
    prisma.equipment.upsert({ where: { name: 'Conjunto de Armadura Rank E' }, update: { imageUrl: '/assets/armors/rank-e/full.png', setKey: 'armor-rank-e', isFullSet: true }, create: { name: 'Conjunto de Armadura Rank E', description: 'DEF +18, VIT +10, HP +50. Armadura iniciante completa para caçadores emergentes.', type: EquipType.ARMOR, rarity: Rarity.COMMON, bonusType: 'def', bonusValue: 18, price: 220, icon: '🛡️', imageUrl: '/assets/armors/rank-e/full.png', rank: 'E', setKey: 'armor-rank-e', isFullSet: true } }),
    prisma.equipment.upsert({ where: { name: 'Elmo Rank E' }, update: { imageUrl: '/assets/armors/rank-e/helmet.png', setKey: 'armor-rank-e', bonusType: 'DEFENSE', bonusValue: 4 }, create: { name: 'Elmo Rank E', description: 'DEF +4, VIT +3. Elmo básico de ferro fundido.', type: EquipType.HELMET, rarity: Rarity.COMMON, bonusType: 'DEFENSE', bonusValue: 4, price: 50, icon: '⛑️', imageUrl: '/assets/armors/rank-e/helmet.png', rank: 'E', setKey: 'armor-rank-e' } }),
    prisma.equipment.upsert({ where: { name: 'Peitoral Rank E' }, update: { imageUrl: '/assets/armors/rank-e/chestplate.png', setKey: 'armor-rank-e' }, create: { name: 'Peitoral Rank E', description: 'DEF +8, HP +30. Placa peitoral de couro endurecido.', type: EquipType.CHESTPLATE, rarity: Rarity.COMMON, bonusType: 'def', bonusValue: 8, price: 90, icon: '🦺', imageUrl: '/assets/armors/rank-e/chestplate.png', rank: 'E', setKey: 'armor-rank-e' } }),
    prisma.equipment.upsert({ where: { name: 'Calça Rank E' }, update: { imageUrl: '/assets/armors/rank-e/pants.png', setKey: 'armor-rank-e', bonusType: 'DEFENSE', bonusValue: 4 }, create: { name: 'Calça Rank E', description: 'DEF +4, DIS +2. Calça reforçada para mobilidade em combate.', type: EquipType.PANTS, rarity: Rarity.COMMON, bonusType: 'DEFENSE', bonusValue: 4, price: 70, icon: '👖', imageUrl: '/assets/armors/rank-e/pants.png', rank: 'E', setKey: 'armor-rank-e' } }),
    prisma.equipment.upsert({ where: { name: 'Botas Rank E' }, update: { imageUrl: '/assets/armors/rank-e/boots.png', setKey: 'armor-rank-e', bonusType: 'DEFENSE', bonusValue: 2 }, create: { name: 'Botas Rank E', description: 'DEF +2, AGI +3. Botas de couro para iniciantes.', type: EquipType.BOOTS, rarity: Rarity.COMMON, bonusType: 'DEFENSE', bonusValue: 2, price: 60, icon: '🥾', imageUrl: '/assets/armors/rank-e/boots.png', rank: 'E', setKey: 'armor-rank-e' } }),

    // ── Rank D Armors ──────────────────────────────────────────────────────────
    prisma.equipment.upsert({ where: { name: 'Conjunto de Armadura Rank D' }, update: { imageUrl: '/assets/armors/rank-d/full.png', setKey: 'armor-rank-d', isFullSet: true }, create: { name: 'Conjunto de Armadura Rank D', description: 'DEF +38, VIT +22, HP +110. Armadura intermediária forjada com aço mágico.', type: EquipType.ARMOR, rarity: Rarity.UNCOMMON, bonusType: 'def', bonusValue: 38, price: 450, icon: '🛡️', imageUrl: '/assets/armors/rank-d/full.png', rank: 'D', setKey: 'armor-rank-d', isFullSet: true } }),
    prisma.equipment.upsert({ where: { name: 'Elmo Rank D' }, update: { imageUrl: '/assets/armors/rank-d/helmet.png', setKey: 'armor-rank-d', bonusType: 'DEFENSE', bonusValue: 9 }, create: { name: 'Elmo Rank D', description: 'DEF +9, VIT +6. Elmo de aço com reforço mágico leve.', type: EquipType.HELMET, rarity: Rarity.UNCOMMON, bonusType: 'DEFENSE', bonusValue: 9, price: 100, icon: '⛑️', imageUrl: '/assets/armors/rank-d/helmet.png', rank: 'D', setKey: 'armor-rank-d' } }),
    prisma.equipment.upsert({ where: { name: 'Peitoral Rank D' }, update: { imageUrl: '/assets/armors/rank-d/chestplate.png', setKey: 'armor-rank-d' }, create: { name: 'Peitoral Rank D', description: 'DEF +17, HP +70. Peitoral de aço reforçado com runas básicas.', type: EquipType.CHESTPLATE, rarity: Rarity.UNCOMMON, bonusType: 'def', bonusValue: 17, price: 180, icon: '🦺', imageUrl: '/assets/armors/rank-d/chestplate.png', rank: 'D', setKey: 'armor-rank-d' } }),
    prisma.equipment.upsert({ where: { name: 'Calça Rank D' }, update: { imageUrl: '/assets/armors/rank-d/pants.png', setKey: 'armor-rank-d', bonusType: 'DEFENSE', bonusValue: 9 }, create: { name: 'Calça Rank D', description: 'DEF +9, DIS +5. Calça de aço articulada para caçadores de rank D.', type: EquipType.PANTS, rarity: Rarity.UNCOMMON, bonusType: 'DEFENSE', bonusValue: 9, price: 140, icon: '👖', imageUrl: '/assets/armors/rank-d/pants.png', rank: 'D', setKey: 'armor-rank-d' } }),
    prisma.equipment.upsert({ where: { name: 'Botas Rank D' }, update: { imageUrl: '/assets/armors/rank-d/boots.png', setKey: 'armor-rank-d', bonusType: 'DEFENSE', bonusValue: 3 }, create: { name: 'Botas Rank D', description: 'DEF +3, AGI +6. Botas de combate reforçadas com ligas mágicas.', type: EquipType.BOOTS, rarity: Rarity.UNCOMMON, bonusType: 'DEFENSE', bonusValue: 3, price: 120, icon: '🥾', imageUrl: '/assets/armors/rank-d/boots.png', rank: 'D', setKey: 'armor-rank-d' } }),

    // ── Rank C Armors ──────────────────────────────────────────────────────────
    prisma.equipment.upsert({ where: { name: 'Conjunto de Armadura Rank C' }, update: { imageUrl: '/assets/armors/rank-c/full.png', setKey: 'armor-rank-c', isFullSet: true }, create: { name: 'Conjunto de Armadura Rank C', description: 'DEF +85, VIT +50, HP +250. Armadura encantada com cristais mágicos de alta pureza.', type: EquipType.ARMOR, rarity: Rarity.RARE, bonusType: 'def', bonusValue: 85, price: 950, icon: '🛡️', imageUrl: '/assets/armors/rank-c/full.png', rank: 'C', setKey: 'armor-rank-c', isFullSet: true } }),
    prisma.equipment.upsert({ where: { name: 'Elmo Rank C' }, update: { imageUrl: '/assets/armors/rank-c/helmet.png', setKey: 'armor-rank-c', bonusType: 'DEFENSE', bonusValue: 20 }, create: { name: 'Elmo Rank C', description: 'DEF +20, VIT +14, FOC +5. Elmo encantado com cristais de proteção.', type: EquipType.HELMET, rarity: Rarity.RARE, bonusType: 'DEFENSE', bonusValue: 20, price: 220, icon: '⛑️', imageUrl: '/assets/armors/rank-c/helmet.png', rank: 'C', setKey: 'armor-rank-c' } }),
    prisma.equipment.upsert({ where: { name: 'Peitoral Rank C' }, update: { imageUrl: '/assets/armors/rank-c/chestplate.png', setKey: 'armor-rank-c' }, create: { name: 'Peitoral Rank C', description: 'DEF +38, HP +160. Peitoral cristalino com barreira mágica passiva.', type: EquipType.CHESTPLATE, rarity: Rarity.RARE, bonusType: 'def', bonusValue: 38, price: 380, icon: '🦺', imageUrl: '/assets/armors/rank-c/chestplate.png', rank: 'C', setKey: 'armor-rank-c' } }),
    prisma.equipment.upsert({ where: { name: 'Calça Rank C' }, update: { imageUrl: '/assets/armors/rank-c/pants.png', setKey: 'armor-rank-c', bonusType: 'DEFENSE', bonusValue: 20 }, create: { name: 'Calça Rank C', description: 'DEF +20, DIS +10. Calça cristalina que amplifica disciplina em combate.', type: EquipType.PANTS, rarity: Rarity.RARE, bonusType: 'DEFENSE', bonusValue: 20, price: 300, icon: '👖', imageUrl: '/assets/armors/rank-c/pants.png', rank: 'C', setKey: 'armor-rank-c' } }),
    prisma.equipment.upsert({ where: { name: 'Botas Rank C' }, update: { imageUrl: '/assets/armors/rank-c/boots.png', setKey: 'armor-rank-c', bonusType: 'DEFENSE', bonusValue: 7 }, create: { name: 'Botas Rank C', description: 'DEF +7, AGI +12. Botas encantadas que aumentam velocidade de reação.', type: EquipType.BOOTS, rarity: Rarity.RARE, bonusType: 'DEFENSE', bonusValue: 7, price: 260, icon: '🥾', imageUrl: '/assets/armors/rank-c/boots.png', rank: 'C', setKey: 'armor-rank-c' } }),

    // ── Rank B Armors ──────────────────────────────────────────────────────────
    prisma.equipment.upsert({ where: { name: 'Conjunto de Armadura Rank B' }, update: { imageUrl: '/assets/armors/rank-b/full.png', setKey: 'armor-rank-b', isFullSet: true }, create: { name: 'Conjunto de Armadura Rank B', description: 'DEF +175, VIT +100, HP +550. Armadura épica forjada nas chamas sombrias de masmorras B.', type: EquipType.ARMOR, rarity: Rarity.EPIC, bonusType: 'def', bonusValue: 175, price: 1900, icon: '🛡️', imageUrl: '/assets/armors/rank-b/full.png', rank: 'B', setKey: 'armor-rank-b', isFullSet: true } }),
    prisma.equipment.upsert({ where: { name: 'Elmo Rank B' }, update: { imageUrl: '/assets/armors/rank-b/helmet.png', setKey: 'armor-rank-b', bonusType: 'DEFENSE', bonusValue: 42 }, create: { name: 'Elmo Rank B', description: 'DEF +42, VIT +28, FOC +12. Elmo épico com escudo mental anti-magia.', type: EquipType.HELMET, rarity: Rarity.EPIC, bonusType: 'DEFENSE', bonusValue: 42, price: 450, icon: '⛑️', imageUrl: '/assets/armors/rank-b/helmet.png', rank: 'B', setKey: 'armor-rank-b' } }),
    prisma.equipment.upsert({ where: { name: 'Peitoral Rank B' }, update: { imageUrl: '/assets/armors/rank-b/chestplate.png', setKey: 'armor-rank-b' }, create: { name: 'Peitoral Rank B', description: 'DEF +80, HP +350. Peitoral épico com absorção de dano mágico ativada.', type: EquipType.CHESTPLATE, rarity: Rarity.EPIC, bonusType: 'def', bonusValue: 80, price: 750, icon: '🦺', imageUrl: '/assets/armors/rank-b/chestplate.png', rank: 'B', setKey: 'armor-rank-b' } }),
    prisma.equipment.upsert({ where: { name: 'Calça Rank B' }, update: { imageUrl: '/assets/armors/rank-b/pants.png', setKey: 'armor-rank-b', bonusType: 'DEFENSE', bonusValue: 38 }, create: { name: 'Calça Rank B', description: 'DEF +38, DIS +20. Calça épica com reforço de mithril encantado.', type: EquipType.PANTS, rarity: Rarity.EPIC, bonusType: 'DEFENSE', bonusValue: 38, price: 600, icon: '👖', imageUrl: '/assets/armors/rank-b/pants.png', rank: 'B', setKey: 'armor-rank-b' } }),
    prisma.equipment.upsert({ where: { name: 'Botas Rank B' }, update: { imageUrl: '/assets/armors/rank-b/boots.png', setKey: 'armor-rank-b', bonusType: 'DEFENSE', bonusValue: 15 }, create: { name: 'Botas Rank B', description: 'DEF +15, AGI +25. Botas épicas que negam dano de queda e veneno.', type: EquipType.BOOTS, rarity: Rarity.EPIC, bonusType: 'DEFENSE', bonusValue: 15, price: 500, icon: '🥾', imageUrl: '/assets/armors/rank-b/boots.png', rank: 'B', setKey: 'armor-rank-b' } }),

    // ── Rank A Armors ──────────────────────────────────────────────────────────
    prisma.equipment.upsert({ where: { name: 'Conjunto de Armadura Rank A' }, update: { imageUrl: '/assets/armors/rank-a/full.png', setKey: 'armor-rank-a', isFullSet: true }, create: { name: 'Conjunto de Armadura Rank A', description: 'DEF +360, VIT +200, HP +1100. Armadura lendária imbuída com essência de soberanos.', type: EquipType.ARMOR, rarity: Rarity.LEGENDARY, bonusType: 'def', bonusValue: 360, price: 3800, icon: '🛡️', imageUrl: '/assets/armors/rank-a/full.png', rank: 'A', setKey: 'armor-rank-a', isFullSet: true } }),
    prisma.equipment.upsert({ where: { name: 'Elmo Rank A' }, update: { imageUrl: '/assets/armors/rank-a/helmet.png', setKey: 'armor-rank-a', bonusType: 'DEFENSE', bonusValue: 85 }, create: { name: 'Elmo Rank A', description: 'DEF +85, VIT +55, FOC +25. Elmo lendário com proteção contra magia de dominação.', type: EquipType.HELMET, rarity: Rarity.LEGENDARY, bonusType: 'DEFENSE', bonusValue: 85, price: 900, icon: '⛑️', imageUrl: '/assets/armors/rank-a/helmet.png', rank: 'A', setKey: 'armor-rank-a' } }),
    prisma.equipment.upsert({ where: { name: 'Peitoral Rank A' }, update: { imageUrl: '/assets/armors/rank-a/chestplate.png', setKey: 'armor-rank-a' }, create: { name: 'Peitoral Rank A', description: 'DEF +165, HP +700. Peitoral lendário com escudo de aura contínua.', type: EquipType.CHESTPLATE, rarity: Rarity.LEGENDARY, bonusType: 'def', bonusValue: 165, price: 1500, icon: '🦺', imageUrl: '/assets/armors/rank-a/chestplate.png', rank: 'A', setKey: 'armor-rank-a' } }),
    prisma.equipment.upsert({ where: { name: 'Calça Rank A' }, update: { imageUrl: '/assets/armors/rank-a/pants.png', setKey: 'armor-rank-a', bonusType: 'DEFENSE', bonusValue: 80 }, create: { name: 'Calça Rank A', description: 'DEF +80, DIS +40. Calça lendária tecida com fios de estrelas caídas.', type: EquipType.PANTS, rarity: Rarity.LEGENDARY, bonusType: 'DEFENSE', bonusValue: 80, price: 1200, icon: '👖', imageUrl: '/assets/armors/rank-a/pants.png', rank: 'A', setKey: 'armor-rank-a' } }),
    prisma.equipment.upsert({ where: { name: 'Botas Rank A' }, update: { imageUrl: '/assets/armors/rank-a/boots.png', setKey: 'armor-rank-a', bonusType: 'DEFENSE', bonusValue: 30 }, create: { name: 'Botas Rank A', description: 'DEF +30, AGI +50. Botas lendárias que permitem passo-fantasma por 3 segundos.', type: EquipType.BOOTS, rarity: Rarity.LEGENDARY, bonusType: 'DEFENSE', bonusValue: 30, price: 1000, icon: '🥾', imageUrl: '/assets/armors/rank-a/boots.png', rank: 'A', setKey: 'armor-rank-a' } }),

    // ── Rank S Armors ──────────────────────────────────────────────────────────
    prisma.equipment.upsert({ where: { name: 'Conjunto de Armadura Rank S' }, update: { imageUrl: '/assets/armors/rank-s/full.png', setKey: 'armor-rank-s', isFullSet: true }, create: { name: 'Conjunto de Armadura Rank S', description: 'DEF +720, VIT +400, HP +2200. Armadura mítica de um Soberano do Abismo selado.', type: EquipType.ARMOR, rarity: Rarity.MYTHIC, bonusType: 'def', bonusValue: 720, price: 7800, icon: '🛡️', imageUrl: '/assets/armors/rank-s/full.png', rank: 'S', setKey: 'armor-rank-s', isFullSet: true } }),
    prisma.equipment.upsert({ where: { name: 'Elmo Rank S' }, update: { imageUrl: '/assets/armors/rank-s/helmet.png', setKey: 'armor-rank-s', bonusType: 'DEFENSE', bonusValue: 170 }, create: { name: 'Elmo Rank S', description: 'DEF +170, VIT +110, FOC +50. Elmo mítico que contém a consciência de um Soberano.', type: EquipType.HELMET, rarity: Rarity.MYTHIC, bonusType: 'DEFENSE', bonusValue: 170, price: 1800, icon: '⛑️', imageUrl: '/assets/armors/rank-s/helmet.png', rank: 'S', setKey: 'armor-rank-s' } }),
    prisma.equipment.upsert({ where: { name: 'Peitoral Rank S' }, update: { imageUrl: '/assets/armors/rank-s/chestplate.png', setKey: 'armor-rank-s' }, create: { name: 'Peitoral Rank S', description: 'DEF +330, HP +1400. Peitoral mítico que regenera HP a cada turno de combate.', type: EquipType.CHESTPLATE, rarity: Rarity.MYTHIC, bonusType: 'def', bonusValue: 330, price: 3000, icon: '🦺', imageUrl: '/assets/armors/rank-s/chestplate.png', rank: 'S', setKey: 'armor-rank-s' } }),
    prisma.equipment.upsert({ where: { name: 'Calça Rank S' }, update: { imageUrl: '/assets/armors/rank-s/pants.png', setKey: 'armor-rank-s', bonusType: 'DEFENSE', bonusValue: 160 }, create: { name: 'Calça Rank S', description: 'DEF +160, DIS +80. Calça mítica que anula efeitos de lentidão e paralisação.', type: EquipType.PANTS, rarity: Rarity.MYTHIC, bonusType: 'DEFENSE', bonusValue: 160, price: 2400, icon: '👖', imageUrl: '/assets/armors/rank-s/pants.png', rank: 'S', setKey: 'armor-rank-s' } }),
    prisma.equipment.upsert({ where: { name: 'Botas Rank S' }, update: { imageUrl: '/assets/armors/rank-s/boots.png', setKey: 'armor-rank-s', bonusType: 'DEFENSE', bonusValue: 60 }, create: { name: 'Botas Rank S', description: 'DEF +60, AGI +100. Botas míticas que permitem voo rasante por 10 segundos.', type: EquipType.BOOTS, rarity: Rarity.MYTHIC, bonusType: 'DEFENSE', bonusValue: 60, price: 2000, icon: '🥾', imageUrl: '/assets/armors/rank-s/boots.png', rank: 'S', setKey: 'armor-rank-s' } }),
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

  // Missions — 34 missions across DAILY / WEEKLY / MONTHLY / SPECIAL
  // minDayUnlock controls progressive unlock via syncUserDaily:
  //   0 = available immediately, 3 = unlocked at day 3, 7 = day 7, 14 = day 14, 30 = day 30
  const missions = await Promise.all([
    // ── DAILY (reset every day) ───────────────────────────────────────────────
    prisma.mission.upsert({ where: { id: 'daily-001' }, update: { minDayUnlock: 0, category: 'GERAL' }, create: { id: 'daily-001', title: 'Guerreiro Diário', description: 'Complete 3 tarefas hoje', type: MissionType.DAILY, category: 'GERAL', requirementType: 'DAILY_TASKS', requirementValue: 3, xpReward: 50, essenceReward: 20, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'daily-002' }, update: { minDayUnlock: 0, category: 'TREINO' }, create: { id: 'daily-002', title: 'Corpo em Ação', description: 'Conclua uma tarefa de saúde ou treino', type: MissionType.DAILY, category: 'TREINO', requirementType: 'CATEGORY_HEALTH_TRAINING', requirementValue: 1, xpReward: 30, essenceReward: 15, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'daily-003' }, update: { minDayUnlock: 0, category: 'ESTUDO' }, create: { id: 'daily-003', title: 'Mente Afiada', description: 'Conclua uma tarefa de estudo', type: MissionType.DAILY, category: 'ESTUDO', requirementType: 'CATEGORY_STUDY', requirementValue: 1, xpReward: 30, essenceReward: 15, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'daily-004' }, update: { minDayUnlock: 0, category: 'GERAL' }, create: { id: 'daily-004', title: 'Colheita de XP', description: 'Ganhe 50 XP em um dia', type: MissionType.DAILY, category: 'GERAL', requirementType: 'DAILY_XP', requirementValue: 50, xpReward: 25, essenceReward: 10, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'daily-005' }, update: { minDayUnlock: 7, category: 'GERAL' }, create: { id: 'daily-005', title: 'Sprint do Dia', description: 'Complete 5 tarefas em um único dia', type: MissionType.DAILY, category: 'GERAL', requirementType: 'DAILY_TASKS', requirementValue: 5, xpReward: 75, essenceReward: 35, minDayUnlock: 7 } }),
    prisma.mission.upsert({ where: { id: 'daily-006' }, update: { minDayUnlock: 7, category: 'TREINO' }, create: { id: 'daily-006', title: 'Duplo Treino', description: 'Conclua 2 tarefas de saúde ou treino hoje', type: MissionType.DAILY, category: 'TREINO', requirementType: 'CATEGORY_HEALTH_TRAINING', requirementValue: 2, xpReward: 60, essenceReward: 30, minDayUnlock: 7 } }),
    prisma.mission.upsert({ where: { id: 'daily-007' }, update: { minDayUnlock: 7, category: 'ESTUDO' }, create: { id: 'daily-007', title: 'Dupla Sessão de Estudo', description: 'Estude em 2 sessões diferentes hoje', type: MissionType.DAILY, category: 'ESTUDO', requirementType: 'CATEGORY_STUDY', requirementValue: 2, xpReward: 60, essenceReward: 30, minDayUnlock: 7 } }),
    prisma.mission.upsert({ where: { id: 'daily-008' }, update: { minDayUnlock: 14, category: 'GERAL' }, create: { id: 'daily-008', title: 'XP Explosivo', description: 'Ganhe 100 XP em um único dia', type: MissionType.DAILY, category: 'GERAL', requirementType: 'DAILY_XP', requirementValue: 100, xpReward: 50, essenceReward: 25, minDayUnlock: 14 } }),
    prisma.mission.upsert({ where: { id: 'daily-009' }, update: { minDayUnlock: 14, category: 'GERAL' }, create: { id: 'daily-009', title: 'Maratona Diária', description: 'Complete 7 tarefas em um dia', type: MissionType.DAILY, category: 'GERAL', requirementType: 'DAILY_TASKS', requirementValue: 7, xpReward: 100, essenceReward: 50, minDayUnlock: 14 } }),

    // ── WEEKLY (reset every Monday) ───────────────────────────────────────────
    prisma.mission.upsert({ where: { id: 'weekly-001' }, update: { minDayUnlock: 0, category: 'GERAL' }, create: { id: 'weekly-001', title: 'Semana Produtiva', description: 'Complete 20 tarefas esta semana', type: MissionType.WEEKLY, category: 'GERAL', requirementType: 'WEEKLY_TASKS', requirementValue: 20, xpReward: 200, essenceReward: 100, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'weekly-002' }, update: { minDayUnlock: 0, category: 'TREINO' }, create: { id: 'weekly-002', title: 'Atleta da Semana', description: 'Treine 3 vezes esta semana', type: MissionType.WEEKLY, category: 'TREINO', requirementType: 'WEEKLY_TRAINING', requirementValue: 3, xpReward: 150, essenceReward: 75, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'weekly-003' }, update: { minDayUnlock: 0, category: 'ESTUDO' }, create: { id: 'weekly-003', title: 'Estudioso Dedicado', description: 'Estude 5 vezes esta semana', type: MissionType.WEEKLY, category: 'ESTUDO', requirementType: 'WEEKLY_STUDY', requirementValue: 5, xpReward: 150, essenceReward: 75, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'weekly-004' }, update: { minDayUnlock: 3, category: 'GERAL' }, create: { id: 'weekly-004', title: 'Dez por Semana', description: 'Complete 10 tarefas nesta semana', type: MissionType.WEEKLY, category: 'GERAL', requirementType: 'WEEKLY_TASKS', requirementValue: 10, xpReward: 120, essenceReward: 60, minDayUnlock: 3 } }),
    prisma.mission.upsert({ where: { id: 'weekly-005' }, update: { minDayUnlock: 7, category: 'TREINO' }, create: { id: 'weekly-005', title: 'Consistência Atlética', description: 'Treine 5 vezes nesta semana', type: MissionType.WEEKLY, category: 'TREINO', requirementType: 'WEEKLY_TRAINING', requirementValue: 5, xpReward: 200, essenceReward: 100, minDayUnlock: 7 } }),
    prisma.mission.upsert({ where: { id: 'weekly-006' }, update: { minDayUnlock: 7, category: 'ESTUDO' }, create: { id: 'weekly-006', title: 'Semana de Estudos', description: 'Estude 7 vezes nesta semana', type: MissionType.WEEKLY, category: 'ESTUDO', requirementType: 'WEEKLY_STUDY', requirementValue: 7, xpReward: 200, essenceReward: 100, minDayUnlock: 7 } }),
    prisma.mission.upsert({ where: { id: 'weekly-007' }, update: { minDayUnlock: 14, category: 'GERAL' }, create: { id: 'weekly-007', title: 'Semana Máxima', description: 'Complete 30 tarefas nesta semana', type: MissionType.WEEKLY, category: 'GERAL', requirementType: 'WEEKLY_TASKS', requirementValue: 30, xpReward: 300, essenceReward: 150, minDayUnlock: 14 } }),
    prisma.mission.upsert({ where: { id: 'weekly-008' }, update: { minDayUnlock: 30, category: 'GERAL' }, create: { id: 'weekly-008', title: 'Mestre Semanal', description: 'Complete 40 tarefas em uma semana', type: MissionType.WEEKLY, category: 'GERAL', requirementType: 'WEEKLY_TASKS', requirementValue: 40, xpReward: 400, essenceReward: 200, minDayUnlock: 30 } }),

    // ── MONTHLY (reset on the 1st of every month) ─────────────────────────────
    prisma.mission.upsert({ where: { id: 'monthly-001' }, update: { minDayUnlock: 14, category: 'GERAL' }, create: { id: 'monthly-001', title: 'Mês Produtivo', description: 'Complete 30 tarefas neste mês', type: MissionType.MONTHLY, category: 'GERAL', requirementType: 'MONTHLY_TASKS', requirementValue: 30, xpReward: 500, essenceReward: 250, minDayUnlock: 14 } }),
    prisma.mission.upsert({ where: { id: 'monthly-002' }, update: { minDayUnlock: 14, category: 'TREINO' }, create: { id: 'monthly-002', title: 'Mês de Treino', description: 'Treine 12 vezes neste mês', type: MissionType.MONTHLY, category: 'TREINO', requirementType: 'MONTHLY_TRAINING', requirementValue: 12, xpReward: 400, essenceReward: 200, minDayUnlock: 14 } }),
    prisma.mission.upsert({ where: { id: 'monthly-003' }, update: { minDayUnlock: 14, category: 'ESTUDO' }, create: { id: 'monthly-003', title: 'Mês de Estudos', description: 'Estude 15 vezes neste mês', type: MissionType.MONTHLY, category: 'ESTUDO', requirementType: 'MONTHLY_STUDY', requirementValue: 15, xpReward: 400, essenceReward: 200, minDayUnlock: 14 } }),
    prisma.mission.upsert({ where: { id: 'monthly-004' }, update: { minDayUnlock: 30, category: 'GERAL' }, create: { id: 'monthly-004', title: 'Mês Extremo', description: 'Complete 60 tarefas em um mês', type: MissionType.MONTHLY, category: 'GERAL', requirementType: 'MONTHLY_TASKS', requirementValue: 60, xpReward: 800, essenceReward: 400, minDayUnlock: 30 } }),
    prisma.mission.upsert({ where: { id: 'monthly-005' }, update: { minDayUnlock: 30, category: 'TREINO' }, create: { id: 'monthly-005', title: 'Atleta do Mês', description: 'Complete 20 treinos neste mês', type: MissionType.MONTHLY, category: 'TREINO', requirementType: 'MONTHLY_HEALTH', requirementValue: 20, xpReward: 600, essenceReward: 300, minDayUnlock: 30 } }),

    // ── SPECIAL (never reset — milestone based) ───────────────────────────────
    prisma.mission.upsert({ where: { id: 'special-001' }, update: { minDayUnlock: 0, category: 'MARCO' }, create: { id: 'special-001', title: 'O Começo', description: 'Conclua sua primeira tarefa', type: MissionType.SPECIAL, category: 'MARCO', requirementType: 'TASKS_COMPLETED', requirementValue: 1, xpReward: 100, essenceReward: 50, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'special-002' }, update: { minDayUnlock: 0, category: 'NÍVEL' }, create: { id: 'special-002', title: 'Ascensão Inicial', description: 'Alcance o nível 5', type: MissionType.SPECIAL, category: 'NÍVEL', requirementType: 'LEVEL', requirementValue: 5, xpReward: 500, essenceReward: 200, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'special-003' }, update: { minDayUnlock: 0, category: 'MARCO' }, create: { id: 'special-003', title: 'Centenário das Tarefas', description: 'Complete 100 tarefas', type: MissionType.SPECIAL, category: 'MARCO', requirementType: 'TASKS_COMPLETED', requirementValue: 100, xpReward: 2000, essenceReward: 1000, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'special-004' }, update: { minDayUnlock: 0, category: 'MARCO' }, create: { id: 'special-004', title: '10 Tarefas Concluídas', description: 'Complete 10 tarefas no total', type: MissionType.SPECIAL, category: 'MARCO', requirementType: 'TASKS_COMPLETED', requirementValue: 10, xpReward: 150, essenceReward: 75, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'special-005' }, update: { minDayUnlock: 0, category: 'MARCO' }, create: { id: 'special-005', title: '25 Tarefas Concluídas', description: 'Complete 25 tarefas no total', type: MissionType.SPECIAL, category: 'MARCO', requirementType: 'TASKS_COMPLETED', requirementValue: 25, xpReward: 300, essenceReward: 150, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'special-006' }, update: { minDayUnlock: 0, category: 'MARCO' }, create: { id: 'special-006', title: '50 Tarefas Concluídas', description: 'Complete 50 tarefas no total', type: MissionType.SPECIAL, category: 'MARCO', requirementType: 'TASKS_COMPLETED', requirementValue: 50, xpReward: 600, essenceReward: 300, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'special-007' }, update: { minDayUnlock: 3, category: 'NÍVEL' }, create: { id: 'special-007', title: 'Nível 3', description: 'Alcance o nível 3', type: MissionType.SPECIAL, category: 'NÍVEL', requirementType: 'LEVEL', requirementValue: 3, xpReward: 200, essenceReward: 100, minDayUnlock: 3 } }),
    prisma.mission.upsert({ where: { id: 'special-008' }, update: { minDayUnlock: 14, category: 'NÍVEL' }, create: { id: 'special-008', title: 'Nível 10', description: 'Alcance o nível 10', type: MissionType.SPECIAL, category: 'NÍVEL', requirementType: 'LEVEL', requirementValue: 10, xpReward: 1000, essenceReward: 500, minDayUnlock: 14 } }),
    prisma.mission.upsert({ where: { id: 'special-009' }, update: { minDayUnlock: 30, category: 'NÍVEL' }, create: { id: 'special-009', title: 'Nível 15', description: 'Alcance o nível 15', type: MissionType.SPECIAL, category: 'NÍVEL', requirementType: 'LEVEL', requirementValue: 15, xpReward: 2000, essenceReward: 1000, minDayUnlock: 30 } }),
    prisma.mission.upsert({ where: { id: 'special-010' }, update: { minDayUnlock: 30, category: 'MARCO' }, create: { id: 'special-010', title: 'Guerreiro Lendário', description: 'Complete 250 tarefas no total', type: MissionType.SPECIAL, category: 'MARCO', requirementType: 'TASKS_COMPLETED', requirementValue: 250, xpReward: 4000, essenceReward: 2000, minDayUnlock: 30 } }),
    prisma.mission.upsert({ where: { id: 'special-011' }, update: { minDayUnlock: 30, category: 'MARCO' }, create: { id: 'special-011', title: 'Mito Ascendente', description: 'Complete 500 tarefas no total', type: MissionType.SPECIAL, category: 'MARCO', requirementType: 'TASKS_COMPLETED', requirementValue: 500, xpReward: 7000, essenceReward: 3500, minDayUnlock: 30 } }),
    prisma.mission.upsert({ where: { id: 'special-012' }, update: { minDayUnlock: 30, category: 'NÍVEL' }, create: { id: 'special-012', title: 'Nível 20', description: 'Alcance o nível 20', type: MissionType.SPECIAL, category: 'NÍVEL', requirementType: 'LEVEL', requirementValue: 20, xpReward: 4000, essenceReward: 2000, minDayUnlock: 30 } }),

    // ── DAILY adicionais ──────────────────────────────────────────────────────
    prisma.mission.upsert({ where: { id: 'daily-010' }, update: { minDayUnlock: 0, category: 'GERAL' }, create: { id: 'daily-010', title: 'Aquecimento', description: 'Complete 1 tarefa hoje', type: MissionType.DAILY, category: 'GERAL', requirementType: 'DAILY_TASKS', requirementValue: 1, xpReward: 15, essenceReward: 5, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'daily-011' }, update: { minDayUnlock: 0, category: 'GERAL' }, create: { id: 'daily-011', title: 'Dupla do Dia', description: 'Complete 2 tarefas hoje', type: MissionType.DAILY, category: 'GERAL', requirementType: 'DAILY_TASKS', requirementValue: 2, xpReward: 25, essenceReward: 10, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'daily-012' }, update: { minDayUnlock: 14, category: 'TREINO' }, create: { id: 'daily-012', title: 'Triplo Treino', description: 'Complete 3 tarefas de treino hoje', type: MissionType.DAILY, category: 'TREINO', requirementType: 'CATEGORY_HEALTH_TRAINING', requirementValue: 3, xpReward: 80, essenceReward: 40, minDayUnlock: 14 } }),
    prisma.mission.upsert({ where: { id: 'daily-013' }, update: { minDayUnlock: 14, category: 'ESTUDO' }, create: { id: 'daily-013', title: 'Maratona do Conhecimento', description: 'Complete 3 tarefas de estudo hoje', type: MissionType.DAILY, category: 'ESTUDO', requirementType: 'CATEGORY_STUDY', requirementValue: 3, xpReward: 80, essenceReward: 40, minDayUnlock: 14 } }),
    prisma.mission.upsert({ where: { id: 'daily-014' }, update: { minDayUnlock: 21, category: 'GERAL' }, create: { id: 'daily-014', title: 'Explosão de Poder', description: 'Ganhe 150 XP em um único dia', type: MissionType.DAILY, category: 'GERAL', requirementType: 'DAILY_XP', requirementValue: 150, xpReward: 70, essenceReward: 35, minDayUnlock: 21 } }),
    prisma.mission.upsert({ where: { id: 'daily-015' }, update: { minDayUnlock: 30, category: 'GERAL' }, create: { id: 'daily-015', title: 'Perfeição Diária', description: 'Ganhe 200 XP em um único dia', type: MissionType.DAILY, category: 'GERAL', requirementType: 'DAILY_XP', requirementValue: 200, xpReward: 100, essenceReward: 50, minDayUnlock: 30 } }),
    prisma.mission.upsert({ where: { id: 'daily-016' }, update: { minDayUnlock: 30, category: 'GERAL' }, create: { id: 'daily-016', title: 'Sem Parar', description: 'Complete 10 tarefas em um único dia', type: MissionType.DAILY, category: 'GERAL', requirementType: 'DAILY_TASKS', requirementValue: 10, xpReward: 130, essenceReward: 65, minDayUnlock: 30 } }),

    // ── WEEKLY adicionais ─────────────────────────────────────────────────────
    prisma.mission.upsert({ where: { id: 'weekly-009' }, update: { minDayUnlock: 0, category: 'GERAL' }, create: { id: 'weekly-009', title: 'Primeiro Passo Semanal', description: 'Complete 5 tarefas nesta semana', type: MissionType.WEEKLY, category: 'GERAL', requirementType: 'WEEKLY_TASKS', requirementValue: 5, xpReward: 60, essenceReward: 30, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'weekly-010' }, update: { minDayUnlock: 3, category: 'TREINO' }, create: { id: 'weekly-010', title: 'Rotina Atlética', description: 'Treine 4 vezes nesta semana', type: MissionType.WEEKLY, category: 'TREINO', requirementType: 'WEEKLY_TRAINING', requirementValue: 4, xpReward: 175, essenceReward: 85, minDayUnlock: 3 } }),
    prisma.mission.upsert({ where: { id: 'weekly-011' }, update: { minDayUnlock: 3, category: 'ESTUDO' }, create: { id: 'weekly-011', title: 'Semana Acadêmica', description: 'Estude 4 vezes nesta semana', type: MissionType.WEEKLY, category: 'ESTUDO', requirementType: 'WEEKLY_STUDY', requirementValue: 4, xpReward: 175, essenceReward: 85, minDayUnlock: 3 } }),
    prisma.mission.upsert({ where: { id: 'weekly-012' }, update: { minDayUnlock: 14, category: 'GERAL' }, create: { id: 'weekly-012', title: 'Semana Equilibrada', description: 'Complete 25 tarefas nesta semana', type: MissionType.WEEKLY, category: 'GERAL', requirementType: 'WEEKLY_TASKS', requirementValue: 25, xpReward: 250, essenceReward: 125, minDayUnlock: 14 } }),
    prisma.mission.upsert({ where: { id: 'weekly-013' }, update: { minDayUnlock: 21, category: 'ESTUDO' }, create: { id: 'weekly-013', title: 'Semana de Fogo', description: 'Estude 10 vezes nesta semana', type: MissionType.WEEKLY, category: 'ESTUDO', requirementType: 'WEEKLY_STUDY', requirementValue: 10, xpReward: 250, essenceReward: 125, minDayUnlock: 21 } }),
    prisma.mission.upsert({ where: { id: 'weekly-014' }, update: { minDayUnlock: 21, category: 'TREINO' }, create: { id: 'weekly-014', title: 'Treino Máximo', description: 'Treine 7 vezes nesta semana', type: MissionType.WEEKLY, category: 'TREINO', requirementType: 'WEEKLY_TRAINING', requirementValue: 7, xpReward: 250, essenceReward: 125, minDayUnlock: 21 } }),

    // ── MONTHLY adicionais ────────────────────────────────────────────────────
    prisma.mission.upsert({ where: { id: 'monthly-006' }, update: { minDayUnlock: 0, category: 'GERAL' }, create: { id: 'monthly-006', title: 'Primeiro Mês', description: 'Complete 15 tarefas neste mês', type: MissionType.MONTHLY, category: 'GERAL', requirementType: 'MONTHLY_TASKS', requirementValue: 15, xpReward: 250, essenceReward: 120, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'monthly-007' }, update: { minDayUnlock: 0, category: 'TREINO' }, create: { id: 'monthly-007', title: 'Treino Intenso', description: 'Treine 8 vezes neste mês', type: MissionType.MONTHLY, category: 'TREINO', requirementType: 'MONTHLY_TRAINING', requirementValue: 8, xpReward: 300, essenceReward: 150, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'monthly-008' }, update: { minDayUnlock: 30, category: 'TREINO' }, create: { id: 'monthly-008', title: 'Mês de Saúde Total', description: 'Complete 25 tarefas de saúde ou treino neste mês', type: MissionType.MONTHLY, category: 'TREINO', requirementType: 'MONTHLY_HEALTH', requirementValue: 25, xpReward: 700, essenceReward: 350, minDayUnlock: 30 } }),
    prisma.mission.upsert({ where: { id: 'monthly-009' }, update: { minDayUnlock: 30, category: 'ESTUDO' }, create: { id: 'monthly-009', title: 'Erudito do Mês', description: 'Estude 20 vezes neste mês', type: MissionType.MONTHLY, category: 'ESTUDO', requirementType: 'MONTHLY_STUDY', requirementValue: 20, xpReward: 600, essenceReward: 300, minDayUnlock: 30 } }),
    prisma.mission.upsert({ where: { id: 'monthly-010' }, update: { minDayUnlock: 45, category: 'GERAL' }, create: { id: 'monthly-010', title: 'Mês Lendário', description: 'Complete 100 tarefas em um único mês', type: MissionType.MONTHLY, category: 'GERAL', requirementType: 'MONTHLY_TASKS', requirementValue: 100, xpReward: 1500, essenceReward: 750, minDayUnlock: 45 } }),

    // ── SPECIAL adicionais ────────────────────────────────────────────────────
    prisma.mission.upsert({ where: { id: 'special-013' }, update: { minDayUnlock: 0, category: 'NÍVEL' }, create: { id: 'special-013', title: 'Nível 2', description: 'Alcance o nível 2', type: MissionType.SPECIAL, category: 'NÍVEL', requirementType: 'LEVEL', requirementValue: 2, xpReward: 75, essenceReward: 30, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'special-014' }, update: { minDayUnlock: 7, category: 'NÍVEL' }, create: { id: 'special-014', title: 'Nível 7', description: 'Alcance o nível 7', type: MissionType.SPECIAL, category: 'NÍVEL', requirementType: 'LEVEL', requirementValue: 7, xpReward: 700, essenceReward: 350, minDayUnlock: 7 } }),
    prisma.mission.upsert({ where: { id: 'special-015' }, update: { minDayUnlock: 14, category: 'NÍVEL' }, create: { id: 'special-015', title: 'Nível 12', description: 'Alcance o nível 12', type: MissionType.SPECIAL, category: 'NÍVEL', requirementType: 'LEVEL', requirementValue: 12, xpReward: 1500, essenceReward: 750, minDayUnlock: 14 } }),
    prisma.mission.upsert({ where: { id: 'special-016' }, update: { minDayUnlock: 30, category: 'NÍVEL' }, create: { id: 'special-016', title: 'Nível 25', description: 'Alcance o nível 25', type: MissionType.SPECIAL, category: 'NÍVEL', requirementType: 'LEVEL', requirementValue: 25, xpReward: 5000, essenceReward: 2500, minDayUnlock: 30 } }),
    prisma.mission.upsert({ where: { id: 'special-017' }, update: { minDayUnlock: 30, category: 'NÍVEL' }, create: { id: 'special-017', title: 'Nível 30', description: 'Alcance o nível 30', type: MissionType.SPECIAL, category: 'NÍVEL', requirementType: 'LEVEL', requirementValue: 30, xpReward: 8000, essenceReward: 4000, minDayUnlock: 30 } }),
    prisma.mission.upsert({ where: { id: 'special-018' }, update: { minDayUnlock: 0, category: 'MARCO' }, create: { id: 'special-018', title: '75 Tarefas Concluídas', description: 'Complete 75 tarefas no total', type: MissionType.SPECIAL, category: 'MARCO', requirementType: 'TASKS_COMPLETED', requirementValue: 75, xpReward: 800, essenceReward: 400, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'special-019' }, update: { minDayUnlock: 0, category: 'MARCO' }, create: { id: 'special-019', title: '150 Tarefas Concluídas', description: 'Complete 150 tarefas no total', type: MissionType.SPECIAL, category: 'MARCO', requirementType: 'TASKS_COMPLETED', requirementValue: 150, xpReward: 1500, essenceReward: 750, minDayUnlock: 0 } }),
    prisma.mission.upsert({ where: { id: 'special-020' }, update: { minDayUnlock: 14, category: 'MARCO' }, create: { id: 'special-020', title: '200 Tarefas Concluídas', description: 'Complete 200 tarefas no total', type: MissionType.SPECIAL, category: 'MARCO', requirementType: 'TASKS_COMPLETED', requirementValue: 200, xpReward: 2500, essenceReward: 1250, minDayUnlock: 14 } }),
    prisma.mission.upsert({ where: { id: 'special-021' }, update: { minDayUnlock: 30, category: 'MARCO' }, create: { id: 'special-021', title: '300 Tarefas Concluídas', description: 'Complete 300 tarefas no total', type: MissionType.SPECIAL, category: 'MARCO', requirementType: 'TASKS_COMPLETED', requirementValue: 300, xpReward: 5000, essenceReward: 2500, minDayUnlock: 30 } }),
    prisma.mission.upsert({ where: { id: 'special-022' }, update: { minDayUnlock: 30, category: 'MARCO' }, create: { id: 'special-022', title: 'Veterano', description: 'Complete 1000 tarefas no total', type: MissionType.SPECIAL, category: 'MARCO', requirementType: 'TASKS_COMPLETED', requirementValue: 1000, xpReward: 15000, essenceReward: 7500, minDayUnlock: 30 } }),
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

  // Caixas de recompensa
  const chests = [
    { key: 'CHEST_E',       name: 'Caixa Rank E',  rank: 'E',       description: 'Uma caixa simples dos primeiros despertares.',           icon: '📦', imageUrl: '/assets/chests/bau-rank-e.png' },
    { key: 'CHEST_D',       name: 'Caixa Rank D',  rank: 'D',       description: 'Recompensas modestas para caçadores iniciantes.',        icon: '🎁', imageUrl: '/assets/chests/bau-rank-d.png' },
    { key: 'CHEST_C',       name: 'Caixa Rank C',  rank: 'C',       description: 'Brilho médio. Pode conter itens incomuns ou raros.',     icon: '🧰', imageUrl: '/assets/chests/bau-rank-c.png' },
    { key: 'CHEST_B',       name: 'Caixa Rank B',  rank: 'B',       description: 'Energia arcana intensa. Itens raros e épicos.',          icon: '💎', imageUrl: '/assets/chests/bau-rank-b.png' },
    { key: 'CHEST_A',       name: 'Caixa Rank A',  rank: 'A',       description: 'Partículas de poder. Itens épicos e lendários.',         icon: '🏆', imageUrl: '/assets/chests/bau-rank-a.png' },
    { key: 'CHEST_S',       name: 'Caixa Rank S',  rank: 'S',       description: 'Explosão de aura. Itens lendários e míticos.',           icon: '👑', imageUrl: '/assets/chests/bau-rank-s.png' },
    { key: 'CHEST_SPECIAL', name: 'Caixa Especial', rank: 'SPECIAL', description: 'Um portal roxo de runas. Recompensa garantida e rara.', icon: '🔮', imageUrl: '/assets/chests/bau-especial.png' },
  ]
  for (const c of chests) {
    await prisma.chest.upsert({ where: { key: c.key }, update: { imageUrl: c.imageUrl }, create: c })
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

  // Inimigos do Bestiário (PvE) — 12 inimigos com imagens reais
  const enemies = [
    // Rank E
    {
      key: 'goblin',
      name: 'Goblin de Portal',
      rank: 'E', type: 'Invasor', isBoss: false,
      hp: 620, attack: 78, defense: 38,
      weakness: 'Fogo', resistance: 'Sombrio',
      specialMechanic: 'Chama reforços fracos a cada 3 turnos.',
      recommendedPower: 80,
      drops: 'Essências, Caixa Rank E',
      icon: '👺',
      imageUrl: '/assets/enemies/goblin-de-portal.png',
    },
    {
      key: 'skeleton',
      name: 'Esqueleto das Minas Abandonadas',
      rank: 'E', type: 'Soldado Fraco', isBoss: false,
      hp: 720, attack: 86, defense: 42,
      weakness: 'Sagrado', resistance: 'Sombrio',
      specialMechanic: 'Reanima ao perder metade do HP.',
      recommendedPower: 100,
      drops: 'Essências, Caixa Rank E',
      icon: '💀',
      imageUrl: '/assets/enemies/esqueleto-das-minas-abandonadas.png',
    },
    // Rank D
    {
      key: 'carrasco',
      name: 'Carrasco das Ruínas',
      rank: 'D', type: 'Executor', isBoss: false,
      hp: 1280, attack: 148, defense: 72,
      weakness: 'Luz', resistance: 'Físico',
      specialMechanic: 'Golpe de Execução: causa dano triplo em alvos com HP abaixo de 30%.',
      recommendedPower: 200,
      drops: 'Essências, Caixa Rank D',
      icon: '🪓',
      imageUrl: '/assets/enemies/carrasco-das-ruinas.png',
    },
    {
      key: 'dark_wolf',
      name: 'Lobo Sombrio da Névoa',
      rank: 'D', type: 'Predador', isBoss: false,
      hp: 1650, attack: 168, defense: 84,
      weakness: 'Luz', resistance: 'Gelo',
      specialMechanic: 'Ataques rápidos em sequência causam sangramento.',
      recommendedPower: 240,
      drops: 'Essências, Caixa Rank D',
      icon: '🐺',
      imageUrl: '/assets/enemies/lobo-sombrio-da-nevoa.png',
    },
    // Rank C
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
      imageUrl: '/assets/enemies/aranha-cristalina.png',
    },
    {
      key: 'mist_mage',
      name: 'Mago da Névoa Azul',
      rank: 'C', type: 'Conjurador', isBoss: false,
      hp: 3200, attack: 268, defense: 148,
      weakness: 'Físico', resistance: 'Mágico',
      specialMechanic: 'Conjura explosões arcanas em área a cada 2 turnos.',
      recommendedPower: 480,
      drops: 'Caixa Rank C, essência mágica',
      icon: '🧙',
      imageUrl: '/assets/enemies/mago-da-nevoa-azul.png',
    },
    // Rank B
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
      imageUrl: '/assets/enemies/cavaleiro-corrompido.png',
    },
    {
      key: 'void_assassin',
      name: 'Assassino do Vazio',
      rank: 'B', type: 'Assassino', isBoss: false,
      hp: 6200, attack: 520, defense: 195,
      weakness: 'Luz', resistance: 'Sombrio',
      specialMechanic: 'Passos no Vazio: teleporta-se para as sombras e executa um golpe fatal nas costas.',
      recommendedPower: 1200,
      drops: 'Caixa Rank B, lâmina sombria, manto do vazio',
      icon: '🗡️',
      imageUrl: '/assets/enemies/assassino-do-vazio.png',
    },
    // Rank B — Chefe
    {
      key: 'shadow_chimera',
      name: 'Quimera Sombria',
      rank: 'B', type: 'Monstro Quimérico', isBoss: true,
      hp: 8200, attack: 620, defense: 280,
      weakness: 'Sagrado / Fogo', resistance: 'Sombrio / Veneno',
      specialMechanic: 'Forma Híbrida: alterna entre ataques físicos brutais e rajadas de veneno arcano a cada 3 turnos.',
      recommendedPower: 1600,
      drops: 'Caixa Rank B, Essência Quimérica, Garra das Sombras',
      icon: '🐉',
      imageUrl: '/assets/enemies/quimera-sombria.png',
    },
    // Rank A
    {
      key: 'rune_golem',
      name: 'Golem Rúnico Ancestral',
      rank: 'A', type: 'Tanque', isBoss: false,
      hp: 12000, attack: 420, defense: 580,
      weakness: 'Arcano', resistance: 'Físico',
      specialMechanic: 'Runa Ancestral: libera pulso rúnico que reduz a DEF dos caçadores.',
      recommendedPower: 2200,
      drops: 'Caixa Rank A, núcleo rúnico, fragmento de pedra mágica',
      icon: '🗿',
      imageUrl: '/assets/enemies/golem-runico-ancestral.png',
    },
    {
      key: 'spider_queen',
      name: 'Rainha Aracnídea Noturna',
      rank: 'A', type: 'Invocadora', isBoss: true,
      hp: 14000, attack: 580, defense: 320,
      weakness: 'Fogo', resistance: 'Veneno',
      specialMechanic: 'Teia da Dominação: invoca aranhas sombrias e aprisiona caçadores.',
      recommendedPower: 2800,
      drops: 'Caixa Rank A, seda das trevas, cristal noturno',
      icon: '🕸️',
      imageUrl: '/assets/enemies/rainha-aracnidea-noturna.png',
    },
    // Rank S
    {
      key: 'abyssal_guardian',
      name: 'Guardião Abissal',
      rank: 'S', type: 'Soberano do Abismo', isBoss: true,
      hp: 28000, attack: 920, defense: 780,
      weakness: 'Sagrado', resistance: 'Sombrio / Maldição',
      specialMechanic: 'Colapso Abissal: cria zonas de aniquilação que crescem a cada turno.',
      recommendedPower: 5500,
      drops: 'Caixa Especial, arma Rank S, essência abissal',
      icon: '🌑',
      imageUrl: '/assets/enemies/guardiao-abissal.png',
    },
    {
      key: 'crimson_monarch',
      name: 'Monarca da Ruína Carmesim',
      rank: 'S', type: 'Soberano', isBoss: true,
      hp: 35000, attack: 1200, defense: 900,
      weakness: 'Luz / Sagrado', resistance: 'Sombrio / Fogo / Maldição',
      specialMechanic: 'Cataclismo Carmesim: abre fendas de ruína que corrompem o campo de batalha. 3 fases.',
      recommendedPower: 8000,
      drops: 'Caixa Especial, Lâmina da Ruína Eterna Rank S, Essência Mítica, Núcleo de Ascensão',
      icon: '👁️',
      imageUrl: '/assets/enemies/monarca-da-ruina-carmesim.png',
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
