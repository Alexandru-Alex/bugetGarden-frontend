import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Props {
  value: Date | null;
  onChange: (date: Date) => void;
}

export function MonthPickerField({ value, onChange }: Props) {
  const { currentYear, currentMonth } = useMemo(() => {
    const now = new Date();
    return { currentYear: now.getFullYear(), currentMonth: now.getMonth() };
  }, []);

  const [showPicker, setShowPicker] = useState(false);
  const [year, setYear] = useState(() => value?.getFullYear() ?? currentYear);

  useEffect(() => {
    setYear(value ? value.getFullYear() : currentYear);
  }, [value]);

  const selectedYear = value?.getFullYear() ?? null;
  const selectedMonth = value?.getMonth() ?? null;

  const label =
    value !== null
      ? value.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "Pick month";

  const isActive = value !== null || showPicker;

  const handleSelect = (monthIdx: number) => {
    onChange(new Date(year, monthIdx, 1));
    setShowPicker(false);
  };

  return (
    <View>
      <Pressable
        style={[s.pill, isActive && s.pillActive]}
        onPress={() => setShowPicker((v) => !v)}
      >
        <MaterialCommunityIcons
          name="calendar-month-outline"
          size={16}
          color={isActive ? "#FFFFFF" : "#346739"}
        />
        <Text style={[s.pillText, isActive && s.pillTextActive]}>{label}</Text>
      </Pressable>

      {showPicker && (
        <View style={s.pickerBox}>
          <View style={s.yearRow}>
            <Pressable
              hitSlop={8}
              style={s.arrow}
              onPress={() => setYear((y) => y - 1)}
            >
              <MaterialCommunityIcons name="chevron-left" size={22} color="#346739" />
            </Pressable>
            <Text style={s.yearLabel}>{year}</Text>
            <Pressable
              hitSlop={8}
              style={s.arrow}
              onPress={() => setYear((y) => y + 1)}
            >
              <MaterialCommunityIcons name="chevron-right" size={22} color="#346739" />
            </Pressable>
          </View>

          <View style={s.monthGrid}>
            {MONTHS.map((name, idx) => {
              const isPast = year < currentYear || (year === currentYear && idx < currentMonth);
              const isSel = year === selectedYear && idx === selectedMonth;
              return (
                <Pressable
                  key={name}
                  style={[s.monthCell, isSel && s.monthCellSel, isPast && s.monthCellPast]}
                  onPress={() => handleSelect(idx)}
                  disabled={isPast}
                >
                  <Text style={[s.monthText, isSel && s.monthTextSel, isPast && s.monthTextPast]}>
                    {name}
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
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F8F0",
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
    alignSelf: "flex-start",
  },
  pillActive: {
    backgroundColor: "#346739",
    borderColor: "#346739",
  },
  pillText: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "#346739",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  pickerBox: {
    backgroundColor: "#F7FCF7",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
    padding: 12,
    marginTop: 10,
  },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  arrow: {
    padding: 4,
  },
  yearLabel: {
    fontSize: 15,
    fontFamily: "Nunito_800ExtraBold",
    color: "#1A2A1A",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  monthCell: {
    width: "23%",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#EDF5ED",
  },
  monthCellSel: {
    backgroundColor: "#346739",
  },
  monthCellPast: {
    backgroundColor: "transparent",
  },
  monthText: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "#346739",
  },
  monthTextSel: {
    color: "#FFFFFF",
    fontFamily: "Nunito_800ExtraBold",
  },
  monthTextPast: {
    color: "#C8DFC6",
  },
});
