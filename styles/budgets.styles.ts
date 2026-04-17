import { StyleSheet } from "react-native";

export const GREEN_DARK = "#346739";
export const GREEN_MED = "#79AE6F";
export const GREEN_LIGHT = "#9FCB98";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: "center",
  },
  headerInner: {
    width: "100%",
    maxWidth: 480,
  },
  headerTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 28,
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  monthArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  monthLabel: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
    color: "#fff",
    minWidth: 150,
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 48,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  summaryCardBudget: {
    backgroundColor: GREEN_DARK,
  },
  summaryCardSpent: {
    backgroundColor: GREEN_MED,
  },
  summaryCardLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryCardAmount: {
    fontFamily: "Nunito_900Black",
    fontSize: 22,
    color: "#fff",
  },
  sectionHeader: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: GREEN_DARK,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: GREEN_DARK,
    marginBottom: 2,
  },
  categoryMeta: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 6,
  },
  categoryMetaText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: GREEN_MED,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN_LIGHT,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  sectionSpacer: {
    height: 28,
  },
  notBudgetedName: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: GREEN_DARK,
    flex: 1,
  },
  setButton: {
    backgroundColor: GREEN_DARK,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  setButtonText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#fff",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 17,
    color: GREEN_DARK,
    textAlign: "center",
    marginBottom: 2,
  },
  modalSubtitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 15,
    color: GREEN_DARK,
    textAlign: "center",
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: GREEN_MED,
    borderRadius: 10,
    padding: 12,
    fontFamily: "Nunito_700Bold",
    fontSize: 24,
    color: GREEN_DARK,
    textAlign: "center",
    width: "100%",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#ddd",
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#888",
  },
  modalSaveBtn: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: GREEN_DARK,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalSaveText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#fff",
  },
});
