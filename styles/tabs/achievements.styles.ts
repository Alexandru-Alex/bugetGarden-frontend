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
    fontFamily: "Nunito_900Black",
    fontSize: 28,
    color: "#fff",
    textAlign: "center",
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
  scrollInner: {
    maxWidth: 560,
    alignSelf: "center",
    width: "100%",
  },

  // ── Section title ─────────────────────────────────────────────────────────

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

  // ── Row card ──────────────────────────────────────────────────────────────

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
    gap: 14,
  },
  rowLocked: {
    borderColor: "#E2E2E2",
    backgroundColor: "#F9F9F9",
    shadowOpacity: 0,
    elevation: 0,
  },

  // ── Badge image ───────────────────────────────────────────────────────────

  badgeImage: {
    width: 80,
    height: 80,
    flexShrink: 0,
  },
  badgeImageWrapper: {
    width: 80,
    height: 80,
    flexShrink: 0,
  },
  badgeGreyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(180,180,180,0.7)",
  },
  lockIcon: {
    position: "absolute",
    fontSize: 12,
    bottom: 2,
    right: 2,
  },

  // ── Content ───────────────────────────────────────────────────────────────

  content: {
    flex: 1,
    gap: 7,
  },
  title: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#1A2A1A",
    lineHeight: 19,
  },
  titleLocked: {
    color: "#A0A0A0",
  },

  // ── Progress bar ──────────────────────────────────────────────────────────

  progressTrack: {
    height: 7,
    backgroundColor: "#EDF2ED",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },

  // ── Meta row ──────────────────────────────────────────────────────────────

  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaCount: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: "#AAAAAA",
  },
  metaCoins: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
  },
  metaExtra: {
    fontSize: 12,
  },
  doneLabel: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginLeft: 2,
  },
});
