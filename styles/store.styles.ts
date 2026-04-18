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
    backgroundColor: "#fff",
  },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    alignItems: "flex-end",
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
  listOuter: {
    flex: 1,
    alignItems: "center",
  },
  list: {
    width: "100%",
    maxWidth: 360,
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
  imageFrame: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#79AE6F",
    borderWidth: 2.5,
    borderColor: "#346739",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    overflow: "hidden",
  },
  card: {
    width: "100%",
    backgroundColor: "#9FCB98",
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
    gap: 2,
    shadowColor: "#1a3a1f",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardName: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#fff",
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
    fontSize: 24,
    color: GREEN_DARK,
    letterSpacing: 0.5,
  },
  modalDescription: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
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
