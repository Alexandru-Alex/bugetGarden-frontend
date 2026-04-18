import { StyleSheet } from "react-native";

export const GREEN_DARK = "#346739";
export const GREEN_MED = "#79AE6F";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerInner: {
    width: "100%",
    maxWidth: 480,
    flexDirection: "row",
    alignItems: "center",
  },
  headerSpacer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 28,
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  coinWidget: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  coinImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginRight: -15,
    zIndex: 1,
  },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  coinAmount: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#FFE566",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  cardWrapper: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    alignItems: "center",
    gap: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardName: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#333",
  },
  cardPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardPriceCoin: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  cardPrice: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#FFE566",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  modalName: {
    fontFamily: "Nunito_900Black",
    fontSize: 22,
    color: "#333",
  },
  modalDescription: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  buyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: GREEN_DARK,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  buyBtnPressed: {
    opacity: 0.8,
  },
  buyBtnCoin: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  buyBtnText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: "#FFE566",
  },
});
