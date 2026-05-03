import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    paddingBottom: 32,
  },
  headerInner: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerInnerMobile: {
    paddingLeft: 64,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 28,
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#9FCB98",
  },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#c8d0c0",
    borderRadius: 999,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 14,
    marginLeft: 12,
  },
  coinImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  coinText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#1a2a1d",
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 48,
    backgroundColor: "#F5F8F5",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  inner: {
    paddingHorizontal: 16,
  },
  innerWeb: {
    maxWidth: 900,
    alignSelf: "center",
    width: "100%",
  },

  // ── Feature banner ────────────────────────────────────────────────────────
  banner: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  bannerLeft: {
    flex: 1,
  },
  bannerKicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(159,203,152,0.18)",
    borderWidth: 1,
    borderColor: "rgba(159,203,152,0.35)",
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  bannerKickerText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 10,
    color: "#9FCB98",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bannerTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 20,
    color: "#ffffff",
    lineHeight: 26,
    marginBottom: 6,
  },
  bannerTitleEm: {
    color: "#9FCB98",
  },
  bannerSubtitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "rgba(255,255,255,0.82)",
    marginBottom: 12,
  },
  bannerCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
  },
  bannerCtaText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 12,
    color: "#1f4a25",
  },
  bannerImgFrame: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: "#f4efe2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  bannerImg: {
    width: "90%",
    height: "90%",
  },

  // ── Search bar ────────────────────────────────────────────────────────────
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e3e5dc",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#1a2a1d",
  },

  // ── Section header ────────────────────────────────────────────────────────
  sectionTitle: {
    fontFamily: "Nunito_900Black",
    fontSize: 18,
    color: "#1f4a25",
    marginBottom: 12,
  },

  // ── Grid ─────────────────────────────────────────────────────────────────
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },

  // ── Flower card ───────────────────────────────────────────────────────────
  card: {},
  cardBody: {
    backgroundColor: "#346739",
    borderRadius: 16,
    padding: 10,
    overflow: "hidden",
    marginBottom: 6,
  },
  cardBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 999,
    zIndex: 1,
  },
  cardBadgeText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  cardImgFrame: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "#f4efe2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cardImg: {
    width: "88%",
    height: "88%",
  },
  cardName: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 13,
    color: "#ffffff",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 2,
  },
  cardPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  cardCoinImg: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  cardPriceText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 13,
    color: "#c99a2a",
  },

  // ── Buy modal ─────────────────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },
  modalImgFrame: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: "#f4efe2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#e3e5dc",
  },
  modalImg: {
    width: "88%",
    height: "88%",
  },
  modalName: {
    fontFamily: "Nunito_900Black",
    fontSize: 22,
    color: "#1f4a25",
    marginBottom: 8,
  },
  modalPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
  },
  modalCoinImg: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  modalPrice: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 20,
    color: "#c99a2a",
  },
  modalBuyBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#346739",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#1f4a25",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  modalBuyBtnText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: "#ffffff",
  },
  modalCancelBtn: {
    paddingVertical: 10,
  },
  modalCancelText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#8a968c",
  },

  // ── Toast ─────────────────────────────────────────────────────────────────
  toast: {
    position: "absolute",
    top: 120,
    left: 20,
    right: 20,
    zIndex: 999,
    backgroundColor: "#346739",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#ffffff",
  },
});
