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

  // ── Achievement row ───────────────────────────────────────────────────────

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    gap: 14,
  },
  rowLocked: {
    borderColor: "#D8D8D8",
    backgroundColor: "#F8F8F8",
    shadowOpacity: 0,
    elevation: 0,
  },

  // ── Badge ────────────────────────────────────────────────────────────────

  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  badgeEmoji: {
    fontSize: 26,
  },

  // ── Content (right of badge) ──────────────────────────────────────────────

  content: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#1A2A1A",
    lineHeight: 18,
  },
  titleLocked: {
    color: "#999999",
  },

  // ── Progress bar ──────────────────────────────────────────────────────────

  progressBar: {
    height: 6,
    backgroundColor: "#E8E8E8",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  // ── Meta ──────────────────────────────────────────────────────────────────

  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metaCount: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: "#888888",
  },
  metaCoins: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
  },
  metaFlower: {
    fontSize: 12,
  },
  unlockedBadge: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
