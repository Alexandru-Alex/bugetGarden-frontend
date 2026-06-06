import { formatAmount } from "@/lib/currency";
import { formatDateISO } from "@/lib/date";
import { FinancialSummaryItem } from "@/lib/types";

export type InsightPeriod = "Day" | "Week" | "Month" | "Year" | "Period";

export interface Insight {
  key: string;
  text: string;
}

export function getPreviousPeriodRange(
  period: InsightPeriod,
  today: Date = new Date(),
): { start: string; end: string } | null {
  if (period === "Period") return null;

  const d = new Date(today);

  if (period === "Day") {
    d.setDate(d.getDate() - 1);
    const s = formatDateISO(d);
    return { start: s, end: s };
  }

  if (period === "Week") {
    const dow = d.getDay(); // 0 = Sunday
    const offsetToMonday = dow === 0 ? -6 : 1 - dow;
    const thisMonday = new Date(d);
    thisMonday.setDate(d.getDate() + offsetToMonday);
    const prevMonday = new Date(thisMonday);
    prevMonday.setDate(thisMonday.getDate() - 7);
    const prevSunday = new Date(prevMonday);
    prevSunday.setDate(prevMonday.getDate() + 6);
    return { start: formatDateISO(prevMonday), end: formatDateISO(prevSunday) };
  }

  if (period === "Month") {
    const prevStart = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    const prevEnd = new Date(d.getFullYear(), d.getMonth(), 0);
    return { start: formatDateISO(prevStart), end: formatDateISO(prevEnd) };
  }

  // Year
  const prevYear = d.getFullYear() - 1;
  return { start: `${prevYear}-01-01`, end: `${prevYear}-12-31` };
}

function periodLabel(period: InsightPeriod): string {
  const map: Record<InsightPeriod, string> = {
    Day: "day",
    Week: "week",
    Month: "month",
    Year: "year",
    Period: "period",
  };
  return map[period];
}

export function computeInsights(
  curExpense: FinancialSummaryItem[],
  prevExpense: FinancialSummaryItem[],
  curIncome: FinancialSummaryItem[],
  prevIncome: FinancialSummaryItem[],
  symbol: string,
  decimals: number,
  period: InsightPeriod,
): Insight[] {
  const insights: Insight[] = [];
  const label = periodLabel(period);
  const hasPrev = prevExpense.length > 0 || prevIncome.length > 0;

  const curExpMap = new Map(curExpense.map((i) => [i.name, Number(i.total)]));
  const prevExpMap = new Map(prevExpense.map((i) => [i.name, Number(i.total)]));

  // 1. Biggest drop (category that shrank the most %)
  if (hasPrev) {
    let best: { name: string; pct: number } | null = null;
    for (const [name, cur] of curExpMap) {
      const prev = prevExpMap.get(name);
      if (!prev || prev === 0) continue;
      const pct = Math.round(((prev - cur) / prev) * 100);
      if (pct >= 10 && (!best || pct > best.pct)) best = { name, pct };
    }
    if (best) {
      insights.push({
        key: "biggest_drop",
        text: `📉 You spent ${best.pct}% less on ${best.name} vs last ${label}`,
      });
    }
  }

  // 2. Biggest spike (category that grew the most %)
  if (hasPrev) {
    let best: { name: string; pct: number } | null = null;
    for (const [name, cur] of curExpMap) {
      const prev = prevExpMap.get(name);
      if (!prev || prev === 0) continue;
      const pct = Math.round(((cur - prev) / prev) * 100);
      if (pct >= 10 && (!best || pct > best.pct)) best = { name, pct };
    }
    if (best) {
      insights.push({
        key: "biggest_spike",
        text: `📈 Spending on ${best.name} is up ${best.pct}% vs last ${label}`,
      });
    }
  }

  // 3. Top expense category
  const sorted = [...curExpMap.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    const [name, amount] = sorted[0];
    insights.push({
      key: "top_category",
      text: `🏆 Biggest expense: ${symbol}${formatAmount(amount, decimals)} on ${name}`,
    });
  }

  // 4. Savings rate
  const totalIncome = curIncome.reduce((s, i) => s + Number(i.total), 0);
  const totalExpense = curExpense.reduce((s, i) => s + Number(i.total), 0);
  if (totalIncome > 0) {
    const pct = Math.round(((totalIncome - totalExpense) / totalIncome) * 100);
    if (pct > 0) {
      insights.push({
        key: "savings_rate",
        text: `💰 You saved ${pct}% of your income this ${label}`,
      });
    }
  }

  // 5. Income coverage
  if (totalExpense > 0 && totalIncome > 0) {
    const pct = Math.round((totalIncome / totalExpense) * 100);
    insights.push({
      key: "income_cover",
      text: `✅ Your income covers ${pct}% of your expenses`,
    });
  }

  // 6. First-time category (in current but not in prev)
  if (prevExpense.length > 0) {
    for (const [name] of curExpMap) {
      if (!prevExpMap.has(name)) {
        insights.push({
          key: "new_category",
          text: `✨ First time spending on ${name} this ${label}`,
        });
        break;
      }
    }
  }

  return insights;
}
