# Engagement System — Plan 3: Quest System

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement daily/weekly/monthly quests — backend tracks progress automatically when users add entries or complete quizzes, frontend shows quest cards with progress and a claim button.

**Architecture:** Quest progress is updated by hooking into `FinancialService.saveTransaction` and `QuizService.submitQuiz`. `QuestService` manages progress calculation and coin/plant rewards on claim. Period boundaries: daily = today, weekly = last Monday, monthly = 1st of current month.

**Tech Stack:** Spring Boot, JdbcTemplate, Lombok, React Native, Expo Router, TypeScript.

**Prerequisites:** Plan 1 (DB Migrations) and Plan 2 (Quiz System) must be complete.

---

### Task 1: Quest DTOs

**Files:**
- Create: `moneyGarden-backend/src/main/java/com/example/bugetGarden/dto/quest/QuestDto.java`
- Create: `moneyGarden-backend/src/main/java/com/example/bugetGarden/dto/quest/ClaimQuestResponseDto.java`

- [ ] **Step 1: Create `QuestDto`**

```java
package com.example.bugetGarden.dto.quest;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class QuestDto {
    private UUID id;
    private String type;           // "daily" | "weekly" | "monthly"
    private String title;
    private String description;
    private int requirementValue;
    private int progress;
    private boolean completed;
    private boolean claimed;
    private int rewardCoins;
    private String rewardPlantRarity; // null if no plant reward
}
```

- [ ] **Step 2: Create `ClaimQuestResponseDto`**

```java
package com.example.bugetGarden.dto.quest;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClaimQuestResponseDto {
    private int coinsEarned;
    private String plantRarityUnlocked; // null if no plant reward
}
```

- [ ] **Step 3: Compile check**

```bash
cd moneyGarden-backend && ./mvnw compile -q
```

Expected: BUILD SUCCESS.

- [ ] **Step 4: Commit**

```bash
git add src/main/java/com/example/bugetGarden/dto/quest/
git commit -m "feat: add quest DTOs"
```

---

### Task 2: `QuestRepository`

**Files:**
- Create: `moneyGarden-backend/src/main/java/com/example/bugetGarden/repository/quest/QuestRepository.java`

- [ ] **Step 1: Create the repository**

```java
package com.example.bugetGarden.repository.quest;

import com.example.bugetGarden.dto.quest.QuestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class QuestRepository {

    private final JdbcTemplate jdbcTemplate;

    /** Returns all active quests for the current period with user progress merged in. */
    public List<QuestDto> getQuestsWithProgress(UUID userId, LocalDate today) {
        LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
        LocalDate monthStart = today.withDayOfMonth(1);
        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();

        String sql = """
                SELECT
                    q.id,
                    q.type,
                    q.title,
                    q.description,
                    q.requirement_value,
                    q.reward_coins,
                    q.reward_plant_rarity,
                    COALESCE(p.progress, 0)     AS progress,
                    p.completed_at IS NOT NULL   AS completed,
                    p.claimed_at IS NOT NULL     AS claimed
                FROM quests q
                LEFT JOIN user_quest_progress p
                    ON p.quest_id = q.id
                    AND p.user_id = ?
                    AND p.period_start = CASE q.type
                        WHEN 'daily'   THEN ?
                        WHEN 'weekly'  THEN ?
                        WHEN 'monthly' THEN ?
                    END
                WHERE q.is_active = true
                  AND (
                    q.type IN ('daily', 'weekly')
                    OR (q.type = 'monthly' AND q.active_month = ? AND q.active_year = ?)
                  )
                ORDER BY
                    CASE q.type WHEN 'daily' THEN 1 WHEN 'weekly' THEN 2 ELSE 3 END,
                    q.created_at
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> QuestDto.builder()
                .id(UUID.fromString(rs.getString("id")))
                .type(rs.getString("type"))
                .title(rs.getString("title"))
                .description(rs.getString("description"))
                .requirementValue(rs.getInt("requirement_value"))
                .rewardCoins(rs.getInt("reward_coins"))
                .rewardPlantRarity(rs.getString("reward_plant_rarity"))
                .progress(rs.getInt("progress"))
                .completed(rs.getBoolean("completed"))
                .claimed(rs.getBoolean("claimed"))
                .build(),
                userId, today, weekStart, monthStart, currentMonth, currentYear
        );
    }

    /** Increment progress for all matching quests of a given requirement type for the user today. */
    public void incrementProgress(UUID userId, String requirementType, LocalDate today) {
        LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
        LocalDate monthStart = today.withDayOfMonth(1);
        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();

        String sql = """
                INSERT INTO user_quest_progress (user_id, quest_id, progress, period_start)
                SELECT ?, q.id, 1,
                    CASE q.type
                        WHEN 'daily'   THEN ?
                        WHEN 'weekly'  THEN ?
                        WHEN 'monthly' THEN ?
                    END
                FROM quests q
                WHERE q.is_active = true
                  AND q.requirement_type = ?
                  AND (
                    q.type IN ('daily', 'weekly')
                    OR (q.type = 'monthly' AND q.active_month = ? AND q.active_year = ?)
                  )
                ON CONFLICT (user_id, quest_id, period_start)
                DO UPDATE SET
                    progress = LEAST(
                        user_quest_progress.progress + 1,
                        (SELECT requirement_value FROM quests WHERE id = EXCLUDED.quest_id)
                    ),
                    completed_at = CASE
                        WHEN user_quest_progress.progress + 1 >=
                             (SELECT requirement_value FROM quests WHERE id = EXCLUDED.quest_id)
                             AND user_quest_progress.completed_at IS NULL
                        THEN now()
                        ELSE user_quest_progress.completed_at
                    END
                """;

        jdbcTemplate.update(sql,
                userId, today, weekStart, monthStart,
                requirementType,
                currentMonth, currentYear
        );
    }

    public QuestDto getQuestProgress(UUID userId, UUID questId, LocalDate today) {
        LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
        LocalDate monthStart = today.withDayOfMonth(1);

        String sql = """
                SELECT
                    q.id, q.type, q.title, q.description, q.requirement_value,
                    q.reward_coins, q.reward_plant_rarity,
                    COALESCE(p.progress, 0)    AS progress,
                    p.completed_at IS NOT NULL  AS completed,
                    p.claimed_at IS NOT NULL    AS claimed
                FROM quests q
                LEFT JOIN user_quest_progress p
                    ON p.quest_id = q.id AND p.user_id = ?
                    AND p.period_start = CASE q.type
                        WHEN 'daily'   THEN ?
                        WHEN 'weekly'  THEN ?
                        WHEN 'monthly' THEN ?
                    END
                WHERE q.id = ?
                """;

        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> QuestDto.builder()
                .id(UUID.fromString(rs.getString("id")))
                .type(rs.getString("type"))
                .title(rs.getString("title"))
                .description(rs.getString("description"))
                .requirementValue(rs.getInt("requirement_value"))
                .rewardCoins(rs.getInt("reward_coins"))
                .rewardPlantRarity(rs.getString("reward_plant_rarity"))
                .progress(rs.getInt("progress"))
                .completed(rs.getBoolean("completed"))
                .claimed(rs.getBoolean("claimed"))
                .build(),
                userId, today, weekStart, monthStart, questId
        );
    }

    public void markClaimed(UUID userId, UUID questId, LocalDate today) {
        LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
        LocalDate monthStart = today.withDayOfMonth(1);

        String sql = """
                UPDATE user_quest_progress
                SET claimed_at = now()
                WHERE user_id = ? AND quest_id = ?
                  AND period_start = (
                      SELECT CASE type
                          WHEN 'daily'   THEN ?
                          WHEN 'weekly'  THEN ?
                          WHEN 'monthly' THEN ?
                      END FROM quests WHERE id = ?
                  )
                """;
        jdbcTemplate.update(sql, userId, questId, today, weekStart, monthStart, questId);
    }
}
```

- [ ] **Step 2: Compile check**

```bash
./mvnw compile -q
```

Expected: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add src/main/java/com/example/bugetGarden/repository/quest/QuestRepository.java
git commit -m "feat: add QuestRepository"
```

---

### Task 3: `QuestService`

**Files:**
- Create: `moneyGarden-backend/src/main/java/com/example/bugetGarden/service/QuestService.java`

- [ ] **Step 1: Create the service**

```java
package com.example.bugetGarden.service;

import com.example.bugetGarden.dto.quest.ClaimQuestResponseDto;
import com.example.bugetGarden.dto.quest.QuestDto;
import com.example.bugetGarden.exception.AppError;
import com.example.bugetGarden.exception.AppException;
import com.example.bugetGarden.repository.quest.QuestRepository;
import com.example.bugetGarden.service.user.LoggedInUser;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuestService {

    private final QuestRepository questRepository;
    private final JdbcTemplate jdbcTemplate;

    public List<QuestDto> getQuests() {
        UUID userId = LoggedInUser.getUserId();
        return questRepository.getQuestsWithProgress(userId, LocalDate.now());
    }

    @Transactional
    public ClaimQuestResponseDto claimQuest(UUID questId) {
        UUID userId = LoggedInUser.getUserId();
        LocalDate today = LocalDate.now();

        QuestDto quest = questRepository.getQuestProgress(userId, questId, today);

        if (!quest.isCompleted()) {
            throw new AppException(AppError.BAD_REQUEST, "Quest not completed yet");
        }
        if (quest.isClaimed()) {
            throw new AppException(AppError.BAD_REQUEST, "Quest already claimed");
        }

        questRepository.markClaimed(userId, questId, today);
        awardCoins(userId, quest.getRewardCoins(), "quest");

        return ClaimQuestResponseDto.builder()
                .coinsEarned(quest.getRewardCoins())
                .plantRarityUnlocked(quest.getRewardPlantRarity())
                .build();
    }

    /** Called by FinancialService after saving a transaction. */
    public void onEntryAdded(UUID userId) {
        questRepository.incrementProgress(userId, "add_entry", LocalDate.now());
    }

    /** Called by QuizService after a quiz is submitted. */
    public void onQuizCompleted(UUID userId) {
        questRepository.incrementProgress(userId, "complete_quiz", LocalDate.now());
        // Also increment complete_daily_quests for weekly quest tracking
        questRepository.incrementProgress(userId, "complete_daily_quests", LocalDate.now());
    }

    private void awardCoins(UUID userId, int coins, String referenceType) {
        String sql = """
                WITH updated AS (
                    UPDATE users SET gold_coins = gold_coins + ? WHERE id = ? RETURNING gold_coins
                )
                INSERT INTO gold_coin_transactions (user_id, amount, transaction_type, balance_after, reference_type)
                SELECT ?, ?, 'earned', gold_coins, ?
                FROM updated
                """;
        jdbcTemplate.update(sql, coins, userId, userId, coins, referenceType);
    }
}
```

- [ ] **Step 2: Compile check**

```bash
./mvnw compile -q
```

Expected: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add src/main/java/com/example/bugetGarden/service/QuestService.java
git commit -m "feat: add QuestService"
```

---

### Task 4: Hook QuestService into FinancialService and QuizService

**Files:**
- Modify: `moneyGarden-backend/src/main/java/com/example/bugetGarden/service/financial/FinancialService.java`
- Modify: `moneyGarden-backend/src/main/java/com/example/bugetGarden/service/QuizService.java`

- [ ] **Step 1: Add `QuestService` to `FinancialService`**

In `FinancialService.java`, add the field and update `saveTransaction`:

```java
// Add field (Lombok @RequiredArgsConstructor will inject it):
private final QuestService questService;

// Update saveTransaction method:
public void saveTransaction(RequestTransactionDto request) {
    var userId = LoggedInUser.getUserId();
    financialRepository.saveTransaction(request, userId);
    questService.onEntryAdded(userId);  // <-- add this line
}
```

- [ ] **Step 2: Add `QuestService` call to `QuizService.submitQuiz`**

In `QuizService.java`, add the field and update `submitQuiz`:

```java
// Add field:
private final QuestService questService;

// At the end of submitQuiz, after saveSession:
questService.onQuizCompleted(userId);  // <-- add this line
```

**Note:** This creates a circular dependency if Spring tries to inject both. To avoid this, make `QuestService` not depend on `QuizService` — which is already the case (QuestService has no QuizService field). The injection chain is: `FinancialService → QuestService` and `QuizService → QuestService`. No cycle.

- [ ] **Step 3: Compile check**

```bash
./mvnw compile -q
```

Expected: BUILD SUCCESS.

- [ ] **Step 4: Commit**

```bash
git add src/main/java/com/example/bugetGarden/service/financial/FinancialService.java
git add src/main/java/com/example/bugetGarden/service/QuizService.java
git commit -m "feat: trigger quest progress on entry add and quiz complete"
```

---

### Task 5: `QuestController`

**Files:**
- Create: `moneyGarden-backend/src/main/java/com/example/bugetGarden/controller/QuestController.java`

- [ ] **Step 1: Create the controller**

```java
package com.example.bugetGarden.controller;

import com.example.bugetGarden.dto.quest.ClaimQuestResponseDto;
import com.example.bugetGarden.dto.quest.QuestDto;
import com.example.bugetGarden.interceptor.Authenticated;
import com.example.bugetGarden.service.QuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Authenticated
@RestController
@RequestMapping("quests")
@RequiredArgsConstructor
public class QuestController {

    private final QuestService questService;

    @GetMapping
    public List<QuestDto> getQuests() {
        return questService.getQuests();
    }

    @PostMapping("/{questId}/claim")
    public ClaimQuestResponseDto claimQuest(@PathVariable UUID questId) {
        return questService.claimQuest(questId);
    }
}
```

- [ ] **Step 2: Compile and manual test**

```bash
./mvnw compile -q && ./mvnw spring-boot:run
```

```bash
curl -H "Authorization: <TOKEN>" http://localhost:8080/quests
```

Expected: JSON array with daily + weekly + monthly quests, progress = 0.

- [ ] **Step 3: Commit**

```bash
git add src/main/java/com/example/bugetGarden/controller/QuestController.java
git commit -m "feat: add QuestController — GET /quests, POST /quests/{id}/claim"
```

---

### Task 6: Frontend quest types + API helper

**Files:**
- Modify: `bugetGarden-front/lib/types.ts`
- Create: `bugetGarden-front/lib/quest-api.ts`

- [ ] **Step 1: Add quest types to `lib/types.ts`**

Append to the end of the file:

```typescript
export interface QuestDto {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  title: string;
  description: string;
  requirementValue: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  rewardCoins: number;
  rewardPlantRarity: string | null;
}

export interface ClaimQuestResponse {
  coinsEarned: number;
  plantRarityUnlocked: string | null;
}
```

- [ ] **Step 2: Create `lib/quest-api.ts`**

```typescript
import { api } from './api';
import type { QuestDto, ClaimQuestResponse } from './types';

export const questApi = {
  getQuests: () => api.get<QuestDto[]>('/quests'),
  claimQuest: (questId: string) =>
    api.post<ClaimQuestResponse>(`/quests/${questId}/claim`, {}),
};
```

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts lib/quest-api.ts
git commit -m "feat: add quest types and API helper"
```

---

### Task 7: Quests screen

**Files:**
- Create: `bugetGarden-front/app/(tabs)/quests.tsx`

- [ ] **Step 1: Create the quests screen**

```typescript
import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { questApi } from '../../lib/quest-api';
import type { QuestDto } from '../../lib/types';

const TYPE_LABELS: Record<string, string> = {
  daily: 'Zilnic',
  weekly: 'Săptămânal',
  monthly: 'Lunar',
};

const RARITY_COLORS: Record<string, string> = {
  rare: '#4FC3F7',
  epic: '#CE93D8',
  legendary: '#FFD54F',
};

export default function QuestsScreen() {
  const [quests, setQuests] = useState<QuestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await questApi.getQuests();
      setQuests(data);
    } catch {
      Alert.alert('Eroare', 'Nu s-au putut încărca quest-urile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handleClaim(quest: QuestDto) {
    setClaiming(quest.id);
    try {
      const res = await questApi.claimQuest(quest.id);
      const plantMsg = res.plantRarityUnlocked
        ? `\nAi primit o plantă ${res.plantRarityUnlocked}! 🌿`
        : '';
      Alert.alert('Recompensă primită!', `+${res.coinsEarned} monede${plantMsg}`);
      load();
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut revendica recompensa');
    } finally {
      setClaiming(null);
    }
  }

  if (loading) return <ActivityIndicator style={styles.center} color="#4CAF50" />;

  const groups = ['daily', 'weekly', 'monthly'] as const;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#4CAF50" />}
    >
      <Text style={styles.header}>Quest-uri</Text>
      {groups.map(group => {
        const groupQuests = quests.filter(q => q.type === group);
        if (groupQuests.length === 0) return null;
        return (
          <View key={group}>
            <Text style={styles.groupLabel}>{TYPE_LABELS[group]}</Text>
            {groupQuests.map(quest => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onClaim={handleClaim}
                claiming={claiming === quest.id}
              />
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

function QuestCard({
  quest,
  onClaim,
  claiming,
}: {
  quest: QuestDto;
  onClaim: (q: QuestDto) => void;
  claiming: boolean;
}) {
  const progress = Math.min(quest.progress, quest.requirementValue);
  const pct = quest.requirementValue > 0 ? progress / quest.requirementValue : 0;

  return (
    <View style={[styles.card, quest.claimed && styles.cardClaimed]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{quest.title}</Text>
        {quest.rewardPlantRarity && (
          <Text style={[styles.rarityBadge, { color: RARITY_COLORS[quest.rewardPlantRarity] ?? '#AAAAAA' }]}>
            {quest.rewardPlantRarity}
          </Text>
        )}
      </View>
      <Text style={styles.cardDesc}>{quest.description}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${pct * 100}%` as any }]} />
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.progressText}>{progress}/{quest.requirementValue}</Text>
        <Text style={styles.coinsText}>+{quest.rewardCoins} 🪙</Text>
      </View>
      {quest.completed && !quest.claimed && (
        <TouchableOpacity
          style={[styles.claimBtn, claiming && styles.claimBtnDisabled]}
          onPress={() => onClaim(quest)}
          disabled={claiming}
        >
          <Text style={styles.claimBtnText}>{claiming ? 'Se revendică...' : 'Revendică recompensa'}</Text>
        </TouchableOpacity>
      )}
      {quest.claimed && (
        <Text style={styles.claimedText}>✅ Revendicat</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 20 },
  groupLabel: { fontSize: 13, fontWeight: '600', color: '#666666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 8 },
  card: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardClaimed: { opacity: 0.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', flex: 1 },
  rarityBadge: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginLeft: 8 },
  cardDesc: { fontSize: 13, color: '#AAAAAA', marginBottom: 12 },
  progressBar: { height: 6, backgroundColor: '#333333', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 3 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { fontSize: 12, color: '#AAAAAA' },
  coinsText: { fontSize: 12, color: '#4CAF50', fontWeight: '700' },
  claimBtn: { marginTop: 12, backgroundColor: '#FF6B6B', borderRadius: 10, padding: 10, alignItems: 'center' },
  claimBtnDisabled: { opacity: 0.5 },
  claimBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  claimedText: { marginTop: 10, color: '#4CAF50', fontSize: 13, textAlign: 'center' },
});
```

- [ ] **Step 2: Add quests route to tab layout**

Open `app/(tabs)/_layout.tsx`. Add the quests tab entry:

```typescript
<Tabs.Screen
  name="quests"
  options={{ title: 'Quest-uri', tabBarButton: () => null }}
/>
```

- [ ] **Step 3: Test in Expo Go**

```bash
npx expo start
```

Navigate to the quests screen. Verify:
- Quests load grouped by daily/weekly/monthly
- Progress bar reflects 0/N on first open
- After adding a financial entry, progress increments on refresh
- Completing a quest shows the claim button
- Claiming awards coins and shows the confirmation alert

- [ ] **Step 4: Commit**

```bash
git add app/(tabs)/quests.tsx app/(tabs)/_layout.tsx lib/types.ts lib/quest-api.ts
git commit -m "feat: add quests screen with progress and claim"
```
