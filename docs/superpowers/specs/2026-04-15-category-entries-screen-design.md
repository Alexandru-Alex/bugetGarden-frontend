# Category Entries Screen — Design Spec

**Date:** 2026-04-15  
**Feature:** Tap on a dashboard legend row to open a list of all financial entries for that category

---

## Context

The dashboard shows a donut chart with a legend below it. Each legend row represents a spending/income category with its name, color dot, total amount, and percentage. Currently these rows are non-interactive `View` elements. The user wants them to be tappable, opening a new full screen that lists every individual entry for that category.

---

## Data Flow

### How `categoryId` is obtained

`GET /financial-entries/summary` returns `{ name, color, total }` — no `categoryId`.  
`GET /categories` returns `{ id, name, type, icon, color }`.

**Approach:** Add a `useQuery` for `/categories` in `DashboardScreen` (same query key `["categories"]` already used in `AddTransactionModal` — React Query deduplicates and cache-hits after modal is opened). Build a `name → id` map (`Map<string, string>`). Attach `categoryId` to each `Segment` passed to `DonutChart`.

### New entries endpoint

`GET /financial-entries?categoryId={id}` returns a list of:

```ts
interface FinancialEntryDto {
  id: string;
  amount: BigDecimal; // arrives as number
  description: string;
  entryDate: string;   // "YYYY-MM-DD"
  categoryName: string;
  icon: string;
  color: string;
}
```

---

## Architecture

### Changes to existing files

**`app/(tabs)/dashboard.tsx`**
- Add `useQuery` for `/categories` (staleTime: 5min, same as modal)
- Build `categoryNameToId: Map<string, string>` with `useMemo`
- Add `categoryId?: string` field to `Segment` interface
- Pass `categoryId` to each segment built from summary items
- Add `onPress?: (categoryId: string, categoryName: string, color: string, type: "EXPENSE" | "INCOME") => void` prop to `DonutChart`
- In `DashboardScreen`, handle `onPress` by setting nav direction and calling `router.push`
- Legend rows become `Pressable` (with press opacity feedback)

**`app/_layout.tsx`**
- Register `<Stack.Screen name="category-entries" options={{ headerShown: false }} />`

### New file

**`app/category-entries.tsx`**
- Receives params: `categoryId`, `categoryName`, `color`, `type`, `symbol` (currency symbol, ex: `$`, `€`)
- Fetches `GET /financial-entries?categoryId={categoryId}` via `useQuery`
- Query key: `["financial-entries", categoryId]`

---

## UI — Category Entries Screen

### Header
- Green gradient (`#2A4A2E` → `#346739`), same as dashboard
- Back arrow (chevron-left) on the left
- Category name centered
- Small colored dot + type label (Expenses / Income) below the name

### Entry list
- `FlatList` (or `ScrollView`) with `RefreshControl`
- Each row (`entryCard`):
  - Left: rounded icon box using `icon` + `color` (same style as `AddTransactionModal` cat icons)
  - Center: `categoryName` (bold), `description` (muted, 1 line truncated), `entryDate` formatted as `DD MMM YYYY`
  - Right: amount with currency symbol, colored with category color

### States
- **Loading:** `ActivityIndicator` centered
- **Empty:** centered illustration text — "No entries for this category"
- **Error:** brief error message centered

### Transition
- Uses `lib/nav-direction.ts` pattern (forward direction before push)

---

## Style

- New file: `styles/category-entries.styles.ts`
- Follows existing palette: `#346739`, `#79AE6F`, `#9FCB98`, `#ffffff`
- Font family: `Nunito_700Bold`, `Nunito_800ExtraBold`, `Nunito_900Black`

---

## What is NOT in scope

- Editing or deleting entries (read-only list)
- Filtering/sorting within the entries screen
- Pagination (loads all entries for the category at once)
