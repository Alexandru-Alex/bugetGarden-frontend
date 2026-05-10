# Edit Name Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the display name in Settings tappable so the user can rename their account via a small modal that calls `PATCH /accounts`.

**Architecture:** Add `showNameModal` + `nameInput` state to `SettingsScreen`, wire a `useMutation` for `PATCH /accounts`, wrap `profileName` in a `Pressable` with a pencil badge, and render a second `Modal` identical in structure to the existing avatar modal. Styles live in `settings.styles.ts`.

**Tech Stack:** React Native, Expo Router, React Query (`useMutation`), `lib/api.ts`

---

### Task 1: Add name-modal styles to `settings.styles.ts`

**Files:**
- Modify: `styles/settings.styles.ts`

- [ ] **Step 1: Add new style keys to the `StyleSheet.create<{...}>` call**

Append the following entries inside the existing `StyleSheet.create({...})` object in `styles/settings.styles.ts` (after `manageRowLabelDisabled`):

```ts
  nameModal: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  nameModalTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 18,
    color: "#1a2e1b",
    marginBottom: 16,
    textAlign: "center",
  },
  nameInput: {
    borderWidth: 1.5,
    borderColor: "#9FCB98",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#1a2e1b",
    width: "100%",
    marginBottom: 20,
    ...Platform.select({ web: { outlineStyle: "none", outlineWidth: 0 } }),
  },
  nameModalButtons: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  nameModalBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#f2f5f2",
  },
  nameModalBtnPrimary: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#346739",
  },
  nameModalBtnLabel: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#346739",
  },
  nameModalBtnPrimaryLabel: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#ffffff",
  },
  nameEditBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#346739",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  profileNameWrapper: {
    position: "relative",
    alignSelf: "flex-start",
  },
```

- [ ] **Step 2: Add `Platform` to the import at the top of `settings.styles.ts`**

The file currently does not import `Platform`. Add it:

```ts
import { Platform, StyleSheet } from "react-native";
```

- [ ] **Step 3: Verify TypeScript compiles without errors**

Run: `npx tsc --noEmit`
Expected: no errors related to `settings.styles.ts`

- [ ] **Step 4: Commit**

```bash
git add styles/settings.styles.ts
git commit -m "style: add name-modal styles to settings"
```

---

### Task 2: Wire state, mutation, and modal in `settings.tsx`

**Files:**
- Modify: `app/settings.tsx`

- [ ] **Step 1: Add `showNameModal` and `nameInput` state**

In `SettingsScreen`, after the existing `const [showAvatarModal, setShowAvatarModal] = useState(false);` line, add:

```ts
const [showNameModal, setShowNameModal] = useState(false);
const [nameInput, setNameInput] = useState("");
```

- [ ] **Step 2: Add `updateName` mutation**

After the existing `updateAvatar` mutation block, add:

```ts
const { mutate: updateName, isPending: savingName } = useMutation({
  mutationFn: (name: string) => api.patch("/accounts", { name, currency: null }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY });
    setShowNameModal(false);
  },
});
```

- [ ] **Step 3: Add `TextInput` to the React Native import**

The file already imports from `"react-native"`. Add `TextInput` to the destructure:

```ts
import { Image, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
```

- [ ] **Step 4: Make the profile name pressable with a pencil badge**

Replace the existing `<View style={styles.profileInfo}>` block (lines ~133–140):

```tsx
<View style={styles.profileInfo}>
  <Text style={styles.profileName} numberOfLines={1}>
    {account?.displayName ?? "—"}
  </Text>
  <Text style={styles.profileEmail} numberOfLines={1}>
    {account?.email ?? "—"}
  </Text>
</View>
```

With:

```tsx
<View style={styles.profileInfo}>
  <Pressable
    style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
    onPress={() => {
      setNameInput(account?.displayName ?? "");
      setShowNameModal(true);
    }}
  >
    <View style={styles.profileNameWrapper}>
      <Text style={styles.profileName} numberOfLines={1}>
        {account?.displayName ?? "—"}
      </Text>
      <View style={styles.nameEditBadge}>
        <Ionicons name="pencil" size={8} color="#fff" />
      </View>
    </View>
  </Pressable>
  <Text style={styles.profileEmail} numberOfLines={1}>
    {account?.email ?? "—"}
  </Text>
</View>
```

- [ ] **Step 5: Add the name modal JSX**

After the closing `</Modal>` tag of the avatar modal (around line 232), add:

```tsx
<Modal
  visible={showNameModal}
  transparent
  animationType="fade"
  onRequestClose={() => setShowNameModal(false)}
>
  <Pressable style={styles.modalBackdrop} onPress={() => setShowNameModal(false)}>
    <Pressable
      style={styles.nameModal}
      {...(Platform.OS === "web" ? { onClick: (e: any) => e.stopPropagation() } : undefined)}
    >
      <Text style={styles.nameModalTitle}>Change Name</Text>
      <TextInput
        style={styles.nameInput}
        value={nameInput}
        onChangeText={setNameInput}
        placeholder="Your name"
        placeholderTextColor="#9FCB98"
        autoFocus
        maxLength={50}
      />
      <View style={styles.nameModalButtons}>
        <Pressable
          style={({ pressed }) => [styles.nameModalBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => setShowNameModal(false)}
        >
          <Text style={styles.nameModalBtnLabel}>Cancel</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.nameModalBtnPrimary, { opacity: pressed || savingName ? 0.7 : 1 }]}
          onPress={() => {
            const trimmed = nameInput.trim();
            if (trimmed) updateName(trimmed);
          }}
          disabled={savingName}
        >
          <Text style={styles.nameModalBtnPrimaryLabel}>
            {savingName ? "Saving…" : "Save"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  </Pressable>
</Modal>
```

- [ ] **Step 6: Verify TypeScript compiles without errors**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add app/settings.tsx
git commit -m "feat: tap name in settings to open change-name modal"
```
