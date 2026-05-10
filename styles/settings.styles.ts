import { StyleSheet } from "react-native";

export const GREEN_DARK = "#346739";
export const GREEN_MED = "#79AE6F";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f2f5f2",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontFamily: "Nunito_900Black",
    fontSize: 28,
    color: "#1a2e1b",
    marginBottom: 20,
  },
  banner: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  bannerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  bannerKicker: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: "#9FCB98",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bannerTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: "#ffffff",
    lineHeight: 21,
    marginBottom: 10,
  },
  bannerCta: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 4,
  },
  bannerCtaText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#ffffff",
  },
  bannerCoinImg: {
    width: 56,
    height: 56,
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: GREEN_MED,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: "#1a2e1b",
    marginBottom: 2,
  },
  profileEmail: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#6b7f6b",
  },
});
