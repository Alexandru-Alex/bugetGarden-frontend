# Budgets Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/budgets` page accessible from the secondary nav menu that shows a monthly budget overview with summary cards, budgeted categories with progress bars, and unbudgeted categories with a "Set budget" modal.

**Architecture:** New `app/budgets.tsx` screen with local mock state; mirrors the structure of `manage-categories.tsx` (LinearGradient header + ScrollView body). Styles live in a separate `styles/budgets.styles.ts` file. No API calls yet — mock data only; replace with `useQuery` when backend endpoints exist.

**Tech Stack:** Expo Router, React Native, React Query (QueryClient already in `_layout.tsx`), Reanimated 4, `expo-linear-gradient`, `@expo/vector-icons` (MaterialCommunityIcons), `react-native-safe-area-context`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `components/nav-menu.tsx` | Modify ~line 28 | Add "Budgets" to `SECONDARY_ITEMS` |
| `app/_layout.tsx` | Modify ~line 58 | Register `budgets` Stack.Screen |
| `styles/budgets.styles.ts` | Create | All StyleSheet definitions for budgets screen |
| `app/budgets.tsx` | Create | Full budgets screen component |

---

## Task 1: Wire navigation

**Files:**
- Modify: `components/nav-menu.tsx:28-32`
- Modify: `app/_layout.tsx:57-60`

- [ ] **Step 1: Add Budgets to SECONDARY_ITEMS in nav-menu.tsx**

Open `components/nav-menu.tsx`. The current `SECONDARY_ITEMS` array starts at line 27:

```ts
const SECONDARY_ITEMS = [
  { label: "Achievements", icon: "trophy-outline"     as const, path: "" },
  { label: "Store",        icon: "storefront-outline" as const, path: ""        },
  { label: "Categories",   icon: "pricetag-outline"   as const, path: "/manage-categories" },
  { label: "Settings",     icon: "settings-outline"   as const, path: ""     },
];
```

Replace with:

```ts
const SECONDARY_ITEMS = [
  { label: "Achievements", icon: "trophy-outline"     as const, path: "" },
  { label: "Store",        icon: "storefront-outline" as const, path: ""        },
  { label: "Categories",   icon: "pricetag-outline"   as const, path: "/manage-categories" },
  { label: "Budgets",      icon: "wallet-outline"     as const, path: "/budgets" },
  { label: "Settings",     icon: "settings-outline"   as const, path: ""     },
];
```

- [ ] **Step 2: Register route in _layout.tsx**

Open `app/_layout.tsx`. After the `create-categories` Stack.Screen (line ~60), add:

```tsx
<Stack.Screen name="create-categories" options={{ headerShown: false }} />
<Stack.Screen name="budgets" options={{ headerShown: false }} />
```

- [ ] **Step 3: Type-check**

```bash
cd D:/IdeaProjects/bugetGarden-front && npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add components/nav-menu.tsx app/_layout.tsx
git commit -m "feat: add Budgets to nav menu and register route"
```

---

## Task 2: Create styles file

**Files:**
- Create: `styles/budgets.styles.ts`

- [ ] **Step 1: Create the styles file**

Create `styles/budgets.styles.ts` with the following content:

```ts
import { StyleSheet } from "react-native";

export const GREEN_DARK = "#346739";
export const GREEN_MED = "#79AE6F";
export const GREEN_LIGHT = "#9FCB98";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 28,
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  monthArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  monthLabel: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
    color: "#fff",
    minWidth: 150,
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 48,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  summaryCardBudget: {
    backgroundColor: GREEN_DARK,
  },
  summaryCardSpent: {
    backgroundColor: GREEN_MED,
  },
  summaryCardLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryCardAmount: {
    fontFamily: "Nunito_900Black",
    fontSize: 22,
    color: "#fff",
  },
  sectionHeader: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: "#333",
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#222",
    marginBottom: 2,
  },
  categoryMeta: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 6,
  },
  categoryMetaText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: "#777",
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN_LIGHT,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  sectionSpacer: {
    height: 28,
  },
  notBudgetedName: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#222",
    flex: 1,
  },
  setButton: {
    backgroundColor: GREEN_DARK,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  setButtonText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#fff",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 17,
    color: "#222",
    textAlign: "center",
    marginBottom: 2,
  },
  modalSubtitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 15,
    color: GREEN_DARK,
    textAlign: "center",
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: GREEN_MED,
    borderRadius: 10,
    padding: 12,
    fontFamily: "Nunito_700Bold",
    fontSize: 24,
    color: "#222",
    textAlign: "center",
    width: "100%",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#ddd",
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#888",
  },
  modalSaveBtn: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: GREEN_DARK,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalSaveText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#fff",
  },
});
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add styles/budgets.styles.ts
git commit -m "feat: add budgets styles"
```

---

## Task 3: Build screen skeleton (auth guard + header + month selector)

**Files:**
- Create: `app/budgets.tsx`

- [ ] **Step 1: Create budgets.tsx with auth, header, and month selector**

Create `app/budgets.tsx`:

```tsx
import { NavMenu } from "@/components/nav-menu";
import { getStoredToken } from "@/lib/api";
import { NavTransition } from "@/lib/nav-direction";
import { styles } from "@/styles/budgets.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BudgetItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  limit: number;
  spent: number;
  remaining: number;
}

interface UnbudgetedCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_BUDGETED: BudgetItem[] = [
  { id: "1", name: "Food", icon: "food", color: "#E67E22", limit: 500, spent: 320, remaining: 180 },
  { id: "2", name: "Transport", icon: "car", color: "#3498DB", limit: 200, spent: 170, remaining: 30 },
  { id: "3", name: "Entertainment", icon: "movie", color: "#9B59B6", limit: 150, spent: 40, remaining: 110 },
];

const MOCK_NOT_BUDGETED: UnbudgetedCategory[] = [
  { id: "4", name: "Health", icon: "hospital-box", color: "#E74C3C" },
  { id: "5", name: "Shopping", icon: "shopping", color: "#1ABC9C" },
  { id: "6", name: "Education", icon: "book-open-variant", color: "#F39C12" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function progressColor(spent: number, limit: number): string {
  const pct = spent / limit;
  if (pct > 0.8) return "#E74C3C";
  if (pct > 0.6) return "#FFE566";
  return "#79AE6F";
}

function progressWidth(spent: number, limit: number): `${number}%` {
  return `${Math.min(Math.round((spent / limit) * 100), 100)}%`;
}

function formatAmount(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BudgetsScreen() {
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const now = new Date();
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [budgeted, setBudgeted] = useState<BudgetItem[]>(MOCK_BUDGETED);
  const [notBudgeted, setNotBudgeted] = useState<UnbudgetedCategory[]>(MOCK_NOT_BUDGETED);
  const [modalCategory, setModalCategory] = useState<UnbudgetedCategory | null>(null);
  const [budgetInput, setBudgetInput] = useState("");

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  const prevMonth = () =>
    setPeriod(p => p.month === 1 ? { month: 12, year: p.year - 1 } : { ...p, month: p.month - 1 });

  const nextMonth = () =>
    setPeriod(p => p.month === 12 ? { month: 1, year: p.year + 1 } : { ...p, month: p.month + 1 });

  const periodLabel = `${MONTH_NAMES[period.month - 1]} ${period.year}`;

  const { totalBudget, totalSpent } = useMemo(() => ({
    totalBudget: budgeted.reduce((s, b) => s + b.limit, 0),
    totalSpent: budgeted.reduce((s, b) => s + b.spent, 0),
  }), [budgeted]);

  const handleSaveBudget = () => {
    if (!modalCategory) return;
    const limit = parseFloat(budgetInput.replace(",", "."));
    if (isNaN(limit) || limit <= 0) return;
    setBudgeted(prev => [...prev, { ...modalCategory, limit, spent: 0, remaining: limit }]);
    setNotBudgeted(prev => prev.filter(c => c.id !== modalCategory.id));
    setModalCategory(null);
    setBudgetInput("");
  };

  const handleCloseModal = () => {
    setModalCategory(null);
    setBudgetInput("");
  };

  return (
    <View style={styles.root}>
      <NavMenu />
      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[styles.header, { paddingTop: Platform.OS === "web" ? 56 : insets.top + 56 }]}
      >
        <Text style={styles.headerTitle}>Budgets</Text>
        <View style={styles.monthSelector}>
          <Pressable style={styles.monthArrow} onPress={prevMonth}>
            <MaterialCommunityIcons name="chevron-left" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.monthLabel}>{periodLabel}</Text>
          <Pressable style={styles.monthArrow} onPress={nextMonth}>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#fff" />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryCardBudget]}>
            <Text style={styles.summaryCardLabel}>Total Budget</Text>
            <Text style={styles.summaryCardAmount}>${formatAmount(totalBudget)}</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardSpent]}>
            <Text style={styles.summaryCardLabel}>Total Spent</Text>
            <Text style={styles.summaryCardAmount}>${formatAmount(totalSpent)}</Text>
          </View>
        </View>

        {/* Budgeted categories */}
        <Text style={styles.sectionHeader}>Budget categories: {periodLabel}</Text>
        {budgeted.map((item, idx) => (
          <React.Fragment key={item.id}>
            <View style={styles.categoryRow}>
              <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
                <MaterialCommunityIcons name={item.icon as any} size={22} color="#fff" />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <View style={styles.categoryMeta}>
                  <Text style={styles.categoryMetaText}>Limit: ${formatAmount(item.limit)}</Text>
                  <Text style={styles.categoryMetaText}>·</Text>
                  <Text style={styles.categoryMetaText}>Spent: ${formatAmount(item.spent)}</Text>
                  <Text style={styles.categoryMetaText}>·</Text>
                  <Text style={styles.categoryMetaText}>Remaining: ${formatAmount(item.remaining)}</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: progressWidth(item.spent, item.limit),
                        backgroundColor: progressColor(item.spent, item.limit),
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
            {idx < budgeted.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}

        <View style={styles.sectionSpacer} />

        {/* Not budgeted */}
        <Text style={styles.sectionHeader}>Not budgeted this month</Text>
        {notBudgeted.map((cat, idx) => (
          <React.Fragment key={cat.id}>
            <View style={styles.categoryRow}>
              <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                <MaterialCommunityIcons name={cat.icon as any} size={22} color="#fff" />
              </View>
              <Text style={styles.notBudgetedName}>{cat.name}</Text>
              <Pressable style={styles.setButton} onPress={() => setModalCategory(cat)}>
                <Text style={styles.setButtonText}>Set budget</Text>
              </Pressable>
            </View>
            {idx < notBudgeted.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </ScrollView>

      {/* Set budget modal */}
      <Modal
        visible={!!modalCategory}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.backdrop}>
            <Pressable style={{ ...require("react-native").StyleSheet.absoluteFillObject }} onPress={handleCloseModal} />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
              <View
                style={styles.modalCard}
                {...(Platform.OS === "web" ? { onClick: (e: any) => e.stopPropagation() } : {})}
              >
                <Text style={styles.modalTitle}>Set budget for</Text>
                <Text style={styles.modalSubtitle}>{modalCategory?.name}</Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    Platform.select({ web: { outlineStyle: "none", outlineWidth: 0 } as any }),
                  ]}
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#bbb"
                />
                <View style={styles.modalButtons}>
                  <Pressable style={styles.modalCancelBtn} onPress={handleCloseModal}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.modalSaveBtn} onPress={handleSaveBudget}>
                    <Text style={styles.modalSaveText}>Save</Text>
                  </Pressable>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
```

- [ ] **Step 2: Fix the absoluteFill in modal backdrop**

The inline `require` for `StyleSheet.absoluteFillObject` is ugly. Replace the `<Pressable>` backdrop line inside the modal with a cleaner import. At the top of the file, `StyleSheet` is not imported yet. Add it to the react-native import:

```tsx
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
```

Then replace the backdrop Pressable line:

```tsx
<Pressable style={StyleSheet.absoluteFillObject} onPress={handleCloseModal} />
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/budgets.tsx
git commit -m "feat: add budgets screen with mock data, month selector, summary cards, and set budget modal"
```

---

## Task 4: Update MEMORY.md

**Files:**
- Modify: `C:\Users\g3d0m\.claude\projects\D--IdeaProjects-bugetGarden-front\memory\MEMORY.md`
- Create: `C:\Users\g3d0m\.claude\projects\D--IdeaProjects-bugetGarden-front\memory\project_budgets_page.md`

- [ ] **Step 1: Write project memory for budgets page**

Create `C:\Users\g3d0m\.claude\projects\D--IdeaProjects-bugetGarden-front\memory\project_budgets_page.md`:

```markdown
---
name: Budgets page — structure and mock data
description: app/budgets.tsx with mock data; endpoints GET/POST/PUT/DELETE /budgets not yet implemented
type: project
---

`app/budgets.tsx` — monthly budget overview page. Accessible via secondary nav (wallet-outline icon).

Mock data only — backend endpoints (`GET/POST/PUT/DELETE /budgets?month=&year=`) not yet built.

**Why:** Backend not available at time of implementation; mock state to be replaced with useQuery/useMutation when ready.

**How to apply:** When backend is ready, replace `useState(MOCK_BUDGETED)` with `useQuery({ queryKey: ["budgets", period], queryFn: () => api.get(\`/budgets?month=${period.month}&year=${period.year}\`) })` and Save handler with `useMutation` → `api.post("/budgets", { categoryId, limit, month, year })`.

BudgetItem type: `{ id, name, icon, color, limit, spent, remaining }` (remaining calculated by backend).
```

- [ ] **Step 2: Add pointer to MEMORY.md**

Add this line to `C:\Users\g3d0m\.claude\projects\D--IdeaProjects-bugetGarden-front\memory\MEMORY.md` under the existing entries:

```
- [Budgets page — mock data](project_budgets_page.md) — app/budgets.tsx cu mock; endpoints GET/POST/PUT/DELETE /budgets neimplementate încă
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Month/year selector with ← → navigation
- [x] Total Budget + Total Spent summary cards (2 columns)
- [x] "Budget categories: [month year]" section with icon, name, Limit/Spent/Remaining, progress bar
- [x] Progress bar color: green ≤60%, yellow 61–80%, red >80%
- [x] "Not budgeted this month" section with all unbudgeted expense categories
- [x] "Set budget" button per unbudgeted category
- [x] Modal with amount input, Cancel, Save
- [x] Save moves category from not-budgeted to budgeted list
- [x] Budgets added to SECONDARY_ITEMS in nav-menu (below Categories)
- [x] Route registered in _layout.tsx

**Placeholder scan:** No TBD, TODO, or vague steps. All code is complete.

**Type consistency:**
- `BudgetItem` defined once, used in `MOCK_BUDGETED`, `budgeted` state, and `handleSaveBudget`
- `UnbudgetedCategory` defined once, used in `MOCK_NOT_BUDGETED`, `notBudgeted` state, `modalCategory` state, and `handleSaveBudget`
- `progressColor(spent, limit)` and `progressWidth(spent, limit)` used consistently in the budgeted list render
- `formatAmount(n)` used for all currency display
