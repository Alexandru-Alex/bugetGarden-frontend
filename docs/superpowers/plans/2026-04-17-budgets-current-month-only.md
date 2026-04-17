# Budgets — Current Month Only Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restrict budget creation and limit changes to the current month only — with visual disabled state and a toast message on non-current months.

**Architecture:** Single-file change in `app/budgets.tsx`. Add `isCurrentMonth` boolean, gate the categories query and "Not budgeted" section on it, disable "Change limit" visually when on a past/future month, and show an inline toast on tap.

**Tech Stack:** React Native, React Query, Expo Router, MaterialCommunityIcons

---

### Task 1: Add `isCurrentMonth` and toast state

**Files:**
- Modify: `app/budgets.tsx`

- [ ] **Step 1: Add `isCurrentMonth` and toast state**

In `budgets.tsx`, after the existing `useState` declarations (around line 88), add:

```tsx
const now = new Date();
const isCurrentMonth = period.month === now.getMonth() + 1 && period.year === now.getFullYear();

const [restrictedToast, setRestrictedToast] = useState(false);

const showRestrictedToast = () => {
  setRestrictedToast(true);
  setTimeout(() => setRestrictedToast(false), 3000);
};
```

- [ ] **Step 2: Commit**

```bash
git add app/budgets.tsx
git commit -m "feat: add isCurrentMonth flag and toast state for budget restrictions"
```

---

### Task 2: Gate categories query and "Not budgeted" section

**Files:**
- Modify: `app/budgets.tsx`

- [ ] **Step 1: Disable categories fetch on non-current months**

Find the categories `useQuery` (around line 121):

```tsx
const { data: categories = [] } = useQuery({
  queryKey: ["categories"],
  queryFn: () => api.get<CategoryDto[]>("/categories"),
  enabled: !!token,
  staleTime: 5 * 60 * 1000,
});
```

Change `enabled` to:

```tsx
  enabled: !!token && isCurrentMonth,
```

- [ ] **Step 2: Hide "Not budgeted" section on non-current months**

Find the "Not budgeted" section in the JSX (around line 273). Wrap it with a conditional:

```tsx
{isCurrentMonth && (
  <>
    <View style={styles.sectionSpacer} />
    <Text style={styles.sectionHeader}>Not budgeted this month</Text>
    {notBudgeted.map((cat, idx) => (
      <React.Fragment key={cat.id}>
        <View style={styles.categoryRow}>
          <View style={[styles.categoryIcon, { backgroundColor: cat.color + "18" }]}>
            <MaterialCommunityIcons name={cat.icon as any} size={22} color={cat.color} />
          </View>
          <Text style={styles.notBudgetedName}>{cat.name}</Text>
          <Pressable style={styles.setButton} onPress={() => setModalCategory(cat)}>
            <Text style={styles.setButtonText}>Set budget</Text>
          </Pressable>
        </View>
        {idx < notBudgeted.length - 1 && <View style={styles.divider} />}
      </React.Fragment>
    ))}
  </>
)}
```

Also remove the `<View style={styles.sectionSpacer} />` and the "Not budgeted" block that were previously unconditional (they are now inside the conditional above).

- [ ] **Step 3: Commit**

```bash
git add app/budgets.tsx
git commit -m "feat: hide not-budgeted section and skip categories fetch on non-current months"
```

---

### Task 3: Disable "Change limit" visually and show toast

**Files:**
- Modify: `app/budgets.tsx`

- [ ] **Step 1: Update "Change limit" Pressable in the action menu**

Find the "Change limit" `Pressable` (around line 310):

```tsx
<Pressable
  style={({ pressed }) => [styles.actionItem, pressed && styles.actionItemPressed]}
  onPress={() => menuItem && handleChangeLimit(menuItem)}
>
  <MaterialCommunityIcons name="pencil-outline" size={18} color="#346739" />
  <Text style={styles.actionItemText}>Change limit</Text>
</Pressable>
```

Replace with:

```tsx
<Pressable
  style={({ pressed }) => [
    styles.actionItem,
    pressed && isCurrentMonth && styles.actionItemPressed,
    !isCurrentMonth && styles.actionItemDisabled,
  ]}
  onPress={() => {
    if (!isCurrentMonth) { showRestrictedToast(); return; }
    menuItem && handleChangeLimit(menuItem);
  }}
>
  <MaterialCommunityIcons
    name="pencil-outline"
    size={18}
    color={isCurrentMonth ? "#346739" : "#bbb"}
  />
  <Text style={[styles.actionItemText, !isCurrentMonth && styles.actionItemTextDisabled]}>
    Change limit
  </Text>
</Pressable>
```

- [ ] **Step 2: Add `actionItemDisabled` and `actionItemTextDisabled` to styles**

Open `styles/budgets.styles.ts` and add these two entries to the `StyleSheet.create({...})` object:

```ts
actionItemDisabled: {
  opacity: 0.4,
},
actionItemTextDisabled: {
  color: "#bbb",
},
```

- [ ] **Step 3: Commit**

```bash
git add app/budgets.tsx styles/budgets.styles.ts
git commit -m "feat: disable Change limit action on non-current month with visual feedback"
```

---

### Task 4: Render the toast in the JSX

**Files:**
- Modify: `app/budgets.tsx`

- [ ] **Step 1: Add toast overlay**

Inside the root `<View style={styles.root}>` in the return statement, add the toast just before the closing `</View>`:

```tsx
{restrictedToast && (
  <View style={styles.restrictedToast} pointerEvents="none">
    <Text style={styles.restrictedToastText}>
      You can only set budgets for the current month
    </Text>
  </View>
)}
```

- [ ] **Step 2: Add toast styles to `styles/budgets.styles.ts`**

```ts
restrictedToast: {
  position: "absolute",
  top: 120,
  alignSelf: "center",
  backgroundColor: "#333",
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 10,
  zIndex: 999,
},
restrictedToastText: {
  color: "#fff",
  fontSize: 13,
},
```

- [ ] **Step 3: Commit**

```bash
git add app/budgets.tsx styles/budgets.styles.ts
git commit -m "feat: show restricted toast when attempting to set budget on non-current month"
```
