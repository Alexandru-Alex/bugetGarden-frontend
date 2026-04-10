import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },

  // ── Green header ──────────────────────────────────────────────────────────

  header: {
    paddingBottom: 36,
  },
  totalSection: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 8,
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 50,
    fontFamily: "Pacifico_400Regular",
    color: "#FFFFFF",
  },

  // ── White content card ────────────────────────────────────────────────────

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
    paddingHorizontal: 24,
    alignItems: "center",
  },

  // ── Tabs ──────────────────────────────────────────────────────────────────

  tabRow: {
    flexDirection: "row",
    backgroundColor: "#E8F0E8",
    borderRadius: 14,
    padding: 4,
    width: "100%",
    maxWidth: 420,
    marginBottom: 28,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
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
    fontSize: 15,
    fontFamily: "Nunito_800ExtraBold",
    color: "#5A8A5A",
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },

  // ── Period selector ───────────────────────────────────────────────────────

  periodRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    width: "100%",
    maxWidth: 420,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#E8F2E8",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  periodBtnActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#346739",
  },
  periodText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#7AAA7A",
  },
  periodTextActive: {
    fontFamily: "Nunito_900Black",
    color: "#346739",
  },

  // ── Donut chart ───────────────────────────────────────────────────────────

  chartWrapper: {
    alignItems: "center",
    width: "100%",
    maxWidth: 420,
    gap: 20,
  },
  chartCenter: {
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  chartCenterLabel: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "#79AE6F",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  chartCenterAmount: {
    fontSize: 17,
    fontFamily: "Nunito_900Black",
    color: "#1A2A1A",
  },

  // ── Legend ────────────────────────────────────────────────────────────────

  legend: {
    width: "100%",
    gap: 10,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#E8F2E8",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    flex: 1,
    color: "#2A2A2A",
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
  },
  legendValue: {
    color: "#1A1A1A",
    fontSize: 14,
    fontFamily: "Nunito_900Black",
  },
  legendPct: {
    color: "#79AE6F",
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
  },

  // ── Add button ────────────────────────────────────────────────────────────

  addButton: {
    marginTop: 28,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E8960A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E8960A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonPressed: {
    backgroundColor: "#C97A08",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 36,
    textAlign: "center",
  },
});
