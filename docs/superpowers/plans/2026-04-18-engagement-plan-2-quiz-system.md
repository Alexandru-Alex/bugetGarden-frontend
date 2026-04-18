# Engagement System — Plan 2: Quiz System

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a daily financial quiz — backend API (random questions, session submit, coins award) and frontend quiz screen.

**Architecture:** Backend follows the existing Controller → Service → Repository pattern with JdbcTemplate raw SQL. Frontend uses `api.get/post` from `lib/api.ts`. One quiz session per user per day (enforced by UNIQUE constraint). Coins are written to `gold_coin_transactions` and `users.gold_coins` on completion.

**Tech Stack:** Spring Boot, JdbcTemplate, Lombok, React Native, Expo Router, TypeScript.

**Prerequisite:** Plan 1 (DB Migrations) must be complete — `quiz_questions` and `user_quiz_sessions` tables must exist.

---

### Task 1: Quiz DTOs

**Files:**
- Create: `budgetGarden-backend/src/main/java/com/example/bugetGarden/dto/quiz/QuizQuestionDto.java`
- Create: `budgetGarden-backend/src/main/java/com/example/bugetGarden/dto/quiz/QuizSessionResponseDto.java`
- Create: `budgetGarden-backend/src/main/java/com/example/bugetGarden/dto/quiz/SubmitQuizRequest.java`
- Create: `budgetGarden-backend/src/main/java/com/example/bugetGarden/dto/quiz/SubmitQuizResponseDto.java`

- [ ] **Step 1: Create `QuizQuestionDto`**

```java
package com.example.bugetGarden.dto.quiz;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class QuizQuestionDto {
    private UUID id;
    private String question;
    private List<String> options;
    private String category;
    private String difficulty;
}
```

- [ ] **Step 2: Create `QuizSessionResponseDto`**

```java
package com.example.bugetGarden.dto.quiz;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class QuizSessionResponseDto {
    private boolean alreadyCompleted;
    private List<QuizQuestionDto> questions; // empty if alreadyCompleted
    private Integer coinsEarned;             // null if not yet completed
}
```

- [ ] **Step 3: Create `SubmitQuizRequest`**

```java
package com.example.bugetGarden.dto.quiz;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class SubmitQuizRequest {
    // questionId -> chosen option index (0-3)
    private Map<UUID, Integer> answers;
}
```

- [ ] **Step 4: Create `SubmitQuizResponseDto`**

```java
package com.example.bugetGarden.dto.quiz;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubmitQuizResponseDto {
    private int correctAnswers;
    private int totalQuestions;
    private int coinsEarned;
}
```

- [ ] **Step 5: Compile check**

```bash
cd budgetGarden-backend && ./mvnw compile -q
```

Expected: BUILD SUCCESS, no errors.

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/example/bugetGarden/dto/quiz/
git commit -m "feat: add quiz DTOs"
```

---

### Task 2: `QuizRepository`

**Files:**
- Create: `budgetGarden-backend/src/main/java/com/example/bugetGarden/repository/quiz/QuizRepository.java`

- [ ] **Step 1: Create the repository**

```java
package com.example.bugetGarden.repository.quiz;

import com.example.bugetGarden.dto.quiz.QuizQuestionDto;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class QuizRepository {

    private final JdbcTemplate jdbcTemplate;

    public List<QuizQuestionDto> getRandomQuestions(int count) {
        String sql = """
                SELECT id, question, options, category, difficulty
                FROM quiz_questions
                ORDER BY random()
                LIMIT ?
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            // options is stored as a JSON array string; parse into List<String>
            String optionsJson = rs.getString("options");
            List<String> options = parseJsonArray(optionsJson);
            return QuizQuestionDto.builder()
                    .id(UUID.fromString(rs.getString("id")))
                    .question(rs.getString("question"))
                    .options(options)
                    .category(rs.getString("category"))
                    .difficulty(rs.getString("difficulty"))
                    .build();
        }, count);
    }

    public boolean hasCompletedToday(UUID userId) {
        String sql = """
                SELECT COUNT(*) FROM user_quiz_sessions
                WHERE user_id = ? AND session_date = CURRENT_DATE AND completed_at IS NOT NULL
                """;
        Long count = jdbcTemplate.queryForObject(sql, Long.class, userId);
        return count != null && count > 0;
    }

    public int getCorrectAnswerIndex(UUID questionId) {
        String sql = "SELECT correct_index FROM quiz_questions WHERE id = ?";
        Integer idx = jdbcTemplate.queryForObject(sql, Integer.class, questionId);
        return idx != null ? idx : -1;
    }

    public void saveSession(UUID userId, int questionsAnswered, int correctAnswers, int coinsEarned) {
        String sql = """
                INSERT INTO user_quiz_sessions
                    (user_id, session_date, questions_answered, correct_answers, coins_earned, completed_at)
                VALUES (?, CURRENT_DATE, ?, ?, ?, now())
                ON CONFLICT (user_id, session_date)
                DO UPDATE SET
                    questions_answered = EXCLUDED.questions_answered,
                    correct_answers    = EXCLUDED.correct_answers,
                    coins_earned       = EXCLUDED.coins_earned,
                    completed_at       = EXCLUDED.completed_at
                """;
        jdbcTemplate.update(sql, userId, questionsAnswered, correctAnswers, coinsEarned);
    }

    @SuppressWarnings("unchecked")
    private List<String> parseJsonArray(String json) {
        // Simple parse for ["a","b","c","d"] without extra dependencies
        String stripped = json.trim().replaceAll("^\\[|]$", "");
        String[] parts = stripped.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
        return java.util.Arrays.stream(parts)
                .map(s -> s.trim().replaceAll("^\"|\"$", ""))
                .toList();
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
git add src/main/java/com/example/bugetGarden/repository/quiz/QuizRepository.java
git commit -m "feat: add QuizRepository"
```

---

### Task 3: `QuizService`

**Files:**
- Create: `budgetGarden-backend/src/main/java/com/example/bugetGarden/service/QuizService.java`

Coin formula: `floor(15 + (correctAnswers / totalQuestions) * 15)` → min 15, max 30 coins.

- [ ] **Step 1: Create the service**

```java
package com.example.bugetGarden.service;

import com.example.bugetGarden.dto.quiz.*;
import com.example.bugetGarden.exception.AppError;
import com.example.bugetGarden.exception.AppException;
import com.example.bugetGarden.repository.quiz.QuizRepository;
import com.example.bugetGarden.service.user.LoggedInUser;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuizService {

    private static final int QUESTIONS_PER_SESSION = 5;
    private static final int MIN_COINS = 15;
    private static final int MAX_COINS = 30;

    private final QuizRepository quizRepository;
    private final JdbcTemplate jdbcTemplate;

    public QuizSessionResponseDto getDailyQuiz() {
        UUID userId = LoggedInUser.getUserId();

        if (quizRepository.hasCompletedToday(userId)) {
            return QuizSessionResponseDto.builder()
                    .alreadyCompleted(true)
                    .questions(List.of())
                    .build();
        }

        List<QuizQuestionDto> questions = quizRepository.getRandomQuestions(QUESTIONS_PER_SESSION);
        return QuizSessionResponseDto.builder()
                .alreadyCompleted(false)
                .questions(questions)
                .build();
    }

    @Transactional
    public SubmitQuizResponseDto submitQuiz(SubmitQuizRequest request) {
        UUID userId = LoggedInUser.getUserId();

        if (quizRepository.hasCompletedToday(userId)) {
            throw new AppException(AppError.BAD_REQUEST, "Quiz already completed today");
        }

        Map<UUID, Integer> answers = request.getAnswers();
        int correct = 0;
        for (Map.Entry<UUID, Integer> entry : answers.entrySet()) {
            int correctIndex = quizRepository.getCorrectAnswerIndex(entry.getKey());
            if (correctIndex == entry.getValue()) correct++;
        }

        int total = answers.size();
        int coins = calculateCoins(correct, total);

        quizRepository.saveSession(userId, total, correct, coins);
        awardCoins(userId, coins, "quiz");

        return SubmitQuizResponseDto.builder()
                .correctAnswers(correct)
                .totalQuestions(total)
                .coinsEarned(coins)
                .build();
    }

    private int calculateCoins(int correct, int total) {
        if (total == 0) return MIN_COINS;
        return MIN_COINS + (int) Math.floor(((double) correct / total) * (MAX_COINS - MIN_COINS));
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

- [ ] **Step 2: Add `BAD_REQUEST` overload to `AppException`**

Check `AppException.java`. If it only accepts `AppError` (no message override), add this constructor:

```java
public AppException(AppError error, String message) {
    super(message);
    this.error = error;
}
```

If a two-arg constructor already exists, skip this step.

- [ ] **Step 3: Compile check**

```bash
./mvnw compile -q
```

Expected: BUILD SUCCESS.

- [ ] **Step 4: Commit**

```bash
git add src/main/java/com/example/bugetGarden/service/QuizService.java
git commit -m "feat: add QuizService with coin award logic"
```

---

### Task 4: `QuizController`

**Files:**
- Create: `budgetGarden-backend/src/main/java/com/example/bugetGarden/controller/QuizController.java`

- [ ] **Step 1: Create the controller**

```java
package com.example.bugetGarden.controller;

import com.example.bugetGarden.dto.quiz.*;
import com.example.bugetGarden.interceptor.Authenticated;
import com.example.bugetGarden.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Authenticated
@RestController
@RequestMapping("quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/daily")
    public QuizSessionResponseDto getDailyQuiz() {
        return quizService.getDailyQuiz();
    }

    @PostMapping("/submit")
    public SubmitQuizResponseDto submitQuiz(@RequestBody SubmitQuizRequest request) {
        return quizService.submitQuiz(request);
    }
}
```

- [ ] **Step 2: Compile check**

```bash
./mvnw compile -q
```

Expected: BUILD SUCCESS.

- [ ] **Step 3: Manual test — start the backend**

```bash
./mvnw spring-boot:run
```

Then test with curl (replace `<TOKEN>` with a valid auth token):

```bash
curl -H "Authorization: <TOKEN>" http://localhost:8080/quiz/daily
```

Expected: JSON with `alreadyCompleted: false` and 5 questions.

- [ ] **Step 4: Commit**

```bash
git add src/main/java/com/example/bugetGarden/controller/QuizController.java
git commit -m "feat: add QuizController — GET /quiz/daily, POST /quiz/submit"
```

---

### Task 5: Frontend types + API helper

**Files:**
- Modify: `bugetGarden-front/lib/types.ts`
- Create: `bugetGarden-front/lib/quiz-api.ts`

- [ ] **Step 1: Add quiz types to `lib/types.ts`**

Append to the end of the file:

```typescript
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizSessionResponse {
  alreadyCompleted: boolean;
  questions: QuizQuestion[];
  coinsEarned: number | null;
}

export interface SubmitQuizRequest {
  answers: Record<string, number>; // questionId -> chosen index
}

export interface SubmitQuizResponse {
  correctAnswers: number;
  totalQuestions: number;
  coinsEarned: number;
}
```

- [ ] **Step 2: Create `lib/quiz-api.ts`**

```typescript
import { api } from './api';
import type { QuizSessionResponse, SubmitQuizRequest, SubmitQuizResponse } from './types';

export const quizApi = {
  getDailyQuiz: () => api.get<QuizSessionResponse>('/quiz/daily'),
  submitQuiz: (request: SubmitQuizRequest) =>
    api.post<SubmitQuizResponse>('/quiz/submit', request),
};
```

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts lib/quiz-api.ts
git commit -m "feat: add quiz types and API helper"
```

---

### Task 6: Quiz screen

**Files:**
- Create: `bugetGarden-front/app/(tabs)/quiz.tsx`

- [ ] **Step 1: Create the quiz screen**

```typescript
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert
} from 'react-native';
import { quizApi } from '../../lib/quiz-api';
import type { QuizQuestion, SubmitQuizResponse } from '../../lib/types';

type AnswerMap = Record<string, number>;

export default function QuizScreen() {
  const [loading, setLoading] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [result, setResult] = useState<SubmitQuizResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    quizApi.getDailyQuiz().then(session => {
      setAlreadyCompleted(session.alreadyCompleted);
      setQuestions(session.questions);
    }).catch(() => Alert.alert('Eroare', 'Nu s-a putut încărca quiz-ul'))
      .finally(() => setLoading(false));
  }, []);

  function selectAnswer(questionId: string, index: number) {
    setAnswers(prev => ({ ...prev, [questionId]: index }));
  }

  async function handleSubmit() {
    if (Object.keys(answers).length < questions.length) {
      Alert.alert('Atenție', 'Răspunde la toate întrebările înainte de a trimite.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await quizApi.submitQuiz({ answers });
      setResult(res);
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut trimite quiz-ul');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <ActivityIndicator style={styles.center} color="#4CAF50" />;

  if (alreadyCompleted && !result) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>✅</Text>
        <Text style={styles.title}>Quiz completat azi!</Text>
        <Text style={styles.subtitle}>Revino mâine pentru un nou quiz.</Text>
      </View>
    );
  }

  if (result) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>🌱</Text>
        <Text style={styles.title}>{result.correctAnswers}/{result.totalQuestions} corecte</Text>
        <Text style={styles.coinsText}>+{result.coinsEarned} monede câștigate!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Quiz financiar zilnic</Text>
      {questions.map((q, qi) => (
        <View key={q.id} style={styles.questionCard}>
          <Text style={styles.questionText}>{qi + 1}. {q.question}</Text>
          {q.options.map((opt, oi) => (
            <TouchableOpacity
              key={oi}
              style={[styles.option, answers[q.id] === oi && styles.optionSelected]}
              onPress={() => selectAnswer(q.id, oi)}
            >
              <Text style={[styles.optionText, answers[q.id] === oi && styles.optionTextSelected]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitBtnText}>
          {submitting ? 'Se trimite...' : 'Trimite răspunsurile'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 20 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#AAAAAA', textAlign: 'center' },
  coinsText: { fontSize: 18, color: '#4CAF50', fontWeight: '700', marginTop: 8 },
  questionCard: {
    backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, marginBottom: 16,
  },
  questionText: { fontSize: 15, color: '#FFFFFF', marginBottom: 12, lineHeight: 22 },
  option: {
    borderRadius: 8, borderWidth: 1, borderColor: '#333333',
    padding: 12, marginBottom: 8,
  },
  optionSelected: { borderColor: '#4CAF50', backgroundColor: '#1a3320' },
  optionText: { fontSize: 14, color: '#AAAAAA' },
  optionTextSelected: { color: '#4CAF50' },
  submitBtn: {
    backgroundColor: '#FF6B6B', borderRadius: 16, padding: 16,
    alignItems: 'center', marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
```

- [ ] **Step 2: Add quiz route to tab layout**

Open `app/(tabs)/_layout.tsx`. Add the quiz tab entry following the same pattern as existing tabs:

```typescript
<Tabs.Screen
  name="quiz"
  options={{ title: 'Quiz', tabBarButton: () => null }}
/>
```

(`tabBarButton: () => null` hides it from the tab bar — it's navigated to programmatically or from dashboard.)

- [ ] **Step 3: Test in Expo Go**

```bash
cd bugetGarden-front && npx expo start
```

Navigate to the quiz screen. Verify:
- Questions load on first open
- Selecting an option highlights it
- Submitting without all answers shows alert
- Submitting with all answers shows result + coins

- [ ] **Step 4: Commit**

```bash
git add app/(tabs)/quiz.tsx app/(tabs)/_layout.tsx lib/types.ts lib/quiz-api.ts
git commit -m "feat: add daily quiz screen"
```
