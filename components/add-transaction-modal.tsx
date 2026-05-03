import { api } from "@/lib/api";
import { formatDateISO } from "@/lib/date";
import { CategoryDto } from "@/lib/types";
import { useQuestProgress } from "@/hooks/use-quest-progress";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { DatePickerField } from "./date-picker-field";

type ModalTab = "expenses" | "income";

interface Props {
  visible: boolean;
  onClose: () => void;
  onAddMore?: () => void;
  symbol: string;
}

export function AddTransactionModal({ visible, onClose, onAddMore, symbol }: Props) {
  const queryClient = useQueryClient();
  const { checkProgress } = useQuestProgress();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>("expenses");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [dateKey, setDateKey] = useState(0);

  const { data: allCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<CategoryDto[]>("/categories"),
    enabled: visible,
    staleTime: 5 * 60 * 1000,
  });

  const addEntry = useMutation({
    mutationFn: (body: {
      type: "INCOME" | "EXPENSE";
      amount: string;
      note: string;
      categoryId: string;
      entryDate: string;
    }) => api.post("/financial-entries", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setAmount("");
      setComment("");
      setSelectedCategory(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      void checkProgress();
    },
  });

  const cardY = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      setAmount("");
      setComment("");
      setSelectedCategory(null);
      setActiveTab("expenses");
      setShowSuccess(false);
      setSelectedDate(new Date());
      setDateKey((k) => k + 1);
      cardY.setValue(60);
      cardOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(cardY, { toValue: 0, damping: 18, stiffness: 200, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(cardY, { toValue: 60, duration: 180, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setModalVisible(false);
      });
    }
  }, [visible]);

  const cardStyle = {
    transform: [{ translateY: cardY }],
    opacity: cardOpacity,
  };

  const activeType = activeTab === "expenses" ? "EXPENSE" : "INCOME";
  const categories = allCategories.filter((c) => c.type === activeType);

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] !== undefined && parts[1].length > 2) return;
    setAmount(cleaned);
  };

  const canAdd = amount.length > 0 && parseFloat(amount) > 0 && selectedCategory !== null;

  return (
    <Modal
      visible={modalVisible}
      animationType="none"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={s.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior="padding"
          enabled={Platform.OS === "ios"}
          style={s.kavWrapper}
        >
          <Animated.View
            style={[s.card, cardStyle]}
            {...(Platform.OS === "web" ? { onClick: (e: any) => e.stopPropagation() } : {})}
          >
            {/* Form fields scroll — flexShrink so it compresses on small screens */}
            <ScrollView
              style={s.scrollArea}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              contentContainerStyle={s.scrollContent}
            >
              <Text style={s.title}>Add Transaction</Text>

              {/* Tabs */}
              <View style={s.tabRow}>
                {(["expenses", "income"] as ModalTab[]).map((tab) => (
                  <Pressable
                    key={tab}
                    style={[s.tab, activeTab === tab && s.tabActive]}
                    onPress={() => { setActiveTab(tab); setSelectedCategory(null); }}
                  >
                    <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                      {tab === "expenses" ? "Expenses" : "Income"}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Amount */}
              <View style={s.amountBox}>
                <Text style={s.currencySymbol}>{symbol}</Text>
                <TextInput
                  style={s.amountInput}
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0.00"
                  placeholderTextColor="#B8D4B8"
                  keyboardType="decimal-pad"
                  maxLength={12}
                />
              </View>

              {/* Comment */}
              <View style={s.commentBox}>
                <MaterialCommunityIcons name="pencil-outline" size={18} color="#79AE6F" style={s.commentIcon} />
                <TextInput
                  style={s.commentInput}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Add a comment..."
                  placeholderTextColor="#B8D4B8"
                  maxLength={120}
                  returnKeyType="done"
                />
              </View>

              {/* Date */}
              <Text style={s.sectionLabel}>Date</Text>
              <View style={s.datePickerWrap}>
                <DatePickerField key={dateKey} value={selectedDate} onChange={setSelectedDate} />
              </View>
            </ScrollView>

            {/* Categories — sibling of outer scroll, not nested inside it */}
            <Text style={s.sectionLabel}>Category</Text>
            {categoriesLoading ? (
              <View style={s.loadingRow}>
                <ActivityIndicator size="small" color="#346739" />
              </View>
            ) : (
              <ScrollView
                style={s.categoriesScroll}
                contentContainerStyle={s.categoriesRow}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled
              >
                {categories.map((cat) => {
                  const selected = selectedCategory === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      style={s.catItem}
                      onPress={() => setSelectedCategory(selected ? null : cat.id)}
                    >
                      <View style={[
                        s.catIcon,
                        { backgroundColor: cat.color + "18" },
                        selected && { backgroundColor: cat.color + "30", borderColor: cat.color },
                      ]}>
                        <MaterialCommunityIcons name={cat.icon as any} size={26} color={cat.color} />
                      </View>
                      <Text style={[s.catLabel, selected && { color: cat.color, fontFamily: "Nunito_800ExtraBold" }]}>
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
                <Pressable style={s.catItem} onPress={onAddMore}>
                  <View style={s.addMoreIcon}>
                    <MaterialCommunityIcons name="plus" size={26} color="#79AE6F" />
                  </View>
                  <Text style={s.catLabel}>Add more</Text>
                </Pressable>
              </ScrollView>
            )}

            <Pressable
              style={({ pressed }) => [s.addBtn, pressed && s.addBtnPressed, (!canAdd || addEntry.isPending) && s.addBtnDisabled]}
              onPress={() => {
                if (!canAdd || addEntry.isPending) return;
                addEntry.mutate({
                  type: activeType,
                  amount,
                  note: comment,
                  categoryId: selectedCategory!,
                  entryDate: formatDateISO(selectedDate),
                });
              }}
            >
              {addEntry.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[s.addBtnText, !canAdd && s.addBtnTextDisabled]}>Add</Text>
              )}
            </Pressable>
          </Animated.View>

          {showSuccess && (
            <View style={s.toast}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
              <Text style={s.toastText}>Transaction added!</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const inputOutline = Platform.select({ web: { outlineStyle: "none" as any, outlineWidth: 0 } });

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    ...(Platform.OS === "web"
      ? { position: "fixed" as any, top: 0, left: 0, right: 0, bottom: 0 }
      : {}),
  },
  kavWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    maxHeight: "88%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
    overflow: "hidden",
  },
  scrollArea: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: "Nunito_900Black",
    color: "#1A2A1A",
    textAlign: "center",
    marginBottom: 20,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#E8F0E8",
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: "#346739",
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Nunito_800ExtraBold",
    color: "#5A8A5A",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  inputFocused: {
    borderColor: "#346739",
    shadowColor: "#346739",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  amountBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8F0",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
  },
  currencySymbol: {
    fontSize: 28,
    fontFamily: "Nunito_900Black",
    color: "#346739",
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontFamily: "Nunito_900Black",
    color: "#346739",
    padding: 0,
    ...inputOutline,
  },
  commentBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#C8DFC6",
  },
  commentIcon: {
    marginRight: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    color: "#346739",
    padding: 0,
    ...inputOutline,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "#7AAA7A",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  datePickerWrap: {
    marginBottom: 20,
  },
  loadingRow: {
    height: 68,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  categoriesScroll: {
    height: 164,
    marginBottom: 20,
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
    columnGap: 8,
  },
  catItem: {
    width: "22%",
    alignItems: "center",
    gap: 6,
  },
  catIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  catLabel: {
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    color: "#5A7A5A",
    textAlign: "center",
  },
  addMoreIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#C8DFC6",
    borderStyle: "dashed",
    backgroundColor: "#F0F8F0",
  },
  addBtn: {
    backgroundColor: "#346739",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 12,
  },
  addBtnPressed: {
    backgroundColor: "#2A4A2E",
  },
  addBtnDisabled: {
    backgroundColor: "#C8DFC6",
  },
  addBtnText: {
    fontSize: 17,
    fontFamily: "Nunito_900Black",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  addBtnTextDisabled: {
    color: "rgba(255,255,255,0.5)",
  },
  toast: {
    position: "absolute",
    top: 48,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#79AE6F",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 30,
    zIndex: 999,
  },
  toastText: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#FFFFFF",
  },
});
