# Engagement System — Plan 1: DB Migrations

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add all tables and columns required by the quiz, quest, and plant health systems.

**Architecture:** No migration framework is configured — all SQL runs directly in the Supabase SQL editor (or via psql). Each task is one `CREATE TABLE` or `ALTER TABLE` statement. Run them in order; later tasks reference columns created by earlier ones.

**Tech Stack:** PostgreSQL (Supabase), raw SQL.

---

### Task 1: Create `quiz_questions` table

**Files:**
- Create: `docs/sql/migrations/001_quiz_questions.sql`

- [ ] **Step 1: Write the SQL file**

```sql
CREATE TYPE quiz_difficulty AS ENUM ('easy', 'medium', 'hard');

CREATE TABLE quiz_questions (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question    text NOT NULL,
    options     jsonb NOT NULL,       -- array of 4 strings
    correct_index int2 NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
    category    varchar(50) NOT NULL, -- 'budgeting' | 'saving' | 'investing' | 'general'
    difficulty  quiz_difficulty NOT NULL DEFAULT 'medium',
    created_at  timestamptz NOT NULL DEFAULT now()
);
```

- [ ] **Step 2: Run in Supabase SQL editor**

Paste the SQL and execute. Expected: `CREATE TABLE` success message.

- [ ] **Step 3: Verify**

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'quiz_questions' ORDER BY ordinal_position;
```

Expected: 7 rows (id, question, options, correct_index, category, difficulty, created_at).

- [ ] **Step 4: Seed with 10 sample questions**

```sql
INSERT INTO quiz_questions (question, options, correct_index, category, difficulty) VALUES
('Ce reprezintă regula bugetară 50/30/20?',
 '["50% nevoi, 30% dorințe, 20% economii","50% economii, 30% nevoi, 20% dorințe","50% dorințe, 30% economii, 20% nevoi","50% nevoi, 20% dorințe, 30% economii"]',
 0, 'budgeting', 'easy'),

('Ce este dobânda compusă?',
 '["Dobândă calculată doar pe suma inițială","Dobândă calculată pe sumă + dobânzile acumulate","Un tip de credit bancar","O taxă de administrare"]',
 1, 'saving', 'medium'),

('Care este scopul unui fond de urgență?',
 '["Investiții pe termen lung","Acoperirea cheltuielilor pe 3-6 luni în caz de criză","Plata vacanțelor","Cumpărarea de bunuri de lux"]',
 1, 'budgeting', 'easy'),

('Ce înseamnă inflația?',
 '["Creșterea valorii banilor în timp","Scăderea puterii de cumpărare a banilor","Un tip de investiție","O formă de economisire"]',
 1, 'general', 'easy'),

('Care dintre urmăoarele este o cheltuială variabilă?',
 '["Chiria lunară","Rata la credit","Abonamentul la sală","Factura de internet"]',
 2, 'budgeting', 'medium'),

('Ce este un ETF?',
 '["Un tip de cont bancar","Un fond tranzacționat la bursă care urmărește un indice","O asigurare de viață","Un credit ipotecar"]',
 1, 'investing', 'hard'),

('Cât de des ar trebui să îți revizuiești bugetul?',
 '["O dată pe an","O dată la 5 ani","Lunar","Niciodată dacă merge bine"]',
 2, 'budgeting', 'easy'),

('Ce este diversificarea unui portofoliu?',
 '["A pune toți banii într-un singur activ","A distribui investițiile între mai multe tipuri de active","A retrage banii din bancă","A cumpăra doar aur"]',
 1, 'investing', 'medium'),

('Care este diferența dintre un activ și un pasiv?',
 '["Activul îți aduce bani, pasivul îți ia bani","Activul îți ia bani, pasivul îți aduce bani","Sunt același lucru","Activul e imobil, pasivul e mobil"]',
 0, 'general', 'medium'),

('Cât din venitul lunar este recomandat să economisești minim?',
 '["1-5%","5-10%","10-20%","50%"]',
 2, 'saving', 'easy');
```

- [ ] **Step 5: Commit the SQL file**

```bash
git add docs/sql/migrations/001_quiz_questions.sql
git commit -m "feat: add quiz_questions table migration"
```

---

### Task 2: Create `user_quiz_sessions` table

**Files:**
- Create: `docs/sql/migrations/002_user_quiz_sessions.sql`

- [ ] **Step 1: Write the SQL file**

```sql
CREATE TABLE user_quiz_sessions (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_date     date NOT NULL DEFAULT CURRENT_DATE,
    questions_answered int2 NOT NULL DEFAULT 0,
    correct_answers  int2 NOT NULL DEFAULT 0,
    coins_earned     int4 NOT NULL DEFAULT 0,
    completed_at     timestamptz,
    UNIQUE (user_id, session_date)
);

CREATE INDEX idx_user_quiz_sessions_user_date ON user_quiz_sessions (user_id, session_date DESC);
```

- [ ] **Step 2: Run in Supabase SQL editor**

Expected: `CREATE TABLE` + `CREATE INDEX` success.

- [ ] **Step 3: Verify**

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_quiz_sessions' ORDER BY ordinal_position;
```

Expected: 8 rows.

- [ ] **Step 4: Commit**

```bash
git add docs/sql/migrations/002_user_quiz_sessions.sql
git commit -m "feat: add user_quiz_sessions table migration"
```

---

### Task 3: Create `quests` table

**Files:**
- Create: `docs/sql/migrations/003_quests.sql`

- [ ] **Step 1: Write the SQL file**

```sql
CREATE TYPE quest_type AS ENUM ('daily', 'weekly', 'monthly');
CREATE TYPE quest_requirement_type AS ENUM ('add_entry', 'complete_quiz', 'complete_quest', 'complete_daily_quests');

CREATE TABLE quests (
    id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type                 quest_type NOT NULL,
    title                varchar(150) NOT NULL,
    description          text NOT NULL,
    requirement_type     quest_requirement_type NOT NULL,
    requirement_value    int4 NOT NULL DEFAULT 1,
    reward_coins         int4 NOT NULL DEFAULT 0,
    reward_plant_rarity  varchar(20),  -- NULL = no plant reward, else 'rare' | 'epic' | 'legendary'
    active_month         int2,         -- NULL = always active (daily/weekly), set for monthly
    active_year          int4,
    is_active            bool NOT NULL DEFAULT true,
    created_at           timestamptz NOT NULL DEFAULT now()
);
```

- [ ] **Step 2: Run in Supabase SQL editor**

Expected: `CREATE TABLE` success.

- [ ] **Step 3: Seed with initial quests**

```sql
-- Daily quests
INSERT INTO quests (type, title, description, requirement_type, requirement_value, reward_coins) VALUES
('daily', 'Înregistrează o cheltuială', 'Adaugă cel puțin o cheltuială sau un venit astăzi', 'add_entry', 1, 10),
('daily', 'Quiz zilnic', 'Completează quiz-ul financiar de azi', 'complete_quiz', 1, 5);

-- Weekly quests
INSERT INTO quests (type, title, description, requirement_type, requirement_value, reward_coins, reward_plant_rarity) VALUES
('weekly', 'Săptămână activă', 'Adaugă intrări în 5 zile diferite această săptămână', 'add_entry', 5, 40, 'rare'),
('weekly', 'Maestrul quiz-ului', 'Completează 5 quiz-uri această săptămână', 'complete_quiz', 5, 40, 'rare'),
('weekly', 'Quest hunter', 'Completează 5 quest-uri zilnice această săptămână', 'complete_daily_quests', 5, 30, null);

-- Monthly quest (April 2026 — Type A)
INSERT INTO quests (type, title, description, requirement_type, requirement_value, reward_coins, reward_plant_rarity, active_month, active_year) VALUES
('monthly', 'Luna quiz-urilor', 'Completează 20 de quiz-uri în luna aprilie', 'complete_quiz', 20, 100, 'legendary', 4, 2026);
```

- [ ] **Step 4: Commit**

```bash
git add docs/sql/migrations/003_quests.sql
git commit -m "feat: add quests table migration with initial quest data"
```

---

### Task 4: Create `user_quest_progress` table

**Files:**
- Create: `docs/sql/migrations/004_user_quest_progress.sql`

- [ ] **Step 1: Write the SQL file**

```sql
CREATE TABLE user_quest_progress (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_id     uuid NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    progress     int4 NOT NULL DEFAULT 0,
    period_start date NOT NULL,   -- monday for weekly, 1st for monthly, today for daily
    completed_at timestamptz,
    claimed_at   timestamptz,
    UNIQUE (user_id, quest_id, period_start)
);

CREATE INDEX idx_user_quest_progress_user ON user_quest_progress (user_id, period_start DESC);
```

- [ ] **Step 2: Run in Supabase SQL editor**

Expected: `CREATE TABLE` + `CREATE INDEX` success.

- [ ] **Step 3: Verify**

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_quest_progress' ORDER BY ordinal_position;
```

Expected: 8 rows.

- [ ] **Step 4: Commit**

```bash
git add docs/sql/migrations/004_user_quest_progress.sql
git commit -m "feat: add user_quest_progress table migration"
```

---

### Task 5: Alter `gardens` table — add `last_activity_at`

**Files:**
- Create: `docs/sql/migrations/005_gardens_last_activity.sql`

- [ ] **Step 1: Write the SQL file**

```sql
ALTER TABLE gardens
ADD COLUMN last_activity_at timestamptz NOT NULL DEFAULT now();
```

- [ ] **Step 2: Run in Supabase SQL editor**

Expected: `ALTER TABLE` success.

- [ ] **Step 3: Verify**

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'gardens' AND column_name = 'last_activity_at';
```

Expected: 1 row.

- [ ] **Step 4: Commit**

```bash
git add docs/sql/migrations/005_gardens_last_activity.sql
git commit -m "feat: add last_activity_at to gardens table"
```

---

### Task 6: Alter `garden_cells` table — add `health_status`

**Files:**
- Create: `docs/sql/migrations/006_garden_cells_health.sql`

- [ ] **Step 1: Write the SQL file**

```sql
CREATE TYPE plant_health_status AS ENUM ('healthy', 'thirsty', 'wilted');

ALTER TABLE garden_cells
ADD COLUMN health_status plant_health_status NOT NULL DEFAULT 'healthy';
```

- [ ] **Step 2: Run in Supabase SQL editor**

Expected: `CREATE TYPE` + `ALTER TABLE` success.

- [ ] **Step 3: Verify**

```sql
SELECT column_name, udt_name FROM information_schema.columns
WHERE table_name = 'garden_cells' AND column_name = 'health_status';
```

Expected: 1 row with `udt_name = plant_health_status`.

- [ ] **Step 4: Commit**

```bash
git add docs/sql/migrations/006_garden_cells_health.sql
git commit -m "feat: add health_status to garden_cells table"
```
