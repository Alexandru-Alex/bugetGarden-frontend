import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#346739",
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 32,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: "Pacifico_400Regular",
    fontSize: 48,
    color: "#ffffff",
  },
  subtitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#9FCB98",
    letterSpacing: 0.4,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 28,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#79AE6F",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
  },
  inputWrapFocused: {
    borderColor: "#346739",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#346739",
    paddingVertical: 12,
    ...Platform.select({
      web: { outlineWidth: 0, outlineStyle: "none" } as any,
      default: {},
    }),
  },
  currencySection: {
    gap: 8,
  },
  currencyLabel: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 12,
    color: "#79AE6F",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingLeft: 4,
  },
  currencyRow: {
    flexDirection: "row",
    gap: 10,
  },
  currencyOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#9FCB98",
    borderRadius: 14,
    paddingVertical: 11,
    backgroundColor: "#ffffff",
  },
  currencyOptionSelected: {
    backgroundColor: "#346739",
    borderColor: "#346739",
  },
  currencyOptionPressed: {
    backgroundColor: "#f0f8ee",
  },
  currencySymbol: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
    color: "#79AE6F",
  },
  currencySymbolSelected: {
    color: "#ffffff",
  },
  currencyName: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#79AE6F",
    letterSpacing: 0.3,
  },
  currencyNameSelected: {
    color: "#ffffff",
  },
  btn: {
    backgroundColor: "#346739",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  btnDisabled: {
    backgroundColor: "#9FCB98",
    shadowOpacity: 0,
    elevation: 0,
  },
  btnPressed: {
    backgroundColor: "#2d5a30",
    transform: [{ scale: 0.98 }],
  },
  btnText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: "#ffffff",
    letterSpacing: 0.4,
  },
});
