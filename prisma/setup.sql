-- ============================================================
-- ASCEND SYSTEM — Setup completo para Supabase
-- Cole este conteúdo inteiro no SQL Editor do Supabase e execute
-- ============================================================

-- 1. EXTENSÃO
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN CREATE TYPE "TaskCategory" AS ENUM ('HEALTH','TRAINING','STUDY','WORK','FINANCE','SPIRITUALITY','SOCIAL','HOME','PERSONAL_DEVELOPMENT','CREATIVITY'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "TaskDifficulty" AS ENUM ('EASY','MEDIUM','HARD','EXTREME'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "TaskRecurrence" AS ENUM ('ONCE','DAILY','WEEKLY','MONTHLY'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "TaskStatus" AS ENUM ('PENDING','COMPLETED','FAILED','CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "MissionType" AS ENUM ('DAILY','WEEKLY','MONTHLY','SPECIAL'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "MissionStatus" AS ENUM ('ACTIVE','COMPLETED','CLAIMED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "EquipType" AS ENUM ('WEAPON','ARMOR','SHIELD','RING','BRACELET','AMULET','BOOTS','BOOK','MEDAL','RELIC','HELMET','CHESTPLATE','PANTS'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "Rarity" AS ENUM ('COMMON','UNCOMMON','RARE','EPIC','LEGENDARY','MYTHIC'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. TABELAS

CREATE TABLE IF NOT EXISTS "classes" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"        TEXT UNIQUE NOT NULL,
  "description" TEXT NOT NULL,
  "icon"        TEXT NOT NULL,
  "bonusType"   TEXT NOT NULL,
  "bonusValue"  DOUBLE PRECISION NOT NULL DEFAULT 0,
  "color"       TEXT NOT NULL DEFAULT '#6366f1'
);

CREATE TABLE IF NOT EXISTS "equipment" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"        TEXT UNIQUE NOT NULL,
  "description" TEXT NOT NULL,
  "type"        "EquipType" NOT NULL,
  "rarity"      "Rarity" NOT NULL,
  "bonusType"   TEXT,
  "bonusValue"  DOUBLE PRECISION NOT NULL DEFAULT 0,
  "price"       INTEGER NOT NULL,
  "icon"        TEXT NOT NULL,
  "imageUrl"    TEXT,
  "rank"        TEXT,
  "setKey"      TEXT,
  "isFullSet"   BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "achievements" (
  "id"               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"             TEXT UNIQUE NOT NULL,
  "description"      TEXT NOT NULL,
  "icon"             TEXT NOT NULL,
  "requirementType"  TEXT NOT NULL,
  "requirementValue" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "missions" (
  "id"               TEXT PRIMARY KEY,
  "title"            TEXT NOT NULL,
  "description"      TEXT NOT NULL,
  "type"             "MissionType" NOT NULL,
  "category"         TEXT,
  "requirementType"  TEXT NOT NULL,
  "requirementValue" INTEGER NOT NULL,
  "xpReward"         INTEGER NOT NULL,
  "essenceReward"    INTEGER NOT NULL,
  "itemRewardId"     TEXT REFERENCES "equipment"("id"),
  "minDayUnlock"     INTEGER NOT NULL DEFAULT 0,
  "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "chests" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "key"         TEXT UNIQUE NOT NULL,
  "name"        TEXT NOT NULL,
  "rank"        TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "icon"        TEXT NOT NULL,
  "imageUrl"    TEXT,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "enemies" (
  "id"               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "key"              TEXT UNIQUE NOT NULL,
  "name"             TEXT NOT NULL,
  "rank"             TEXT NOT NULL,
  "type"             TEXT NOT NULL,
  "isBoss"           BOOLEAN NOT NULL DEFAULT false,
  "hp"               INTEGER NOT NULL,
  "attack"           INTEGER NOT NULL,
  "defense"          INTEGER NOT NULL,
  "weakness"         TEXT,
  "resistance"       TEXT,
  "specialMechanic"  TEXT,
  "recommendedPower" INTEGER NOT NULL,
  "drops"            TEXT,
  "icon"             TEXT NOT NULL,
  "imageUrl"         TEXT,
  "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "arena_seasons" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "key"       TEXT UNIQUE NOT NULL,
  "name"      TEXT NOT NULL,
  "startsAt"  TIMESTAMPTZ NOT NULL,
  "endsAt"    TIMESTAMPTZ NOT NULL,
  "active"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "users" (
  "id"                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"                 TEXT NOT NULL,
  "email"                TEXT UNIQUE NOT NULL,
  "passwordHash"         TEXT NOT NULL,
  "avatarUrl"            TEXT,
  "level"                INTEGER NOT NULL DEFAULT 1,
  "currentXp"            INTEGER NOT NULL DEFAULT 0,
  "totalXp"              INTEGER NOT NULL DEFAULT 0,
  "essences"             INTEGER NOT NULL DEFAULT 0,
  "fragments"            INTEGER NOT NULL DEFAULT 0,
  "currentStreak"        INTEGER NOT NULL DEFAULT 0,
  "bestStreak"           INTEGER NOT NULL DEFAULT 0,
  "lastActiveDate"       TIMESTAMPTZ,
  "penaltiesEnabled"     BOOLEAN NOT NULL DEFAULT false,
  "arenaWins"            INTEGER NOT NULL DEFAULT 0,
  "arenaLosses"          INTEGER NOT NULL DEFAULT 0,
  "arenaPoints"          INTEGER NOT NULL DEFAULT 0,
  "seasonPoints"         INTEGER NOT NULL DEFAULT 0,
  "onboardingCompleted"  BOOLEAN NOT NULL DEFAULT false,
  "timezone"             TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  "goals"                TEXT[] DEFAULT '{}',
  "availableMinutes"     INTEGER NOT NULL DEFAULT 30,
  "experienceLevel"      TEXT NOT NULL DEFAULT 'BEGINNER',
  "availableEquipment"   TEXT[] DEFAULT '{}',
  "healthNotes"          TEXT,
  "specialization"       TEXT,
  "notificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
  "selectedClassId"      TEXT REFERENCES "classes"("id"),
  "lastBattleAt"         TIMESTAMPTZ,
  "arenaCharges"         INTEGER NOT NULL DEFAULT 5,
  "arenaNextChargeAt"    TIMESTAMPTZ,
  "createdAt"            TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "attributes" (
  "id"           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"       TEXT UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "strength"     INTEGER NOT NULL DEFAULT 0,
  "intelligence" INTEGER NOT NULL DEFAULT 0,
  "discipline"   INTEGER NOT NULL DEFAULT 0,
  "focus"        INTEGER NOT NULL DEFAULT 0,
  "vitality"     INTEGER NOT NULL DEFAULT 0,
  "charisma"     INTEGER NOT NULL DEFAULT 0,
  "wisdom"       INTEGER NOT NULL DEFAULT 0,
  "creativity"   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "tasks" (
  "id"               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"           TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title"            TEXT NOT NULL,
  "description"      TEXT,
  "category"         "TaskCategory" NOT NULL,
  "difficulty"       "TaskDifficulty" NOT NULL,
  "recurrence"       "TaskRecurrence" NOT NULL DEFAULT 'ONCE',
  "dueDate"          TIMESTAMPTZ,
  "xpReward"         INTEGER NOT NULL,
  "essenceReward"    INTEGER NOT NULL,
  "status"           "TaskStatus" NOT NULL DEFAULT 'PENDING',
  "completedAt"      TIMESTAMPTZ,
  "targetValue"      DOUBLE PRECISION,
  "targetUnit"       TEXT,
  "estimatedMinutes" INTEGER,
  "isTemplate"       BOOLEAN NOT NULL DEFAULT false,
  "templateName"     TEXT,
  "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "tasks_userId_idx" ON "tasks"("userId");
CREATE INDEX IF NOT EXISTS "tasks_userId_status_idx" ON "tasks"("userId","status");

CREATE TABLE IF NOT EXISTS "task_subtasks" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "taskId"    TEXT NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
  "title"     TEXT NOT NULL,
  "position"  INTEGER NOT NULL DEFAULT 0,
  "completed" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "task_executions" (
  "id"                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "taskId"              TEXT NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
  "userId"              TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "idempotencyKey"      TEXT UNIQUE NOT NULL,
  "actualValue"         DOUBLE PRECISION,
  "durationMinutes"     INTEGER,
  "perceivedDifficulty" INTEGER,
  "notes"               TEXT,
  "xpGained"            INTEGER NOT NULL DEFAULT 0,
  "essenceGained"       INTEGER NOT NULL DEFAULT 0,
  "completedAt"         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "task_executions_userId_completedAt_idx" ON "task_executions"("userId","completedAt");

CREATE TABLE IF NOT EXISTS "action_receipts" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "action"    TEXT NOT NULL,
  "key"       TEXT NOT NULL,
  "result"    JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("userId","action","key")
);

CREATE TABLE IF NOT EXISTS "user_missions" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"      TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "missionId"   TEXT NOT NULL REFERENCES "missions"("id"),
  "progress"    INTEGER NOT NULL DEFAULT 0,
  "status"      "MissionStatus" NOT NULL DEFAULT 'ACTIVE',
  "completedAt" TIMESTAMPTZ,
  "claimedAt"   TIMESTAMPTZ,
  "assignedAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("userId","missionId")
);
CREATE INDEX IF NOT EXISTS "user_missions_userId_idx" ON "user_missions"("userId");

CREATE TABLE IF NOT EXISTS "inventory" (
  "id"           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"       TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "equipmentId"  TEXT NOT NULL REFERENCES "equipment"("id"),
  "isEquipped"   BOOLEAN NOT NULL DEFAULT false,
  "upgradeLevel" INTEGER NOT NULL DEFAULT 0,
  "durability"   INTEGER NOT NULL DEFAULT 100,
  "durabilityMax" INTEGER NOT NULL DEFAULT 100,
  "acquiredAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("userId","equipmentId")
);
CREATE INDEX IF NOT EXISTS "inventory_userId_idx" ON "inventory"("userId");

CREATE TABLE IF NOT EXISTS "forge_logs" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"      TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "inventoryId" TEXT NOT NULL REFERENCES "inventory"("id") ON DELETE CASCADE,
  "action"      TEXT NOT NULL,
  "success"     BOOLEAN NOT NULL,
  "costEssences" INTEGER NOT NULL DEFAULT 0,
  "detail"      TEXT,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_achievements" (
  "id"            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"        TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "achievementId" TEXT NOT NULL REFERENCES "achievements"("id"),
  "unlockedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("userId","achievementId")
);
CREATE INDEX IF NOT EXISTS "user_achievements_userId_idx" ON "user_achievements"("userId");

CREATE TABLE IF NOT EXISTS "activity_history" (
  "id"            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"        TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type"          TEXT NOT NULL,
  "description"   TEXT NOT NULL,
  "xpChange"      INTEGER NOT NULL DEFAULT 0,
  "essenceChange" INTEGER NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "activity_history_userId_idx" ON "activity_history"("userId");

CREATE TABLE IF NOT EXISTS "battles" (
  "id"            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"        TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "opponentName"  TEXT NOT NULL,
  "opponentType"  TEXT NOT NULL,
  "won"           BOOLEAN NOT NULL,
  "xpChange"      INTEGER NOT NULL DEFAULT 0,
  "essenceChange" INTEGER NOT NULL DEFAULT 0,
  "pointsChange"  INTEGER NOT NULL DEFAULT 0,
  "seasonKey"     TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "battles_userId_idx" ON "battles"("userId");

CREATE TABLE IF NOT EXISTS "feedback" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "category"  TEXT NOT NULL,
  "message"   TEXT NOT NULL,
  "rating"    INTEGER,
  "status"    TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "groups" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "inviteCode"  TEXT UNIQUE NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "group_members" (
  "id"       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "groupId"  TEXT NOT NULL REFERENCES "groups"("id") ON DELETE CASCADE,
  "userId"   TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role"     TEXT NOT NULL DEFAULT 'MEMBER',
  "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("groupId","userId")
);

CREATE TABLE IF NOT EXISTS "group_challenges" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "groupId"     TEXT NOT NULL REFERENCES "groups"("id") ON DELETE CASCADE,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "target"      INTEGER NOT NULL,
  "reward"      INTEGER NOT NULL DEFAULT 0,
  "startsAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "endsAt"      TIMESTAMPTZ NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "group_contributions" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "challengeId" TEXT NOT NULL REFERENCES "group_challenges"("id") ON DELETE CASCADE,
  "userId"      TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "value"       INTEGER NOT NULL DEFAULT 0,
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("challengeId","userId")
);

CREATE TABLE IF NOT EXISTS "user_chests" (
  "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"     TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "chestId"    TEXT NOT NULL REFERENCES "chests"("id"),
  "quantity"   INTEGER NOT NULL DEFAULT 1,
  "source"     TEXT NOT NULL DEFAULT 'REWARD',
  "acquiredAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("userId","chestId")
);

CREATE TABLE IF NOT EXISTS "chest_opening_logs" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"      TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "chestId"     TEXT NOT NULL REFERENCES "chests"("id"),
  "rewardsJson" JSONB NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "chest_opening_logs_userId_createdAt_idx" ON "chest_opening_logs"("userId","createdAt");

-- ============================================================
-- 4. DADOS INICIAIS (SEED)
-- ============================================================

-- CLASSES
INSERT INTO "classes" ("name","description","icon","bonusType","bonusValue","color") VALUES
('Aprendiz da Disciplina','O começo de toda grande jornada. Bônus em consistência diária.','🌱','DAILY',5,'#22c55e'),
('Caçador de Hábitos','Especialista em criar e manter hábitos poderosos. Bônus em tarefas recorrentes.','🎯','HABIT',10,'#f59e0b'),
('Estrategista','Planejamento e execução são suas armas. Bônus em tarefas de trabalho.','♟️','WORK',10,'#3b82f6'),
('Guardião da Saúde','Corpo e mente em harmonia. Bônus em tarefas de saúde e treino.','🛡️','HEALTH',15,'#10b981'),
('Mestre do Foco','Concentração absoluta em cada tarefa. Bônus em produtividade.','🔮','FOCUS',12,'#8b5cf6'),
('Arquiteto do Conhecimento','Construtor de sabedoria e habilidades. Bônus em tarefas de estudo.','📚','STUDY',15,'#6366f1'),
('Guerreiro da Consistência','A constância é sua maior força. Bônus por streak diário.','⚔️','STREAK',20,'#ef4444'),
('Explorador da Evolução','Sempre buscando o próximo nível. Bônus em XP geral.','🚀','XP',8,'#f97316')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Itens iniciais
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl") VALUES
('Lâmina da Disciplina','Uma arma forjada pela consistência inabalável.','WEAPON','RARE','DISCIPLINE',10,150,'⚔️',NULL),
('Armadura do Foco','Proteção contra distrações e procrastinação.','ARMOR','EPIC','FOCUS',15,300,'🛡️',NULL),
('Anel da Consistência','Um anel mágico que simboliza disciplina, equilíbrio e constância.','RING','UNCOMMON','STREAK',5,250,'💍','/assets/items/accessories/anel-da-consistencia.png'),
('Botas da Velocidade','Botas leves e reforçadas, feitas para aumentar mobilidade e agilidade.','BOOTS','COMMON','SPEED',5,150,'👟','/assets/items/boots/botas-da-velocidade.png'),
('Livro da Sabedoria','Um grimório épico repleto de conhecimento arcano e energia ancestral.','BOOK','EPIC','WISDOM',20,1200,'📖','/assets/items/books/livro-da-sabedoria.png'),
('Medalha da Persistência','Uma medalha rara concedida àqueles que resistem, insistem e continuam evoluindo.','MEDAL','RARE','PERSISTENCE',12,650,'🏅','/assets/items/accessories/medalha-da-persistencia.png'),
('Amuleto da Clareza','Um amuleto cristalino que favorece foco, lucidez e percepção.','AMULET','UNCOMMON','CLARITY',8,280,'🔮','/assets/items/accessories/amuleto-da-clareza.png'),
('Escudo da Rotina','Protege sua consistência contra o caos do dia a dia.','ARMOR','COMMON','ROUTINE',3,30,'🔰',NULL),
('Relíquia da Evolução','Uma relíquia lendária ligada à ascensão, transformação e crescimento contínuo.','RELIC','LEGENDARY','ALL',25,3000,'✨','/assets/items/relics/reliquia-da-evolucao.png'),
('Coroa do Ápice','Uma relíquia mítica que representa o ápice da evolução e da conquista.','RELIC','MYTHIC','ALL',50,6000,'👑','/assets/items/relics/coroa-do-apice.png'),
('Espada da Força Interior','Forjada com determinação pura e esforço inabalável.','WEAPON','LEGENDARY','STRENGTH',30,800,'🗡️',NULL),
('Bracelete da Vitalidade','Um bracelete raro que pulsa energia vital e fortalece a resistência do usuário.','BRACELET','RARE','VITALITY',18,600,'⚡','/assets/items/accessories/bracelete-da-vitalidade.png')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Escudos catálogo
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl") VALUES
('Escudo do Rei das Sombras','Forjado nas profundezas das trevas, irradia poder sombrio. DEF +260, HP +650, Bloqueio +20%.','ARMOR','MYTHIC','DEFENSE',260,8000,'🛡️','/assets/shields/escudo-supremo-do-nucleo-ascendente-rank-s.png'),
('Escudo do Guardião Fantasma','Escudo etéreo que atravessa ataques físicos. DEF +185, Defesa +16%, Mana +40, Bloqueio +14%.','ARMOR','EPIC','DEFENSE',185,2800,'🛡️','/assets/shields/escudo-da-barreira-sombria-rank-b.png'),
('Bastião do Guardião Lunar','Escudo imbuído com energia da lua. DEF +138, HP +240, Resistência Mágica +10%.','ARMOR','RARE','DEFENSE',138,950,'🛡️','/assets/shields/escudo-runico-de-ciano-rank-c.png'),
('Escudo de Ferro Rúnico','Ferro temperado com runas antigas. DEF +92, HP +150, Bloqueio +8%, Resistência +6%.','ARMOR','UNCOMMON','DEFENSE',92,320,'🛡️','/assets/shields/escudo-do-vigia-de-ferro-rank-d.png'),
('Escudo do Iniciante','Escudo básico para novos caçadores. DEF +50, HP +70, Bloqueio +4%.','ARMOR','COMMON','DEFENSE',50,80,'🛡️','/assets/shields/escudo-de-madeira-rachada-rank-e.png')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Armaduras catálogo página 1
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl") VALUES
('Armadura do Eclipse Abissal','Forjada no coração de um eclipse sombrio. DEF +220, AGI +35, Mana +80, Resistência Sombria +25%.','ARMOR','MYTHIC','DEFENSE',220,9000,'🥋','/assets/armors/rank-s/chestplate.png'),
('Couraça do Caçador Sombrio','Armadura leve para caçadores das trevas. DEF +170, HP +450, Precisão +15, Furtividade +12%.','ARMOR','EPIC','DEFENSE',170,3200,'🥋','/assets/armors/rank-b/chestplate.png'),
('Peitoral do Guardião Lunar','Proteção imbuída pela luz da lua. DEF +125, Mana +40, Resistência Mágica +14%, Vitalidade +10.','ARMOR','RARE','DEFENSE',125,1100,'🥋','/assets/armors/rank-c/chestplate.png'),
('Armadura de Ferro Rúnico','Ferro forjado com runas protetoras. DEF +90, HP +220, Vitalidade +10, Bloqueio +8%.','ARMOR','UNCOMMON','DEFENSE',90,380,'🥋','/assets/armors/rank-d/chestplate.png'),
('Colete do Iniciante das Ruínas','Colete encontrado nas ruínas. DEF +55, Stamina +80, Sorte +3, Recuperação +4/s.','ARMOR','COMMON','DEFENSE',55,90,'🥋','/assets/armors/rank-e/chestplate.png')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Armaduras catálogo página 4
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl") VALUES
('Couraça do Dragão Obsidiano','Escamas de dragão obsidiano convertidas em armadura. DEF +240, Resistência a Fogo +25%, Força +28, HP +500.','ARMOR','MYTHIC','DEFENSE',240,9500,'🐉','/assets/armors/rank-s/chestplate.png'),
('Armadura do General Fantasma','Usada por generais fantasmas em batalhas lendárias. DEF +175, Liderança +10, Defesa +15%, Mana +35.','ARMOR','EPIC','DEFENSE',175,3500,'👻','/assets/armors/rank-b/chestplate.png'),
('Peitoral da Chama Sombria','Forjado nas chamas das profundezas. DEF +118, Dano de Fogo +12%, Resistência +10%, HP +170.','ARMOR','RARE','DEFENSE',118,980,'🔥','/assets/armors/rank-c/chestplate.png'),
('Colete do Rastreador de Masmorras','Leve e discreto para explorar masmorras. DEF +82, Visão +12, Stamina +70, Furtividade +5%.','ARMOR','UNCOMMON','DEFENSE',82,290,'🗺️','/assets/armors/rank-d/chestplate.png'),
('Armadura Simples do Desperto','Primeira armadura de quem acabou de despertar. DEF +45, HP +100, Recuperação +5/s, Resistência +4%.','ARMOR','COMMON','DEFENSE',45,60,'⚙️','/assets/armors/rank-e/chestplate.png')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Espadas catálogo página 1
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl") VALUES
('Espada do Monarca do Eclipse','ATK +245, Crítico +22%, Dano Sombrio +20%, AGI +18, Perfuração +15%.','WEAPON','MYTHIC','ATTACK',245,8500,'⚔️','/assets/weapons/swords/lamina-suprema-da-ascensao-rank-s.png'),
('Espada da Tempestade Violeta','ATK +185, Velocidade +16, Dano Elétrico +12%, Precisão +10.','WEAPON','EPIC','ATTACK',185,2600,'⚔️','/assets/weapons/swords/lamina-da-fenda-sombria-rank-b.png'),
('Lâmina do Guardião Lunar','ATK +132, Mana +35, Crítico +8%, Resistência Mágica +10%.','WEAPON','RARE','ATTACK',132,900,'🗡️','/assets/weapons/swords/espada-runica-de-ciano-rank-c.png'),
('Sabre Rúnico do Vigia','ATK +88, AGI +8, Precisão +6, Sangramento +4%.','WEAPON','UNCOMMON','ATTACK',88,300,'🗡️',NULL),
('Espada do Recruta Desperto','ATK +46, Stamina +40, Precisão +2, Recuperação +2/s.','WEAPON','COMMON','ATTACK',46,70,'🗡️',NULL)
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Arcos catálogo página 2
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl") VALUES
('Arco do Eclipse Abissal','ATK +238, Crítico +24%, Alcance +18%, Penetração +14%, AGI +20.','WEAPON','MYTHIC','ATTACK',238,8200,'🏹','/assets/weapons/bows/arco-do-eclipse-ascendente-rank-s.png'),
('Arco da Tempestade Sombria','ATK +176, Velocidade +18, Dano Elétrico +10%, Precisão +12.','WEAPON','EPIC','ATTACK',176,2500,'🏹','/assets/weapons/bows/arco-da-sombra-perfurante-rank-b.png'),
('Arco do Lobo Espiritual','ATK +128, HP +120, Crítico +8%, AGI +12.','WEAPON','RARE','ATTACK',128,850,'🏹','/assets/weapons/bows/arco-da-mira-arcana-rank-c.png'),
('Arco Rúnico do Explorador','ATK +84, Mobilidade +8, Mana +20, Precisão +5.','WEAPON','UNCOMMON','ATTACK',84,280,'🏹','/assets/weapons/bows/arco-do-vigia-silencioso-rank-d.png'),
('Arco Simples do Aspirante','ATK +40, Stamina +35, Precisão +2, Evasão +3%.','WEAPON','COMMON','ATTACK',40,65,'🏹','/assets/weapons/bows/arco-de-madeira-rustica-rank-e.png')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Armaduras catálogo página 2
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl") VALUES
('Vestes do Monarca da Noite','DEF +205, Mana +120, Regeneração +18/s, Resistência Sombria +30%, Recarga -10%.','ARMOR','MYTHIC','DEFENSE',205,8800,'🥷','/assets/armors/rank-s/chestplate.png'),
('Armadura da Tempestade Roxa','DEF +160, Velocidade +22, Evasão +15%, Dano Elétrico +12%.','ARMOR','EPIC','DEFENSE',160,3000,'🥋','/assets/armors/rank-b/chestplate.png'),
('Couraça do Lobo Espiritual','DEF +120, Crítico +10%, AGI +14, HP +180.','ARMOR','RARE','DEFENSE',120,1000,'🥋','/assets/armors/rank-c/chestplate.png'),
('Manto do Vigia Arcano','DEF +85, Mana +60, Recarga -8%, Resistência Arcana +9%.','ARMOR','UNCOMMON','DEFENSE',85,310,'🧥','/assets/armors/rank-d/chestplate.png'),
('Armadura de Couro Sombrio','DEF +50, Furtividade +6%, Stamina +60, Evasão +4%.','ARMOR','COMMON','DEFENSE',50,75,'🥋','/assets/armors/rank-e/chestplate.png')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Armaduras catálogo página 3
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl") VALUES
('Placas do Rei das Sombras','DEF +230, HP +600, Dano Sombrio +20%, Controle de Sombras +1, Resistência +18%.','ARMOR','MYTHIC','DEFENSE',230,9200,'👑','/assets/armors/rank-s/chestplate.png'),
('Cota do Sentinela do Vazio','DEF +165, Resistência +18%, Precisão +12, Mana +35.','ARMOR','EPIC','DEFENSE',165,3100,'🥋','/assets/armors/rank-b/chestplate.png'),
('Armadura do Berserker Noturno','DEF +130, Força +20, HP +250, Taxa Crítica +8%.','ARMOR','RARE','DEFENSE',130,1050,'⚙️','/assets/armors/rank-c/chestplate.png'),
('Traje do Explorador de Portais','DEF +88, Mobilidade +10, Mana +25, Resistência Elemental +8%.','ARMOR','UNCOMMON','DEFENSE',88,330,'🥋','/assets/armors/rank-d/chestplate.png'),
('Jaqueta do Recruta Caçador','DEF +48, HP +120, Agilidade +5, Recuperação +3/s.','ARMOR','COMMON','DEFENSE',48,72,'🧥','/assets/armors/rank-e/chestplate.png')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Escudos com imagem (Rank E→S)
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl","rank") VALUES
('Escudo de Madeira Rachada','Escudo básico de madeira rachada. DEF +30, Bloqueio +3%.','SHIELD','COMMON','defense',30,40,'🛡️','/assets/shields/escudo-de-madeira-rachada-rank-e.png','E'),
('Escudo do Vigia de Ferro','Ferro robusto forjado para patrulheiros. DEF +68, HP +90, Bloqueio +5%.','SHIELD','UNCOMMON','defense',68,180,'🛡️','/assets/shields/escudo-do-vigia-de-ferro-rank-d.png','D'),
('Escudo Rúnico de Ciano','Runas de proteção ciano gravadas no aço. DEF +112, HP +160, Bloqueio +8%.','SHIELD','RARE','defense',112,650,'🛡️','/assets/shields/escudo-runico-de-ciano-rank-c.png','C'),
('Escudo da Barreira Sombria','Barreira de energia sombria condensada. DEF +168, HP +280, Bloqueio +13%, Resistência Sombria +10%.','SHIELD','EPIC','defense',168,2200,'🛡️','/assets/shields/escudo-da-barreira-sombria-rank-b.png','B'),
('Escudo do Guardião Astral','Escudo imbuído com poder astral. DEF +228, HP +420, Bloqueio +17%, Resistência Mágica +15%.','SHIELD','LEGENDARY','defense',228,5800,'🛡️','/assets/shields/escudo-do-guardiao-astral-rank-a.png','A'),
('Escudo Supremo do Núcleo Ascendente','Forjado no núcleo da ascensão. DEF +310, HP +600, Bloqueio +22%, Reflete 8% do dano.','SHIELD','MYTHIC','defense',310,12000,'🛡️','/assets/shields/escudo-supremo-do-nucleo-ascendente-rank-s.png','S')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Cajados (Rank E→S)
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl","rank") VALUES
('Cajado de Madeira Antiga','Cajado simples cortado de uma árvore ancestral. ATK +28, Mana +20.','WEAPON','COMMON','ATTACK',28,45,'🪄','/assets/weapons/staffs/cajado-de-madeira-antiga-rank-e.png','E'),
('Cajado do Aprendiz Arcano','Canaliza energia arcana para aprendizes. ATK +62, Mana +55, Inteligência +4.','WEAPON','UNCOMMON','ATTACK',62,190,'🪄','/assets/weapons/staffs/cajado-do-aprendiz-arcano-rank-d.png','D'),
('Cajado da Mana Ciano','Cristal ciano que amplifica magia. ATK +105, Mana +110, Regeneração +8/s.','WEAPON','RARE','ATTACK',105,720,'🪄','/assets/weapons/staffs/cajado-da-mana-ciano-rank-c.png','C'),
('Cajado da Névoa Sombria','Envolto em névoa sombria permanente. ATK +158, Mana +180, Dano Sombrio +12%.','WEAPON','EPIC','ATTACK',158,2400,'🪄','/assets/weapons/staffs/cajado-da-nevoa-sombria-rank-b.png','B'),
('Cajado do Orbe Astral','Orbe astral que distorce a realidade. ATK +215, Mana +280, Crítico Mágico +15%.','WEAPON','LEGENDARY','ATTACK',215,6200,'🪄','/assets/weapons/staffs/cajado-do-orbe-astral-rank-a.png','A'),
('Cajado do Núcleo Eterno','O cajado mais poderoso já forjado. ATK +298, Mana +450, Todos os danos mágicos +20%.','WEAPON','MYTHIC','ATTACK',298,14000,'🪄','/assets/weapons/staffs/cajado-do-nucleo-eterno-rank-s.png','S')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Machados (Rank E→S)
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl","rank") VALUES
('Machado de Ferro Bruto','Ferro bruto sem refinamento. ATK +38, Força +3.','WEAPON','COMMON','ATTACK',38,55,'🪓','/assets/weapons/axes/machado-de-ferro-bruto-rank-e.png','E'),
('Machado do Quebrador de Pedra','Destrói pedras e inimigos igualmente. ATK +78, Força +6, Perfuração +5%.','WEAPON','UNCOMMON','ATTACK',78,210,'🪓','/assets/weapons/axes/machado-do-quebrador-de-pedra-rank-d.png','D'),
('Machado Rúnico de Combate','Runas de combate gravadas no aço. ATK +120, Força +10, Crítico +6%.','WEAPON','RARE','ATTACK',120,780,'🪓','/assets/weapons/axes/machado-runico-de-combate-rank-c.png','C'),
('Machado da Ruptura Sombria','Rompe armaduras com energia sombria. ATK +172, Força +16, Perfuração +12%.','WEAPON','EPIC','ATTACK',172,2600,'🪓','/assets/weapons/axes/machado-da-ruptura-sombria-rank-b.png','B'),
('Machado do Titã Arcano','Poder de titã canalizado em aço arcano. ATK +235, Força +24, Dano de Área +10%.','WEAPON','LEGENDARY','ATTACK',235,6800,'🪓','/assets/weapons/axes/machado-do-tita-arcano-rank-a.png','A'),
('Machado da Ruína Ascendente','Forjado com a essência da ruína. ATK +320, Força +35, Desmonta defesas em 15%.','WEAPON','MYTHIC','ATTACK',320,15000,'🪓','/assets/weapons/axes/machado-da-ruina-ascendente-rank-s.png','S')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Adagas (Rank E→S)
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl","rank") VALUES
('Adaga Enferrujada','Faca velha e enferrujada. ATK +22, AGI +3, Veneno +2%.','WEAPON','COMMON','ATTACK',22,35,'🗡️','/assets/weapons/daggers/adaga-enferrujada-rank-e.png','E'),
('Adaga do Passo Rápido','Leveza extrema para ataques rápidos. ATK +55, AGI +8, Evasão +4%.','WEAPON','UNCOMMON','ATTACK',55,160,'🗡️','/assets/weapons/daggers/adaga-do-passo-rapido-rank-d.png','D'),
('Adaga do Corte Ciano','Lâmina imbuída com energia ciano. ATK +98, Crítico +10%, Veneno +6%.','WEAPON','RARE','ATTACK',98,600,'🗡️','/assets/weapons/daggers/adaga-do-corte-ciano-rank-c.png','C'),
('Adaga do Vazio Silencioso','Golpeia sem fazer barulho. ATK +148, Crítico +16%, Furtividade +14%.','WEAPON','EPIC','ATTACK',148,2000,'🗡️','/assets/weapons/daggers/adaga-do-vazio-silencioso-rank-b.png','B'),
('Adaga da Lua Arcana','Forjada sob luz lunar arcana. ATK +205, Crítico +22%, Dano Lunar +15%.','WEAPON','LEGENDARY','ATTACK',205,5500,'🗡️','/assets/weapons/daggers/adaga-da-lua-arcana-rank-a.png','A'),
('Adaga do Julgamento Sombrio','Execução instantânea dos inimigos mais fracos. ATK +285, Crítico +30%, Execução +8%.','WEAPON','MYTHIC','ATTACK',285,13000,'🗡️','/assets/weapons/daggers/adaga-do-julgamento-sombrio-rank-s.png','S')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Arcos (Rank E→S)
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl","rank") VALUES
('Arco de Madeira Rústica','Arco simples de madeira rústica. ATK +26, Alcance +10%.','WEAPON','COMMON','ATTACK',26,38,'🏹','/assets/weapons/bows/arco-de-madeira-rustica-rank-e.png','E'),
('Arco do Vigia Silencioso','Disparo silencioso sem alertar inimigos. ATK +60, Precisão +8, Furtividade +5%.','WEAPON','UNCOMMON','ATTACK',60,170,'🏹','/assets/weapons/bows/arco-do-vigia-silencioso-rank-d.png','D'),
('Arco da Mira Arcana','Mira guiada por energia arcana. ATK +102, Precisão +14, Crítico +7%.','WEAPON','RARE','ATTACK',102,650,'🏹','/assets/weapons/bows/arco-da-mira-arcana-rank-c.png','C'),
('Arco da Sombra Perfurante','Flechas que perfuram armaduras como sombra. ATK +155, Penetração +14%, Crítico +12%.','WEAPON','EPIC','ATTACK',155,2100,'🏹','/assets/weapons/bows/arco-da-sombra-perfurante-rank-b.png','B'),
('Arco do Céu Astral','Disparos astrais que ignoram distância. ATK +210, Alcance +30%, Dano Astral +18%.','WEAPON','LEGENDARY','ATTACK',210,5800,'🏹','/assets/weapons/bows/arco-do-ceu-astral-rank-a.png','A'),
('Arco do Eclipse Ascendente','O arco mais poderoso do Sistema. ATK +292, Crítico +28%, Penetração +20%, AGI +25.','WEAPON','MYTHIC','ATTACK',292,13500,'🏹','/assets/weapons/bows/arco-do-eclipse-ascendente-rank-s.png','S')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Espadas com imagem (Rank C→S)
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl","rank") VALUES
('Espada Rúnica de Ciano','Runas cianas gravam lâmina de aço. ATK +115, Mana +30, Crítico +8%.','WEAPON','RARE','ATTACK',115,700,'⚔️','/assets/weapons/swords/espada-runica-de-ciano-rank-c.png','C'),
('Lâmina da Fenda Sombria','Abre fendas no espaço com cada corte. ATK +165, Dano Sombrio +14%, Crítico +11%.','WEAPON','EPIC','ATTACK',165,2300,'⚔️','/assets/weapons/swords/lamina-da-fenda-sombria-rank-b.png','B'),
('Espada do Arauto Arcano','Arma dos arautos do poder arcano. ATK +225, Dano Arcano +18%, Força +22.','WEAPON','LEGENDARY','ATTACK',225,6000,'⚔️','/assets/weapons/swords/espada-do-arauto-arcano-rank-a.png','A'),
('Lâmina Suprema da Ascensão','A lâmina definitiva do Sistema de Ascensão. ATK +310, Crítico +25%, Todos os atributos +10.','WEAPON','MYTHIC','ATTACK',310,14500,'⚔️','/assets/weapons/swords/lamina-suprema-da-ascensao-rank-s.png','S')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Lanças (Rank E→S)
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl","rank") VALUES
('Lança de Ferro Simples','Lança básica de ferro sem refinamento. ATK +32, Alcance +15%.','WEAPON','COMMON','ATTACK',32,42,'🔱','/assets/weapons/spears/lanca-de-ferro-simples-rank-e.png','E'),
('Lança do Guarda Desperto','Usada pelos guardas dos portais. ATK +72, Alcance +18%, HP +60.','WEAPON','UNCOMMON','ATTACK',72,195,'🔱','/assets/weapons/spears/lanca-do-guarda-desperto-rank-d.png','D'),
('Lança Rúnica Azul','Runas azuis aumentam o alcance e dano. ATK +118, Mana +40, Alcance +22%.','WEAPON','RARE','ATTACK',118,720,'🔱','/assets/weapons/spears/lanca-runica-azul-rank-c.png','C'),
('Lança da Penumbra','Perfura alvos com sombras. ATK +172, Dano Sombrio +12%, Perfuração +10%.','WEAPON','EPIC','ATTACK',172,2400,'🔱','/assets/weapons/spears/lanca-da-penumbra-rank-b.png','B'),
('Lança Celestial do Arauto','Lança dos arautos celestes. ATK +232, Dano Sagrado +20%, Alcance +35%.','WEAPON','LEGENDARY','ATTACK',232,6500,'🔱','/assets/weapons/spears/lanca-celestial-do-arauto-rank-a.png','A'),
('Lança Divina da Ascensão','Arma divina do Sistema de Ascensão. ATK +315, Dano +25%, Alcance +40%, Força +30.','WEAPON','MYTHIC','ATTACK',315,14800,'🔱','/assets/weapons/spears/lanca-divina-da-ascensao-rank-s.png','S')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Itens especiais / consumíveis
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl") VALUES
('Cristal de EXP','Cristal que libera experiência pura acumulada. Concede XP bônus ao usar.','RELIC','RARE','xp',50,120,'💠','/assets/items/cristal-de-exp.png'),
('Kit de Reparo','Restaura a durabilidade de qualquer equipamento para 100%.','RELIC','UNCOMMON','durability',100,80,'🔧','/assets/items/kit-de-reparo.png'),
('Moeda do Sistema','Moeda oficial do Sistema de Ascensão. Pode ser trocada na loja.','MEDAL','COMMON','gold',1,1,'🪙','/assets/items/moeda.png'),
('Núcleo de Ascensão','Fragmento do núcleo primordial. Necessário para evoluções de rank.','RELIC','EPIC','ascension',1,800,'🔮','/assets/items/nucleo-de-ascensao.png'),
('Pedra de Aprimoramento','Aumenta o nível de upgrade de um equipamento em 1.','RELIC','RARE','upgrade',1,200,'💎','/assets/items/pedra-de-aprimoramento.png'),
('Poção de Mana','Restaura 50% da mana máxima instantaneamente.','RELIC','COMMON','mana',50,30,'🧪','/assets/items/pocao-de-mana.png'),
('Poção de Vitalidade','Restaura 50% do HP máximo instantaneamente.','RELIC','COMMON','vitality',50,30,'🧪','/assets/items/pocao-de-vitalidade.png'),
('Runa de Força','Runa ancestral que amplifica a força temporariamente.','BOOK','UNCOMMON','strength',8,95,'📜','/assets/items/runa-de-forca.png')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Conjuntos de Armadura Rank E→S
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl","rank","setKey","isFullSet") VALUES
('Conjunto de Armadura Rank E','DEF +18, VIT +10, HP +50. Armadura iniciante completa para caçadores emergentes.','ARMOR','COMMON','def',18,220,'🛡️','/assets/armors/rank-e/full.png','E','armor-rank-e',true),
('Conjunto de Armadura Rank D','DEF +38, VIT +22, HP +110. Armadura intermediária forjada com aço mágico.','ARMOR','UNCOMMON','def',38,450,'🛡️','/assets/armors/rank-d/full.png','D','armor-rank-d',true),
('Conjunto de Armadura Rank C','DEF +85, VIT +50, HP +250. Armadura encantada com cristais mágicos de alta pureza.','ARMOR','RARE','def',85,950,'🛡️','/assets/armors/rank-c/full.png','C','armor-rank-c',true),
('Conjunto de Armadura Rank B','DEF +175, VIT +100, HP +550. Armadura épica forjada nas chamas sombrias de masmorras B.','ARMOR','EPIC','def',175,1900,'🛡️','/assets/armors/rank-b/full.png','B','armor-rank-b',true),
('Conjunto de Armadura Rank A','DEF +360, VIT +200, HP +1100. Armadura lendária imbuída com essência de soberanos.','ARMOR','LEGENDARY','def',360,3800,'🛡️','/assets/armors/rank-a/full.png','A','armor-rank-a',true),
('Conjunto de Armadura Rank S','DEF +720, VIT +400, HP +2200. Armadura mítica de um Soberano do Abismo selado.','ARMOR','MYTHIC','def',720,7800,'🛡️','/assets/armors/rank-s/full.png','S','armor-rank-s',true)
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Elmos Rank E→S
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl","rank","setKey") VALUES
('Elmo Rank E','DEF +4, VIT +3. Elmo básico de ferro fundido.','HELMET','COMMON','DEFENSE',4,50,'⛑️','/assets/armors/rank-e/helmet.png','E','armor-rank-e'),
('Elmo Rank D','DEF +9, VIT +6. Elmo de aço com reforço mágico leve.','HELMET','UNCOMMON','DEFENSE',9,100,'⛑️','/assets/armors/rank-d/helmet.png','D','armor-rank-d'),
('Elmo Rank C','DEF +20, VIT +14, FOC +5. Elmo encantado com cristais de proteção.','HELMET','RARE','DEFENSE',20,220,'⛑️','/assets/armors/rank-c/helmet.png','C','armor-rank-c'),
('Elmo Rank B','DEF +42, VIT +28, FOC +12. Elmo épico com escudo mental anti-magia.','HELMET','EPIC','DEFENSE',42,450,'⛑️','/assets/armors/rank-b/helmet.png','B','armor-rank-b'),
('Elmo Rank A','DEF +85, VIT +55, FOC +25. Elmo lendário com proteção contra magia de dominação.','HELMET','LEGENDARY','DEFENSE',85,900,'⛑️','/assets/armors/rank-a/helmet.png','A','armor-rank-a'),
('Elmo Rank S','DEF +170, VIT +110, FOC +50. Elmo mítico que contém a consciência de um Soberano.','HELMET','MYTHIC','DEFENSE',170,1800,'⛑️','/assets/armors/rank-s/helmet.png','S','armor-rank-s')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Peitorais Rank E→S
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl","rank","setKey") VALUES
('Peitoral Rank E','DEF +8, HP +30. Placa peitoral de couro endurecido.','CHESTPLATE','COMMON','def',8,90,'🦺','/assets/armors/rank-e/chestplate.png','E','armor-rank-e'),
('Peitoral Rank D','DEF +17, HP +70. Peitoral de aço reforçado com runas básicas.','CHESTPLATE','UNCOMMON','def',17,180,'🦺','/assets/armors/rank-d/chestplate.png','D','armor-rank-d'),
('Peitoral Rank C','DEF +38, HP +160. Peitoral cristalino com barreira mágica passiva.','CHESTPLATE','RARE','def',38,380,'🦺','/assets/armors/rank-c/chestplate.png','C','armor-rank-c'),
('Peitoral Rank B','DEF +80, HP +350. Peitoral épico com absorção de dano mágico ativada.','CHESTPLATE','EPIC','def',80,750,'🦺','/assets/armors/rank-b/chestplate.png','B','armor-rank-b'),
('Peitoral Rank A','DEF +165, HP +700. Peitoral lendário com escudo de aura contínua.','CHESTPLATE','LEGENDARY','def',165,1500,'🦺','/assets/armors/rank-a/chestplate.png','A','armor-rank-a'),
('Peitoral Rank S','DEF +330, HP +1400. Peitoral mítico que regenera HP a cada turno de combate.','CHESTPLATE','MYTHIC','def',330,3000,'🦺','/assets/armors/rank-s/chestplate.png','S','armor-rank-s')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Calças Rank E→S
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl","rank","setKey") VALUES
('Calça Rank E','DEF +4, DIS +2. Calça reforçada para mobilidade em combate.','PANTS','COMMON','DEFENSE',4,70,'👖','/assets/armors/rank-e/pants.png','E','armor-rank-e'),
('Calça Rank D','DEF +9, DIS +5. Calça de aço articulada para caçadores de rank D.','PANTS','UNCOMMON','DEFENSE',9,140,'👖','/assets/armors/rank-d/pants.png','D','armor-rank-d'),
('Calça Rank C','DEF +20, DIS +10. Calça cristalina que amplifica disciplina em combate.','PANTS','RARE','DEFENSE',20,300,'👖','/assets/armors/rank-c/pants.png','C','armor-rank-c'),
('Calça Rank B','DEF +38, DIS +20. Calça épica com reforço de mithril encantado.','PANTS','EPIC','DEFENSE',38,600,'👖','/assets/armors/rank-b/pants.png','B','armor-rank-b'),
('Calça Rank A','DEF +80, DIS +40. Calça lendária tecida com fios de estrelas caídas.','PANTS','LEGENDARY','DEFENSE',80,1200,'👖','/assets/armors/rank-a/pants.png','A','armor-rank-a'),
('Calça Rank S','DEF +160, DIS +80. Calça mítica que anula efeitos de lentidão e paralisação.','PANTS','MYTHIC','DEFENSE',160,2400,'👖','/assets/armors/rank-s/pants.png','S','armor-rank-s')
ON CONFLICT ("name") DO NOTHING;

-- EQUIPAMENTOS — Botas Rank E→S
INSERT INTO "equipment" ("name","description","type","rarity","bonusType","bonusValue","price","icon","imageUrl","rank","setKey") VALUES
('Botas Rank E','DEF +2, AGI +3. Botas de couro para iniciantes.','BOOTS','COMMON','DEFENSE',2,60,'🥾','/assets/armors/rank-e/boots.png','E','armor-rank-e'),
('Botas Rank D','DEF +3, AGI +6. Botas de combate reforçadas com ligas mágicas.','BOOTS','UNCOMMON','DEFENSE',3,120,'🥾','/assets/armors/rank-d/boots.png','D','armor-rank-d'),
('Botas Rank C','DEF +7, AGI +12. Botas encantadas que aumentam velocidade de reação.','BOOTS','RARE','DEFENSE',7,260,'🥾','/assets/armors/rank-c/boots.png','C','armor-rank-c'),
('Botas Rank B','DEF +15, AGI +25. Botas épicas que negam dano de queda e veneno.','BOOTS','EPIC','DEFENSE',15,500,'🥾','/assets/armors/rank-b/boots.png','B','armor-rank-b'),
('Botas Rank A','DEF +30, AGI +50. Botas lendárias que permitem passo-fantasma por 3 segundos.','BOOTS','LEGENDARY','DEFENSE',30,1000,'🥾','/assets/armors/rank-a/boots.png','A','armor-rank-a'),
('Botas Rank S','DEF +60, AGI +100. Botas míticas que permitem voo rasante por 10 segundos.','BOOTS','MYTHIC','DEFENSE',60,2000,'🥾','/assets/armors/rank-s/boots.png','S','armor-rank-s')
ON CONFLICT ("name") DO NOTHING;

-- CONQUISTAS
INSERT INTO "achievements" ("name","description","icon","requirementType","requirementValue") VALUES
('Primeiro Passo','Conclua sua primeira tarefa','👣','TASKS_COMPLETED',1),
('Iniciante Promissor','Alcance o nível 5','⭐','LEVEL',5),
('Disciplina de Ferro','Mantenha 7 dias de sequência','🔥','STREAK',7),
('Evolução Constante','Complete 50 tarefas','📈','TASKS_COMPLETED',50),
('Mestre da Rotina','Complete 100 tarefas','🏆','TASKS_COMPLETED',100),
('Lenda da Consistência','Mantenha 100 dias de streak','💎','STREAK',100),
('Acumulador de XP','Acumule 1.000 XP','💫','TOTAL_XP',1000),
('Guerreiro Ascendente','Alcance o nível 10','⚔️','LEVEL',10),
('Lenda Viva','Alcance o nível 25','👑','LEVEL',25),
('Semana Perfeita','Mantenha 14 dias de sequência','🌟','STREAK',14),
('Um Mês de Glória','Mantenha 30 dias de sequência','🎖️','STREAK',30),
('Milionário de XP','Acumule 10.000 XP','🌠','TOTAL_XP',10000)
ON CONFLICT ("name") DO NOTHING;

-- MISSÕES DIÁRIAS
INSERT INTO "missions" ("id","title","description","type","category","requirementType","requirementValue","xpReward","essenceReward","minDayUnlock") VALUES
('daily-001','Guerreiro Diário','Complete 3 tarefas hoje','DAILY','GERAL','DAILY_TASKS',3,50,20,0),
('daily-002','Corpo em Ação','Conclua uma tarefa de saúde ou treino','DAILY','TREINO','CATEGORY_HEALTH_TRAINING',1,30,15,0),
('daily-003','Mente Afiada','Conclua uma tarefa de estudo','DAILY','ESTUDO','CATEGORY_STUDY',1,30,15,0),
('daily-004','Colheita de XP','Ganhe 50 XP em um dia','DAILY','GERAL','DAILY_XP',50,25,10,0),
('daily-005','Sprint do Dia','Complete 5 tarefas em um único dia','DAILY','GERAL','DAILY_TASKS',5,75,35,7),
('daily-006','Duplo Treino','Conclua 2 tarefas de saúde ou treino hoje','DAILY','TREINO','CATEGORY_HEALTH_TRAINING',2,60,30,7),
('daily-007','Dupla Sessão de Estudo','Estude em 2 sessões diferentes hoje','DAILY','ESTUDO','CATEGORY_STUDY',2,60,30,7),
('daily-008','XP Explosivo','Ganhe 100 XP em um único dia','DAILY','GERAL','DAILY_XP',100,50,25,14),
('daily-009','Maratona Diária','Complete 7 tarefas em um dia','DAILY','GERAL','DAILY_TASKS',7,100,50,14),
('daily-010','Aquecimento','Complete 1 tarefa hoje','DAILY','GERAL','DAILY_TASKS',1,15,5,0),
('daily-011','Dupla do Dia','Complete 2 tarefas hoje','DAILY','GERAL','DAILY_TASKS',2,25,10,0),
('daily-012','Triplo Treino','Complete 3 tarefas de treino hoje','DAILY','TREINO','CATEGORY_HEALTH_TRAINING',3,80,40,14),
('daily-013','Maratona do Conhecimento','Complete 3 tarefas de estudo hoje','DAILY','ESTUDO','CATEGORY_STUDY',3,80,40,14),
('daily-014','Explosão de Poder','Ganhe 150 XP em um único dia','DAILY','GERAL','DAILY_XP',150,70,35,21),
('daily-015','Perfeição Diária','Ganhe 200 XP em um único dia','DAILY','GERAL','DAILY_XP',200,100,50,30),
('daily-016','Sem Parar','Complete 10 tarefas em um único dia','DAILY','GERAL','DAILY_TASKS',10,130,65,30)
ON CONFLICT ("id") DO NOTHING;

-- MISSÕES SEMANAIS
INSERT INTO "missions" ("id","title","description","type","category","requirementType","requirementValue","xpReward","essenceReward","minDayUnlock") VALUES
('weekly-001','Semana Produtiva','Complete 20 tarefas esta semana','WEEKLY','GERAL','WEEKLY_TASKS',20,200,100,0),
('weekly-002','Atleta da Semana','Treine 3 vezes esta semana','WEEKLY','TREINO','WEEKLY_TRAINING',3,150,75,0),
('weekly-003','Estudioso Dedicado','Estude 5 vezes esta semana','WEEKLY','ESTUDO','WEEKLY_STUDY',5,150,75,0),
('weekly-004','Dez por Semana','Complete 10 tarefas nesta semana','WEEKLY','GERAL','WEEKLY_TASKS',10,120,60,3),
('weekly-005','Consistência Atlética','Treine 5 vezes nesta semana','WEEKLY','TREINO','WEEKLY_TRAINING',5,200,100,7),
('weekly-006','Semana de Estudos','Estude 7 vezes nesta semana','WEEKLY','ESTUDO','WEEKLY_STUDY',7,200,100,7),
('weekly-007','Semana Máxima','Complete 30 tarefas nesta semana','WEEKLY','GERAL','WEEKLY_TASKS',30,300,150,14),
('weekly-008','Mestre Semanal','Complete 40 tarefas em uma semana','WEEKLY','GERAL','WEEKLY_TASKS',40,400,200,30),
('weekly-009','Primeiro Passo Semanal','Complete 5 tarefas nesta semana','WEEKLY','GERAL','WEEKLY_TASKS',5,60,30,0),
('weekly-010','Rotina Atlética','Treine 4 vezes nesta semana','WEEKLY','TREINO','WEEKLY_TRAINING',4,175,85,3),
('weekly-011','Semana Acadêmica','Estude 4 vezes nesta semana','WEEKLY','ESTUDO','WEEKLY_STUDY',4,175,85,3),
('weekly-012','Semana Equilibrada','Complete 25 tarefas nesta semana','WEEKLY','GERAL','WEEKLY_TASKS',25,250,125,14),
('weekly-013','Semana de Fogo','Estude 10 vezes nesta semana','WEEKLY','ESTUDO','WEEKLY_STUDY',10,250,125,21),
('weekly-014','Treino Máximo','Treine 7 vezes nesta semana','WEEKLY','TREINO','WEEKLY_TRAINING',7,250,125,21)
ON CONFLICT ("id") DO NOTHING;

-- MISSÕES MENSAIS
INSERT INTO "missions" ("id","title","description","type","category","requirementType","requirementValue","xpReward","essenceReward","minDayUnlock") VALUES
('monthly-001','Mês Produtivo','Complete 30 tarefas neste mês','MONTHLY','GERAL','MONTHLY_TASKS',30,500,250,14),
('monthly-002','Mês de Treino','Treine 12 vezes neste mês','MONTHLY','TREINO','MONTHLY_TRAINING',12,400,200,14),
('monthly-003','Mês de Estudos','Estude 15 vezes neste mês','MONTHLY','ESTUDO','MONTHLY_STUDY',15,400,200,14),
('monthly-004','Mês Extremo','Complete 60 tarefas em um mês','MONTHLY','GERAL','MONTHLY_TASKS',60,800,400,30),
('monthly-005','Atleta do Mês','Complete 20 treinos neste mês','MONTHLY','TREINO','MONTHLY_HEALTH',20,600,300,30),
('monthly-006','Primeiro Mês','Complete 15 tarefas neste mês','MONTHLY','GERAL','MONTHLY_TASKS',15,250,120,0),
('monthly-007','Treino Intenso','Treine 8 vezes neste mês','MONTHLY','TREINO','MONTHLY_TRAINING',8,300,150,0),
('monthly-008','Mês de Saúde Total','Complete 25 tarefas de saúde ou treino neste mês','MONTHLY','TREINO','MONTHLY_HEALTH',25,700,350,30),
('monthly-009','Erudito do Mês','Estude 20 vezes neste mês','MONTHLY','ESTUDO','MONTHLY_STUDY',20,600,300,30),
('monthly-010','Mês Lendário','Complete 100 tarefas em um único mês','MONTHLY','GERAL','MONTHLY_TASKS',100,1500,750,45)
ON CONFLICT ("id") DO NOTHING;

-- MISSÕES ESPECIAIS
INSERT INTO "missions" ("id","title","description","type","category","requirementType","requirementValue","xpReward","essenceReward","minDayUnlock") VALUES
('special-001','O Começo','Conclua sua primeira tarefa','SPECIAL','MARCO','TASKS_COMPLETED',1,100,50,0),
('special-002','Ascensão Inicial','Alcance o nível 5','SPECIAL','NÍVEL','LEVEL',5,500,200,0),
('special-003','Centenário das Tarefas','Complete 100 tarefas','SPECIAL','MARCO','TASKS_COMPLETED',100,2000,1000,0),
('special-004','10 Tarefas Concluídas','Complete 10 tarefas no total','SPECIAL','MARCO','TASKS_COMPLETED',10,150,75,0),
('special-005','25 Tarefas Concluídas','Complete 25 tarefas no total','SPECIAL','MARCO','TASKS_COMPLETED',25,300,150,0),
('special-006','50 Tarefas Concluídas','Complete 50 tarefas no total','SPECIAL','MARCO','TASKS_COMPLETED',50,600,300,0),
('special-007','Nível 3','Alcance o nível 3','SPECIAL','NÍVEL','LEVEL',3,200,100,3),
('special-008','Nível 10','Alcance o nível 10','SPECIAL','NÍVEL','LEVEL',10,1000,500,14),
('special-009','Nível 15','Alcance o nível 15','SPECIAL','NÍVEL','LEVEL',15,2000,1000,30),
('special-010','Guerreiro Lendário','Complete 250 tarefas no total','SPECIAL','MARCO','TASKS_COMPLETED',250,4000,2000,30),
('special-011','Mito Ascendente','Complete 500 tarefas no total','SPECIAL','MARCO','TASKS_COMPLETED',500,7000,3500,30),
('special-012','Nível 20','Alcance o nível 20','SPECIAL','NÍVEL','LEVEL',20,4000,2000,30),
('special-013','Nível 2','Alcance o nível 2','SPECIAL','NÍVEL','LEVEL',2,75,30,0),
('special-014','Nível 7','Alcance o nível 7','SPECIAL','NÍVEL','LEVEL',7,700,350,7),
('special-015','Nível 12','Alcance o nível 12','SPECIAL','NÍVEL','LEVEL',12,1500,750,14),
('special-016','Nível 25','Alcance o nível 25','SPECIAL','NÍVEL','LEVEL',25,5000,2500,30),
('special-017','Nível 30','Alcance o nível 30','SPECIAL','NÍVEL','LEVEL',30,8000,4000,30),
('special-018','75 Tarefas Concluídas','Complete 75 tarefas no total','SPECIAL','MARCO','TASKS_COMPLETED',75,800,400,0),
('special-019','150 Tarefas Concluídas','Complete 150 tarefas no total','SPECIAL','MARCO','TASKS_COMPLETED',150,1500,750,0),
('special-020','200 Tarefas Concluídas','Complete 200 tarefas no total','SPECIAL','MARCO','TASKS_COMPLETED',200,2500,1250,14),
('special-021','300 Tarefas Concluídas','Complete 300 tarefas no total','SPECIAL','MARCO','TASKS_COMPLETED',300,5000,2500,30),
('special-022','Veterano','Complete 1000 tarefas no total','SPECIAL','MARCO','TASKS_COMPLETED',1000,15000,7500,30)
ON CONFLICT ("id") DO NOTHING;

-- CAIXAS
INSERT INTO "chests" ("key","name","rank","description","icon","imageUrl") VALUES
('CHEST_E','Caixa Rank E','E','Uma caixa simples dos primeiros despertares.','📦','/assets/chests/bau-rank-e.png'),
('CHEST_D','Caixa Rank D','D','Recompensas modestas para caçadores iniciantes.','🎁','/assets/chests/bau-rank-d.png'),
('CHEST_C','Caixa Rank C','C','Brilho médio. Pode conter itens incomuns ou raros.','🧰','/assets/chests/bau-rank-c.png'),
('CHEST_B','Caixa Rank B','B','Energia arcana intensa. Itens raros e épicos.','💎','/assets/chests/bau-rank-b.png'),
('CHEST_A','Caixa Rank A','A','Partículas de poder. Itens épicos e lendários.','🏆','/assets/chests/bau-rank-a.png'),
('CHEST_S','Caixa Rank S','S','Explosão de aura. Itens lendários e míticos.','👑','/assets/chests/bau-rank-s.png'),
('CHEST_SPECIAL','Caixa Especial','SPECIAL','Um portal roxo de runas. Recompensa garantida e rara.','🔮','/assets/chests/bau-especial.png')
ON CONFLICT ("key") DO NOTHING;

-- INIMIGOS DO BESTIÁRIO
INSERT INTO "enemies" ("key","name","rank","type","isBoss","hp","attack","defense","weakness","resistance","specialMechanic","recommendedPower","drops","icon","imageUrl") VALUES
('goblin','Goblin de Portal','E','Invasor',false,620,78,38,'Fogo','Sombrio','Chama reforços fracos a cada 3 turnos.',80,'Essências, Caixa Rank E','👺','/assets/enemies/goblin-de-portal.png'),
('skeleton','Esqueleto das Minas Abandonadas','E','Soldado Fraco',false,720,86,42,'Sagrado','Sombrio','Reanima ao perder metade do HP.',100,'Essências, Caixa Rank E','💀','/assets/enemies/esqueleto-das-minas-abandonadas.png'),
('carrasco','Carrasco das Ruínas','D','Executor',false,1280,148,72,'Luz','Físico','Golpe de Execução: causa dano triplo em alvos com HP abaixo de 30%.',200,'Essências, Caixa Rank D','🪓','/assets/enemies/carrasco-das-ruinas.png'),
('dark_wolf','Lobo Sombrio da Névoa','D','Predador',false,1650,168,84,'Luz','Gelo','Ataques rápidos em sequência causam sangramento.',240,'Essências, Caixa Rank D','🐺','/assets/enemies/lobo-sombrio-da-nevoa.png'),
('crystal_spider','Aranha Cristalina','C','Caçador Venenoso',false,2480,212,116,'Contundente','Perfuração','Teias cristalinas reduzem a velocidade do caçador.',400,'Caixa Rank C, cristais arcanos','🕷️','/assets/enemies/aranha-cristalina.png'),
('mist_mage','Mago da Névoa Azul','C','Conjurador',false,3200,268,148,'Físico','Mágico','Conjura explosões arcanas em área a cada 2 turnos.',480,'Caixa Rank C, essência mágica','🧙','/assets/enemies/mago-da-nevoa-azul.png'),
('corrupted_knight','Cavaleiro Corrompido','B','Guardião Amaldiçoado',false,5480,412,236,'Luz','Sombrio','Postura defensiva: reduz 40% do dano recebido por 2 turnos.',980,'Caixa Rank B, Espada da Ruína, Armadura Fragmentada','⚔️','/assets/enemies/cavaleiro-corrompido.png'),
('void_assassin','Assassino do Vazio','B','Assassino',false,6200,520,195,'Luz','Sombrio','Passos no Vazio: teleporta-se para as sombras e executa um golpe fatal nas costas.',1200,'Caixa Rank B, lâmina sombria, manto do vazio','🗡️','/assets/enemies/assassino-do-vazio.png'),
('shadow_chimera','Quimera Sombria','B','Monstro Quimérico',true,8200,620,280,'Sagrado / Fogo','Sombrio / Veneno','Forma Híbrida: alterna entre ataques físicos brutais e rajadas de veneno arcano a cada 3 turnos.',1600,'Caixa Rank B, Essência Quimérica, Garra das Sombras','🐉','/assets/enemies/quimera-sombria.png'),
('rune_golem','Golem Rúnico Ancestral','A','Tanque',false,12000,420,580,'Arcano','Físico','Runa Ancestral: libera pulso rúnico que reduz a DEF dos caçadores.',2200,'Caixa Rank A, núcleo rúnico, fragmento de pedra mágica','🗿','/assets/enemies/golem-runico-ancestral.png'),
('spider_queen','Rainha Aracnídea Noturna','A','Invocadora',true,14000,580,320,'Fogo','Veneno','Teia da Dominação: invoca aranhas sombrias e aprisiona caçadores.',2800,'Caixa Rank A, seda das trevas, cristal noturno','🕸️','/assets/enemies/rainha-aracnidea-noturna.png'),
('abyssal_guardian','Guardião Abissal','S','Soberano do Abismo',true,28000,920,780,'Sagrado','Sombrio / Maldição','Colapso Abissal: cria zonas de aniquilação que crescem a cada turno.',5500,'Caixa Especial, arma Rank S, essência abissal','🌑','/assets/enemies/guardiao-abissal.png'),
('crimson_monarch','Monarca da Ruína Carmesim','S','Soberano',true,35000,1200,900,'Luz / Sagrado','Sombrio / Fogo / Maldição','Cataclismo Carmesim: abre fendas de ruína que corrompem o campo de batalha. 3 fases.',8000,'Caixa Especial, Lâmina da Ruína Eterna Rank S, Essência Mítica, Núcleo de Ascensão','👁️','/assets/enemies/monarca-da-ruina-carmesim.png')
ON CONFLICT ("key") DO NOTHING;

-- ============================================================
-- CONCLUÍDO! Todas as tabelas e dados foram criados.
-- ============================================================
