import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#346739",
    ...(Platform.OS === "web" ? { minHeight: "100vh" as any, overflow: "hidden" } : {}),
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.10)",
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: Platform.select({ web: 72, default: 60 }),
  },
  innerWrapper: {
    width: "100%",
    maxWidth: 700,
    flexGrow: 1,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  navBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  navArrow: {
    fontSize: 28,
    color: "#9FCB98",
    lineHeight: 30,
    fontFamily: "Nunito_800ExtraBold",
  },
  monthLabel: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: "#ffffff",
    minWidth: 150,
    textAlign: "center",
  },
  gridSection: {
    alignSelf: "stretch",
    position: "relative",
  },
  gridWrapper: {
    alignSelf: "stretch",
    paddingHorizontal: 4,
    overflow: "visible",
  },
  grid: {
    position: "relative",
    overflow: "visible",
  },
  leafCounter: {
    position: "absolute",
    bottom: 16,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.28)",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  leafIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  leafCount: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#ffffff",
  },
  chartCard: {
    alignSelf: "stretch",
    backgroundColor: "#f4f9f1",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 48,
    flexGrow: 1,
  },
  dayNumber: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: "#3a6a2a",
    fontWeight: "600",
    textAlign: "center",
  },
});
