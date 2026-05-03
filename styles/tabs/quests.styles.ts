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

  // ── Inner content wrapper ─────────────────────────────────────────────────
  inner: {
    flex: 1,
  },
  innerWeb: {
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
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

  // ── Quests container (wraps summary + all cards) ─────────────────────────
  questsContainer: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    marginHorizontal: 20,
    padding: 16,
    gap: 12,
  },

  // ── Summary section ───────────────────────────────────────────────────────
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  chestImage: {
    width: 56,
    height: 56,
  },

  // ── Quest card ────────────────────────────────────────────────────────────
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#1A3A1A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
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
    fontFamily: "Nunito_900Black",
    fontSize: 16,
    color: "#346739",
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
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
  },
  bonusTextWhite: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 20,
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
