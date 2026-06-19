# Ascend System

Plataforma web de produtividade gamificada com identidade original. O usuário transforma hábitos e tarefas em uma jornada de evolução pessoal com XP, níveis, atributos, especializações, missões, equipamentos, Arena e desafios cooperativos.

> Essências, itens, patentes e recompensas são fictícios e não possuem valor financeiro.

## Principais recursos

- Cadastro e login com senha protegida por bcrypt e JWT em cookie `httpOnly`.
- Onboarding adaptativo por objetivos, tempo disponível, experiência e equipamentos.
- Tarefas únicas ou recorrentes com subtarefas, duração, meta quantitativa e histórico por execução.
- Rotinas reutilizáveis para manhã, foco profundo e treino sem equipamentos.
- XP, níveis, oito atributos, classes e quatro especializações.
- Progressão transparente com fórmulas de XP, combate e patentes.
- Inventário, loja, missões, conquistas, streak e histórico.
- Arena contra bots ou jogadores próximos, prévia de risco, limite diário e temporadas.
- Ranking permanente E–S e ranking sazonal.
- Grupos privados com desafios cooperativos.
- Relatórios planejado × realizado, metas, duração, categorias e melhor horário.
- Feedback e suporte interno.
- Exportação de dados, exclusão definitiva da conta e páginas de privacidade/termos.
- PWA instalável, cache básico offline e notificações locais opcionais.
- Player com três faixas cinematográficas em reprodução contínua.

## Stack

- Next.js 16, React 19 e TypeScript
- PostgreSQL e Prisma 6
- Tailwind CSS 4, Framer Motion, Lucide React e Recharts
- Zod para validação
- Vitest para testes

## Instalação

Requisitos: Node.js 20+ e PostgreSQL.

```bash
npm install
cp .env.example .env
npm run setup
npm run dev
```

Abra `http://localhost:3000`.

Usuário de demonstração criado pelo seed:

```text
teste@ascend.com
admin123
```

## Variáveis de ambiente

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ascend_system"
JWT_SECRET="use-um-segredo-longo-e-aleatorio"
```

## Scripts

| Comando | Função |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção e checagem TypeScript |
| `npm start` | Servidor de produção |
| `npm test` | Testes de progressão, Arena, patentes e validação |
| `npm run setup` | Gera o client, sincroniza o banco e roda o seed |
| `npm run db:studio` | Interface visual do Prisma |

## Confiabilidade e segurança

- Conclusões de tarefas e batalhas usam chaves de idempotência.
- Compras e resgates usam transações e atualizações condicionais.
- Rate limiting básico protege autenticação, tarefas, Arena e feedback.
- Todas as consultas privadas são filtradas pelo usuário autenticado.
- Inputs principais usam schemas Zod.
- Senhas nunca são retornadas nas APIs ou exportações.
- O usuário pode exportar ou excluir seus dados.

O rate limit atual é em memória e funciona para uma instância. Em produção distribuída, substitua por Redis/Upstash.

## Deploy

1. Provisione PostgreSQL em Neon, Supabase, Railway, Render ou equivalente.
2. Configure `DATABASE_URL` e `JWT_SECRET`.
3. Execute `npm run db:push` uma vez ou converta o schema em migrations versionadas.
4. Build: `npm run build`.
5. Start: `npm start`.

Para notificações push reais em segundo plano, conecte um provedor Web Push. A versão atual oferece PWA, cache offline e notificações locais autorizadas pelo usuário.
