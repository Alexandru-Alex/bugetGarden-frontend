import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollBase: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "#121212",
    position: "relative",
    minHeight: "100%",
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
    zIndex: 1,
  },

  // ── Wide layout ──────────────────────────────────────────────────────────────
  wideContainer: {
    width: "100%",
    paddingHorizontal: 32,
    paddingVertical: 28,
    gap: 20,
  },

  // ── Compact header (wide mode) ───────────────────────────────────────────────
  headerCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
    paddingVertical: 8,
  },
  headerCompactEmoji: {
    fontSize: 36,
    backgroundColor: "#E8F5E9",
    width: 56,
    height: 56,
    borderRadius: 28,
    textAlign: "center",
    lineHeight: 56,
    overflow: "hidden",
  },
  headerCompactTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  headerCompactSub: {
    fontSize: 12,
    color: "#8BC34A",
    fontStyle: "italic",
    marginTop: 2,
  },

  // ── Section labels ──────────────────────────────────────────────────────────
  sectionLabel: {
    alignSelf: "flex-start",
    marginBottom: 6,
    marginTop: 4,
  },
  sectionLabelText: {
    color: "#555",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // ── Responsive input row (web wide) ─────────────────────────────────────────
  inputRow: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    alignItems: "stretch",
  },
  inputRowLeft: {
    flex: 1,
  },
  inputRowRight: {
    flex: 1,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  headerSection: {
    alignItems: "center",
    marginBottom: 8,
    marginTop: 48,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#E8F5E9",
  },
  logoEmoji: {
    fontSize: 48,
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "center",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    color: "#8BC34A",
    fontStyle: "italic",
  },

  // ── Grass row ────────────────────────────────────────────────────────────────
  grassRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 10,
  },
  grassEmoji: {
    fontSize: 22,
  },

  // ── Separator ────────────────────────────────────────────────────────────────
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 14,
    gap: 10,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(76,175,80,0.2)",
  },
  separatorEmojis: {
    flexDirection: "row",
    gap: 8,
  },
  separatorEmoji: {
    fontSize: 20,
  },

  // ── Card (wooden sign) ───────────────────────────────────────────────────────
  cardFlex: {
    flex: 1,
  },
  cardInnerFlex: {
    flex: 1,
  },
  cardFormBottom: {
    gap: 14,
  },
  incomeCentered: {
    flex: 1,
    justifyContent: "center",
  },
  cardOuter: {
    width: "100%",
    backgroundColor: "#1A2A0A",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginVertical: 6,
  },
  cardOuterExpenses: {
    backgroundColor: "#251A08",
    borderColor: "#FF8F00",
    shadowColor: "#FF8F00",
  },
  nailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  nail: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
  },
  nailOrange: {
    backgroundColor: "#FF8F00",
  },
  cardInner: {
    padding: 22,
    gap: 14,
  },

  // ── Badge ────────────────────────────────────────────────────────────────────
  cardBadge: {
    alignSelf: "center",
    backgroundColor: "rgba(76,175,80,0.15)",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(76,175,80,0.4)",
  },
  cardBadgeOrange: {
    backgroundColor: "rgba(255,143,0,0.15)",
    borderColor: "rgba(255,143,0,0.4)",
  },
  cardBadgeText: {
    color: "#8BC34A",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardBadgeTextOrange: {
    color: "#FFB300",
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },
  cardHint: {
    fontSize: 13,
    color: "#7A9A5A",
    textAlign: "center",
    fontStyle: "italic",
  },

  // ── Income input ─────────────────────────────────────────────────────────────
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1A05",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#4CAF50",
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    marginRight: 10,
  },
  incomeInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 30,
    fontWeight: "900",
    color: "#AEED6F",
    letterSpacing: 1,
    // @ts-ignore - web only
    outlineStyle: "none",
  },

  // ── Expense rows ─────────────────────────────────────────────────────────────
  expenseFieldsContainer: {
    gap: 10,
  },
  expenseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#1A1005",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255,143,0,0.35)",
    paddingHorizontal: 14,
    paddingVertical: 0,
  },
  expenseRowEmoji: {
    fontSize: 22,
    width: 30,
    textAlign: "center",
  },
  expenseRowLabel: {
    width: 130,
    color: "#CCAA70",
    fontSize: 14,
    fontWeight: "700",
  },
  expenseInputWrapper: {
    width: 100,
    alignItems: "flex-end",
  },
  expenseInput: {
    flex: 1,
    textAlign: "right",
    fontSize: 18,
    fontWeight: "800",
    color: "#FFD54F",
    paddingVertical: 14,
    minWidth: 0,
    // @ts-ignore - web only
    outlineStyle: "none",
  },

  // ── Divider ──────────────────────────────────────────────────────────────────
  divider: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginVertical: 2,
  },
  dividerEmoji: {
    fontSize: 18,
  },

  // ── Submit button ────────────────────────────────────────────────────────────
  submitButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#81C784",
  },
  submitButtonOrange: {
    backgroundColor: "#FF8F00",
    shadowColor: "#FF8F00",
    borderColor: "#FFB300",
  },
  submitButtonPressed: {
    backgroundColor: "#388E3C",
  },
  submitButtonOrangePressed: {
    backgroundColor: "#E65100",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.4,
  },

  // ── Saved state ──────────────────────────────────────────────────────────────
  savedState: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  savedStateEmoji: {
    fontSize: 52,
    marginBottom: 4,
  },
  savedStateTitle: {
    fontSize: 22,
    fontWeight: "900",
  },
  savedStateSubtitle: {
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
  },
  savedStateEditBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  savedStateEditText: {
    fontSize: 13,
    fontWeight: "700",
  },

  // ── Score card ───────────────────────────────────────────────────────────────
  cardOuterScore: {
    backgroundColor: "#1A1600",
  },
  cardOuterPerfect: {
    backgroundColor: "#1A1200",
    borderWidth: 3,
    shadowRadius: 24,
  },
  cardInnerHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 32,
  },
  scoreCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  scoreSide: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
  },
  scoreCircleWrapper: {
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  perfectBadge: {
    alignSelf: "center",
    borderRadius: 20,
    borderWidth: 2,
    paddingVertical: 6,
    paddingHorizontal: 18,
    backgroundColor: "rgba(255,215,0,0.1)",
  },
  perfectBadgeText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
  },
  sparkleRing: {
    position: "absolute",
    width: 180,
    height: 180,
    top: -20,
  },
  sparkleItem: {
    position: "absolute",
    fontSize: 18,
  },
  scoreCirclePerfect: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 5,
    shadowRadius: 24,
  },
  scoreNumberPerfect: {
    fontSize: 52,
    fontWeight: "900",
    color: "#FFD700",
    lineHeight: 56,
  },
  scoreTrophy: {
    fontSize: 28,
    lineHeight: 32,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 7,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#120F00",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 18,
    elevation: 10,
  },
  scoreNumber: {
    fontSize: 46,
    fontWeight: "900",
    lineHeight: 52,
  },
  scoreOutOf: {
    fontSize: 14,
    fontWeight: "700",
    opacity: 0.8,
  },
  emojiRing: {
    flexDirection: "row",
    gap: 8,
  },
  emojiRingItem: {
    fontSize: 22,
  },
  scoreBarsContainer: {
    gap: 10,
    marginTop: 4,
  },
  scoreBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scoreBarEmoji: {
    fontSize: 22,
    width: 28,
    textAlign: "center",
  },
  scoreBarContent: {
    flex: 1,
    gap: 6,
  },
  scoreBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreBarLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Nunito_800ExtraBold",
    letterSpacing: 0.3,
  },
  scoreBarValue: {
    fontSize: 15,
    fontFamily: "Nunito_900Black",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 20,
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: "800",
    minWidth: 22,
    textAlign: "center",
  },
  scoreBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 5,
  },

  // ── Floating bugs ────────────────────────────────────────────────────────────
  bugsContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    marginTop: 8,
  },
  bugEmoji: {
    position: "absolute",
    fontSize: 26,
  },
});
