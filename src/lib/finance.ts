/**
 * Módulo de Finanças — cálculos educativos e biblioteca de ativos.
 *
 * IMPORTANTE: Nada aqui é recomendação financeira. Todas as taxas são
 * estimativas configuráveis e NÃO representam garantia de retorno.
 */

export const FINANCE_DISCLAIMER =
  'Simulações financeiras são apenas estimativas educativas. Rentabilidades podem variar e não representam garantia de retorno.'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface InvestmentAsset {
  key: string
  name: string
  category: string
  riskLevel: RiskLevel
  liquidity: string
  /** Rentabilidade anual estimada (%). Configurável — NÃO é garantia. */
  estimatedAnnualReturn: number
  description: string
  disclaimer: string
}

/**
 * Biblioteca de ativos APENAS para simulação educativa.
 * As taxas abaixo são estimativas configuráveis. Para alterá-las,
 * edite os valores de `estimatedAnnualReturn` (em % ao ano).
 */
export const INVESTMENT_ASSETS: InvestmentAsset[] = [
  {
    key: 'RESERVA_EMERGENCIA',
    name: 'Reserva de Emergência',
    category: 'Reserva',
    riskLevel: 'LOW',
    liquidity: 'Imediata',
    estimatedAnnualReturn: 10.5,
    description: 'Dinheiro guardado para imprevistos, com liquidez imediata e baixíssimo risco. Base de qualquer planejamento.',
    disclaimer: 'Foco em segurança e liquidez, não em rentabilidade.',
  },
  {
    key: 'TESOURO_SELIC',
    name: 'Tesouro Selic',
    category: 'Renda Fixa',
    riskLevel: 'LOW',
    liquidity: 'Diária',
    estimatedAnnualReturn: 11,
    description: 'Título público pós-fixado atrelado à taxa Selic. Considerado de menor risco do mercado.',
    disclaimer: 'Rentabilidade acompanha a Selic, que varia ao longo do tempo.',
  },
  {
    key: 'CDB',
    name: 'CDB',
    category: 'Renda Fixa',
    riskLevel: 'LOW',
    liquidity: 'Varia',
    estimatedAnnualReturn: 12,
    description: 'Título emitido por bancos. Costuma render um percentual do CDI e conta com proteção do FGC até o limite vigente.',
    disclaimer: 'Liquidez e rentabilidade variam conforme o emissor.',
  },
  {
    key: 'LCI_LCA',
    name: 'LCI / LCA',
    category: 'Renda Fixa',
    riskLevel: 'LOW',
    liquidity: 'Baixa',
    estimatedAnnualReturn: 11.5,
    description: 'Títulos isentos de imposto de renda para pessoa física, ligados aos setores imobiliário e do agronegócio.',
    disclaimer: 'Costumam ter prazo de carência (baixa liquidez).',
  },
  {
    key: 'FII',
    name: 'Fundos Imobiliários',
    category: 'Renda Variável',
    riskLevel: 'MEDIUM',
    liquidity: 'Média',
    estimatedAnnualReturn: 10,
    description: 'Fundos que investem em imóveis ou papéis do setor. Podem distribuir rendimentos periódicos.',
    disclaimer: 'Sujeitos à oscilação de mercado. Rendimentos não são garantidos.',
  },
  {
    key: 'ACOES',
    name: 'Ações',
    category: 'Renda Variável',
    riskLevel: 'HIGH',
    liquidity: 'Alta',
    estimatedAnnualReturn: 13,
    description: 'Frações de empresas negociadas em bolsa. Potencial de valorização maior, com volatilidade alta.',
    disclaimer: 'Alto risco. O valor pode cair significativamente.',
  },
  {
    key: 'ETF',
    name: 'ETFs',
    category: 'Renda Variável',
    riskLevel: 'MEDIUM',
    liquidity: 'Alta',
    estimatedAnnualReturn: 11,
    description: 'Fundos negociados em bolsa que replicam índices, diversificando o investimento em uma única cota.',
    disclaimer: 'Acompanham o índice de referência, que pode desvalorizar.',
  },
  {
    key: 'CRIPTO',
    name: 'Criptomoedas',
    category: 'Alto Risco',
    riskLevel: 'HIGH',
    liquidity: 'Alta',
    estimatedAnnualReturn: 0,
    description: 'Ativos digitais de altíssima volatilidade. Apenas para fins de simulação e estudo.',
    disclaimer: 'Altíssimo risco. Pode haver perda total do valor investido.',
  },
]

export const RISK_LABELS: Record<RiskLevel, string> = {
  LOW: 'Baixo',
  MEDIUM: 'Médio',
  HIGH: 'Alto',
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: '#22c55e',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
}

export const GOAL_CATEGORIES: Record<string, { label: string; icon: string }> = {
  INVESTMENT: { label: 'Investimento', icon: '📈' },
  EMERGENCY: { label: 'Reserva de Emergência', icon: '🛡️' },
  RETIREMENT: { label: 'Aposentadoria', icon: '🌅' },
  GOAL: { label: 'Objetivo', icon: '🎯' },
  CUSTOM: { label: 'Personalizada', icon: '✨' },
}

export const GOAL_STATUS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Ativa', color: '#6366f1' },
  COMPLETED: { label: 'Concluída', color: '#22c55e' },
  PAUSED: { label: 'Pausada', color: '#94a3b8' },
}

export function getAsset(key: string | null | undefined): InvestmentAsset | undefined {
  if (!key) return undefined
  return INVESTMENT_ASSETS.find(a => a.key === key)
}

/** Converte taxa anual (%) em taxa mensal decimal. */
export function annualToMonthlyRate(annualPercent: number): number {
  return Math.pow(1 + annualPercent / 100, 1 / 12) - 1
}

export interface SimulationPoint {
  month: number
  contributed: number
  balance: number
}

export interface SimulationResult {
  totalContributed: number
  estimatedReturn: number
  finalAmount: number
  series: SimulationPoint[]
}

/**
 * Simula juros compostos com aportes mensais.
 * Fórmula educativa — NÃO é garantia de retorno.
 */
export function simulateInvestment(params: {
  initialAmount: number
  monthlyContribution: number
  annualRate: number
  durationMonths: number
}): SimulationResult {
  const initial = Math.max(0, params.initialAmount)
  const monthly = Math.max(0, params.monthlyContribution)
  const months = Math.max(0, Math.min(1200, Math.floor(params.durationMonths)))
  const i = annualToMonthlyRate(params.annualRate)

  let balance = initial
  const series: SimulationPoint[] = [{ month: 0, contributed: initial, balance: initial }]

  // Amostragem: no máximo ~60 pontos para gráficos leves
  const step = months > 60 ? Math.ceil(months / 60) : 1

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + i) + monthly
    if (m % step === 0 || m === months) {
      series.push({
        month: m,
        contributed: initial + monthly * m,
        balance: Math.round(balance * 100) / 100,
      })
    }
  }

  const totalContributed = initial + monthly * months
  const finalAmount = Math.round(balance * 100) / 100
  const estimatedReturn = Math.round((finalAmount - totalContributed) * 100) / 100

  return { totalContributed, estimatedReturn, finalAmount, series }
}

/**
 * Estima quantos meses faltam para atingir um valor-alvo,
 * dado um saldo atual, aporte mensal e taxa anual.
 * Retorna null se inatingível em 1200 meses (sem aporte e sem juros).
 */
export function monthsToReachTarget(params: {
  currentAmount: number
  monthlyContribution: number
  annualRate: number
  targetAmount: number
}): number | null {
  const { currentAmount, monthlyContribution, annualRate, targetAmount } = params
  if (currentAmount >= targetAmount) return 0
  if (monthlyContribution <= 0 && annualRate <= 0) return null

  const i = annualToMonthlyRate(annualRate)
  let balance = currentAmount
  for (let m = 1; m <= 1200; m++) {
    balance = balance * (1 + i) + monthlyContribution
    if (balance >= targetAmount) return m
  }
  return null
}

export function goalProgress(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
