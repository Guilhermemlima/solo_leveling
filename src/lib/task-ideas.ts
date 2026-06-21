export interface TaskIdea {
  title: string
  description: string
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXTREME'
  estimatedMinutes: number
}

export const TASK_IDEAS: TaskIdea[] = [
  // ── HEALTH ──────────────────────────────────────────────────────────────────
  { title: 'Beber 2L de água', description: 'Mantenha a hidratação ao longo do dia', category: 'HEALTH', difficulty: 'EASY', estimatedMinutes: 5 },
  { title: 'Dormir 8 horas', description: 'Priorize o descanso para recuperação total', category: 'HEALTH', difficulty: 'EASY', estimatedMinutes: 480 },
  { title: 'Meditar por 10 minutos', description: 'Respire fundo e esvazie a mente', category: 'HEALTH', difficulty: 'EASY', estimatedMinutes: 10 },
  { title: 'Fazer alongamento matinal', description: 'Mobilize os músculos antes do dia começar', category: 'HEALTH', difficulty: 'EASY', estimatedMinutes: 10 },
  { title: 'Nenhuma tela 1h antes de dormir', description: 'Prepare o cérebro para um sono de qualidade', category: 'HEALTH', difficulty: 'MEDIUM', estimatedMinutes: 60 },
  { title: 'Comer uma refeição nutritiva sem distrações', description: 'Pratique alimentação consciente', category: 'HEALTH', difficulty: 'EASY', estimatedMinutes: 20 },
  { title: 'Fazer uma caminhada de 20 minutos', description: 'Movimento leve ao ar livre', category: 'HEALTH', difficulty: 'EASY', estimatedMinutes: 20 },
  { title: 'Respiração 4-7-8 por 5 minutos', description: 'Técnica para reduzir ansiedade e melhorar foco', category: 'HEALTH', difficulty: 'EASY', estimatedMinutes: 5 },
  { title: 'Registrar humor e energia do dia', description: 'Auto-observação é o primeiro passo', category: 'HEALTH', difficulty: 'EASY', estimatedMinutes: 5 },
  { title: 'Reduzir o consumo de açúcar hoje', description: 'Evite alimentos ultraprocessados durante o dia', category: 'HEALTH', difficulty: 'MEDIUM', estimatedMinutes: 10 },

  // ── TRAINING ──────────────────────────────────────────────────────────────
  { title: '30 minutos de corrida', description: 'Cardio constante para aumentar resistência', category: 'TRAINING', difficulty: 'MEDIUM', estimatedMinutes: 30 },
  { title: 'Treino de força em casa', description: 'Flexões, agachamentos e abdominais', category: 'TRAINING', difficulty: 'MEDIUM', estimatedMinutes: 25 },
  { title: 'Yoga de 20 minutos', description: 'Flexibilidade e equilíbrio com foco na respiração', category: 'TRAINING', difficulty: 'EASY', estimatedMinutes: 20 },
  { title: 'Treino HIIT de 15 minutos', description: 'Alta intensidade em pouco tempo', category: 'TRAINING', difficulty: 'HARD', estimatedMinutes: 15 },
  { title: '100 polichinelos', description: 'Aquecimento rápido e eficiente', category: 'TRAINING', difficulty: 'EASY', estimatedMinutes: 10 },
  { title: 'Séries de prancha (3x 1min)', description: 'Core forte e postura melhorada', category: 'TRAINING', difficulty: 'MEDIUM', estimatedMinutes: 10 },
  { title: 'Nadar por 30 minutos', description: 'Treino completo de baixo impacto', category: 'TRAINING', difficulty: 'MEDIUM', estimatedMinutes: 30 },
  { title: 'Andar de bicicleta', description: 'Exercício aeróbico ao ar livre', category: 'TRAINING', difficulty: 'EASY', estimatedMinutes: 40 },
  { title: 'Treino de mobilidade articular', description: 'Preserve a saúde das articulações', category: 'TRAINING', difficulty: 'EASY', estimatedMinutes: 15 },
  { title: 'Desafio dos 50 agachamentos', description: 'Fortaleça as pernas e glúteos', category: 'TRAINING', difficulty: 'MEDIUM', estimatedMinutes: 10 },

  // ── STUDY ────────────────────────────────────────────────────────────────
  { title: 'Ler por 30 minutos', description: 'Um livro que te faça crescer', category: 'STUDY', difficulty: 'EASY', estimatedMinutes: 30 },
  { title: 'Assistir uma aula online', description: 'Plataformas como Coursera, YouTube ou Udemy', category: 'STUDY', difficulty: 'EASY', estimatedMinutes: 45 },
  { title: 'Estudar um idioma por 15 minutos', description: 'Duolingo, Anki ou conversa', category: 'STUDY', difficulty: 'EASY', estimatedMinutes: 15 },
  { title: 'Resumir o que aprendeu hoje', description: 'Fixação ativa é mais eficiente que reler', category: 'STUDY', difficulty: 'EASY', estimatedMinutes: 10 },
  { title: 'Praticar técnica Pomodoro', description: '25 min foco + 5 min pausa, 4 ciclos', category: 'STUDY', difficulty: 'MEDIUM', estimatedMinutes: 120 },
  { title: 'Revisar anotações da semana', description: 'Consolide o conhecimento adquirido', category: 'STUDY', difficulty: 'EASY', estimatedMinutes: 20 },
  { title: 'Resolver exercícios práticos', description: 'Aplique o que estudou em problemas reais', category: 'STUDY', difficulty: 'MEDIUM', estimatedMinutes: 30 },
  { title: 'Criar um mapa mental de um tema', description: 'Organize visualmente seu conhecimento', category: 'STUDY', difficulty: 'MEDIUM', estimatedMinutes: 20 },
  { title: 'Ouvir um podcast educativo', description: 'Aprenda enquanto faz outra atividade', category: 'STUDY', difficulty: 'EASY', estimatedMinutes: 30 },
  { title: 'Escrever sobre o que aprendeu', description: 'Ensinar é a melhor forma de aprender', category: 'STUDY', difficulty: 'MEDIUM', estimatedMinutes: 20 },

  // ── WORK ─────────────────────────────────────────────────────────────────
  { title: 'Definir as 3 prioridades do dia', description: 'Foco no que realmente importa', category: 'WORK', difficulty: 'EASY', estimatedMinutes: 10 },
  { title: 'Limpar a caixa de e-mail', description: 'Inbox zero: responda, arquive ou delete', category: 'WORK', difficulty: 'MEDIUM', estimatedMinutes: 30 },
  { title: 'Fazer uma revisão semanal', description: 'O que funcionou? O que melhorar?', category: 'WORK', difficulty: 'EASY', estimatedMinutes: 20 },
  { title: 'Planejar a semana no domingo', description: 'Visualize as metas antes de entrar nelas', category: 'WORK', difficulty: 'EASY', estimatedMinutes: 30 },
  { title: 'Atualizar portfólio ou currículo', description: 'Mantenha suas conquistas registradas', category: 'WORK', difficulty: 'MEDIUM', estimatedMinutes: 45 },
  { title: 'Documentar um processo que você domina', description: 'Transforme conhecimento tácito em explícito', category: 'WORK', difficulty: 'HARD', estimatedMinutes: 60 },
  { title: 'Enviar uma mensagem de networking', description: 'Uma conexão pode mudar seu caminho', category: 'WORK', difficulty: 'EASY', estimatedMinutes: 10 },
  { title: 'Fazer uma sessão de deep work (1h sem distrações)', description: 'Desligue notificações e produza', category: 'WORK', difficulty: 'HARD', estimatedMinutes: 60 },

  // ── FINANCE ──────────────────────────────────────────────────────────────
  { title: 'Registrar os gastos do dia', description: 'Consciência financeira começa no básico', category: 'FINANCE', difficulty: 'EASY', estimatedMinutes: 10 },
  { title: 'Revisar assinaturas ativas', description: 'Cancele o que não usa mais', category: 'FINANCE', difficulty: 'EASY', estimatedMinutes: 15 },
  { title: 'Definir uma meta de economia mensal', description: 'Automatize a poupança', category: 'FINANCE', difficulty: 'EASY', estimatedMinutes: 10 },
  { title: 'Pesquisar um investimento novo', description: 'Tesouro Direto, FIIs, ETFs...', category: 'FINANCE', difficulty: 'MEDIUM', estimatedMinutes: 30 },
  { title: 'Criar ou revisar o orçamento mensal', description: 'Categorize receitas e despesas', category: 'FINANCE', difficulty: 'MEDIUM', estimatedMinutes: 30 },
  { title: 'Guardar 10% do ganho de hoje', description: 'Pague a si mesmo primeiro', category: 'FINANCE', difficulty: 'EASY', estimatedMinutes: 5 },

  // ── PERSONAL DEVELOPMENT ─────────────────────────────────────────────────
  { title: 'Escrever no diário pessoal', description: 'Processe pensamentos e emoções', category: 'PERSONAL_DEVELOPMENT', difficulty: 'EASY', estimatedMinutes: 15 },
  { title: 'Listar 3 coisas pelas quais é grato', description: 'Gratidão muda a perspectiva', category: 'PERSONAL_DEVELOPMENT', difficulty: 'EASY', estimatedMinutes: 5 },
  { title: 'Identificar um medo e agir apesar dele', description: 'Coragem é múscculo — exercite', category: 'PERSONAL_DEVELOPMENT', difficulty: 'HARD', estimatedMinutes: 30 },
  { title: 'Pedir feedback a alguém de confiança', description: 'Pontos cegos só aparecem quando perguntamos', category: 'PERSONAL_DEVELOPMENT', difficulty: 'MEDIUM', estimatedMinutes: 20 },
  { title: 'Definir uma meta para o próximo mês', description: 'Específica, mensurável e com prazo', category: 'PERSONAL_DEVELOPMENT', difficulty: 'EASY', estimatedMinutes: 15 },
  { title: 'Desafio do silêncio (30 min sem estímulos)', description: 'Sente e ouça seus pensamentos', category: 'PERSONAL_DEVELOPMENT', difficulty: 'MEDIUM', estimatedMinutes: 30 },
  { title: 'Aprender algo fora da sua área', description: 'Curiosidade é vantagem competitiva', category: 'PERSONAL_DEVELOPMENT', difficulty: 'EASY', estimatedMinutes: 30 },
  { title: 'Praticar autodisciplina (abrir mão de algo)', description: 'Resistência constrói caráter', category: 'PERSONAL_DEVELOPMENT', difficulty: 'MEDIUM', estimatedMinutes: 60 },

  // ── CREATIVITY ───────────────────────────────────────────────────────────
  { title: 'Escrever 500 palavras livres', description: 'Sem julgamento, apenas fluxo', category: 'CREATIVITY', difficulty: 'EASY', estimatedMinutes: 20 },
  { title: 'Desenhar por 15 minutos', description: 'Sem pressão por perfeição', category: 'CREATIVITY', difficulty: 'EASY', estimatedMinutes: 15 },
  { title: 'Fotografar algo interessante no dia a dia', description: 'Treinar o olhar criativo', category: 'CREATIVITY', difficulty: 'EASY', estimatedMinutes: 10 },
  { title: 'Compor uma melodia ou beat', description: 'Expresse emoções através do som', category: 'CREATIVITY', difficulty: 'MEDIUM', estimatedMinutes: 30 },
  { title: 'Criar algo com o que tem em casa', description: 'DIY, culinária nova, colagem...', category: 'CREATIVITY', difficulty: 'MEDIUM', estimatedMinutes: 45 },
  { title: 'Brainstorm de 10 ideias em 10 minutos', description: 'Quantidade antes de qualidade', category: 'CREATIVITY', difficulty: 'EASY', estimatedMinutes: 10 },

  // ── SOCIAL ───────────────────────────────────────────────────────────────
  { title: 'Ligar para alguém que não fala há tempo', description: 'Relações precisam de nutrição', category: 'SOCIAL', difficulty: 'EASY', estimatedMinutes: 20 },
  { title: 'Elogiar alguém sinceramente', description: 'Generosidade cria vínculos reais', category: 'SOCIAL', difficulty: 'EASY', estimatedMinutes: 5 },
  { title: 'Participar de um grupo ou comunidade', description: 'Online ou presencial, conexão importa', category: 'SOCIAL', difficulty: 'EASY', estimatedMinutes: 30 },
  { title: 'Ajudar alguém sem esperar retorno', description: 'Altruísmo faz bem a quem dá', category: 'SOCIAL', difficulty: 'EASY', estimatedMinutes: 20 },
  { title: 'Organizar um encontro com amigos', description: 'Marcar a data é o passo mais difícil', category: 'SOCIAL', difficulty: 'MEDIUM', estimatedMinutes: 15 },

  // ── HOME ─────────────────────────────────────────────────────────────────
  { title: 'Organizar uma gaveta ou prateleira', description: 'Ambiente limpo, mente limpa', category: 'HOME', difficulty: 'EASY', estimatedMinutes: 20 },
  { title: 'Cozinhar uma refeição do zero', description: 'Saúde e economia na mesma panela', category: 'HOME', difficulty: 'MEDIUM', estimatedMinutes: 45 },
  { title: 'Fazer uma limpeza rápida de 15 minutos', description: 'Regra dos 15 minutos: surpreende', category: 'HOME', difficulty: 'EASY', estimatedMinutes: 15 },
  { title: 'Desapegar de roupas que não usa', description: 'Menos é mais', category: 'HOME', difficulty: 'EASY', estimatedMinutes: 30 },
  { title: 'Preparar marmitas para a semana', description: 'Meal prep economiza tempo e dinheiro', category: 'HOME', difficulty: 'HARD', estimatedMinutes: 90 },

  // ── SPIRITUALITY ─────────────────────────────────────────────────────────
  { title: 'Meditar com foco na compaixão', description: 'Metta: amor incondicional a si e aos outros', category: 'SPIRITUALITY', difficulty: 'EASY', estimatedMinutes: 15 },
  { title: 'Passar 20 minutos na natureza', description: 'Reconecte com o mundo fora das telas', category: 'SPIRITUALITY', difficulty: 'EASY', estimatedMinutes: 20 },
  { title: 'Escrever sobre seus valores', description: 'O que realmente importa para você?', category: 'SPIRITUALITY', difficulty: 'MEDIUM', estimatedMinutes: 20 },
  { title: 'Praticar um ato de bondade anônimo', description: 'Faça o bem sem esperar ser visto', category: 'SPIRITUALITY', difficulty: 'EASY', estimatedMinutes: 15 },
  { title: 'Fazer uma pausa de gratidão no trabalho', description: '5 minutos para reconhecer o que há de bom', category: 'SPIRITUALITY', difficulty: 'EASY', estimatedMinutes: 5 },
]

export function getRandomIdeas(count = 6, category?: string): TaskIdea[] {
  const pool = category ? TASK_IDEAS.filter(i => i.category === category) : TASK_IDEAS
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
