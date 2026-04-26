import { DatePickerField } from "@/components/date-picker-field";
import { NavMenu } from "@/components/nav-menu";
import { api } from "@/lib/api";
import { formatDateISO } from "@/lib/date";
import { inputOutline, styles } from "@/styles/edit-entry.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTaskProgress } from "@/hooks/use-task-progress";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditEntryScreen() {
  const {
    entryId,
    amount: initialAmount,
    description: initialDescription,
    entryDate: initialDate,
    symbol,
    categoryId,
  } = useLocalSearchParams<{
    entryId: string;
    amount: string;
    description: string;
    entryDate: string;
    symbol: string;
    categoryId: string;
  }>();

  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { checkProgress } = useTaskProgress();

  const [amount, setAmount] = useState(initialAmount ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (initialDate) {
      const [year, month, day] = initialDate.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date();
  });

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] !== undefined && parts[1].length > 2) return;
    setAmount(cleaned);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      api.put(`/financial-entries/${entryId}`, {
        amount,
        description,
        entryDate: formatDateISO(selectedDate),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-entries", categoryId] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      router.back();
      void checkProgress();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/financial-entries/${entryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-entries", categoryId] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      router.back();
      void checkProgress();
    },
  });

  const handleDelete = () => setConfirmDelete(true);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const canSave = amount.length > 0 && parseFloat(amount) > 0;
  const isBusy = saveMutation.isPending || deleteMutation.isPending;
  const error = saveMutation.error?.message ?? deleteMutation.error?.message ?? null;

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
        <Text style={styles.headerTitle}>Edit Transaction</Text>
        <View style={styles.headerSubRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/(tabs)/dashboard")
            }
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          {/* Amount */}
          <Text style={styles.sectionLabel}>Amount</Text>
          <View style={styles.amountBox}>
            <Text style={styles.currencySymbol}>{symbol}</Text>
            <TextInput
              style={[styles.amountInput, inputOutline]}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor="#B8D4B8"
              keyboardType="decimal-pad"
              maxLength={12}
            />
          </View>

          {/* Description */}
          <Text style={styles.sectionLabel}>Description</Text>
          <View style={styles.commentBox}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={18}
              color="#79AE6F"
              style={styles.commentIcon}
            />
            <TextInput
              style={[styles.commentInput, inputOutline]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add a description..."
              placeholderTextColor="#B8D4B8"
              maxLength={120}
              returnKeyType="done"
            />
          </View>

          {/* Date */}
          <Text style={styles.sectionLabel}>Date</Text>
          <View style={styles.dateWrap}>
            <DatePickerField value={selectedDate} onChange={setSelectedDate} />
          </View>

          {/* Error */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Save */}
          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              pressed && styles.saveBtnPressed,
              (!canSave || isBusy) && styles.saveBtnDisabled,
            ]}
            onPress={() => {
              if (!canSave || isBusy) return;
              saveMutation.mutate();
            }}
          >
            {saveMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save</Text>
            )}
          </Pressable>

          {/* Delete */}
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
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmDeleteText}>Delete</Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
              onPress={handleDelete}
              disabled={isBusy}
            >
              <Text style={styles.deleteBtnText}>Delete transaction</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
