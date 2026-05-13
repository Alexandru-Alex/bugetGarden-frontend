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
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  navSide: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  navSideRight: {
    justifyContent: "flex-end",
  },
  navBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  shareBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    gap: 2,
  },
  leafIcon: {
    width: 34,
    height: 34,
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
    paddingHorizontal: 24,
    paddingTop: 20,
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
  toast: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    backgroundColor: "rgba(31,46,31,0.92)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 100,
  },
  toastText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#fff",
    textAlign: "center",
  },
});
