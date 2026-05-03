import { NavMenu } from "@/components/nav-menu";
import { api } from "@/lib/api";
import { styles } from "@/styles/goal-transactions.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuestProgress } from "@/hooks/use-quest-progress";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ───────────────────────────────────────────────────────────────────────

type GoalTransactionType = "deposit" | "withdraw";

interface GoalTransactionDto {
  id: string;
  amount: number;
  type: GoalTransactionType;
  note: string | null;
  createdAt: string;
}

interface PagedResponse {
  content: GoalTransactionDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface Section {
  title: string;
  data: GoalTransactionDto[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PAGE_SIZE = 20;

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${parseInt(day, 10)} ${MONTHS[parseInt(month, 10) - 1]} ${year}`;
}

function formatAmount(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function groupByDate(txs: GoalTransactionDto[]): Section[] {
  const map = new Map<string, GoalTransactionDto[]>();
  for (const tx of txs) {
    const group = map.get(tx.createdAt) ?? [];
    group.push(tx);
    map.set(tx.createdAt, group);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => ({ title: formatDate(date), data }));
}

// ─── EditGoalTransactionModal ─────────────────────────────────────────────────────

interface EditGoalTransactionModalProps {
  tx: GoalTransactionDto | null;
  symbol: string;
  goalId: string;
  onClose: () => void;
}

function EditGoalTransactionModal({ tx, symbol, goalId, onClose }: EditGoalTransactionModalProps) {
  const queryClient = useQueryClient();
  const { checkProgress } = useQuestProgress();
  const [amountInput, setAmountInput] = useState("");
  const [txType, setTxType] = useState<GoalTransactionType>("deposit");
  const [note, setNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorToast, setErrorToast] = useState("");

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(""), 3000);
  };

  useEffect(() => {
    if (tx) {
      setAmountInput(String(tx.amount));
      setTxType(tx.type);
      setNote(tx.note ?? "");
      setConfirmDelete(false);
    }
  }, [tx?.id]);

  const handleClose = () => {
    setConfirmDelete(false);
    onClose();
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      api.put("/goals/transaction", {
        transactionId: tx?.id,
        amount: parseInt(amountInput, 10),
        type: txType.toUpperCase(),
        note: note.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-transactions", goalId] });
      queryClient.invalidateQueries({ queryKey: ["goals", "active"] });
      handleClose();
      void checkProgress();
    },
    onError: (err: Error) => showError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/goals/transaction?transactionId=${tx?.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-transactions", goalId] });
      queryClient.invalidateQueries({ queryKey: ["goals", "active"] });
      handleClose();
      void checkProgress();
    },
  });

  const canSave = amountInput.length > 0 && parseInt(amountInput, 10) > 0;
  const isBusy = saveMutation.isPending || deleteMutation.isPending;

  if (!tx) return null;

  return (
    <Modal visible={!!tx} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: "100%", paddingHorizontal: 20 }}
          >
            <View
              style={[styles.modalCard, { width: "100%", maxWidth: 400, alignSelf: "center" }]}
              {...(Platform.OS === "web" ? { onClick: (e: any) => e.stopPropagation() } : {})}
            >
              <Text style={styles.modalTitle}>Edit Transaction</Text>

              <View style={styles.typeRow}>
                <Pressable
                  style={[styles.tabPill, txType === "deposit" && styles.tabPillActive]}
                  onPress={() => setTxType("deposit")}
                >
                  <Text style={[styles.tabPillText, txType === "deposit" && styles.tabPillTextActive]}>
                    Deposit
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.tabPill, txType === "withdraw" && styles.tabPillActive]}
                  onPress={() => setTxType("withdraw")}
                >
                  <Text style={[styles.tabPillText, txType === "withdraw" && styles.tabPillTextActive]}>
                    Withdraw
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.fieldLabel}>Amount</Text>
              <TextInput
                style={[
                  styles.textInput,
                  Platform.select({ web: { outlineStyle: "none", outlineWidth: 0 } as any }),
                ]}
                value={amountInput}
                onChangeText={(v) => setAmountInput(v.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#bbb"
                autoFocus
              />

              <Text style={styles.fieldLabel}>Note (optional)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  Platform.select({ web: { outlineStyle: "none", outlineWidth: 0 } as any }),
                ]}
                value={note}
                onChangeText={setNote}
                placeholder="e.g. Monthly savings"
                placeholderTextColor="#bbb"
              />

              <View style={styles.modalButtons}>
                <Pressable style={styles.cancelBtn} onPress={handleClose} disabled={isBusy}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.saveBtn, (!canSave || isBusy) && { opacity: 0.6 }]}
                  onPress={() => { if (canSave && !isBusy) saveMutation.mutate(); }}
                  disabled={!canSave || isBusy}
                >
                  {saveMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveText}>Save</Text>
                  )}
                </Pressable>
              </View>

              {confirmDelete ? (
                <View style={styles.confirmBox}>
                  <Text style={styles.confirmText}>Delete this transaction?</Text>
                  <View style={styles.confirmRow}>
                    <Pressable
                      style={({ pressed }) => [styles.confirmCancel, pressed && styles.confirmCancelPressed]}
                      onPress={() => setConfirmDelete(false)}
                    >
                      <Text style={styles.confirmCancelText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.confirmDelete, pressed && styles.confirmDeletePressed]}
                      onPress={() => deleteMutation.mutate()}
                      disabled={isBusy}
                    >
                      {deleteMutation.isPending ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.confirmDeleteText}>Delete</Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
                  onPress={() => setConfirmDelete(true)}
                  disabled={isBusy}
                >
                  <Text style={styles.deleteBtnText}>Delete transaction</Text>
                </Pressable>
              )}

            </View>
          </KeyboardAvoidingView>

          {!!errorToast && (
            <View style={styles.errorToast} pointerEvents="none">
              <Text style={styles.errorToastText}>{errorToast}</Text>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────────

export default function GoalTransactionsScreen() {
  const { goalId, goalName, goalColor, symbol, goalStatus } = useLocalSearchParams<{
    goalId: string;
    goalName: string;
    goalColor: string;
    symbol: string;
    goalStatus: string;
  }>();

  const isReadOnly = goalStatus === "completed" || goalStatus === "cancelled";

  const { width } = useWindowDimensions();
  const compact = width < 500;
  const insets = useSafeAreaInsets();
  const [selectedTx, setSelectedTx] = useState<GoalTransactionDto | null>(null);

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
    queryKey: ["goal-transactions", goalId],
    queryFn: ({ pageParam = 0 }) =>
      api.get<PagedResponse>(`/goals/transaction?goalId=${goalId}&page=${pageParam}&size=${PAGE_SIZE}`),
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
    enabled: !!goalId,
    staleTime: 30_000,
  });

  const allTxs = useMemo(
    () => data?.pages.flatMap((p) => p.content ?? []) ?? [],
    [data],
  );

  const sections = useMemo(() => groupByDate(allTxs), [allTxs]);

  const renderSectionHeader = useCallback(({ section }: { section: Section }) => (
    <View style={[styles.sectionHeader, !compact && styles.sectionHeaderWide]}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  ), [compact]);

  const renderItem = useCallback(({ item }: { item: GoalTransactionDto }) => {
    const isDeposit = item.type === "deposit";
    return (
      <Pressable
        style={({ pressed }) => [
          styles.txCard,
          !compact && styles.txCardWide,
          pressed && !isReadOnly && styles.txCardPressed,
        ]}
        onPress={() => { if (!isReadOnly) setSelectedTx(item); }}
      >
        <View style={[styles.iconBox, { backgroundColor: isDeposit ? "#EAF3E8" : "#FDECEA" }]}>
          <MaterialCommunityIcons
            name={isDeposit ? "arrow-up-circle-outline" : "arrow-down-circle-outline"}
            size={26}
            color={isDeposit ? "#346739" : "#E74C3C"}
          />
        </View>
        <View style={styles.txCenter}>
          <Text style={styles.txType}>{isDeposit ? "Deposit" : "Withdraw"}</Text>
          {!!item.note && (
            <Text style={styles.txNote} numberOfLines={1}>{item.note}</Text>
          )}
        </View>
        <Text style={[styles.txAmount, { color: isDeposit ? "#346739" : "#E74C3C" }]}>
          {isDeposit ? "+" : "-"}{symbol}{formatAmount(item.amount)}
        </Text>
      </Pressable>
    );
  }, [compact, symbol, isReadOnly]);

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
        <Text style={styles.headerTitle}>{goalName}</Text>
        <View style={styles.headerSubRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/goals"))}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerSubCenter}>
            <View style={[styles.headerDot, { backgroundColor: goalColor }]} />
            <Text style={styles.headerSubLabel}>Transactions</Text>
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
          <Text style={styles.errorText}>Could not load transactions. Pull to retry.</Text>
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No transactions yet</Text>
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
              <ActivityIndicator style={styles.footerSpinner} size="small" color="#346739" />
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

      <EditGoalTransactionModal
        tx={selectedTx}
        symbol={symbol}
        goalId={goalId}
        onClose={() => setSelectedTx(null)}
      />
    </View>
  );
}
