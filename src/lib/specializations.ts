export const SPECIALIZATIONS = [
  {
    key: 'VANGUARD',
    name: 'Vanguarda Vital',
    icon: '🛡️',
    color: '#22c55e',
    description: 'Fortalece saúde, treino e consistência.',
    perks: ['+5% XP em Saúde e Treino', '+8% de HP na Arena', 'Bônus de streak mais frequente'],
  },
  {
    key: 'SCHOLAR',
    name: 'Erudito Ascendente',
    icon: '📘',
    color: '#3b82f6',
    description: 'Acelera estudo, reflexão e conhecimento.',
    perks: ['+5% XP em Estudo', '+8% de foco', 'Relatórios de aprendizado destacados'],
  },
  {
    key: 'ARCHITECT',
    name: 'Arquiteto de Rotinas',
    icon: '🧭',
    color: '#8b5cf6',
    description: 'Transforma planejamento em execução consistente.',
    perks: ['+5% XP em Trabalho', '+1 Essência por rotina concluída', 'Modelos de rotina destacados'],
  },
  {
    key: 'HARMONIZER',
    name: 'Harmonizador',
    icon: '✨',
    color: '#f59e0b',
    description: 'Equilibra vida social, criatividade e bem-estar.',
    perks: ['+5% XP em Social e Criatividade', '+5% de crítico na Arena', 'Recuperação gentil de streak'],
  },
] as const

export type SpecializationKey = typeof SPECIALIZATIONS[number]['key']

export function getSpecialization(key?: string | null) {
  return SPECIALIZATIONS.find(item => item.key === key) || null
}
