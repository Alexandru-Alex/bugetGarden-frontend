import { StyleSheet } from "react-native";

export const sharedStyles = StyleSheet.create({
  tabsExtension: {
    marginHorizontal: 16,
    marginTop: -1,
    maxWidth: 448,
    alignSelf: "center",
    width: "100%",
    backgroundColor: "#346739",
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 14,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  typeRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 12,
    padding: 3,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 10,
  },
  typeBtnActive: {
    backgroundColor: "#79AE6F",
  },
  typeBtnText: {
    fontSize: 13,
    fontFamily: "Nunito_800ExtraBold",
    color: "rgba(255,255,255,0.7)",
  },
  typeBtnTextActive: {
    color: "#FFFFFF",
  },
});
