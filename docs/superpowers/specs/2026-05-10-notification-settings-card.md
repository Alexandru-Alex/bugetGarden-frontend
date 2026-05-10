# Notification Settings Card — Design Spec

## Summary

Add a "Notification" card to the settings page with two rows: a daily reminder toggle and a link to OS notification settings.

## Location

Inserted after the "Appearance" card in `app/settings.tsx`, using the existing `manageCard` style pattern.

## Data

- `AccountDto.isNotification: boolean` — already returned by the backend
- New `PATCH /accounts` call with `{ isNotification: boolean }` — same mutation pattern as currency/decimals
- Switch value is driven directly by `account?.isNotification ?? false`

## UI

### Card title
"NOTIFICATION" — same `manageCardTitle` style (uppercase, grey, letter-spaced)

### Row 1 — Remind everyday
- Left: `notifications-outline` Ionicon (green `#346739`, size 20)
- Middle: two-line label stack
  - "Remind everyday" — `manageRowLabel` style
  - "Remind to add expenses/income" — small grey subtext (`fontSize: 12`, `color: "#6b7f6b"`, `Nunito_700Bold`)
- Right: React Native `Switch` (`trackColor false: "#e0e0e0"`, `true: "#9FCB98"`, `thumbColor: "#346739"`)
- On toggle: fires `updateNotification` mutation; no optimistic state — query invalidation is enough

### Row 2 — Notification settings
- Left: `settings-outline` Ionicon (green, size 20)
- Label: "Notification settings" — `manageRowLabel`
- Right: chevron-forward icon
- On press: `Linking.openSettings()` — opens OS app settings (Android shows notification channels there)
- Shown on all platforms; on web the call is a no-op

## Styles

New entries in `styles/settings.styles.ts`:
- `notifSubtext` — `fontSize: 12`, `Nunito_700Bold`, `color: "#6b7f6b"`
- `notifRow` — same as `manageRow` but `alignItems: "center"` (already is, reuse `manageRow`)
- `notifLabelGroup` — `flex: 1`, `gap: 2` (wraps label + subtext)

No new modal needed.
