import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },
  content: {
    paddingTop: 16,
    paddingBottom: 32,
  },

  tabRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#E4EFE1",
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: "#346739",
  },
  tabText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#346739",
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },

  periodRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  periodChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#E4EFE1",
  },
  periodChipActive: {
    backgroundColor: "#79AE6F",
  },
  periodText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#346739",
  },
  periodTextActive: {
    color: "#FFFFFF",
  },

  chartCard: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingTop: 16,
    paddingBottom: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#346739",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 11,
    color: "#346739",
  },
  chartLoader: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  chartEmpty: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  chartEmptyText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#79AE6F",
  },

  toast: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    backgroundColor: "#346739",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 8,
  },
  toastText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#FFFFFF",
  },

  txSection: {
    marginHorizontal: 16,
  },
  txTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#346739",
    marginBottom: 10,
  },
  txCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  txIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txCategory: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#1A1A1A",
  },
  txDescription: {
    fontFamily: "Nunito_400Regular",
    fontSize: 11,
    color: "#79AE6F",
    marginTop: 1,
  },
  txRight: {
    alignItems: "flex-end",
  },
  txAmount: {
    fontFamily: "Nunito_900Black",
    fontSize: 14,
    color: "#346739",
  },
  txDate: {
    fontFamily: "Nunito_400Regular",
    fontSize: 11,
    color: "#9FCB98",
    marginTop: 2,
  },
  txLoader: {
    paddingVertical: 24,
    alignItems: "center",
  },
  txEmpty: {
    paddingVertical: 24,
    alignItems: "center",
  },
  txEmptyText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#9FCB98",
  },
});
