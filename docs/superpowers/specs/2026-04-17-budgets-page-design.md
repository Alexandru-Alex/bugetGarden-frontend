# Budgets Page Design

**Date:** 2026-04-17  
**Status:** Approved

---

## Overview

A new `/budgets` page accessible from the secondary nav menu (avatar dropdown / mobile drawer), positioned between Categories and Settings. Shows monthly budget overview: total summary, budgeted categories with progress bars, and unbudgeted expense categories with the ability to set a budget via modal.

Implemented with mock data initially. When backend endpoints are ready (`GET/POST/PUT/DELETE /budgets`), replace mock with `useQuery`/`useMutation`.

---

## Files

| File | Action |
|------|--------|
| `app/budgets.tsx` | Create — main screen |
| `styles/budgets.styles.ts` | Create — all styles |
| `components/nav-menu.tsx` | Edit — add Budgets to `SECONDARY_ITEMS` |
| `app/_layout.tsx` | Edit — register `budgets` Stack.Screen |

---

## Navigation

Add to `SECONDARY_ITEMS` in `nav-menu.tsx`, between Categories and Settings:

```ts
{ label: "Budgets", icon: "wallet-outline", path: "/budgets" }
```

Register in root `_layout.tsx`:

```tsx
<Stack.Screen name="budgets" options={{ headerShown: false }} />
```

---

## Screen Layout

### Header

Same pattern as `manage-categories.tsx`:
- `LinearGradient` background (`#346739` → `#4a8f52`)
- `NavMenu` component (hamburger / web nav bar)
- Title "Budgets" centered, `paddingTop` from `useSafeAreaInsets`

### Month/Year Selector

Row: `←` | `April 2026` | `→`

- `useState<{ month: number; year: number }>` initialized to current month/year
- Left arrow decrements month, wrapping Dec→Jan with year decrement
- Right arrow increments month, wrapping Dec→Jan with year increment
- Label formatted as `MMMM YYYY` (e.g. "April 2026")

### Summary Cards

Two equal-width cards side by side:

| Total Budget | Total Spent |
|---|---|
| sum of all `limit` values | sum of all `spent` values |

- Calculated via `useMemo` from mock budget list
- Card colors: `#346739` (dark) for Total Budget, `#79AE6F` (medium) for Total Spent
- White text, bold amounts

### Budget Categories Section

Header: `"Budget categories: April 2026"` (month/year reactive to selector)

Per-category row:
- **Icon**: circular background with category `color`, `MaterialCommunityIcons` icon centered
- **Info column**: category `name` (bold), then three labels on one row: `Limit: X` · `Spent: X` · `Remaining: X`
- **Progress bar**: full-width, height 6, rounded. Fill width = `(spent / limit) * 100%`, clamped to 100%. Color:
  - ≤60% spent → `#79AE6F` (green)
  - 61–80% spent → `#FFE566` (yellow)
  - >80% spent → `#E74C3C` (red)

Mock data (3–4 items):
```ts
{ id: "1", name: "Food", icon: "food", color: "#E67E22", limit: 500, spent: 320, remaining: 180 }
{ id: "2", name: "Transport", icon: "car", color: "#3498DB", limit: 200, spent: 170, remaining: 30 }
{ id: "3", name: "Entertainment", icon: "movie", color: "#9B59B6", limit: 150, spent: 40, remaining: 110 }
```

### Not Budgeted This Month Section

Header: `"Not budgeted this month"`

Per-category row:
- Icon (same circular style)
- Category name
- "Set budget" button aligned to the right — pressing opens the Set Budget modal

Mock data (3–4 unbudgeted EXPENSE categories):
```ts
{ id: "4", name: "Health", icon: "hospital", color: "#E74C3C" }
{ id: "5", name: "Shopping", icon: "shopping", color: "#1ABC9C" }
{ id: "6", name: "Education", icon: "book", color: "#F39C12" }
```

### Set Budget Modal

Triggered by pressing "Set budget" on any unbudgeted category.

- `Modal` with `transparent` + `absoluteFill` backdrop (semi-transparent black)
- Centered card (white, `borderRadius: 16`, shadow)
- Title: `"Set budget for [category name]"`
- `TextInput` — numeric keyboard, `textAlign: "center"`, placeholder `"0.00"`
- Two buttons: **Cancel** (dismiss, clear input) | **Save** (move category from not-budgeted list to budgeted list with `remaining = limit`)
- State: `useState<string>` for input value, `useState<CategoryDto | null>` for selected category

State update on Save (mock only):
- Remove category from `notBudgeted` list
- Add to `budgeted` list with `{ ...category, limit: parsed, spent: 0, remaining: parsed }`

---

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `GREEN_DARK` | `#346739` | Header bg, Total Budget card |
| `GREEN_MED` | `#79AE6F` | Total Spent card, progress bar (healthy) |
| `GREEN_LIGHT` | `#9FCB98` | Progress bar track background |
| `YELLOW` | `#FFE566` | Progress bar (warning) |
| `RED` | `#E74C3C` | Progress bar (danger) |
| `WHITE` | `#ffffff` | Text on dark backgrounds |

---

## State

```ts
const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
const [budgeted, setBudgeted] = useState<BudgetItem[]>(MOCK_BUDGETED);
const [notBudgeted, setNotBudgeted] = useState<CategoryDto[]>(MOCK_NOT_BUDGETED);
const [modalCategory, setModalCategory] = useState<CategoryDto | null>(null);
const [budgetInput, setBudgetInput] = useState("");
```

---

## Types (local to budgets.tsx)

```ts
interface BudgetItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  limit: number;
  spent: number;
  remaining: number;
}
```

---

## Future API Integration

When endpoints are available:
- Replace `useState(MOCK_BUDGETED)` with `useQuery({ queryKey: ["budgets", period], queryFn: () => api.get(\`/budgets?month=\${period.month}&year=\${period.year}\`) })`
- Replace Save handler with `useMutation` → `api.post("/budgets", { categoryId, limit, month, year })` + `invalidateQueries(["budgets"])`
- Unbudgeted list = all EXPENSE categories minus the budgeted ones (filter client-side)
