# Tasks & Achievements — Design Spec
**Date:** 2026-04-26

## Overview

Sistem de gamification cu task-uri zilnice/lunare și achievements permanente. Motivează userii să folosească aplicația zilnic prin recompense (coins, scor, flori).

---

## 1. Comportament

### Tasks
- Pool de task-uri predefinite în sistem (`task_definitions`)
- Fiecare user primește **3 task-uri zilnice** random din pool în fiecare zi
- Fiecare user primește **3 task-uri lunare** random din pool în fiecare lună
- Reset la **miezul nopții ora serverului** — task-urile necompletate se pierd
- Verificare **event-driven** — backend detectează automat când un task e completat

### Achievements
- Milestone-uri predefinite, permanente (nu se resetează)
- Anti-gaming: `current_count` se incrementează la creare și **decrementează la ștergere** (nu scade sub 0)
- Se deblochează automat când `current_count >= target_count`

### Recompense
| Eveniment | Recompensă |
|---|---|
| Task completat | coins + scor |
| Toate task-urile zilnice completate | floare random din `user_inventory` |
| Toate task-urile lunare completate | bonus coins + deblochează o floare nouă în `user_inventory` |
| Achievement deblocat (`easy`/`medium`) | coins + notificare |
| Achievement deblocat (`hard`) | coins + notificare + floare random din `user_inventory` |

---

## 2. DB Schema

### `task_definitions`
```sql
id              uuid PRIMARY KEY
title           varchar(100)
type            varchar(10)   -- 'daily' | 'monthly'
action_type     varchar(50)   -- 'transaction_created' | 'category_created' | 'goal_deposit' | ...
target_count    int
coin_reward     int
score_reward    int
is_active       bool DEFAULT true
```

### `achievement_definitions`
```sql
id              uuid PRIMARY KEY
title           varchar(100)
action_type     varchar(50)
target_count    int
coin_reward     int
difficulty      varchar(10)   -- 'easy' | 'medium' | 'hard'
is_active       bool DEFAULT true
```

### `user_tasks`
```sql
id                    uuid PRIMARY KEY
user_id               uuid REFERENCES users(id)
task_definition_id    uuid REFERENCES task_definitions(id)
assigned_date         date   -- daily: ziua; monthly: prima zi a lunii
current_count         int DEFAULT 0
completed_at          timestamptz NULL
notified_at           timestamptz NULL
UNIQUE (user_id, task_definition_id, assigned_date)
```

### `user_achievements`
```sql
id                          uuid PRIMARY KEY
user_id                     uuid REFERENCES users(id)
achievement_definition_id   uuid REFERENCES achievement_definitions(id)
current_count               int DEFAULT 0
unlocked_at                 timestamptz NULL
notified_at                 timestamptz NULL
UNIQUE (user_id, achievement_definition_id)
```

---

## 3. Backend Architecture

### Spring Application Events

Serviciile existente publică events după fiecare mutație:

| Acțiune | Event |
|---|---|
| Adaugă tranzacție | `TransactionCreatedEvent(userId)` |
| Șterge tranzacție | `TransactionDeletedEvent(userId)` |
| Creează categorie | `CategoryCreatedEvent(userId)` |
| Șterge categorie | `CategoryDeletedEvent(userId)` |
| Deposit la saving goal | `GoalDepositEvent(userId)` |

### Clase noi

**`TaskAssignmentScheduler`**
- `@Scheduled(cron = "0 0 0 * * *")` — rulează la miezul nopții
- Selectează random 3 task-uri zilnice per user activ → inserează în `user_tasks`
- La 1 ale lunii: selectează random task-urile lunare per user activ

**`TaskProgressService`**
- `@EventListener` pe fiecare event de creare
- Caută `user_tasks` active cu `action_type` corespunzător
- Incrementează `current_count`; dacă `>= target_count` → setează `completed_at`
- Verifică dacă toate task-urile zilei/lunii sunt complete → acordă bonus

**`AchievementService`**
- `@EventListener` pe events de creare și ștergere
- Incrementează/decrementează `current_count` în `user_achievements`
- La deblocare: acordă coins, setează `unlocked_at`, marchează pentru notificare

---

## 4. API Endpoints

### Tasks
| Method | Endpoint | Descriere |
|---|---|---|
| `GET` | `/tasks/today` | Task-urile zilnice asignate azi + progres |
| `GET` | `/tasks/month` | Task-urile lunare ale lunii curente + progres |
| `GET` | `/tasks/progress` | Progres curent + `newlyCompleted` (atomic clear) |

**Response `/tasks/today`:**
```json
{
  "tasks": [
    {
      "id": "...",
      "title": "Adaugă 3 tranzacții",
      "currentCount": 1,
      "targetCount": 3,
      "completed": false,
      "coinReward": 30,
      "scoreReward": 10
    }
  ],
  "allCompleted": false,
  "bonusFlower": null
}
```

**Response `/tasks/progress`:**
```json
{
  "tasks": [ ... ],
  "newlyCompleted": [
    { "taskId": "...", "title": "...", "coinReward": 30, "scoreReward": 10 }
  ]
}
```
`newlyCompleted` e gol la request-urile ulterioare (backend setează `notified_at = now()` în același request, atomic).

### Achievements
| Method | Endpoint | Descriere |
|---|---|---|
| `GET` | `/achievements` | Toate achievements cu progres curent |

**Response:**
```json
{
  "achievements": [
    {
      "id": "...",
      "title": "10 tranzacții adăugate",
      "currentCount": 5,
      "targetCount": 10,
      "unlocked": false,
      "difficulty": "medium",
      "coinReward": 100
    }
  ]
}
```

---

## 5. Frontend

### Ecrane noi
- `app/(tabs)/tasks.tsx` — două tab-uri: **Zilnice** / **Lunare**
  - Fiecare task: titlu, bară de progres (`current/target`), recompensă, bifă la completare
  - Footer: progres spre bonusul global ("2/3 task-uri completate → floare bonus")
- `app/(tabs)/achievements.tsx` — achievements grupate pe difficulty
  - Deblocate sus cu animație; nedeblocate gri cu progres vizibil

### Logica update UI
1. User face o acțiune → serviciul frontend apelează endpoint-ul existent
2. La succes → automat `GET /tasks/progress`
3. Dacă `newlyCompleted` nu e gol → animație/toast cu recompensa
4. Bara de progres din `tasks.tsx` se actualizează

---

## 6. Flower System

- **Daily bonus**: se alege random o floare din `user_inventory` (florile deja debloctate/cumpărate de user)
- **Monthly bonus**: se deblochează o floare nouă → se adaugă în `user_inventory` → intră automat în pool-ul pentru bonusurile zilnice viitoare
- Florile se cumpără cu coins din shop (`shop_items` + `user_inventory` existente)
