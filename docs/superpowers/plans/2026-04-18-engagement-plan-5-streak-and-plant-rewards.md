# Engagement System — Plan 5: Streak Bonus & Plant Rewards

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** (1) Award a random plant from the user's unlocked pool when they add a financial entry. (2) Apply a x1.5 coin multiplier on all daily coin earnings when the user completes all three daily activities (entry, quiz, both daily quests).

**Architecture:** Plant rewards use `shop_items` (rarity-based pool) and `user_inventory` (already in schema). Streak bonus is computed at end-of-day or eagerly when the last daily activity is completed — we use the eager approach (check after each activity if all are done, award bonus once). Both features add new methods to existing services without new controllers.

**Tech Stack:** Spring Boot, JdbcTemplate, Lombok, React Native, TypeScript.

**Prerequisites:** Plans 1–4 must be complete. `shop_items` must have rows with `is_available = true`.

---

### Task 1: Plant reward on financial entry

**Files:**
- Create: `budgetGarden-backend/src/main/java/com/example/bugetGarden/service/PlantRewardService.java`
- Modify: `budgetGarden-backend/src/main/java/com/example/bugetGarden/service/financial/FinancialService.java`
- Modify: `budgetGarden-backend/src/main/java/com/example/bugetGarden/dto/financial/SaveTransactionResponseDto.java` (create if not exists)

- [ ] **Step 1: Create `SaveTransactionResponseDto`**

```java
package com.example.bugetGarden.dto.financial;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SaveTransactionResponseDto {
    private String plantEmoji;    // null if no plant awarded today
    private String plantRarity;   // null if no plant awarded today
    private String plantName;     // null if no plant awarded today
}
```

- [ ] **Step 2: Create `PlantRewardService`**

```java
package com.example.bugetGarden.service;

import com.example.bugetGarden.dto.financial.SaveTransactionResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlantRewardService {

    private final JdbcTemplate jdbcTemplate;

    /** Returns true if the user already received a plant reward today. */
    public boolean hasReceivedPlantToday(UUID userId) {
        // We track this via gold_coin_transactions with reference_type = 'daily_entry_plant'
        // Actually we use user_inventory insert timestamp — simpler: dedicated check
        String sql = """
                SELECT COUNT(*) FROM gold_coin_transactions
                WHERE user_id = ? AND reference_type = 'daily_entry_plant'
                  AND created_at::date = CURRENT_DATE
                """;
        Long count = jdbcTemplate.queryForObject(sql, Long.class, userId);
        return count != null && count > 0;
    }

    /**
     * Awards a random plant from the user's unlocked pool (species in user_inventory with quantity > 0
     * OR any available shop_item if user has no unlocked pool yet — fallback to common).
     * Adds 1 to user_inventory for the chosen plant.
     * Returns the plant details, or null if no plants are available.
     */
    @Transactional
    public SaveTransactionResponseDto awardRandomPlant(UUID userId) {
        if (hasReceivedPlantToday(userId)) {
            return SaveTransactionResponseDto.builder().build();
        }

        // Pick a random plant from user's unlocked pool, weighted by rarity inverse
        // (common 60%, rare 25%, epic 12%, legendary 3%)
        String sql = """
                SELECT si.id, si.name, si.item_type AS emoji, si.rarity
                FROM shop_items si
                WHERE si.is_available = true
                  AND (
                    EXISTS (SELECT 1 FROM user_inventory ui WHERE ui.shop_item_id = si.id AND ui.user_id = ?)
                    OR si.rarity = 'common'
                  )
                ORDER BY random() * CASE si.rarity
                    WHEN 'common'    THEN 1.0
                    WHEN 'rare'      THEN 0.42
                    WHEN 'epic'      THEN 0.20
                    WHEN 'legendary' THEN 0.05
                END DESC
                LIMIT 1
                """;

        var results = jdbcTemplate.query(sql, (rs, rowNum) -> new Object[]{
                UUID.fromString(rs.getString("id")),
                rs.getString("name"),
                rs.getString("emoji"),
                rs.getString("rarity")
        }, userId);

        if (results.isEmpty()) return SaveTransactionResponseDto.builder().build();

        Object[] plant = results.get(0);
        UUID shopItemId = (UUID) plant[0];
        String name = (String) plant[1];
        String emoji = (String) plant[2];
        String rarity = (String) plant[3];

        // Upsert into user_inventory
        String inventorySql = """
                INSERT INTO user_inventory (user_id, shop_item_id, quantity)
                VALUES (?, ?, 1)
                ON CONFLICT (user_id, shop_item_id)
                DO UPDATE SET quantity = user_inventory.quantity + 1
                """;
        jdbcTemplate.update(inventorySql, userId, shopItemId);

        // Record in gold_coin_transactions as 0-coin event for daily tracking
        String logSql = """
                INSERT INTO gold_coin_transactions
                    (user_id, amount, transaction_type, balance_after, reference_type, reference_id)
                SELECT ?, 0, 'bonus', gold_coins, 'daily_entry_plant', ?
                FROM users WHERE id = ?
                """;
        jdbcTemplate.update(logSql, userId, shopItemId, userId);

        return SaveTransactionResponseDto.builder()
                .plantName(name)
                .plantEmoji(emoji)
                .plantRarity(rarity)
                .build();
    }
}
```

- [ ] **Step 3: Update `FinancialService.saveTransaction` to return `SaveTransactionResponseDto`**

In `FinancialService.java`:

```java
// Add field:
private final PlantRewardService plantRewardService;

// Change saveTransaction signature from void to SaveTransactionResponseDto:
public SaveTransactionResponseDto saveTransaction(RequestTransactionDto request) {
    var userId = LoggedInUser.getUserId();
    financialRepository.saveTransaction(request, userId);
    questService.onEntryAdded(userId);
    gardenRepository.touchActivity(userId);
    return plantRewardService.awardRandomPlant(userId);
}
```

- [ ] **Step 4: Update `FinancialController.saveTransaction` return type**

In `FinancialController.java`, change:

```java
@PostMapping
public SaveTransactionResponseDto saveTransaction(@RequestBody RequestTransactionDto request) {
    return financialService.saveTransaction(request);
}
```

- [ ] **Step 5: Compile check**

```bash
cd budgetGarden-backend && ./mvnw compile -q
```

Expected: BUILD SUCCESS.

- [ ] **Step 6: Manual test**

```bash
./mvnw spring-boot:run
```

```bash
curl -X POST -H "Authorization: <TOKEN>" -H "Content-Type: application/json" \
  -d '{"categoryId":"<ID>","amount":50,"entryDate":"2026-04-18","note":"test"}' \
  http://localhost:8080/financial-entries
```

Expected: JSON with `plantName`, `plantEmoji`, `plantRarity` on first call; empty object on second call same day.

- [ ] **Step 7: Update frontend to show plant reward toast**

In the frontend screen where financial entries are added (locate `app/(tabs)/` screen that calls `POST /financial-entries`), update the save handler to show a notification if a plant was awarded:

```typescript
// After the successful API call, check the response:
const response = await api.post<{ plantName?: string; plantEmoji?: string; plantRarity?: string }>(
  '/financial-entries', entryData
);

if (response.plantName) {
  Alert.alert(
    'Plantă nouă! 🌱',
    `Ai primit: ${response.plantEmoji} ${response.plantName} (${response.plantRarity})`
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add src/main/java/com/example/bugetGarden/service/PlantRewardService.java
git add src/main/java/com/example/bugetGarden/dto/financial/SaveTransactionResponseDto.java
git add src/main/java/com/example/bugetGarden/service/financial/FinancialService.java
git add src/main/java/com/example/bugetGarden/controller/FinancialController.java
git commit -m "feat: award random plant on daily financial entry"
```

---

### Task 2: Streak bonus — x1.5 coin multiplier

The streak bonus applies when the user has completed all three daily activities on the same day:
1. Added at least one financial entry
2. Completed the daily quiz
3. Completed both daily quests (or all available daily quests for the day)

The bonus is a one-time award of **additional coins equal to 50% of daily coins earned**, awarded when the last activity is completed. We track this via a `daily_streak_bonus` reference_type in `gold_coin_transactions`.

**Files:**
- Create: `budgetGarden-backend/src/main/java/com/example/bugetGarden/service/StreakBonusService.java`
- Modify: `budgetGarden-backend/src/main/java/com/example/bugetGarden/service/financial/FinancialService.java`
- Modify: `budgetGarden-backend/src/main/java/com/example/bugetGarden/service/QuizService.java`
- Modify: `budgetGarden-backend/src/main/java/com/example/bugetGarden/service/QuestService.java`

- [ ] **Step 1: Create `StreakBonusService`**

```java
package com.example.bugetGarden.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StreakBonusService {

    private final JdbcTemplate jdbcTemplate;

    /** Check if bonus was already awarded today. */
    public boolean bonusAlreadyAwardedToday(UUID userId) {
        String sql = """
                SELECT COUNT(*) FROM gold_coin_transactions
                WHERE user_id = ? AND reference_type = 'daily_streak_bonus'
                  AND created_at::date = CURRENT_DATE
                """;
        Long count = jdbcTemplate.queryForObject(sql, Long.class, userId);
        return count != null && count > 0;
    }

    /** Returns true if user has done all 3 daily activities today. */
    public boolean allDailyActivitiesDone(UUID userId) {
        // 1. Added an entry today
        String entrySql = """
                SELECT COUNT(*) FROM financial_entries
                WHERE user_id = ? AND entry_date = CURRENT_DATE
                """;
        Long entries = jdbcTemplate.queryForObject(entrySql, Long.class, userId);
        if (entries == null || entries == 0) return false;

        // 2. Completed quiz today
        String quizSql = """
                SELECT COUNT(*) FROM user_quiz_sessions
                WHERE user_id = ? AND session_date = CURRENT_DATE AND completed_at IS NOT NULL
                """;
        Long quizzes = jdbcTemplate.queryForObject(quizSql, Long.class, userId);
        if (quizzes == null || quizzes == 0) return false;

        // 3. All daily quests claimed today
        String questSql = """
                SELECT COUNT(*) FROM quests q
                LEFT JOIN user_quest_progress p
                    ON p.quest_id = q.id AND p.user_id = ? AND p.period_start = CURRENT_DATE
                WHERE q.type = 'daily' AND q.is_active = true
                  AND (p.claimed_at IS NULL)
                """;
        Long unclaimed = jdbcTemplate.queryForObject(questSql, Long.class, userId);
        return unclaimed != null && unclaimed == 0;
    }

    /**
     * Awards streak bonus = 50% of today's earned coins (rounded down), min 5 coins.
     * Only called if all daily activities are done and bonus not yet awarded.
     */
    @Transactional
    public int awardStreakBonus(UUID userId) {
        if (bonusAlreadyAwardedToday(userId) || !allDailyActivitiesDone(userId)) return 0;

        // Sum today's earned coins (excluding previous streak bonuses)
        String earnedSql = """
                SELECT COALESCE(SUM(amount), 0) FROM gold_coin_transactions
                WHERE user_id = ? AND transaction_type = 'earned'
                  AND reference_type != 'daily_streak_bonus'
                  AND created_at::date = CURRENT_DATE
                """;
        Integer earned = jdbcTemplate.queryForObject(earnedSql, Integer.class, userId);
        int bonus = Math.max(5, (int) Math.floor((earned != null ? earned : 0) * 0.5));

        String awardSql = """
                WITH updated AS (
                    UPDATE users SET gold_coins = gold_coins + ? WHERE id = ? RETURNING gold_coins
                )
                INSERT INTO gold_coin_transactions (user_id, amount, transaction_type, balance_after, reference_type)
                SELECT ?, ?, 'earned', gold_coins, 'daily_streak_bonus'
                FROM updated
                """;
        jdbcTemplate.update(awardSql, bonus, userId, userId, bonus);
        return bonus;
    }
}
```

- [ ] **Step 2: Call streak check from `FinancialService.saveTransaction`**

In `FinancialService.java`, add the field and call at end of `saveTransaction`:

```java
// Add field:
private final StreakBonusService streakBonusService;

// At end of saveTransaction, after plantRewardService call:
streakBonusService.awardStreakBonus(userId);
```

- [ ] **Step 3: Call streak check from `QuizService.submitQuiz`**

In `QuizService.java`:

```java
// Add field:
private final StreakBonusService streakBonusService;

// At end of submitQuiz, after questService.onQuizCompleted:
streakBonusService.awardStreakBonus(userId);
```

- [ ] **Step 4: Call streak check from `QuestService.claimQuest`**

In `QuestService.java`:

```java
// Add field:
private final StreakBonusService streakBonusService;

// At end of claimQuest, after awardCoins:
streakBonusService.awardStreakBonus(userId);
```

- [ ] **Step 5: Compile check**

```bash
./mvnw compile -q
```

Expected: BUILD SUCCESS. If there is a circular dependency error (unlikely since StreakBonusService only uses JdbcTemplate), annotate one injection with `@Lazy`.

- [ ] **Step 6: Manual test**

Complete all three daily activities for a test user. After the last one, check `gold_coin_transactions`:

```sql
SELECT reference_type, amount, created_at
FROM gold_coin_transactions
WHERE user_id = '<USER_ID>'
  AND created_at::date = CURRENT_DATE
ORDER BY created_at DESC;
```

Expected: a `daily_streak_bonus` row with `amount >= 5`.

- [ ] **Step 7: Commit**

```bash
git add src/main/java/com/example/bugetGarden/service/StreakBonusService.java
git add src/main/java/com/example/bugetGarden/service/financial/FinancialService.java
git add src/main/java/com/example/bugetGarden/service/QuizService.java
git add src/main/java/com/example/bugetGarden/service/QuestService.java
git commit -m "feat: award x1.5 streak bonus when all daily activities completed"
```
