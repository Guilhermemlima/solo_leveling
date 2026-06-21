type AttributeKey = 'strength' | 'vitality' | 'intelligence' | 'focus' | 'discipline' | 'wisdom' | 'charisma' | 'creativity'

export interface TaskSuggestion {
  title: string
  category: string
  difficulty: string
  estimatedMinutes: number
  reason: string
}

export interface AdvisorResult {
  weakest: { key: AttributeKey; label: string; value: number }[]
  insight: string
  suggestions: TaskSuggestion[]
}

const ATTR_LABELS: Record<AttributeKey, string> = {
  strength: 'Força',
  vitality: 'Vitalidade',
  intelligence: 'Inteligência',
  focus: 'Foco',
  discipline: 'Disciplina',
  wisdom: 'Sabedoria',
  charisma: 'Carisma',
  creativity: 'Criatividade',
}

const SUGGESTIONS: Record<AttributeKey, TaskSuggestion[]> = {
  strength: [
    { title: '3 séries de flexão até a falha', category: 'TRAINING', difficulty: 'MEDIUM', estimatedMinutes: 15, reason: 'Exercícios de resistência aumentam sua Força diretamente.' },
    { title: 'Treino de musculação 45 min', category: 'TRAINING', difficulty: 'HARD', estimatedMinutes: 45, reason: 'Treino de carga é o caminho mais rápido para construir Força.' },
    { title: 'Caminhada acelerada 30 min', category: 'TRAINING', difficulty: 'EASY', estimatedMinutes: 30, reason: 'Atividade física consistente fortalece o corpo gradualmente.' },
  ],
  vitality: [
    { title: 'Beber 2 litros de água hoje', category: 'HEALTH', difficulty: 'EASY', estimatedMinutes: 10, reason: 'Hidratação adequada é fundamental para a sua Vitalidade.' },
    { title: 'Dormir antes das 23h', category: 'HEALTH', difficulty: 'MEDIUM', estimatedMinutes: 480, reason: 'Sono de qualidade é o maior regenerador de Vitalidade.' },
    { title: 'Praticar respiração consciente 10 min', category: 'HEALTH', difficulty: 'EASY', estimatedMinutes: 10, reason: 'Técnicas de respiração reduzem estresse e recuperam energia vital.' },
  ],
  intelligence: [
    { title: 'Ler 20 páginas de um livro técnico', category: 'STUDY', difficulty: 'MEDIUM', estimatedMinutes: 30, reason: 'Leitura técnica expande sua Inteligência e base de conhecimento.' },
    { title: 'Resolver 5 problemas de lógica', category: 'STUDY', difficulty: 'HARD', estimatedMinutes: 45, reason: 'Desafios cognitivos treinam a mente e elevam a Inteligência.' },
    { title: 'Estudar um novo tópico por 30 min', category: 'STUDY', difficulty: 'MEDIUM', estimatedMinutes: 30, reason: 'Aprendizado constante acelera o ganho de Inteligência.' },
  ],
  focus: [
    { title: 'Sessão Pomodoro de 25 min sem distrações', category: 'WORK', difficulty: 'MEDIUM', estimatedMinutes: 25, reason: 'Técnica Pomodoro treina concentração profunda e eleva o Foco.' },
    { title: 'Completar 1 tarefa importante do início ao fim', category: 'WORK', difficulty: 'HARD', estimatedMinutes: 60, reason: 'Finalizar tarefas sem interrupção fortalece o Foco.' },
    { title: 'Meditar por 10 minutos', category: 'SPIRITUALITY', difficulty: 'EASY', estimatedMinutes: 10, reason: 'Meditação treina a atenção plena e aumenta o Foco.' },
  ],
  discipline: [
    { title: 'Acordar no horário planejado', category: 'HOME', difficulty: 'MEDIUM', estimatedMinutes: 5, reason: 'Consistência de rotina matinal é a base da Disciplina.' },
    { title: 'Seguir sua rotina matinal completa', category: 'PERSONAL_DEVELOPMENT', difficulty: 'MEDIUM', estimatedMinutes: 30, reason: 'Rotinas fixas constroem Disciplina sólida ao longo do tempo.' },
    { title: 'Eliminar 1 hábito improdutivo hoje', category: 'PERSONAL_DEVELOPMENT', difficulty: 'HARD', estimatedMinutes: 20, reason: 'Remover hábitos ruins é o teste máximo de Disciplina.' },
  ],
  wisdom: [
    { title: 'Escrever reflexão do dia — journaling 15 min', category: 'PERSONAL_DEVELOPMENT', difficulty: 'EASY', estimatedMinutes: 15, reason: 'Reflexão escrita consolida aprendizados e eleva a Sabedoria.' },
    { title: 'Meditar com intenção e gratidão 15 min', category: 'SPIRITUALITY', difficulty: 'MEDIUM', estimatedMinutes: 15, reason: 'Práticas contemplativas são o caminho para a Sabedoria.' },
    { title: 'Ler sobre filosofia ou autoconhecimento', category: 'STUDY', difficulty: 'MEDIUM', estimatedMinutes: 30, reason: 'Filosofia e introspecção desenvolvem profundidade de Sabedoria.' },
  ],
  charisma: [
    { title: 'Iniciar uma conversa com alguém novo', category: 'SOCIAL', difficulty: 'MEDIUM', estimatedMinutes: 30, reason: 'Conexões novas treinam sua Carisma de forma direta.' },
    { title: 'Ligar para um amigo ou familiar', category: 'SOCIAL', difficulty: 'EASY', estimatedMinutes: 15, reason: 'Manter vínculos sociais fortalece sua presença e Carisma.' },
    { title: 'Participar de um grupo ou evento social', category: 'SOCIAL', difficulty: 'HARD', estimatedMinutes: 90, reason: 'Ambientes sociais são a arena de treinamento de Carisma.' },
  ],
  creativity: [
    { title: 'Dedicar 30 min a um projeto criativo pessoal', category: 'CREATIVITY', difficulty: 'MEDIUM', estimatedMinutes: 30, reason: 'Criar algo do zero é o exercício mais puro de Criatividade.' },
    { title: 'Escrever, desenhar ou compor algo novo', category: 'CREATIVITY', difficulty: 'EASY', estimatedMinutes: 20, reason: 'Expressão criativa livre expande os limites da Criatividade.' },
    { title: 'Resolver um problema de forma inovadora', category: 'CREATIVITY', difficulty: 'HARD', estimatedMinutes: 45, reason: 'Pensar fora do padrão amplifica sua Criatividade.' },
  ],
}

const INSIGHTS: Record<AttributeKey, string> = {
  strength: 'Seu corpo é seu templo. Sem Força, nenhum poder mental pode sustentá-lo por muito tempo.',
  vitality: 'Energia vital é a base de tudo. Um guerreiro sem Vitalidade cai antes de chegar ao pico.',
  intelligence: 'Conhecimento é poder absoluto. Sua Inteligência determina quão longe você pode ir.',
  focus: 'Sem Foco, até os mais talentosos desperdiçam seu potencial. Concentração é superioridade.',
  discipline: 'Disciplina é o atributo que move todos os outros. Sem ela, o progresso é ilusório.',
  wisdom: 'Sabedoria transforma experiência em evolução. O forte que não reflete não cresce.',
  charisma: 'Nenhum herói conquista sozinho. Sua Carisma determina quantos seguirão você.',
  creativity: 'Criatividade é adaptação suprema. Quem não inova fica preso nos limites do passado.',
}

export function analyzeAttributes(attributes: Record<string, number>): AdvisorResult {
  const attrKeys: AttributeKey[] = ['strength', 'vitality', 'intelligence', 'focus', 'discipline', 'wisdom', 'charisma', 'creativity']
  const sorted = attrKeys
    .map(key => ({ key, value: attributes[key] ?? 0, label: ATTR_LABELS[key] }))
    .sort((a, b) => a.value - b.value)
  const weakest = sorted.slice(0, 2)
  const primaryWeak = weakest[0]
  return {
    weakest,
    insight: INSIGHTS[primaryWeak.key],
    suggestions: SUGGESTIONS[primaryWeak.key].slice(0, 3),
  }
}
