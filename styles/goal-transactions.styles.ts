import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },

  // ── Header ───────────────────────────────────────────────────────────────────

  header: {
    paddingBottom: 28,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    textAlign: "center",
    paddingTop: 12,
    marginBottom: 10,
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
  headerSubRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSubCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  headerSpacer: {
    width: 32,
  },
  headerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headerSubLabel: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  // ── List ─────────────────────────────────────────────────────────────────────

  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 48,
  },

  // ── Section header ───────────────────────────────────────────────────────────

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeaderWide: {
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },
  sectionHeaderText: {
    fontSize: 12,
    fontFamily: "Nunito_800ExtraBold",
    color: "#79AE6F",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // ── Transaction card ─────────────────────────────────────────────────────────

  txCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
    marginBottom: 8,
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  txCardWide: {
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },
  txCardPressed: {
    opacity: 0.75,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  txCenter: {
    flex: 1,
    gap: 2,
  },
  txType: {
    fontSize: 14,
    fontFamily: "Nunito_800ExtraBold",
    color: "#1A2A1A",
  },
  txNote: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "#79AE6F",
  },
  txAmount: {
    fontSize: 15,
    fontFamily: "Nunito_900Black",
  },

  // ── States ───────────────────────────────────────────────────────────────────

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    color: "#79AE6F",
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#FF6B6B",
    textAlign: "center",
  },
  footerSpinner: {
    paddingVertical: 20,
  },

  // ── Edit modal ───────────────────────────────────────────────────────────────

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  modalTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 20,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#346739",
    marginBottom: 14,
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  tabPillActive: {
    backgroundColor: "#EAF3E8",
  },
  tabPillText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 13,
    color: "#bbb",
  },
  tabPillTextActive: {
    color: "#346739",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  cancelText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#666",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#346739",
    alignItems: "center",
  },
  saveText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#fff",
  },
  deleteBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FDECEA",
    alignItems: "center",
  },
  deleteBtnPressed: {
    backgroundColor: "#FBCFCC",
  },
  deleteBtnText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#E74C3C",
  },
  confirmBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FFF3F3",
    borderWidth: 1,
    borderColor: "#FBCFCC",
  },
  confirmText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#E74C3C",
    textAlign: "center",
    marginBottom: 10,
  },
  confirmRow: {
    flexDirection: "row",
    gap: 8,
  },
  confirmCancel: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  confirmCancelPressed: {
    backgroundColor: "#E8E8E8",
  },
  confirmCancelText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#666",
  },
  confirmDelete: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#E74C3C",
    alignItems: "center",
  },
  confirmDeletePressed: {
    backgroundColor: "#C0392B",
  },
  confirmDeleteText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#fff",
  },
  errorToast: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    backgroundColor: "#C0392B",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    zIndex: 999,
  },
  errorToastText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
});
