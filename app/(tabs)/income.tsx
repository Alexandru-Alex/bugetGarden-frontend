import { AnimatedTreesBackground } from "@/components/animated-trees";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { styles } from "./income.styles";

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  if (isWide) {
    return (
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBase}
      >
        <View style={styles.container}>
          <AnimatedTreesBackground />
          <View style={styles.wideContainer}>
            {/* Header row */}
            <DashboardHeader compact />

            {/* Score card — full width, horizontal layout */}
            <ScoreCard horizontal />

            {/* Inputs row */}
            <View style={styles.inputRow}>
              <View style={styles.inputRowLeft}><IncomeCard /></View>
              <View style={styles.inputRowRight}><ExpensesCard /></View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollBase}
    >
      <View style={styles.container}>
        <AnimatedTreesBackground />
        <View style={styles.contentWrapper}>
          <DashboardHeader />
          <GrassRow emojis={["🌱", "🌿", "🌾", "🌱", "🌿", "🌾", "🌱"]} />
          <ScoreCard />
          <GardenSeparator emojis={["🌸", "🐝", "🌿", "🌼", "🦋"]} />
          <IncomeCard />
          <GardenSeparator emojis={["🌿", "🌼", "🌿", "🌼", "🌿"]} />
          <ExpensesCard />
          <GrassRow emojis={["🌻", "🌸", "🍀", "🌼", "🌺", "🍀", "🌻"]} />
          <FloatingBugs />
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Dashboard Header ────────────────────────────────────────────────────────

function DashboardHeader({ compact = false }: { compact?: boolean }) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,  duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, [floatAnim]);

  if (compact) {
    return (
      <View style={styles.headerCompact}>
        <Animated.Text style={[styles.headerCompactEmoji, { transform: [{ translateY: floatAnim }] }]}>
          🌿
        </Animated.Text>
        <View>
          <Text style={styles.headerCompactTitle}>My Garden Dashboard</Text>
          <Text style={styles.headerCompactSub}>Plant your numbers and watch your budget grow 🌱</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.headerSection}>
      <Animated.View style={[styles.logoContainer, { transform: [{ translateY: floatAnim }] }]}>
        <Text style={styles.logoEmoji}>🌿</Text>
      </Animated.View>
      <Text style={styles.mainTitle}>My Garden Dashboard</Text>
      <Text style={styles.subtitle}>Plant your numbers and watch your budget grow 🌱</Text>
    </View>
  );
}

// ─── Income Card ─────────────────────────────────────────────────────────────

function IncomeCard() {
  const [income, setIncome] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const successScaleAnim = useRef(new Animated.Value(0.5)).current;

  const handleSubmit = async () => {
    const value = parseFloat(income.replace(",", "."));
    if (isNaN(value) || value <= 0) {
      alert("Oops! 🌱 Please enter a valid amount");
      return;
    }
    setLoading(true);
    try {
      await fetch(
        "https://bugetgarden-backend-production-7c3b.up.railway.app/monthly-income",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ income: value }),
        },
      );
      setSubmitted(true);
      Animated.timing(successScaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }).start();
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.cardOuter, styles.cardFlex]}>
      <View style={styles.nailRow}>
        <View style={styles.nail} />
        <View style={styles.nail} />
      </View>

      <View style={[styles.cardInner, styles.cardInnerFlex]}>
        <View>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>🪙 Monthly Harvest</Text>
          </View>
          <Text style={[styles.cardTitle, { marginTop: 10 }]}>What's your monthly income?</Text>
          <Text style={styles.cardHint}>This is the base of your garden budget 🌾</Text>
        </View>

        {submitted ? (
          <SavedState
            emoji="🌻"
            title="Income saved!"
            subtitle="Your harvest is registered 🌿"
            anim={successScaleAnim}
            onEdit={() => {
              setSubmitted(false);
              setIncome("");
              successScaleAnim.setValue(0.5);
            }}
          />
        ) : (
          <>
            <View style={styles.incomeCentered}>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>💰</Text>
                <TextInput
                  style={styles.incomeInput}
                  placeholder="0.00"
                  placeholderTextColor="#5a6b3a"
                  keyboardType="decimal-pad"
                  value={income}
                  onChangeText={(v) =>
                    setIncome(v.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"))
                  }
                />
              </View>
            </View>
            <SubmitButton label="🌱 Save Income" onPress={handleSubmit} loading={loading} />
          </>
        )}
      </View>

      <View style={styles.nailRow}>
        <View style={styles.nail} />
        <View style={styles.nail} />
      </View>
    </View>
  );
}

// ─── Expenses Card ────────────────────────────────────────────────────────────

const EXPENSE_FIELDS = [
  { key: "rent",      emoji: "🏠", label: "Rent / Mortgage" },
  { key: "food",      emoji: "🛒", label: "Food" },
  { key: "utilities", emoji: "💡", label: "Utilities" },
  { key: "other",     emoji: "📦", label: "Other" },
] as const;

type ExpenseKey = (typeof EXPENSE_FIELDS)[number]["key"];

function ExpensesCard() {
  const [values, setValues] = useState<Record<ExpenseKey, string>>({
    rent: "",
    food: "",
    utilities: "",
    other: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const successScaleAnim = useRef(new Animated.Value(0.5)).current;

  const handleSubmit = async () => {
    const parsed = Object.fromEntries(
      EXPENSE_FIELDS.map(({ key }) => [
        key,
        parseFloat(values[key].replace(",", ".")) || 0,
      ]),
    );

    setLoading(true);
    try {
      await fetch(
        "https://bugetgarden-backend-production-7c3b.up.railway.app/monthly-expenses",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed),
        },
      );
      setSubmitted(true);
      Animated.timing(successScaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }).start();
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.cardOuter, styles.cardOuterExpenses, styles.cardFlex]}>
      <View style={styles.nailRow}>
        <View style={[styles.nail, styles.nailOrange]} />
        <View style={[styles.nail, styles.nailOrange]} />
      </View>

      <View style={[styles.cardInner, styles.cardInnerFlex]}>
        <View>
          <View style={[styles.cardBadge, styles.cardBadgeOrange]}>
            <Text style={[styles.cardBadgeText, styles.cardBadgeTextOrange]}>
              🌻 Fixed Monthly Expenses
            </Text>
          </View>
          <Text style={[styles.cardTitle, { marginTop: 10 }]}>What do you spend every month?</Text>
          <Text style={styles.cardHint}>The regular costs that grow like weeds 🌿</Text>
        </View>

        {submitted ? (
          <SavedState
            emoji="🌻"
            title="Expenses saved!"
            subtitle="Your soil is fertilized 🌱"
            anim={successScaleAnim}
            orange
            onEdit={() => {
              setSubmitted(false);
              successScaleAnim.setValue(0.5);
            }}
          />
        ) : (
          <View style={styles.cardFormBottom}>
            <ExpenseFields values={values} setValues={setValues} />
            <View style={styles.divider}>
              {["🌸", "🌿", "🌼", "🌿", "🌸"].map((e, i) => (
                <Text key={i} style={styles.dividerEmoji}>{e}</Text>
              ))}
            </View>
            <SubmitButton label="🌻 Save Expenses" onPress={handleSubmit} loading={loading} orange />
          </View>
        )}
      </View>

      <View style={styles.nailRow}>
        <View style={[styles.nail, styles.nailOrange]} />
        <View style={[styles.nail, styles.nailOrange]} />
      </View>
    </View>
  );
}

// ─── Score Card ──────────────────────────────────────────────────────────────

interface ScoreData {
  total: number;
  dailyControl: number;
  consistency: number;
  savingsRate: number;
  monthlyProgress: number;
}

const SCORE_BARS = [
  { key: "dailyControl",    emoji: "📅", label: "Daily Control"    },
  { key: "consistency",     emoji: "📉", label: "Consistency"      },
  { key: "savingsRate",     emoji: "💰", label: "Savings Rate"     },
  { key: "monthlyProgress", emoji: "🗓️",  label: "Monthly Progress" },
] as const;

const RAINBOW_COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#C77DFF", "#FF6B6B"];

function scoreColor(score: number) {
  if (score === 100) return "#FFD700";
  if (score >= 70)   return "#FFCA28";
  if (score >= 40)   return "#FF9800";
  return "#EF5350";
}

function scoreEmojis(score: number) {
  if (score === 100) return ["🌺", "🌸", "🌼", "🌸", "🌺"];
  if (score >= 70)   return ["🌻", "🌻", "🌻", "🌻", "🌻"];
  if (score >= 40)   return ["🌱", "🌱", "🌱", "🌰", "🌰"];
  return ["🌰", "🌰", "🌰", "🌰", "🌰"];
}

type ScoreKey = keyof ScoreData;

function ScoreCard({ horizontal = false }: { horizontal?: boolean }) {
  const [scores, setScores] = useState<Omit<ScoreData, "total">>({
    dailyControl: 0,
    consistency: 0,
    savingsRate: 0,
    monthlyProgress: 0,
  });

  const total     = Object.values(scores).reduce((a, b) => a + b, 0);
  const isPerfect = total === 100;
  const color     = scoreColor(total);
  const emojis    = scoreEmojis(total);

  const [displayScore, setDisplayScore] = useState(0);
  const countAnim    = useRef(new Animated.Value(0)).current;
  const glowAnim     = useRef(new Animated.Value(0.6)).current;
  const rainbowAnim  = useRef(new Animated.Value(0)).current;
  const perfectScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const id = countAnim.addListener(({ value }) => setDisplayScore(Math.round(value)));
    return () => countAnim.removeListener(id);
  }, [countAnim]);

  useEffect(() => {
    countAnim.stopAnimation();
    Animated.timing(countAnim, {
      toValue: total,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [total]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1,   duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0.6, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ]),
    ).start();
    Animated.loop(
      Animated.timing(rainbowAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: false }),
    ).start();
  }, []);

  useEffect(() => {
    if (isPerfect) {
      Animated.spring(perfectScale, { toValue: 1.12, friction: 3, useNativeDriver: true }).start();
    } else {
      Animated.spring(perfectScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    }
  }, [isPerfect]);

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0.6, 1],
    outputRange: [0.25, 0.6],
  });

  const adjust = (key: keyof typeof scores, delta: number) => {
    setScores((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(25, prev[key] + delta)),
    }));
  };

  const rainbowBorder = rainbowAnim.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: RAINBOW_COLORS,
  });

  return (
    <Animated.View
      style={[
        styles.cardOuter,
        styles.cardOuterScore,
        isPerfect && styles.cardOuterPerfect,
        { borderColor: isPerfect ? rainbowBorder : color, shadowColor: color, shadowOpacity },
      ]}
    >
      <View style={styles.nailRow}>
        <View style={[styles.nail, { backgroundColor: color }]} />
        <View style={[styles.nail, { backgroundColor: color }]} />
      </View>

      <View style={[styles.cardInner, horizontal && styles.cardInnerHorizontal]}>

        {horizontal ? (
          <>
            {/* Left: first 2 bars */}
            <View style={styles.scoreSide}>
              {SCORE_BARS.slice(0, 2).map(({ key, emoji, label }) => (
                <ScoreBar key={key} emoji={emoji} label={label}
                  value={scores[key as keyof typeof scores]} max={25}
                  color={isPerfect ? "#FFD700" : color}
                  onMinus={() => adjust(key as keyof typeof scores, -1)}
                  onPlus={() => adjust(key as keyof typeof scores, 1)}
                />
              ))}
            </View>

            {/* Center: badge + circle + emoji ring */}
            <View style={styles.scoreCenter}>
              {isPerfect ? (
                <PerfectBadge rainbowAnim={rainbowAnim} />
              ) : (
                <View style={[styles.cardBadge, { backgroundColor: `${color}22`, borderColor: `${color}66` }]}>
                  <Text style={[styles.cardBadgeText, { color }]}>🌿 Budget Score</Text>
                </View>
              )}
              <View style={styles.scoreCircleWrapper}>
                {isPerfect && <SparkleRing rainbowAnim={rainbowAnim} />}
                <Animated.View style={[styles.scoreCircle, isPerfect && styles.scoreCirclePerfect,
                  { borderColor: isPerfect ? rainbowBorder : color, shadowColor: color, shadowOpacity, transform: [{ scale: perfectScale }] }
                ]}>
                  {isPerfect ? (
                    <><Text style={styles.scoreNumberPerfect}>100</Text><Text style={styles.scoreTrophy}>🏆</Text></>
                  ) : (
                    <><Text style={[styles.scoreNumber, { color }]}>{displayScore}</Text><Text style={[styles.scoreOutOf, { color }]}>/ 100</Text></>
                  )}
                </Animated.View>
                <View style={styles.emojiRing}>
                  {emojis.map((e, i) => <Text key={i} style={styles.emojiRingItem}>{e}</Text>)}
                </View>
              </View>
            </View>

            {/* Right: last 2 bars */}
            <View style={styles.scoreSide}>
              {SCORE_BARS.slice(2).map(({ key, emoji, label }) => (
                <ScoreBar key={key} emoji={emoji} label={label}
                  value={scores[key as keyof typeof scores]} max={25}
                  color={isPerfect ? "#FFD700" : color}
                  onMinus={() => adjust(key as keyof typeof scores, -1)}
                  onPlus={() => adjust(key as keyof typeof scores, 1)}
                />
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Mobile: badge + circle + all bars below */}
            <View style={[styles.cardBadge, { backgroundColor: `${color}22`, borderColor: `${color}66`, alignSelf: "center" }]}>
              <Text style={[styles.cardBadgeText, { color }]}>🌿 Budget Health Score</Text>
            </View>
            <View style={styles.scoreCircleWrapper}>
              {isPerfect && <SparkleRing rainbowAnim={rainbowAnim} />}
              <Animated.View style={[styles.scoreCircle, isPerfect && styles.scoreCirclePerfect,
                { borderColor: isPerfect ? rainbowBorder : color, shadowColor: color, shadowOpacity, transform: [{ scale: perfectScale }] }
              ]}>
                {isPerfect ? (
                  <><Text style={styles.scoreNumberPerfect}>100</Text><Text style={styles.scoreTrophy}>🏆</Text></>
                ) : (
                  <><Text style={[styles.scoreNumber, { color }]}>{displayScore}</Text><Text style={[styles.scoreOutOf, { color }]}>/ 100</Text></>
                )}
              </Animated.View>
              <View style={styles.emojiRing}>
                {emojis.map((e, i) => <Text key={i} style={styles.emojiRingItem}>{e}</Text>)}
              </View>
            </View>
            <View style={styles.scoreBarsContainer}>
              {SCORE_BARS.map(({ key, emoji, label }) => (
                <ScoreBar key={key} emoji={emoji} label={label}
                  value={scores[key as keyof typeof scores]} max={25}
                  color={isPerfect ? "#FFD700" : color}
                  onMinus={() => adjust(key as keyof typeof scores, -1)}
                  onPlus={() => adjust(key as keyof typeof scores, 1)}
                />
              ))}
            </View>
          </>
        )}
      </View>

      <View style={styles.nailRow}>
        <View style={[styles.nail, { backgroundColor: color }]} />
        <View style={[styles.nail, { backgroundColor: color }]} />
      </View>
    </Animated.View>
  );
}

function PerfectBadge({ rainbowAnim }: { rainbowAnim: Animated.Value }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, [pulseAnim]);

  const badgeColor = rainbowAnim.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: RAINBOW_COLORS,
  });

  return (
    <Animated.View
      style={[styles.perfectBadge, { borderColor: badgeColor, transform: [{ scale: pulseAnim }] }]}
    >
      <Animated.Text style={[styles.perfectBadgeText, { color: badgeColor }]}>
        ✨ PERFECT SCORE! ✨
      </Animated.Text>
    </Animated.View>
  );
}

const SPARKLE_POSITIONS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * 2 * Math.PI;
  const radius = 90;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
});
const SPARKLE_EMOJIS = ["✨", "⭐", "💫", "🌟", "✨", "⭐", "💫", "🌟"];

function SparkleRing({ rainbowAnim }: { rainbowAnim: Animated.Value }) {
  return (
    <View style={styles.sparkleRing} pointerEvents="none">
      {SPARKLE_POSITIONS.map((pos, i) => (
        <SparkleItem key={i} x={pos.x} y={pos.y} emoji={SPARKLE_EMOJIS[i]} delay={i * 150} />
      ))}
    </View>
  );
}

function SparkleItem({ x, y, emoji, delay }: { x: number; y: number; emoji: string; delay: number }) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 700 + delay * 0.2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.6, duration: 700 + delay * 0.2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, [scaleAnim, delay]);

  return (
    <Animated.Text
      style={[
        styles.sparkleItem,
        { left: x + 90, top: y + 90, transform: [{ scale: scaleAnim }] },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

function barFillColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio >= 0.7) return "#4CAF50";
  if (ratio >= 0.4) return "#FF9800";
  return "#EF5350";
}

function ScoreBar({
  emoji, label, value, max, color, onMinus, onPlus,
}: {
  emoji: string;
  label: string;
  value: number;
  max: number;
  color: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: value / max,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const fillWidth = fillAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const fillColor = barFillColor(value, max);

  return (
    <View style={styles.scoreBarRow}>
      <Text style={styles.scoreBarEmoji}>{emoji}</Text>
      <View style={styles.scoreBarContent}>
        <View style={styles.scoreBarHeader}>
          <Text style={styles.scoreBarLabel}>{label}</Text>
          <View style={styles.stepperRow}>
            <Pressable style={[styles.stepperBtn, { borderColor: color }]} onPress={onMinus}>
              <Text style={[styles.stepperBtnText, { color }]}>−</Text>
            </Pressable>
            <Text style={[styles.stepperValue, { color: fillColor }]}>{value}</Text>
            <Pressable style={[styles.stepperBtn, { borderColor: color }]} onPress={onPlus}>
              <Text style={[styles.stepperBtnText, { color }]}>+</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.scoreBarTrack}>
          <Animated.View style={[styles.scoreBarFill, { width: fillWidth, backgroundColor: fillColor }]} />
        </View>
      </View>
    </View>
  );
}

// ─── Saved State ─────────────────────────────────────────────────────────────

function SavedState({
  emoji, title, subtitle, anim, orange = false, onEdit,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  anim: Animated.Value;
  orange?: boolean;
  onEdit: () => void;
}) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -6, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0,  duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, [bounceAnim]);

  const accentColor = orange ? "#FFB300" : "#4CAF50";

  return (
    <Animated.View style={[styles.savedState, { transform: [{ scale: anim }] }]}>
      <Animated.Text style={[styles.savedStateEmoji, { transform: [{ translateY: bounceAnim }] }]}>
        {emoji}
      </Animated.Text>
      <Text style={[styles.savedStateTitle, { color: accentColor }]}>{title}</Text>
      <Text style={styles.savedStateSubtitle}>{subtitle}</Text>
      <Pressable
        style={[styles.savedStateEditBtn, { borderColor: `${accentColor}66` }]}
        onPress={onEdit}
      >
        <Text style={[styles.savedStateEditText, { color: accentColor }]}>✏️ Update</Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Expense Fields ───────────────────────────────────────────────────────────

function ExpenseFields({
  values,
  setValues,
}: {
  values: Record<ExpenseKey, string>;
  setValues: React.Dispatch<React.SetStateAction<Record<ExpenseKey, string>>>;
}) {
  const refs = useRef<Record<ExpenseKey, TextInput | null>>({
    rent: null,
    food: null,
    utilities: null,
    other: null,
  });

  return (
    <View style={styles.expenseFieldsContainer}>
      {EXPENSE_FIELDS.map(({ key, emoji, label }) => (
        <Pressable
          key={key}
          style={styles.expenseRow}
          onPress={() => refs.current[key]?.focus()}
        >
          <Text style={styles.expenseRowEmoji}>{emoji}</Text>
          <Text style={styles.expenseRowLabel}>{label}</Text>
          <TextInput
            ref={(r) => { refs.current[key] = r; }}
            style={styles.expenseInput}
            placeholder="0"
            placeholderTextColor="#6b5a3a"
            keyboardType="decimal-pad"
            value={values[key]}
            onChangeText={(v) => {
              const filtered = v.replace(/[^0-9.,]/g, "");
              setValues((prev) => ({ ...prev, [key]: filtered }));
            }}
          />
        </Pressable>
      ))}
    </View>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function SubmitButton({
  label,
  onPress,
  loading,
  orange = false,
}: {
  label: string;
  onPress: () => void;
  loading: boolean;
  orange?: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.timing(scaleAnim, {
      toValue: 0.94,
      duration: 80,
      useNativeDriver: true,
    }).start();

  const handlePressOut = () =>
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.back(2)),
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          orange && styles.submitButtonOrange,
          pressed && (orange ? styles.submitButtonOrangePressed : styles.submitButtonPressed),
          loading && styles.submitButtonDisabled,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

function GrassRow({ emojis }: { emojis: string[] }) {
  return (
    <View style={styles.grassRow}>
      {emojis.map((e, i) => (
        <Text key={i} style={styles.grassEmoji}>{e}</Text>
      ))}
    </View>
  );
}

function GardenSeparator({ emojis }: { emojis: string[] }) {
  return (
    <View style={styles.separatorContainer}>
      <View style={styles.separatorLine} />
      <View style={styles.separatorEmojis}>
        {emojis.map((e, i) => (
          <FloatingEmoji key={i} emoji={e} delay={i * 200} />
        ))}
      </View>
      <View style={styles.separatorLine} />
    </View>
  );
}

function FloatingEmoji({ emoji, delay }: { emoji: string; delay: number }) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1300 + delay * 0.3,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1300 + delay * 0.3,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [floatAnim, delay]);

  return (
    <Animated.Text
      style={[styles.separatorEmoji, { transform: [{ translateY: floatAnim }] }]}
    >
      {emoji}
    </Animated.Text>
  );
}

const BUGS = [
  { emoji: "🦋", top: 40,  left: 10,  delay: 0   },
  { emoji: "🐝", top: 100, left: 330, delay: 400  },
  { emoji: "🐞", top: 20,  left: 290, delay: 200  },
  { emoji: "🦋", top: 160, left: 40,  delay: 600  },
];

function FloatingBugs() {
  return (
    <View style={styles.bugsContainer} pointerEvents="none">
      {BUGS.map((bug, i) => (
        <FloatingBug key={i} {...bug} />
      ))}
    </View>
  );
}

function FloatingBug({
  emoji, top, left, delay,
}: {
  emoji: string; top: number; left: number; delay: number;
}) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
          duration: 1500 + delay * 0.5,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500 + delay * 0.5,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [floatAnim, delay]);

  return (
    <Animated.Text
      style={[styles.bugEmoji, { top, left, transform: [{ translateY: floatAnim }] }]}
    >
      {emoji}
    </Animated.Text>
  );
}
