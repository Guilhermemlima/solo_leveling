export const ROUTINE_TEMPLATES = [
  {
    id: 'morning',
    name: 'Ritual da Manhã',
    description: 'Comece o dia com clareza, movimento e planejamento.',
    tasks: [
      { title: 'Beber água e alongar', category: 'HEALTH', difficulty: 'EASY', estimatedMinutes: 10 },
      { title: 'Definir três prioridades', category: 'WORK', difficulty: 'EASY', estimatedMinutes: 10 },
      { title: 'Leitura breve', category: 'STUDY', difficulty: 'EASY', estimatedMinutes: 15 },
    ],
  },
  {
    id: 'deep-work',
    name: 'Bloco de Foco Profundo',
    description: 'Uma sessão estruturada para produzir sem distrações.',
    tasks: [
      { title: 'Preparar ambiente de foco', category: 'WORK', difficulty: 'EASY', estimatedMinutes: 5 },
      { title: 'Executar bloco de foco', category: 'WORK', difficulty: 'HARD', estimatedMinutes: 50, targetValue: 50, targetUnit: 'min' },
      { title: 'Registrar resultado e próximo passo', category: 'PERSONAL_DEVELOPMENT', difficulty: 'EASY', estimatedMinutes: 5 },
    ],
  },
  {
    id: 'bodyweight',
    name: 'Treino sem Equipamentos',
    description: 'Rotina acessível para iniciantes, feita em casa.',
    tasks: [
      { title: 'Aquecimento e mobilidade', category: 'HEALTH', difficulty: 'EASY', estimatedMinutes: 8 },
      { title: 'Circuito de calistenia adaptável', category: 'TRAINING', difficulty: 'MEDIUM', estimatedMinutes: 20 },
      { title: 'Desacelerar e respirar', category: 'HEALTH', difficulty: 'EASY', estimatedMinutes: 5 },
    ],
  },
] as const
