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
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "rgba(255,255,255,0.65)",
    marginTop: 4,
    letterSpacing: 0.5,
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
    paddingTop: 32,
    paddingHorizontal: 24,
  },

  // ── Gauge triple layout ───────────────────────────────────────────────────

  gaugeTriple: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 36,
  },

  // Side panels
  sidePanel: {
    flex: 1,
    gap: 10,
    alignSelf: "stretch",
  },
  sidePanelLeft: {
    alignItems: "flex-end",
  },
  sidePanelRight: {
    alignItems: "flex-start",
  },
  sideStat: {
    gap: 2,
  },
  sideStatValue: {
    fontFamily: "Nunito_900Black",
    fontSize: 20,
    lineHeight: 26,
    color: "#1A2A1A",
  },
  sideStatGrade: {
    fontFamily: "Pacifico_400Regular",
    fontSize: 20,
    lineHeight: 26,
  },
  sideStatLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: "#79AE6F",
    letterSpacing: 0.2,
  },
  sideDivider: {
    height: 1,
    backgroundColor: "#D8EBD6",
    alignSelf: "stretch",
  },

  // Gauge center
  gaugeCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  gaugeScore: {
    fontSize: 38,
    fontFamily: "Pacifico_400Regular",
    lineHeight: 44,
  },
  gaugeMax: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#79AE6F",
    letterSpacing: 0.5,
    marginTop: -2,
  },

  // ── Shared section ────────────────────────────────────────────────────────

  sectionsContainer: {
    alignSelf: "center",
    width: "100%",
  },
  section: {
    marginTop: 28,
  },
  catSection: {},
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 16,
    color: "#1A2A1A",
    letterSpacing: 0.2,
    marginBottom: 14,
  },
  sectionSubtitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#79AE6F",
  },

  // ── Category grid ─────────────────────────────────────────────────────────

  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  catGridCenter: {
    alignItems: "center",
    marginTop: 10,
  },
  catCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
  },
  catCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  catCardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catCardName: {
    flex: 1,
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#1A2A1A",
  },
  catCardWeight: {
    fontFamily: "Nunito_900Black",
    fontSize: 12,
    color: "#5A8A5A",
  },
  catCardBarTrack: {
    height: 6,
    backgroundColor: "#E8F2E8",
    borderRadius: 3,
    overflow: "hidden",
  },
  catCardBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  catCardScoreRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  catCardScoreValue: {
    fontFamily: "Nunito_900Black",
    fontSize: 12,
    color: "#1A2A1A",
  },
  catCardScoreMax: {
    fontFamily: "Nunito_700Bold",
    fontSize: 10,
    color: "#79AE6F",
  },

  // ── Score trend chart ─────────────────────────────────────────────────────

  trendEmptyInner: {
    paddingVertical: 28,
    alignItems: "center",
  },
  trendEmptyText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#79AE6F",
    textAlign: "center",
  },
  trendChart: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },
  trendScoreLabel: {
    position: "absolute",
    width: 32,
    textAlign: "center",
    fontSize: 10,
    fontFamily: "Nunito_700Bold",
  },
  trendScoreLabelCurrent: {
    fontFamily: "Nunito_900Black",
  },
  trendWeekLabel: {
    position: "absolute",
    width: 24,
    textAlign: "center",
    fontSize: 10,
    fontFamily: "Nunito_700Bold",
  },
  trendWeekLabelCurrent: {
    fontFamily: "Nunito_900Black",
  },

  // ── Improvement tips ──────────────────────────────────────────────────────

  tipsList: {
    gap: 10,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
    borderLeftWidth: 4,
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  tipContent: {
    flex: 1,
    gap: 3,
  },
  tipTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#1A2A1A",
  },
  tipDesc: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#5A8A5A",
    lineHeight: 18,
  },
});
