# Engagement System — Plan 4: Plant Health & Inactivity

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Track user activity via `gardens.last_activity_at`, run a daily scheduled job to mark plants as thirsty (3 days inactive) or wilted (7 days inactive), expose a revive endpoint, and show health status visually on the garden screen.

**Architecture:** `FinancialService.saveTransaction` and `QuizService.submitQuiz` both update `gardens.last_activity_at`. A Spring `@Scheduled` job runs nightly at 01:00 and updates `garden_cells.health_status` based on inactivity duration. Frontend reads health status from the existing garden API (extended to include `healthStatus` per cell).

**Tech Stack:** Spring Boot (`@EnableScheduling`), JdbcTemplate, Lombok, React Native, Expo Router, TypeScript.

**Prerequisites:** Plans 1, 2, and 3 must be complete.

---

### Task 1: Enable Spring Scheduling

**Files:**
- Modify: `budgetGarden-backend/src/main/java/com/example/bugetGarden/BugetGardenApplication.java`

- [ ] **Step 1: Add `@EnableScheduling`**

```java
package com.example.bugetGarden;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BugetGardenApplication {
    public static void main(String[] args) {
        SpringApplication.run(BugetGardenApplication.class, args);
    }
}
```

- [ ] **Step 2: Compile check**

```bash
cd budgetGarden-backend && ./mvnw compile -q
```

Expected: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add src/main/java/com/example/bugetGarden/BugetGardenApplication.java
git commit -m "feat: enable Spring scheduling"
```

---

### Task 2: Update `last_activity_at` on user actions

**Files:**
- Create: `budgetGarden-backend/src/main/java/com/example/bugetGarden/repository/garden/GardenRepository.java`
- Modify: `budgetGarden-backend/src/main/java/com/example/bugetGarden/service/financial/FinancialService.java`
- Modify: `budgetGarden-backend/src/main/java/com/example/bugetGarden/service/QuizService.java`

- [ ] **Step 1: Create `GardenRepository`**

```java
package com.example.bugetGarden.repository.garden;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class GardenRepository {

    private final JdbcTemplate jdbcTemplate;

    /** Touch last_activity_at for the user's current-month garden. Creates the garden row if it doesn't exist. */
    public void touchActivity(UUID userId) {
        String sql = """
                INSERT INTO gardens (user_id, month, year, last_activity_at)
                VALUES (?, EXTRACT(MONTH FROM now())::int2, EXTRACT(YEAR FROM now())::int4, now())
                ON CONFLICT (user_id, month, year)
                DO UPDATE SET last_activity_at = now()
                """;
        jdbcTemplate.update(sql, userId);
    }

    /** Update health_status for all garden_cells where the garden's inactivity crossed a threshold. */
    public void updateHealthStatuses() {
        // Mark thirsty: 3+ days inactive and currently healthy
        String thirstySql = """
                UPDATE garden_cells gc
                SET health_status = 'thirsty'
                FROM gardens g
                WHERE gc.garden_id = g.id
                  AND gc.health_status = 'healthy'
                  AND g.last_activity_at < now() - INTERVAL '3 days'
                """;
        jdbcTemplate.update(thirstySql);

        // Mark wilted: 7+ days inactive and currently thirsty
        String wiltedSql = """
                UPDATE garden_cells gc
                SET health_status = 'wilted'
                FROM gardens g
                WHERE gc.garden_id = g.id
                  AND gc.health_status = 'thirsty'
                  AND g.last_activity_at < now() - INTERVAL '7 days'
                """;
        jdbcTemplate.update(wiltedSql);
    }

    /** Revive a specific garden_cell back to healthy, charging coins. */
    public boolean reviveCell(UUID gardenCellId, UUID userId) {
        // Verify ownership first
        String checkSql = """
                SELECT COUNT(*) FROM garden_cells gc
                JOIN gardens g ON gc.garden_id = g.id
                WHERE gc.id = ? AND g.user_id = ? AND gc.health_status = 'wilted'
                """;
        Long owned = jdbcTemplate.queryForObject(checkSql, Long.class, gardenCellId, userId);
        if (owned == null || owned == 0) return false;

        String sql = "UPDATE garden_cells SET health_status = 'healthy' WHERE id = ?";
        jdbcTemplate.update(sql, gardenCellId);
        return true;
    }
}
```

- [ ] **Step 2: Call `touchActivity` from `FinancialService.saveTransaction`**

In `FinancialService.java`, add the field and update `saveTransaction`:

```java
// Add field:
private final GardenRepository gardenRepository;

// Update saveTransaction — add after the existing questService.onEntryAdded line:
gardenRepository.touchActivity(userId);
```

- [ ] **Step 3: Call `touchActivity` from `QuizService.submitQuiz`**

In `QuizService.java`, add the field and update `submitQuiz`:

```java
// Add field:
private final GardenRepository gardenRepository;

// Add at end of submitQuiz, after questService.onQuizCompleted:
gardenRepository.touchActivity(userId);
```

- [ ] **Step 4: Compile check**

```bash
./mvnw compile -q
```

Expected: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/com/example/bugetGarden/repository/garden/GardenRepository.java
git add src/main/java/com/example/bugetGarden/service/financial/FinancialService.java
git add src/main/java/com/example/bugetGarden/service/QuizService.java
git commit -m "feat: touch garden last_activity_at on entry add and quiz submit"
```

---

### Task 3: Scheduled health job

**Files:**
- Create: `budgetGarden-backend/src/main/java/com/example/bugetGarden/scheduler/GardenHealthScheduler.java`

- [ ] **Step 1: Create the scheduler**

```java
package com.example.bugetGarden.scheduler;

import com.example.bugetGarden.repository.garden.GardenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class GardenHealthScheduler {

    private final GardenRepository gardenRepository;

    @Scheduled(cron = "0 0 1 * * *") // 01:00 every day
    public void updatePlantHealth() {
        log.info("Running plant health update job");
        gardenRepository.updateHealthStatuses();
        log.info("Plant health update job complete");
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
git add src/main/java/com/example/bugetGarden/scheduler/GardenHealthScheduler.java
git commit -m "feat: add daily scheduled job to update plant health"
```

---

### Task 4: Revive endpoint

**Files:**
- Create: `budgetGarden-backend/src/main/java/com/example/bugetGarden/dto/garden/ReviveResponseDto.java`
- Create: `budgetGarden-backend/src/main/java/com/example/bugetGarden/service/GardenHealthService.java`
- Create: `budgetGarden-backend/src/main/java/com/example/bugetGarden/controller/GardenController.java`

Revive cost: **20 coins** per wilted plant.

- [ ] **Step 1: Create `ReviveResponseDto`**

```java
package com.example.bugetGarden.dto.garden;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviveResponseDto {
    private int coinsSpent;
    private int remainingCoins;
}
```

- [ ] **Step 2: Create `GardenHealthService`**

```java
package com.example.bugetGarden.service;

import com.example.bugetGarden.dto.garden.ReviveResponseDto;
import com.example.bugetGarden.exception.AppError;
import com.example.bugetGarden.exception.AppException;
import com.example.bugetGarden.repository.garden.GardenRepository;
import com.example.bugetGarden.service.user.LoggedInUser;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GardenHealthService {

    private static final int REVIVE_COST = 20;

    private final GardenRepository gardenRepository;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public ReviveResponseDto revivePlant(UUID gardenCellId) {
        UUID userId = LoggedInUser.getUserId();

        // Check user has enough coins
        String balanceSql = "SELECT gold_coins FROM users WHERE id = ?";
        Integer balance = jdbcTemplate.queryForObject(balanceSql, Integer.class, userId);
        if (balance == null || balance < REVIVE_COST) {
            throw new AppException(AppError.BAD_REQUEST, "Insufficient coins to revive plant");
        }

        boolean revived = gardenRepository.reviveCell(gardenCellId, userId);
        if (!revived) {
            throw new AppException(AppError.NOT_FOUND);
        }

        // Deduct coins
        String deductSql = """
                WITH updated AS (
                    UPDATE users SET gold_coins = gold_coins - ? WHERE id = ? RETURNING gold_coins
                )
                INSERT INTO gold_coin_transactions (user_id, amount, transaction_type, balance_after, reference_type)
                SELECT ?, ?, 'spent', gold_coins, 'revive_plant'
                FROM updated
                """;
        jdbcTemplate.update(deductSql, REVIVE_COST, userId, userId, REVIVE_COST);

        int remaining = balance - REVIVE_COST;
        return ReviveResponseDto.builder()
                .coinsSpent(REVIVE_COST)
                .remainingCoins(remaining)
                .build();
    }
}
```

- [ ] **Step 3: Create `GardenController`**

```java
package com.example.bugetGarden.controller;

import com.example.bugetGarden.dto.garden.ReviveResponseDto;
import com.example.bugetGarden.interceptor.Authenticated;
import com.example.bugetGarden.service.GardenHealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Authenticated
@RestController
@RequestMapping("garden")
@RequiredArgsConstructor
public class GardenController {

    private final GardenHealthService gardenHealthService;

    @PostMapping("/cells/{cellId}/revive")
    public ReviveResponseDto revivePlant(@PathVariable UUID cellId) {
        return gardenHealthService.revivePlant(cellId);
    }
}
```

- [ ] **Step 4: Compile and manual test**

```bash
./mvnw compile -q && ./mvnw spring-boot:run
```

To test manually: manually set a cell to `'wilted'` in Supabase, then call:

```bash
curl -X POST -H "Authorization: <TOKEN>" http://localhost:8080/garden/cells/<CELL_ID>/revive
```

Expected: `{"coinsSpent":20,"remainingCoins":<balance-20>}`.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/com/example/bugetGarden/dto/garden/ReviveResponseDto.java
git add src/main/java/com/example/bugetGarden/service/GardenHealthService.java
git add src/main/java/com/example/bugetGarden/controller/GardenController.java
git commit -m "feat: add revive plant endpoint"
```

---

### Task 5: Extend garden API response with health status

This task assumes there is an existing endpoint that returns garden data with cells. Find the existing garden response DTO and add `healthStatus` to `GardenCellDto` (or equivalent). If no garden API exists yet, create a minimal one.

**Files:**
- Modify: the existing garden cell DTO (locate via `grep -r "garden_cells" src/`)
- Modify: the SQL query that fetches garden cells (add `health_status` column)

- [ ] **Step 1: Find the existing garden cell DTO**

```bash
grep -r "garden_cells\|GardenCell\|gardenCell" src/main/java --include="*.java" -l
```

Open the files found. Locate the DTO class that represents a garden cell.

- [ ] **Step 2: Add `healthStatus` field to the cell DTO**

In the garden cell DTO, add:

```java
private String healthStatus; // "healthy" | "thirsty" | "wilted"
```

- [ ] **Step 3: Add `health_status` to the SQL query**

In the repository that fetches cells, add `gc.health_status` to the SELECT and map it in the row mapper:

```java
.healthStatus(rs.getString("health_status"))
```

- [ ] **Step 4: Compile check**

```bash
./mvnw compile -q
```

Expected: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```bash
git add -p  # stage only the DTO and repository changes
git commit -m "feat: include health_status in garden cell API response"
```

---

### Task 6: Frontend — show health status and revive modal

**Files:**
- Modify: `bugetGarden-front/app/(tabs)/garden.tsx`
- Create: `bugetGarden-front/components/revive-modal.tsx`

- [ ] **Step 1: Add health status types to `lib/types.ts`**

Append to the end of the file:

```typescript
export type PlantHealthStatus = 'healthy' | 'thirsty' | 'wilted';

export interface ReviveResponse {
  coinsSpent: number;
  remainingCoins: number;
}
```

- [ ] **Step 2: Add `reviveCell` to `lib/api` usage**

Create `lib/garden-api.ts`:

```typescript
import { api } from './api';
import type { ReviveResponse } from './types';

export const gardenApi = {
  reviveCell: (cellId: string) =>
    api.post<ReviveResponse>(`/garden/cells/${cellId}/revive`, {}),
};
```

- [ ] **Step 3: Create `components/revive-modal.tsx`**

```typescript
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export function ReviveModal({ visible, onConfirm, onCancel, loading }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.emoji}>🥀</Text>
          <Text style={styles.title}>Plantă ofilită</Text>
          <Text style={styles.body}>Planta ta s-a ofilit din lipsă de activitate. O poți învia cu 20 monede.</Text>
          <TouchableOpacity
            style={[styles.confirmBtn, loading && styles.disabled]}
            onPress={onConfirm}
            disabled={loading}
          >
            <Text style={styles.confirmText}>{loading ? 'Se înviează...' : 'Înviază (20 🪙)'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Anulează</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  modal: { backgroundColor: '#1E1E1E', borderRadius: 20, padding: 24, width: '80%', alignItems: 'center' },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  body: { fontSize: 14, color: '#AAAAAA', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  confirmBtn: { backgroundColor: '#FF6B6B', borderRadius: 12, padding: 14, width: '100%', alignItems: 'center', marginBottom: 8 },
  disabled: { opacity: 0.5 },
  confirmText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  cancelBtn: { padding: 10 },
  cancelText: { color: '#666666', fontSize: 14 },
});
```

- [ ] **Step 4: Add health overlay to garden cells in `garden.tsx`**

Locate where individual garden cells are rendered in `app/(tabs)/garden.tsx`. Add health status overlays and wire up the revive modal.

Find the cell render function (look for the plant emoji or cell TouchableOpacity) and add:

```typescript
// At the top of the file, add imports:
import { ReviveModal } from '../../components/revive-modal';
import { gardenApi } from '../../lib/garden-api';

// Add state for revive modal (inside the component):
const [reviveCellId, setReviveCellId] = useState<string | null>(null);
const [reviving, setReviving] = useState(false);

async function handleRevive() {
  if (!reviveCellId) return;
  setReviving(true);
  try {
    await gardenApi.reviveCell(reviveCellId);
    setReviveCellId(null);
    // Reload garden data
    loadGarden(); // call whatever function loads the garden
  } catch {
    Alert.alert('Eroare', 'Nu s-au putut cheltui monedele');
  } finally {
    setReviving(false);
  }
}

// In the cell render, add health overlay on top of the plant:
// (inside the existing cell TouchableOpacity or View)
{cell.healthStatus === 'thirsty' && (
  <Text style={{ position: 'absolute', top: 0, right: 0, fontSize: 12 }}>💧</Text>
)}
{cell.healthStatus === 'wilted' && (
  <TouchableOpacity
    style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
    onPress={() => setReviveCellId(cell.id)}
  >
    <Text style={{ fontSize: 18 }}>🥀</Text>
  </TouchableOpacity>
)}

// At the bottom of the JSX, before closing tag:
<ReviveModal
  visible={reviveCellId !== null}
  onConfirm={handleRevive}
  onCancel={() => setReviveCellId(null)}
  loading={reviving}
/>
```

- [ ] **Step 5: Test in Expo Go**

```bash
npx expo start
```

To test manually without waiting 3 days: set `last_activity_at = now() - INTERVAL '4 days'` for a garden row in Supabase, then run the scheduler SQL manually:

```sql
UPDATE garden_cells gc
SET health_status = 'thirsty'
FROM gardens g
WHERE gc.garden_id = g.id
  AND gc.health_status = 'healthy'
  AND g.last_activity_at < now() - INTERVAL '3 days';
```

Reload the garden screen. Verify:
- Thirsty plants show 💧 badge
- Wilted plants show 🥀 overlay
- Tapping wilted plant opens revive modal
- Confirming revive costs 20 coins and restores the plant

- [ ] **Step 6: Commit**

```bash
git add app/(tabs)/garden.tsx components/revive-modal.tsx lib/types.ts lib/garden-api.ts
git commit -m "feat: show plant health status and revive modal on garden screen"
```
