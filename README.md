# ⚡ Ascend System

**Transforme sua rotina em uma jornada de evolução pessoal.**

Plataforma de produtividade gamificada inspirada em mecânicas de RPG: cumpra tarefas, ganhe XP, suba de nível, evolua atributos, complete missões, desbloqueie conquistas e equipe itens fictícios — tudo para incentivar disciplina, estudo, treino, trabalho, finanças e desenvolvimento pessoal na vida real.

> ⚠️ **Aviso:** Todas as moedas (*Essências*), equipamentos e recompensas do sistema são **fictícios** e **não possuem nenhum valor financeiro ou monetário real**. O projeto é original, apenas inspirado em mecânicas genéricas de progressão.

---

## ✨ Funcionalidades

- 🔐 **Autenticação própria e segura** — cadastro, login e logout com senhas criptografadas (bcrypt) e sessão via JWT em cookie httpOnly. Cada usuário acessa somente os próprios dados.
- 📊 **Dashboard futurista** — nível, barra de XP animada, classe, streak, Essências, tarefas do dia, missões ativas, resumo semanal e atividade recente.
- ✅ **Sistema de tarefas** — 10 categorias, 4 dificuldades, recorrência (única/diária/semanal/mensal), prazos e status.
- 🆙 **XP e níveis** — recompensa por dificuldade (10/25/50/100 XP), level-up automático com fórmula `100 + nível × 50` e animação de **Level Up**.
- 💪 **8 atributos** — Força, Inteligência, Disciplina, Foco, Vitalidade, Carisma, Sabedoria e Criatividade, que evoluem conforme a categoria das tarefas.
- 🎭 **Classes** — 8 classes com ícone, descrição, cor e bônus simbólico.
- 🛡️ **Inventário e Loja** — equipamentos fictícios com 6 raridades, compra com Essências e sistema de equipar/desequipar por tipo.
- 🎯 **Missões** — diárias, semanais e especiais, com progresso automático e resgate de recompensas.
- 🔥 **Streak** — sequência de dias ativos com bônus em marcos (3, 7, 14, 30, 60, 100 dias).
- 🏆 **Conquistas** — badges desbloqueáveis com data de conquista.
- 📜 **Histórico** — linha do tempo de toda a evolução.
- 📈 **Relatórios** — gráficos de XP por dia, tarefas por semana e distribuição por categoria (Recharts).
- ⚙️ **Configurações** — editar perfil, avatar e classe.
- 📱 **100% responsivo** — sidebar no desktop, navegação inferior no mobile.

---

## 🧱 Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| Backend | Next.js API Routes |
| Banco | PostgreSQL |
| ORM | Prisma 6 |
| Auth | JWT + bcrypt (sistema próprio) |
| Estilo | Tailwind CSS 4 |
| Ícones | Lucide React |
| Gráficos | Recharts |

---

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js 18.18+ (recomendado 20+)
- Uma instância PostgreSQL (local, ou na nuvem: Neon, Supabase, Railway, Render…)

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure as variáveis de ambiente
Copie o exemplo e edite com seus dados:
```bash
cp .env.example .env
```
Ajuste a `DATABASE_URL` para apontar ao seu PostgreSQL e defina um `JWT_SECRET` forte.

### 3. Prepare o banco de dados e popule os dados iniciais
```bash
npm run setup
```
Esse comando roda, em sequência:
- `prisma generate` — gera o Prisma Client
- `prisma db push` — cria as tabelas no banco
- `db:seed` — popula classes, equipamentos, conquistas, missões e um **usuário de teste**

> Prefere migrations versionadas? Use `npm run db:migrate` no lugar de `db:push`.

### 4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```
Acesse **http://localhost:3000**.

### 🔑 Usuário de teste (criado pelo seed)
```
Email: teste@ascend.com
Senha: admin123
```

---

## 📜 Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Servidor de produção |
| `npm run setup` | Generate + push + seed (configuração completa do banco) |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:push` | Sincroniza o schema com o banco |
| `npm run db:migrate` | Cria/aplica migrations |
| `npm run db:seed` | Popula os dados iniciais |
| `npm run db:studio` | Abre o Prisma Studio (UI do banco) |

---

## 📁 Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/              # Login e cadastro (layout sem sidebar)
│   ├── (dashboard)/         # Páginas protegidas (layout com sidebar)
│   │   ├── dashboard/  tasks/  missions/  profile/
│   │   ├── inventory/  shop/   achievements/
│   │   └── history/    reports/ settings/
│   └── api/                 # API Routes (auth, tasks, missions, shop…)
├── components/
│   ├── ui/                  # Button, Input, Select, Toast
│   ├── layout/              # Sidebar, MobileNav
│   └── game/                # XPBar, RewardModal
├── context/                 # AuthContext
├── hooks/                   # useAuth
└── lib/                     # db (Prisma), auth (JWT), game-logic (regras)
prisma/
├── schema.prisma            # Modelos do banco
└── seed.ts                  # Dados iniciais
```

---

## 🔄 Regras de jogo (resumo)

**Ao concluir uma tarefa**, o backend (em uma transação) executa:
1. Marca a tarefa como concluída
2. Adiciona XP e Essências ao usuário
3. Recalcula nível (level-up automático com bônus de Essências)
4. Atualiza atributos conforme a categoria
5. Atualiza o streak e concede bônus em marcos
6. Avança o progresso das missões ativas
7. Desbloqueia conquistas elegíveis
8. Registra tudo no histórico
9. Retorna os dados para a **animação de recompensa**

---

## ☁️ Deploy

O projeto está pronto para **Vercel**, **Railway** ou **Render**:

1. Provisione um PostgreSQL gerenciado e copie a connection string.
2. Configure as variáveis de ambiente `DATABASE_URL` e `JWT_SECRET` no painel do serviço.
3. No build, rode as migrations/seed (`npm run db:push && npm run db:seed`) ou execute manualmente uma vez.
4. Comando de build: `npm run build` · Start: `npm start`.

---

## 🔐 Segurança

- Senhas hasheadas com **bcrypt** (12 rounds), nunca retornadas pela API.
- Sessão via **JWT** em cookie `httpOnly` + `sameSite=lax`.
- Toda rota da API valida a sessão e filtra os dados pelo `userId` autenticado.
- Validação de entrada nos endpoints (campos obrigatórios, tamanho mínimo de senha, saldo suficiente etc.).

---

Feito com 💜 para quem quer evoluir de verdade.
