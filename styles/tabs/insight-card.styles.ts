import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 420,
    marginTop: 20,
    backgroundColor: "#F0F7EF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#C8E0C5",
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 14,
  },
  cardPressed: {
    opacity: 0.85,
  },
  insightText: {
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    color: "#2A4A2E",
    textAlign: "center",
    lineHeight: 22,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C8E0C5",
  },
  dotActive: {
    backgroundColor: "#346739",
  },
  skeleton: {
    height: 18,
    width: "70%",
    borderRadius: 9,
    backgroundColor: "#C8E0C5",
  },
});
