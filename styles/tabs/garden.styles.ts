import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5a9e2f",
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
    padding: 16,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#f0f9ec",
    borderRadius: 28,
    overflow: "hidden",
    width: "100%",
    maxWidth: 700,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 16,
  },
  gardenStrip: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#d6f0c8",
    borderBottomWidth: 1,
    borderBottomColor: "#b8dfa8",
  },
  gardenEmoji: {
    fontSize: 22,
  },
  cardInner: {
    paddingTop: 16,
    paddingHorizontal: 12,
    paddingBottom: 28,
    alignItems: "center",
  },
  title: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 26,
    color: "#1b4d1b",
    marginBottom: 12,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    backgroundColor: "#d4ebc8",
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  navBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  navArrow: {
    fontSize: 28,
    color: "#4a9e2f",
    lineHeight: 30,
    fontFamily: "Nunito_800ExtraBold",
  },
  monthLabel: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: "#1b4d1b",
    minWidth: 150,
    textAlign: "center",
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
  dayNumber: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
    color: "#3a6a2a",
    fontWeight: "600",
    textAlign: "center",
  },
  dayNumberToday: {
    fontFamily: "Nunito_800ExtraBold",
    color: "#1b5e20",
    fontWeight: "700",
  },
  dayNumberFuture: {
    color: "#8aab6e",
  },
  counter: {
    marginTop: 20,
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#5a8a3c",
    letterSpacing: 0.4,
  },
});
