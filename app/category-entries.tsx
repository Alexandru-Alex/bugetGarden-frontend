import { NavMenu } from "@/components/nav-menu";
import { api } from "@/lib/api";
import { styles } from "@/styles/category-entries.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FinancialEntryDto {
  id: string;
  amount: number;
  description: string;
  entryDate: string;
  categoryName: string;
  icon: string;
  color: string;
}

interface PagedResponse {
  content: FinancialEntryDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface Section {
  title: string;
  data: FinancialEntryDto[];
}

const PAGE_SIZE = 20;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatEntryDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${parseInt(day, 10)} ${MONTHS[parseInt(month, 10) - 1]} ${year}`;
}

function formatAmount(amount: number) {
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function groupByDate(entries: FinancialEntryDto[]): Section[] {
  const map = new Map<string, FinancialEntryDto[]>();
  for (const entry of entries) {
    const group = map.get(entry.entryDate) ?? [];
    group.push(entry);
    map.set(entry.entryDate, group);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => ({ title: formatEntryDate(date), data }));
}

export default function CategoryEntriesScreen() {
  const { categoryId, categoryName, color, type, symbol } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
    color: string;
    type: "EXPENSE" | "INCOME";
    symbol: string;
  }>();

  const [sortBy, setSortBy] = useState<"date" | "amount">("date");

  const { width } = useWindowDimensions();
  const compact = width < 500;
  const insets = useSafeAreaInsets();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["financial-entries", categoryId],
    queryFn: ({ pageParam = 0 }) =>
      api.get<PagedResponse>(`/financial-entries?categoryId=${categoryId}&page=${pageParam}&size=${PAGE_SIZE}`),
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
    enabled: !!categoryId,
    staleTime: 30_000,
  });

  const allEntries = useMemo(
    () => data?.pages.flatMap((p) => p.content ?? []) ?? [],
    [data],
  );
  const sections = useMemo(() => {
    const grouped = groupByDate(allEntries);
    if (sortBy === "amount") {
      return grouped.map((section) => ({
        ...section,
        data: [...section.data].sort((a, b) => b.amount - a.amount),
      }));
    }
    return grouped;
  }, [allEntries, sortBy]);

  const renderSectionHeader = ({ section }: { section: Section }) => {
    const isFirst = sections[0]?.title === section.title;
    return (
      <View style={[styles.sectionHeader, !compact && styles.sectionHeaderWide]}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
        {isFirst && (
          <Pressable
            style={({ pressed }) => [styles.sortBtn, pressed && styles.sortBtnPressed]}
            onPress={() => setSortBy((prev) => prev === "date" ? "amount" : "date")}
          >
            <MaterialCommunityIcons
              name={sortBy === "date" ? "sort-clock-descending-outline" : "sort-numeric-descending"}
              size={14}
              color="#79AE6F"
            />
            <Text style={styles.sortBtnText}>
              {sortBy === "date" ? "Date" : "Amount"}
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  const renderItem = ({ item }: { item: FinancialEntryDto }) => (
    <Pressable
      style={({ pressed }) => [
        styles.entryCard,
        !compact && styles.entryCardWide,
        pressed && styles.entryCardPressed,
      ]}
      onPress={() =>
        router.push({
          pathname: "/edit-entry",
          params: {
            entryId: item.id,
            amount: String(item.amount),
            description: item.description ?? "",
            entryDate: item.entryDate,
            symbol,
            categoryId,
          },
        })
      }
    >
      <View style={[styles.iconBox, { backgroundColor: item.color + "18" }]}>
        <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={styles.entryCenter}>
        <Text style={styles.entryCategory}>{item.categoryName}</Text>
        {!!item.description && (
          <Text style={styles.entryDescription} numberOfLines={1}>{item.description}</Text>
        )}
      </View>
      <Text style={styles.entryAmount}>
        {symbol}{formatAmount(item.amount)}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.root}>
      <NavMenu />
      <LinearGradient
        colors={["#2A4A2E", "#346739"]}
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 56 : insets.top + 56 },
        ]}
      >
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <View style={styles.headerSubRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/dashboard")}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerSubCenter}>
            <View style={[styles.headerDot, { backgroundColor: color }]} />
            <Text style={styles.headerSubLabel}>
              {type === "EXPENSE" ? "Expenses" : "Income"}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#346739" />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Could not load entries. Pull to retry.</Text>
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No entries for this category</Text>
        </View>
      ) : (
        <SectionList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          onEndReachedThreshold={0.3}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                style={styles.footerSpinner}
                size="small"
                color="#346739"
              />
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#346739"
              colors={["#346739"]}
            />
          }
        />
      )}
    </View>
  );
}
