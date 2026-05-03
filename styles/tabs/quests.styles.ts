import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // ── Root ──────────────────────────────────────────────────────────────────
  root: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  headerSection: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerLabel: {
    fontFamily: "Nunito_900Black",
    fontSize: 32,
    color: "#FFFFFF",
    textAlign: "center",
  },
  headerSubtitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#9FCB98",
    textAlign: "center",
    marginTop: 4,
  },

  // ── Tab toggle ────────────────────────────────────────────────────────────
  tabRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20,
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
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  tabTextActive: {
    color: "#346739",
  },

  // ── Summary card ──────────────────────────────────────────────────────────
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  summaryLeft: {
    flex: 1,
    marginRight: 12,
  },
  summaryTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 10,
  },
  progressPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  progressPillText: {
    fontFamily: "Nunito_900Black",
    fontSize: 16,
    color: "#FFFFFF",
  },
  summaryEmoji: {
    fontSize: 48,
  },

  // ── Quest card ────────────────────────────────────────────────────────────
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: "#1A3A1A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: "#1A2A1A",
    flex: 1,
  },
  completedCheck: {
    fontSize: 18,
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E8F2E8",
    overflow: "hidden",
    marginTop: 12,
  },
  progressBarFill: {
    height: "100%",
  },
  progressBarLabel: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    textAlign: "center",
    textAlignVertical: "center",
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 12,
    lineHeight: 24,
  },
  rewardRow: {
    marginTop: 10,
  },
  rewardText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#5A8A5A",
  },

  // ── Bonus card ────────────────────────────────────────────────────────────
  bonusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
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

  // ── Empty / Loading ───────────────────────────────────────────────────────
  emptyText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 32,
  },
  loader: {
    marginTop: 40,
  },
});
