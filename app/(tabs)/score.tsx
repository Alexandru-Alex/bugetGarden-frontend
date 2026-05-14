import { ACCOUNT_QUERY_KEY, AccountDto } from "@/lib/query-keys";
import { NavMenu } from "@/components/nav-menu";
import { PageTransition } from "@/components/page-transition";
import { api, getStoredToken } from "@/lib/api";
import { MONTH_LABELS_SHORT } from "@/lib/date";
import { styles } from "@/styles/tabs/score.styles";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Path, Stop } from "react-native-svg";

// ─── Data ─────────────────────────────────────────────────────────────────────

type CategoryType = "behavioral" | "result";

interface Category {
  name: string;
  weight: number;
  type: CategoryType;
  score: number;
}

export interface MonthlyScoreDto {
  month: number;
  year: number;
  finalScore: number;
  loggingStreak: number;
  categoryCoverage: number;
  savingRate: number;
  budgetSetup: number;
  dailyAdherence: number;
}

export interface DailyScoreDto {
  scoreDate: string;
  scoreDelta: number;
  scoreTotal: number;
  incomeTotal: string;
  expenseTotal: string;
}

function buildCategories(dto: MonthlyScoreDto): Category[] {
  return [
    { name: "Logging Streak",         weight: 35, type: "behavioral", score: dto.loggingStreak    },
    { name: "Category Coverage",      weight: 20, type: "behavioral", score: dto.categoryCoverage },
    { name: "Budget Setup",           weight: 15, type: "behavioral", score: dto.budgetSetup      },
    { name: "Savings Rate",           weight: 18, type: "result",     score: dto.savingRate       },
    { name: "Daily Budget Adherence", weight: 12, type: "result",     score: dto.dailyAdherence   },
  ];
}

function computeGroupScore(cats: Category[], type: CategoryType): number {
  const filtered  = cats.filter(c => c.type === type);
  const totalW    = filtered.reduce((s, c) => s + c.weight, 0);
  return Math.round(filtered.reduce((s, c) => s + c.score * c.weight, 0) / totalW);
}

const TIPS = [
  {
    icon: "calendar-outline"          as const,
    title: "Log every day",
    desc: "Logging Streak carries 35% of your score. Even a single entry per day keeps the streak alive.",
    color: "#4E9AF1",
  },
  {
    icon: "wallet-outline"            as const,
    title: "Grow your savings rate",
    desc: "Try auto-allocating 10% of your income to savings before spending. Small habit, big impact.",
    color: "#346739",
  },
  {
    icon: "checkmark-circle-outline"  as const,
    title: "Stick to your daily budget",
    desc: "Review your budget each evening. Staying under your daily limit for 5+ days lifts this score fast.",
    color: "#E8960A",
  },
];

const BEHAVIORAL_COLOR = "#4E9AF1";
const RESULT_COLOR     = "#346739";

function scoreColor(score: number) {
  if (score >= 80) return "#346739";
  if (score >= 60) return "#79AE6F";
  if (score >= 40) return "#E8960A";
  return "#F43F5E";
}

function scoreGrade(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

// ─── Gauge ────────────────────────────────────────────────────────────────────

const GAUGE_SIZE      = 160;
const GAUGE_STROKE    = 18;
const GAUGE_START_DEG = 150;
const GAUGE_SWEEP_DEG = 240;

function polarToCart(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToCart(cx, cy, r, startDeg);
  const end   = polarToCart(cx, cy, r, endDeg);
  const sweep = endDeg - startDeg;
  const large = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

function ScoreGauge({ score }: { score: number }) {
  const cx    = GAUGE_SIZE / 2;
  const cy    = GAUGE_SIZE / 2;
  const r     = (GAUGE_SIZE - GAUGE_STROKE) / 2;
  const clamp = Math.max(0, Math.min(100, score));
  const color = scoreColor(clamp);

  const trackPath    = useMemo(() => arcPath(cx, cy, r, GAUGE_START_DEG, GAUGE_START_DEG + GAUGE_SWEEP_DEG), []);
  const progressPath = useMemo(() => {
    if (clamp <= 0) return null;
    return arcPath(cx, cy, r, GAUGE_START_DEG, GAUGE_START_DEG + GAUGE_SWEEP_DEG * (clamp / 100));
  }, [clamp]);

  return (
    <View style={{ width: GAUGE_SIZE, height: GAUGE_SIZE }}>
      <Svg width={GAUGE_SIZE} height={GAUGE_SIZE} style={StyleSheet.absoluteFill}>
        <Path d={trackPath} fill="none" stroke="#D8EBD6" strokeWidth={GAUGE_STROKE} strokeLinecap="round" />
        {progressPath && (
          <Path d={progressPath} fill="none" stroke={color} strokeWidth={GAUGE_STROKE + 6} strokeLinecap="round" opacity={0.15} />
        )}
        {progressPath && (
          <Path d={progressPath} fill="none" stroke={color} strokeWidth={GAUGE_STROKE} strokeLinecap="round" />
        )}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.gaugeCenter]}>
        <Text style={[styles.gaugeScore, { color }]}>{clamp}</Text>
        <Text style={styles.gaugeMax}>/ 100</Text>
      </View>
    </View>
  );
}

// ─── Compact category card (2-col grid) ───────────────────────────────────────

function CategoryCard({ name, weight, type, score }: Category) {
  const color = type === "behavioral" ? BEHAVIORAL_COLOR : RESULT_COLOR;
  return (
    <View style={styles.catCard}>
      <View style={styles.catCardHeader}>
        <View style={[styles.catCardDot, { backgroundColor: color }]} />
        <Text style={styles.catCardName} numberOfLines={1}>{name}</Text>
        <Text style={styles.catCardWeight}>{weight}%</Text>
      </View>
      <View style={styles.catCardBarTrack}>
        <View style={[styles.catCardBarFill, { width: `${score}%` as any, backgroundColor: color }]} />
      </View>
      <View style={styles.catCardScoreRow}>
        <Text style={styles.catCardScoreValue}>
          {score}<Text style={styles.catCardScoreMax}>/100</Text>
        </Text>
      </View>
    </View>
  );
}

// ─── Score trend chart ────────────────────────────────────────────────────────

const CHART_PAD_X   = 20;
const CHART_PAD_TOP = 28;
const CHART_PAD_BOT = 22;
const CHART_H       = 68;
const CHART_TOTAL_H = CHART_PAD_TOP + CHART_H + CHART_PAD_BOT;

function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cx = (curr.x - prev.x) * 0.45;
    d += ` C ${prev.x + cx} ${prev.y} ${curr.x - cx} ${curr.y} ${curr.x} ${curr.y}`;
  }
  return d;
}

interface ChartPoint {
  label: string;
  score: number;
  showLabel: boolean;
}

function ScoreHistory({ data, subtitle }: { data: ChartPoint[]; subtitle?: string }) {
  const [cw, setCw] = useState(0);

  const pts = useMemo(() => {
    if (cw === 0 || data.length < 2) return [];
    return data.map((d, i) => ({
      x: CHART_PAD_X + (i * (cw - 2 * CHART_PAD_X)) / (data.length - 1),
      y: CHART_PAD_TOP + (1 - d.score / 100) * CHART_H,
      score: d.score,
      label: d.label,
      showLabel: d.showLabel,
      color: scoreColor(d.score),
      isCurrent: i === data.length - 1,
    }));
  }, [cw, data]);

  const linePath = useMemo(() => smoothPath(pts), [pts]);
  const areaPath = useMemo(() => {
    if (pts.length === 0) return "";
    const bottom = CHART_PAD_TOP + CHART_H;
    return `${linePath} L ${pts[pts.length - 1].x} ${bottom} L ${pts[0].x} ${bottom} Z`;
  }, [linePath, pts]);

  const latestColor = data.length > 0 ? scoreColor(data[data.length - 1].score) : "#346739";
  const hasData = data.length >= 2;

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Score Trend</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      <View
        style={styles.trendChart}
        onLayout={e => setCw(Math.floor(e.nativeEvent.layout.width))}
      >
        {!hasData ? (
          <View style={styles.trendEmptyInner}>
            <Text style={styles.trendEmptyText}>Log entries to start tracking your daily score.</Text>
          </View>
        ) : cw > 0 && (
          <>
          <Svg width={cw} height={CHART_TOTAL_H}>
            <Defs>
              <SvgLinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={latestColor} stopOpacity="0.2" />
                <Stop offset="1" stopColor={latestColor} stopOpacity="0.01" />
              </SvgLinearGradient>
            </Defs>

            <Path d={areaPath} fill="url(#areaGrad)" />

            <Path
              d={linePath}
              fill="none"
              stroke={latestColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.75}
            />

            {pts.map((pt, i) => (
              <React.Fragment key={i}>
                {pt.showLabel && (
                  <>
                    <Circle cx={pt.x} cy={pt.y} r={pt.isCurrent ? 9 : 6} fill={pt.color} opacity={0.12} />
                    <Circle cx={pt.x} cy={pt.y} r={pt.isCurrent ? 6 : 4} fill={pt.color} />
                  </>
                )}
                {pt.isCurrent && <Circle cx={pt.x} cy={pt.y} r={2.5} fill="white" />}
              </React.Fragment>
            ))}
          </Svg>

          {pts.filter(pt => pt.showLabel).map(pt => (
            <Text
              key={`s-${pt.label}`}
              style={[
                styles.trendScoreLabel,
                pt.isCurrent && styles.trendScoreLabelCurrent,
                { left: pt.x - 16, top: pt.y - 22, color: pt.color },
              ]}
            >
              {pt.score}
            </Text>
          ))}

          {pts.filter(pt => pt.showLabel).map(pt => (
            <Text
              key={`w-${pt.label}`}
              style={[
                styles.trendWeekLabel,
                pt.isCurrent && styles.trendWeekLabelCurrent,
                {
                  left: pt.x - 12,
                  top: CHART_PAD_TOP + CHART_H + 5,
                  color: pt.isCurrent ? "#346739" : "#9FCB98",
                },
              ]}
            >
              {pt.label}
            </Text>
          ))}
          </>
        )}
      </View>
    </View>
  );
}

// ─── Improvement tips ─────────────────────────────────────────────────────────

function ImprovementTips() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>How to Improve</Text>
      <View style={styles.tipsList}>
        {TIPS.map((tip) => (
          <View key={tip.title} style={[styles.tipRow, { borderLeftColor: tip.color }]}>
            <View style={[styles.tipIconWrap, { backgroundColor: tip.color + "22" }]}>
              <Ionicons name={tip.icon} size={20} color={tip.color} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ScoreScreen() {
  const { width } = useWindowDimensions();
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    getStoredToken().then(setToken);
  }, []);

  const [month, year] = useMemo(() => {
    const now = new Date();
    return [now.getMonth() + 1, now.getFullYear()] as const;
  }, []);

  const { data: account } = useQuery<AccountDto>({
    queryKey: ACCOUNT_QUERY_KEY,
    queryFn: () => api.get<AccountDto>("/accounts"),
    enabled: !!token,
    staleTime: Infinity,
  });

  const { data: monthly } = useQuery<MonthlyScoreDto>({
    queryKey: ["budget-score", "monthly", month, year],
    queryFn: () => api.get<MonthlyScoreDto>(`/budget-score/monthly?month=${month}&year=${year}`),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const { data: history } = useQuery<MonthlyScoreDto[]>({
    queryKey: ["budget-score", "history", year],
    queryFn: () => api.get<MonthlyScoreDto[]>(`/budget-score/history?year=${year}`),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const { data: dailyScores } = useQuery<DailyScoreDto[]>({
    queryKey: ["budget-score", "daily", month, year],
    queryFn: () => api.get<DailyScoreDto[]>(`/budget-score/daily?month=${month}&year=${year}`),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const dailyPoints = useMemo((): ChartPoint[] => {
    if (!dailyScores || dailyScores.length === 0) return [];
    return [...dailyScores]
      .sort((a, b) => new Date(a.scoreDate).getTime() - new Date(b.scoreDate).getTime())
      .map(d => ({
        label:     String(new Date(d.scoreDate).getDate()),
        score:     d.scoreTotal,
        showLabel: true,
      }));
  }, [dailyScores]);

  const prevMonthScore = useMemo(() => {
    if (!history) return null;
    const prev = history.find(h => h.month === month - 1 && h.year === year);
    return prev?.finalScore ?? null;
  }, [history, month, year]);

  const { categories, behavioralScore, resultScore } = useMemo(() => {
    if (!monthly) return { categories: [], behavioralScore: 0, resultScore: 0 };
    const cats = buildCategories(monthly);
    return {
      categories:     cats,
      behavioralScore: computeGroupScore(cats, "behavioral"),
      resultScore:     computeGroupScore(cats, "result"),
    };
  }, [monthly]);

  const dailyDelta = useMemo(() => {
    if (!dailyScores || dailyScores.length < 2) return null;
    const sorted = [...dailyScores].sort(
      (a, b) => new Date(a.scoreDate).getTime() - new Date(b.scoreDate).getTime()
    );
    const last = Number(sorted[sorted.length - 1].scoreTotal);
    const prev = Number(sorted[sorted.length - 2].scoreTotal);
    if (isNaN(last) || isNaN(prev)) return null;
    return last - prev;
  }, [dailyScores]);

  if (token === undefined) return null;
  if (!token) return <Redirect href="/landing" />;

  const total = monthly?.finalScore ?? account?.totalScore ?? 0;
  const color = scoreColor(total);
  const grade = scoreGrade(total);

  const monthChange = prevMonthScore != null ? total - prevMonthScore : null;

  const trendSubtitle = MONTH_LABELS_SHORT[month - 1] + " " + year;

  return (
    <PageTransition style={styles.root}>
      <NavMenu />

      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[styles.header, Platform.OS === "web" && { paddingTop: 56 }]}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerSection}>
            <Text style={styles.headerLabel}>Budget Score</Text>
            <Text style={styles.headerSubtitle}>Your financial health score</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>

          {/* ── Gauge centered, info on both sides ── */}
          <View style={styles.gaugeTriple}>

            {/* Left panel — right-aligned */}
            <View style={[styles.sidePanel, styles.sidePanelLeft]}>
              <View style={styles.sideStat}>
                <Text style={styles.sideStatValue}>{behavioralScore}</Text>
                <Text style={styles.sideStatLabel}>Behavioral</Text>
              </View>
              <View style={styles.sideDivider} />
              <View style={styles.sideStat}>
                <Text style={[styles.sideStatValue, {
                  color: dailyDelta == null ? "#1A2A1A" : dailyDelta >= 0 ? "#346739" : "#F43F5E"
                }]}>
                  {dailyDelta == null ? "—" : (dailyDelta >= 0 ? "+" : "") + dailyDelta}
                </Text>
                <Text style={styles.sideStatLabel}>vs yesterday</Text>
              </View>
            </View>

            {/* Gauge */}
            <ScoreGauge score={total} />

            {/* Right panel — left-aligned */}
            <View style={[styles.sidePanel, styles.sidePanelRight]}>
              <View style={styles.sideStat}>
                <Text style={[styles.sideStatGrade, { color }]}>{grade}</Text>
                <Text style={styles.sideStatLabel}>Financial grade</Text>
              </View>
              <View style={styles.sideDivider} />
              <View style={styles.sideStat}>
                <Text style={styles.sideStatValue}>{resultScore}</Text>
                <Text style={styles.sideStatLabel}>Results</Text>
              </View>
            </View>

          </View>

          {/* ── Sections — half-width + centered on wide screens ── */}
          <View style={[
            styles.sectionsContainer,
            width > 500 && { maxWidth: Math.floor(width * 0.5) },
          ]}>
            {categories.length >= 5 && (
              <View style={styles.catSection}>
                <Text style={styles.sectionTitle}>Category Breakdown</Text>
                <View style={styles.catGrid}>
                  {categories.slice(0, 4).map(cat => (
                    <CategoryCard key={cat.name} {...cat} />
                  ))}
                </View>
                <View style={styles.catGridCenter}>
                  <CategoryCard {...categories[4]} />
                </View>
              </View>
            )}

            <ScoreHistory data={dailyPoints} subtitle={trendSubtitle} />
            <ImprovementTips />
          </View>
        </View>
      </ScrollView>
    </PageTransition>
  );
}
