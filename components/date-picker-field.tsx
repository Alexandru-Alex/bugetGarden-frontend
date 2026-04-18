import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface Props {
  value: Date | null;
  onChange: (date: Date) => void;
  quickPicks?: boolean;
}

export function DatePickerField({ value, onChange, quickPicks = true }: Props) {
  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);
  const yesterday = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - 1); d.setHours(0, 0, 0, 0); return d;
  }, []);

  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState(() => {
    const d = value ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const isToday = value !== null && isSameDay(value, today);
  const isYesterday = value !== null && isSameDay(value, yesterday);
  const isCustom = value !== null && !isToday && !isYesterday;
  const calActive = isCustom || showCalendar;

  const calDays = useMemo(() => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const offset = firstDow === 0 ? 6 : firstDow - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [calMonth]);

  return (
    <View>
      <View style={s.row}>
        {quickPicks && (
          <>
            <Pressable
              style={[s.pill, isToday && s.pillActive]}
              onPress={() => { onChange(new Date(today)); setShowCalendar(false); }}
            >
              <Text style={[s.pillText, isToday && s.pillTextActive]}>Today</Text>
            </Pressable>
            <Pressable
              style={[s.pill, isYesterday && s.pillActive]}
              onPress={() => { onChange(new Date(yesterday)); setShowCalendar(false); }}
            >
              <Text style={[s.pillText, isYesterday && s.pillTextActive]}>Yesterday</Text>
            </Pressable>
          </>
        )}
        <Pressable
          style={[s.pill, s.pillCal, calActive && s.pillActive]}
          onPress={() => setShowCalendar((v) => !v)}
        >
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={16}
            color={calActive ? "#FFFFFF" : "#346739"}
          />
          <Text style={[s.pillText, calActive && s.pillTextActive]}>
            {isCustom
              ? value!.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Pick date"}
          </Text>
        </Pressable>
      </View>

      {showCalendar && (
        <View style={s.calBox}>
          <View style={s.calMonthRow}>
            <Pressable
              onPress={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              hitSlop={8}
              style={s.calArrow}
            >
              <MaterialCommunityIcons name="chevron-left" size={22} color="#346739" />
            </Pressable>
            <Text style={s.calMonthLabel}>
              {calMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </Text>
            <Pressable
              onPress={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              hitSlop={8}
              style={s.calArrow}
            >
              <MaterialCommunityIcons name="chevron-right" size={22} color="#346739" />
            </Pressable>
          </View>
          <View style={s.calHeaders}>
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <Text key={d} style={s.calHeader}>{d}</Text>
            ))}
          </View>
          <View style={s.calGrid}>
            {calDays.map((day, i) => {
              if (!day) return <View key={`e${i}`} style={s.calCell} />;
              const sel = value !== null && isSameDay(day, value);
              const tod = isSameDay(day, today);
              return (
                <Pressable
                  key={day.toISOString()}
                  style={[s.calCell, sel && s.calCellSel, !sel && tod && s.calCellToday]}
                  onPress={() => { onChange(day); setShowCalendar(false); }}
                >
                  <Text style={[s.calCellText, sel && s.calCellTextSel, !sel && tod && s.calCellTextToday]}>
                    {day.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F0F8F0",
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
  },
  pillActive: {
    backgroundColor: "#346739",
    borderColor: "#346739",
  },
  pillCal: {
    flex: 1,
  },
  pillText: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "#346739",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  calBox: {
    backgroundColor: "#F7FCF7",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
    padding: 12,
    marginTop: 10,
  },
  calMonthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  calArrow: {
    padding: 4,
  },
  calMonthLabel: {
    fontSize: 14,
    fontFamily: "Nunito_800ExtraBold",
    color: "#1A2A1A",
  },
  calHeaders: {
    flexDirection: "row",
    marginBottom: 6,
  },
  calHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    color: "#7AAA7A",
    textTransform: "uppercase",
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calCellSel: {
    backgroundColor: "#346739",
    borderRadius: 999,
  },
  calCellToday: {
    backgroundColor: "#E8F0E8",
    borderRadius: 999,
  },
  calCellText: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "#1A2A1A",
  },
  calCellTextSel: {
    color: "#FFFFFF",
    fontFamily: "Nunito_800ExtraBold",
  },
  calCellTextToday: {
    color: "#346739",
    fontFamily: "Nunito_800ExtraBold",
  },
});
