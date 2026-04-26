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

  // ── Scroll / Content ──────────────────────────────────────────────────────

  scroll: {
    flex: 1,
    marginTop: -24,
  },
  scrollContent: {
    paddingTop: 28,
    paddingBottom: 48,
    backgroundColor: "#F5F8F5",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // ── Section ───────────────────────────────────────────────────────────────

  sectionTitle: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "#5A8A5A",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 16,
  },

  // ── Achievement card ──────────────────────────────────────────────────────

  card: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLocked: {
    opacity: 0.5,
  },
  cardTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: "#1A2A1A",
    marginBottom: 8,
  },

  // ── Progress bar ──────────────────────────────────────────────────────────

  progressBar: {
    height: 6,
    backgroundColor: "#E8F2E8",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#346739",
    borderRadius: 3,
  },
  progressFillUnlocked: {
    backgroundColor: "#52B788",
  },

  // ── Meta row ──────────────────────────────────────────────────────────────

  meta: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  metaText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#5A8A5A",
  },

  // ── Difficulty badge ──────────────────────────────────────────────────────

  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
  },
});
