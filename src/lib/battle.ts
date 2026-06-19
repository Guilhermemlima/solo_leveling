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

export interface Combatant {
  name: string
  icon: string
  level: number
  attributes: Attributes
  equipBonus?: number // soma de bonusValue dos itens equipados
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
  const eq = c.equipBonus || 0

  const hp = Math.round(80 + a.vitality * 6 + c.level * 12 + eq * 1.0)
  const atk = Math.round(10 + a.strength * 1.6 + a.focus * 0.9 + a.intelligence * 0.6 + eq * 0.4)
  const def = Math.round(6 + a.discipline * 1.1 + a.vitality * 0.7 + a.wisdom * 0.4 + eq * 0.3)
  const crit = Math.min(0.45, 0.03 + (a.charisma + a.creativity) * 0.012)
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
    let dmg = (atkStats.atk - defStats.def * 0.5) * rng(0.85, 1.15)
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

export type BotDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

const BOT_PROFILES: Record<BotDifficulty, { name: string; icon: string; mult: number; levelOffset: number }> = {
  EASY: { name: 'Boneco de Treino', icon: '🤖', mult: 0.8, levelOffset: -1 },
  MEDIUM: { name: 'Guardião Autômato', icon: '🛡️', mult: 1.15, levelOffset: 0 },
  HARD: { name: 'Coloso de Ferro', icon: '⚙️', mult: 1.6, levelOffset: 2 },
}

/** Gera um bot escalado para o nível do jogador. Determinístico por nível+dificuldade. */
export function makeBot(playerLevel: number, difficulty: BotDifficulty): Combatant {
  const p = BOT_PROFILES[difficulty]
  const level = Math.max(1, playerLevel + p.levelOffset)
  const base = Math.max(2, Math.round(playerLevel * 2.2 * p.mult))

  const attributes: Attributes = {
    strength: Math.round(base * 1.0),
    vitality: Math.round(base * 1.0),
    focus: Math.round(base * 0.9),
    discipline: Math.round(base * 0.8),
    intelligence: Math.round(base * 0.7),
    wisdom: Math.round(base * 0.6),
    charisma: Math.round(base * 0.5),
    creativity: Math.round(base * 0.5),
  }

  return { name: p.name, icon: p.icon, level, attributes, equipBonus: difficulty === 'HARD' ? base * 0.5 : 0 }
}

export const BOT_DIFFICULTIES: { key: BotDifficulty; label: string }[] = [
  { key: 'EASY', label: 'Fácil' },
  { key: 'MEDIUM', label: 'Médio' },
  { key: 'HARD', label: 'Difícil' },
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

  const byDiff: Record<BotDifficulty, { xp: number; essences: number }> = {
    EASY: { xp: 15 + playerLevel * 2, essences: 8 },
    MEDIUM: { xp: 30 + playerLevel * 3, essences: 15 },
    HARD: { xp: 50 + playerLevel * 5, essences: 25 },
  }
  const r = byDiff[difficulty || 'MEDIUM']
  return { ...r, points: 0 }
}
