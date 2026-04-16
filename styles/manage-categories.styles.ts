import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },

  // ── Header ──────────────────────────────────────────────────────────────────

  header: {
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    textAlign: "center",
    paddingTop: 12,
    marginBottom: 12,
  },
  headerSubRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  // ── Tabs ────────────────────────────────────────────────────────────────────

  tabRow: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 14,
    padding: 4,
    marginTop: 14,
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Nunito_800ExtraBold",
    color: "rgba(255,255,255,0.7)",
  },
  tabTextActive: {
    color: "#346739",
  },

  // ── List ────────────────────────────────────────────────────────────────────

  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // ── Category card ────────────────────────────────────────────────────────────

  card: {
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
  cardWide: {
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  cardName: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Nunito_800ExtraBold",
    color: "#1A2A1A",
  },
  systemBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0F8F0",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  systemBadgeText: {
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    color: "#79AE6F",
  },
  actionRow: {
    flexDirection: "row",
    gap: 6,
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EAF3E8",
    justifyContent: "center",
    alignItems: "center",
  },
  editBtnPressed: {
    backgroundColor: "#D5E9D2",
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FFEAEA",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtnPressed: {
    backgroundColor: "#FFCECE",
  },

  // ── FAB ─────────────────────────────────────────────────────────────────────

  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#346739",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  fabPressed: {
    backgroundColor: "#2A4A2E",
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
