import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },

  // ── Header ────────────────────────────────────────────────────────────────

  header: {
    paddingBottom: 36,
  },
  headerSection: {
    paddingTop: 24,
    paddingBottom: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  headerLabel: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  // ── Scroll / Card ─────────────────────────────────────────────────────────

  scroll: {
    flex: 1,
    marginTop: -24,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  card: {
    backgroundColor: "#F5F8F5",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 28,
    paddingHorizontal: 20,
  },

  // ── Tab row ───────────────────────────────────────────────────────────────

  tabRow: {
    flexDirection: "row",
    backgroundColor: "#E8F0E8",
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: "#346739",
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#5A8A5A",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },

  // ── Task card ─────────────────────────────────────────────────────────────

  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  taskTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: "#1A2A1A",
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E8F2E8",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#346739",
    borderRadius: 4,
  },
  progressFillComplete: {
    backgroundColor: "#52B788",
  },
  rewardRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  rewardText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#5A8A5A",
  },

  // ── Bonus card ────────────────────────────────────────────────────────────

  bonusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#52B788",
    alignItems: "center",
  },
  bonusText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#2D7A56",
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Empty state ───────────────────────────────────────────────────────────

  emptyText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#79AE6F",
    textAlign: "center",
    marginTop: 40,
  },
});
