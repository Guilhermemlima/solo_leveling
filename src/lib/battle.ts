/**
 * Sistema de combate da Arena.
 * O poder vem dos atributos que o jogador já evolui + nível + equipamentos.
 * A batalha é por turnos e gera um log round a round para a animação.
 */

export interface Attributes {
  strength: number
  intelligence: number
  discipline: number
  focus: number
  vitality: number
  charisma: number
  wisdom: number
  creativity: number
}

export interface EquipBonuses {
  atk: number
  def: number
  hp: number
}

export interface Combatant {
  name: string
  icon: string
  imageUrl?: string
  level: number
  attributes: Attributes
  equipBonus?: number      // usado por bots (escalar genérico)
  equipBonuses?: EquipBonuses // usado por jogadores (tipado por stat)
}

/** Converte itens equipados em bônus de combate respeitando o bonusType. */
export function computeEquipBonuses(
  items: Array<{ bonusType: string | null; bonusValue: number; upgradeLevel?: number }>
): EquipBonuses {
  const b = { atk: 0, def: 0, hp: 0 }
  for (const item of items) {
    const val = (item.bonusValue || 0) * (1 + (item.upgradeLevel ?? 0) * 0.05)
    const t = (item.bonusType || '').toUpperCase()
    if (['ATTACK', 'STRENGTH', 'FORCE', 'STR'].includes(t)) {
      b.atk += val
    } else if (['DEFENSE', 'DEF', 'ARMOR', 'DISCIPLINE', 'ROUTINE', 'SHIELD'].includes(t)) {
      b.def += val
    } else if (['VITALITY', 'HP', 'HEALTH', 'VIT', 'LIFE'].includes(t)) {
      b.hp += val
    } else if (t === 'ALL') {
      b.atk += val * 0.5
      b.def += val * 0.5
      b.hp += val * 1.0
    } else {
      // FOCUS, WISDOM, SPEED, CLARITY, STREAK, PERSISTENCE, CHARISMA, etc.
      b.atk += val * 0.25
      b.def += val * 0.25
      b.hp += val * 0.5
    }
  }
  return { atk: Math.round(b.atk), def: Math.round(b.def), hp: Math.round(b.hp) }
}

export interface CombatStats {
  hp: number
  atk: number
  def: number
  crit: number // 0..1
  speed: number
  power: number // pontuação geral para ranking/exibição
}

export interface Round {
  attacker: 'player' | 'opponent'
  damage: number
  crit: boolean
  playerHp: number
  opponentHp: number
}

export interface BattleResult {
  playerWon: boolean
  rounds: Round[]
  playerStats: CombatStats
  opponentStats: CombatStats
}

const EMPTY_ATTRS: Attributes = {
  strength: 0, intelligence: 0, discipline: 0, focus: 0,
  vitality: 0, charisma: 0, wisdom: 0, creativity: 0,
}

/** Deriva os atributos de combate a partir dos atributos do personagem. */
export function deriveStats(c: Combatant): CombatStats {
  const a = { ...EMPTY_ATTRS, ...c.attributes }

  // Jogadores usam equipBonuses (tipado por stat); bots usam equipBonus (escalar genérico)
  let eqAtk: number, eqDef: number, eqHp: number
  if (c.equipBonuses) {
    eqAtk = c.equipBonuses.atk
    eqDef = c.equipBonuses.def
    eqHp  = c.equipBonuses.hp
  } else {
    const eq = c.equipBonus || 0
    eqAtk = eq * 0.4
    eqDef = eq * 0.3
    eqHp  = eq * 1.0
  }

  const hp  = Math.round(80 + a.vitality * 6 + c.level * 12 + eqHp)
  const atk = Math.round(10 + a.strength * 1.6 + a.focus * 0.9 + a.intelligence * 0.6 + eqAtk)
  const def = Math.round(6  + a.discipline * 1.1 + a.vitality * 0.7 + a.wisdom * 0.4 + eqDef)
  const crit  = Math.min(0.45, 0.03 + (a.charisma + a.creativity) * 0.012)
  const speed = a.focus + a.charisma + c.level
  const power = Math.round(hp * 0.5 + atk * 3 + def * 2 + crit * 100)

  return { hp, atk, def, crit, speed, power }
}

function rng(min: number, max: number) {
  return min + Math.random() * (max - min)
}

/** Simula a batalha por turnos a partir de stats de combate brutos (reusável por PvE). */
export function simulateStats(ps: CombatStats, os: CombatStats): BattleResult {
  let playerHp = ps.hp
  let opponentHp = os.hp
  const rounds: Round[] = []

  // quem ataca primeiro é definido pela velocidade
  let playerTurn = ps.speed >= os.speed
  const MAX_ROUNDS = 40
  let i = 0

  while (playerHp > 0 && opponentHp > 0 && i < MAX_ROUNDS) {
    const atkStats = playerTurn ? ps : os
    const defStats = playerTurn ? os : ps

    const isCrit = Math.random() < atkStats.crit
    // Mitigação por defesa, mas com piso proporcional ao ataque: mesmo contra
    // alvos muito defensivos, o atacante sempre causa ao menos 15% do seu ATK
    // (evita que defesa alta zere o dano e trave a luta em 1 de dano).
    const mitigated = atkStats.atk - defStats.def * 0.5
    let dmg = Math.max(atkStats.atk * 0.15, mitigated) * rng(0.85, 1.15)
    dmg = Math.max(1, dmg)
    if (isCrit) dmg *= 1.7
    dmg = Math.round(dmg)

    if (playerTurn) opponentHp = Math.max(0, opponentHp - dmg)
    else playerHp = Math.max(0, playerHp - dmg)

    rounds.push({
      attacker: playerTurn ? 'player' : 'opponent',
      damage: dmg,
      crit: isCrit,
      playerHp,
      opponentHp,
    })

    playerTurn = !playerTurn
    i++
  }

  // empate por rounds: vence quem tem maior % de HP restante
  let playerWon: boolean
  if (opponentHp <= 0 && playerHp > 0) playerWon = true
  else if (playerHp <= 0 && opponentHp > 0) playerWon = false
  else playerWon = playerHp / ps.hp >= opponentHp / os.hp

  return { playerWon, rounds, playerStats: ps, opponentStats: os }
}

/** Simula a batalha por turnos entre dois combatentes (Arena). */
export function simulateBattle(player: Combatant, opponent: Combatant): BattleResult {
  return simulateStats(deriveStats(player), deriveStats(opponent))
}

export type BotDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'ELITE' | 'CHAMPION' | 'LEGENDARY' | 'NIGHTMARE'

interface BotProfile {
  name: string
  icon: string
  imageUrl: string
  rank: string
  mult: number
  levelOffset: number
  equipBonusMult: number
}

const BOT_PROFILES: Record<BotDifficulty, BotProfile> = {
  EASY:      { name: 'Goblin Espião',          icon: '🔰', imageUrl: '/assets/enemies/goblin-de-portal.png',              rank: 'E', mult: 0.70, levelOffset: -2, equipBonusMult: 0.0 },
  MEDIUM:    { name: 'Lobo das Sombras',        icon: '🐺', imageUrl: '/assets/enemies/lobo-sombrio-da-nevoa.png',         rank: 'D', mult: 1.05, levelOffset:  0, equipBonusMult: 0.0 },
  HARD:      { name: 'Carrasco das Ruínas',     icon: '🔥', imageUrl: '/assets/enemies/carrasco-das-ruinas.png',           rank: 'C', mult: 1.45, levelOffset:  2, equipBonusMult: 0.3 },
  ELITE:     { name: 'Assassino do Vazio',      icon: '🗡️', imageUrl: '/assets/enemies/assassino-do-vazio.png',            rank: 'B', mult: 1.90, levelOffset:  4, equipBonusMult: 0.5 },
  CHAMPION:  { name: 'Cavaleiro Corrompido',    icon: '⚔️', imageUrl: '/assets/enemies/cavaleiro-corrompido.png',          rank: 'B', mult: 2.30, levelOffset:  5, equipBonusMult: 0.7 },
  LEGENDARY: { name: 'Golem Rúnico Ancestral',  icon: '⚡', imageUrl: '/assets/enemies/golem-runico-ancestral.png',        rank: 'A', mult: 2.90, levelOffset:  7, equipBonusMult: 1.0 },
  NIGHTMARE: { name: 'Guardião Abissal',        icon: '💀', imageUrl: '/assets/enemies/guardiao-abissal.png',              rank: 'S', mult: 3.80, levelOffset: 10, equipBonusMult: 1.5 },
}

/** Gera um bot escalado para o nível do jogador. */
export function makeBot(playerLevel: number, difficulty: BotDifficulty): Combatant {
  const p = BOT_PROFILES[difficulty]
  const level = Math.max(1, playerLevel + p.levelOffset)
  const base = Math.max(2, Math.round(playerLevel * 2.2 * p.mult))

  const attributes: Attributes = {
    strength:     Math.round(base * 1.0),
    vitality:     Math.round(base * 1.0),
    focus:        Math.round(base * 0.9),
    discipline:   Math.round(base * 0.8),
    intelligence: Math.round(base * 0.7),
    wisdom:       Math.round(base * 0.6),
    charisma:     Math.round(base * 0.5),
    creativity:   Math.round(base * 0.5),
  }

  return { name: p.name, icon: p.icon, imageUrl: p.imageUrl, level, attributes, equipBonus: base * p.equipBonusMult }
}

export const BOT_DIFFICULTIES: { key: BotDifficulty; label: string; rankLabel: string }[] = [
  { key: 'EASY',      label: 'Fácil',     rankLabel: 'E' },
  { key: 'MEDIUM',    label: 'Médio',     rankLabel: 'D' },
  { key: 'HARD',      label: 'Difícil',   rankLabel: 'C' },
  { key: 'ELITE',     label: 'Elite',     rankLabel: 'B' },
  { key: 'CHAMPION',  label: 'Campeão',   rankLabel: 'B+' },
  { key: 'LEGENDARY', label: 'Lendário',  rankLabel: 'A' },
  { key: 'NIGHTMARE', label: 'Pesadelo',  rankLabel: 'S' },
]

/** Recompensas por vitória/derrota. Modestas para não trivializar o nível. */
export function battleRewards(opts: {
  playerLevel: number
  won: boolean
  type: 'BOT' | 'PLAYER'
  difficulty?: BotDifficulty
}): { xp: number; essences: number; points: number } {
  const { playerLevel, won, type, difficulty } = opts

  if (!won) {
    // consolação pequena — ainda evolui, mas devagar
    return { xp: 5, essences: 0, points: type === 'PLAYER' ? -8 : 0 }
  }

  if (type === 'PLAYER') {
    return { xp: 40 + playerLevel * 4, essences: 20 + playerLevel * 2, points: 15 }
  }

  const byDiff: Record<BotDifficulty, { xp: number; essences: number; points: number }> = {
    EASY:      { xp: 15  + playerLevel * 2, essences:  8, points:  1 },
    MEDIUM:    { xp: 30  + playerLevel * 3, essences: 15, points:  3 },
    HARD:      { xp: 50  + playerLevel * 5, essences: 25, points:  5 },
    ELITE:     { xp: 80  + playerLevel * 7, essences: 42, points:  8 },
    CHAMPION:  { xp: 115 + playerLevel * 9, essences: 62, points: 12 },
    LEGENDARY: { xp: 160 + playerLevel * 12, essences: 90, points: 18 },
    NIGHTMARE: { xp: 220 + playerLevel * 16, essences: 130, points: 25 },
  }
  return byDiff[difficulty || 'MEDIUM']
}
