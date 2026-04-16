import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },

  // ── Header (white, clean) ────────────────────────────────────────────────────

  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAF3E8",
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Nunito_900Black",
    color: "#1A2A1A",
    textAlign: "center",
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EAF3E8",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnPressed: {
    backgroundColor: "#D5E9D2",
  },
  headerSpacer: {
    width: 32,
  },

  // ── Type toggle (in header) ───────────────────────────────────────────────────

  typeRow: {
    flexDirection: "row",
    backgroundColor: "#EAF3E8",
    borderRadius: 14,
    padding: 4,
    gap: 0,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 11,
  },
  typeBtnActive: {
    backgroundColor: "#346739",
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  typeBtnText: {
    fontSize: 14,
    fontFamily: "Nunito_800ExtraBold",
    color: "#5A8A5A",
  },
  typeBtnTextActive: {
    color: "#FFFFFF",
  },

  // ── Scroll ───────────────────────────────────────────────────────────────────

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  inner: {
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },

  // ── Preview ──────────────────────────────────────────────────────────────────

  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 28,
  },
  previewIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  previewName: {
    fontSize: 20,
    fontFamily: "Nunito_900Black",
    color: "#1A2A1A",
    maxWidth: 200,
  },
  previewNamePlaceholder: {
    color: "#B8D4B8",
  },

  // ── Section label ────────────────────────────────────────────────────────────

  sectionLabel: {
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    color: "#79AE6F",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 4,
  },

  // ── Name input ───────────────────────────────────────────────────────────────

  nameBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  nameInput: {
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold",
    color: "#1A2A1A",
    padding: 0,
  },

  // ── Color picker ─────────────────────────────────────────────────────────────

  colorGrid: {
    gap: 10,
    marginBottom: 24,
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: "transparent",
  },
  colorSwatchSelected: {
    borderColor: "#1A2A1A",
  },

  // ── Icon picker ──────────────────────────────────────────────────────────────

  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 32,
  },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
  },
  iconBtnSelected: {
    borderWidth: 2.5,
  },

  // ── Save button ───────────────────────────────────────────────────────────────

  saveBtn: {
    backgroundColor: "#346739",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnPressed: {
    backgroundColor: "#2A4A2E",
  },
  saveBtnDisabled: {
    backgroundColor: "#C8DFC6",
  },
  saveBtnText: {
    fontSize: 17,
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
