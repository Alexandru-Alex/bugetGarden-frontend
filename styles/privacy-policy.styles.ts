import { Platform, StyleSheet } from "react-native";

export const pp = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#346739",
  },
  containerWeb: {
    minHeight: "100vh" as any,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // ── Nav ───────────────────────────────────────────────────────────────────
  stickyNav: {
    position: "fixed" as any,
    top: 20,
    left: 28,
    right: 28,
    zIndex: 100,
    flexDirection: "row" as any,
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 22,
  },
  backBtnText: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    letterSpacing: 0.4,
  },
  openAppBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.65)",
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 22,
    ...Platform.select({ web: { backdropFilter: "blur(10px)" } as any }),
  },
  openAppBtnText: {
    color: "#ffffff",
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    letterSpacing: 0.4,
  },
  // ── Header block ──────────────────────────────────────────────────────────
  headerBlock: {
    width: "100%" as any,
    backgroundColor: "#346739",
    paddingTop: 120,
    paddingBottom: 60,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 38,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
  },
  headerMeta: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  // ── Content area ──────────────────────────────────────────────────────────
  contentArea: {
    width: "100%" as any,
    backgroundColor: "#ffffff",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  contentInner: {
    maxWidth: 760,
    alignSelf: "center",
    width: "100%" as any,
  },
  sectionTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 18,
    color: "#346739",
    marginTop: 36,
    marginBottom: 10,
  },
  subsectionTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: "#346739",
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#444444",
    lineHeight: 24,
    marginBottom: 8,
  },
  bold: {
    fontFamily: "Nunito_800ExtraBold",
    color: "#222222",
  },
  divider: {
    height: 1,
    backgroundColor: "#e8f5e3",
    marginTop: 32,
    marginBottom: 4,
  },
  // ── Bullet list ───────────────────────────────────────────────────────────
  bulletRow: {
    flexDirection: "row" as any,
    marginBottom: 6,
    paddingLeft: 8,
  },
  bulletDot: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#79AE6F",
    marginRight: 8,
    lineHeight: 24,
  },
  bulletText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#444444",
    lineHeight: 24,
    flex: 1,
  },
  // ── Table (section 4) ─────────────────────────────────────────────────────
  table: {
    borderRadius: 10,
    overflow: "hidden" as any,
    borderWidth: 1,
    borderColor: "#e0ede0",
    marginTop: 12,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row" as any,
    backgroundColor: "#346739",
  },
  tableHeaderCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  tableHeaderText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 13,
    color: "#ffffff",
  },
  tableRow: {
    flexDirection: "row" as any,
    borderTopWidth: 1,
    borderColor: "#e8f0e8",
  },
  tableRowAlt: {
    backgroundColor: "#f8fdf8",
  },
  tableCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  tableCellText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#444444",
    lineHeight: 20,
  },
  // ── Footer ────────────────────────────────────────────────────────────────
  footerSection: {
    width: "100%" as any,
    backgroundColor: "#346739",
    paddingVertical: 28,
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.3,
  },
});
