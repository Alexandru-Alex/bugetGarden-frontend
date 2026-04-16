import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },

  // ── Header ──────────────────────────────────────────────────────────────────

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


  // ── Icon grid ────────────────────────────────────────────────────────────────

  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  iconGrid: {
    gap: 12,
    alignSelf: "center",
  },
  iconRow: {
    flexDirection: "row",
    gap: 12,
  },
  iconTile: {
    width: 68,
    height: 68,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── FAB ─────────────────────────────────────────────────────────────────────

  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E8960A",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 24,
    shadowColor: "#E8960A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabPressed: {
    backgroundColor: "#C97A08",
  },

  // ── Toast ────────────────────────────────────────────────────────────────────

  toast: {
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#79AE6F",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  toastText: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#FFFFFF",
  },

  // ── States ───────────────────────────────────────────────────────────────────

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    color: "#79AE6F",
    textAlign: "center",
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#FF6B6B",
    textAlign: "center",
  },
});
