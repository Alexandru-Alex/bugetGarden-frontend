import { Platform, StyleSheet } from "react-native";

export const inputOutline = Platform.select({
  web: { outlineStyle: "none" as any, outlineWidth: 0 },
});

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },
  header: {
    paddingBottom: 28,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    textAlign: "center",
    paddingTop: 12,
    marginBottom: 10,
  },
  headerSubRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnPressed: {
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  headerSpacer: {
    width: 32,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 48,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "#7AAA7A",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    color: "#346739",
    padding: 0,
  },
  saveBtn: {
    backgroundColor: "#346739",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 12,
  },
  saveBtnPressed: {
    backgroundColor: "#2A4A2E",
  },
  saveBtnDisabled: {
    backgroundColor: "#C8DFC6",
  },
  saveBtnText: {
    fontSize: 17,
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "#E53935",
    textAlign: "center",
    marginBottom: 12,
  },
  toast: {
    position: "absolute",
    top: 120,
    left: 32,
    right: 32,
    backgroundColor: "#346739",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 14,
    color: "#ffffff",
  },
});
