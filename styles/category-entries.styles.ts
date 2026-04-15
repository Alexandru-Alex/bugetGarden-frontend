import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },

  // ── Header ──────────────────────────────────────────────────────────────────

  header: {
    paddingBottom: 28,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    textAlign: "center",
    paddingTop: 12,
    marginBottom: 10,
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
  headerSubRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSubCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  headerSpacer: {
    width: 32,
  },

  // ── Sort control ─────────────────────────────────────────────────────────────

  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#EAF3E8",
  },
  sortBtnPressed: {
    backgroundColor: "#D5E9D2",
  },
  sortBtnText: {
    fontSize: 11,
    fontFamily: "Nunito_800ExtraBold",
    color: "#79AE6F",
    letterSpacing: 0.5,
  },
  headerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headerSubLabel: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  // ── List ────────────────────────────────────────────────────────────────────

  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 48,
  },

  // ── Section header (date) ────────────────────────────────────────────────────

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeaderWide: {
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },
  sectionHeaderText: {
    fontSize: 12,
    fontFamily: "Nunito_800ExtraBold",
    color: "#79AE6F",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // ── Entry card ───────────────────────────────────────────────────────────────

  entryCard: {
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
  entryCardWide: {
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },
  entryCardPressed: {
    opacity: 0.75,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  entryCenter: {
    flex: 1,
    gap: 2,
  },
  entryCategory: {
    fontSize: 14,
    fontFamily: "Nunito_800ExtraBold",
    color: "#1A2A1A",
  },
  entryDescription: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "#79AE6F",
  },
  entryAmount: {
    fontSize: 15,
    fontFamily: "Nunito_900Black",
    color: "#1A2A1A",
  },

  // ── States ───────────────────────────────────────────────────────────────────

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    color: "#79AE6F",
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#FF6B6B",
    textAlign: "center",
  },
  footerSpinner: {
    paddingVertical: 20,
  },
});
