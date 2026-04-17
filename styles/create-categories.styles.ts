import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },

  // ── Header (green gradient) ──────────────────────────────────────────────────

  header: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    textAlign: "center",
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnPressed: {
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  headerSpacer: {
    width: 32,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: "#E05555",
  },
  deleteBtnPressed: {
    backgroundColor: "#FFF0F0",
  },
  deleteBtnText: {
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold",
    color: "#E05555",
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
    color: "#346739",
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
    color: "#346739",
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
    gap: 6,
    marginBottom: 32,
  },
  iconRow: {
    flexDirection: "row",
    gap: 6,
  },
  iconBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
  },
  iconBtnSelected: {
    borderWidth: 2.5,
  },

  // ── Toast ────────────────────────────────────────────────────────────────────

  toast: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#C0392B",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  toastText: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#FFFFFF",
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
