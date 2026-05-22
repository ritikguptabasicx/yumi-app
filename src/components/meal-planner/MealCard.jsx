import { useCallback, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { cn, showMealAddedNotification } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import {
  Plus,
  Minus,
  AlertTriangle,
  ShieldAlert,
  X,
} from "lucide-react-native";
import { useMealPlannerStore } from "@/store/useMealStore";
import { api } from "@/lib/apiClient";
import { useTranslation } from "react-i18next";
import Tooltip from "react-native-walkthrough-tooltip";

// Maps allergen names to emoji icons for quick visual recognition
const ALLERGEN_ICONS = {
  gluten: "🌾",
  wheat: "🌾",
  milk: "🥛",
  dairy: "🥛",
  eggs: "🥚",
  egg: "🥚",
  nuts: "🥜",
  peanut: "🥜",
  peanuts: "🥜",
  "tree nuts": "🌰",
  soy: "🫘",
  soya: "🫘",
  fish: "🐟",
  shellfish: "🦐",
  sesame: "🫙",
  celery: "🌿",
  mustard: "🟡",
  lupin: "🌼",
  molluscs: "🦑",
  sulphites: "⚗️",
  sulphur: "⚗️",
};

const getAllergenIcon = (name = "") =>
  ALLERGEN_ICONS[name.toLowerCase()] ?? "⚠️";

// Severity colours — tweak to match your design system
const SEVERITY_CONFIG = {
  high: { bg: "bg-red-100", text: "text-red-700", dot: "#ef4444" },
  medium: { bg: "bg-orange-100", text: "text-orange-700", dot: "#f97316" },
  low: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "#eab308" },
  default: { bg: "bg-slate-100", text: "text-slate-600", dot: "#94a3b8" },
};

const getSeverityConfig = (allergen) => {
  // If your API returns a severity field use it; otherwise default
  if (!allergen.severity) return SEVERITY_CONFIG.default;
  return SEVERITY_CONFIG[allergen.severity] ?? SEVERITY_CONFIG.default;
};

/* ─── Allergen Tooltip Content ─────────────────────────────────────── */
const AllergenTooltipContent = ({ allergens, onClose }) => (
  <View style={{ minWidth: 220, maxWidth: 280 }}>
    {/* Header */}
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(249,115,22,0.2)",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <ShieldAlert size={14} color="#f97316" />
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: "#f97316",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Allergen Info
        </Text>
      </View>

      <Pressable
        onPress={onClose}
        hitSlop={8}
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
      >
        <X size={13} color="#94a3b8" />
      </Pressable>
    </View>

    {/* Subtitle */}
    <Text
      style={{
        fontSize: 10,
        color: "#94a3b8",
        marginBottom: 10,
        lineHeight: 14,
      }}
    >
      This item contains the following allergens. Please consult staff if you
      have dietary concerns.
    </Text>

    {/* Allergen chips */}
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {allergens.map((allergen, idx) => {
        const cfg = getSeverityConfig(allergen);
        return (
          <View
            key={idx}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 20,
              backgroundColor:
                allergen.severity === "high"
                  ? "rgba(239,68,68,0.12)"
                  : allergen.severity === "medium"
                    ? "rgba(249,115,22,0.12)"
                    : "rgba(148,163,184,0.15)",
              borderWidth: 1,
              borderColor:
                allergen.severity === "high"
                  ? "rgba(239,68,68,0.25)"
                  : allergen.severity === "medium"
                    ? "rgba(249,115,22,0.25)"
                    : "rgba(148,163,184,0.25)",
            }}
          >
            <Text style={{ fontSize: 11 }}>
              {getAllergenIcon(allergen.name)}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color:
                  allergen.severity === "high"
                    ? "#dc2626"
                    : allergen.severity === "medium"
                      ? "#ea580c"
                      : "#475569",
              }}
            >
              {allergen.name}
            </Text>
          </View>
        );
      })}
    </View>

    {/* Footer note */}
    <Text
      style={{
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "rgba(249,115,22,0.1)",
        fontSize: 9,
        color: "#cbd5e1",
        lineHeight: 13,
      }}
    >
      Always check with kitchen staff for full ingredient details.
    </Text>
  </View>
);

/* ─── Allergen Trigger Button ───────────────────────────────────────── */
const AllergenBadge = ({ count, onPress }) => (
  <Pressable
    onPress={onPress}
    className="mt-2 self-start"
    style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
    hitSlop={6}
  >
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: "rgba(249,115,22,0.1)",
        borderWidth: 1,
        borderColor: "rgba(249,115,22,0.3)",
      }}
    >
      <AlertTriangle size={11} color="#f97316" strokeWidth={2.5} />
      <Text
        style={{
          fontSize: 10,
          fontWeight: "700",
          color: "#f97316",
          letterSpacing: 0.3,
        }}
      >
        {count} Allergen{count !== 1 ? "s" : ""}
      </Text>
    </View>
  </Pressable>
);

/* ─── MealCard ──────────────────────────────────────────────────────── */
const MealCard = ({ selectedMeals, availableMeals }) => {
  const { user } = useUser();
  const { t } = useTranslation();
  const debounceTimers = useRef({});
  const { selectedDay, updateMealQuantity, updateWeekStatusByDay } =
    useMealPlannerStore();
  const [tooltipMealId, setTooltipMealId] = useState(null);

  const handleAddMeal = useCallback(
    async (itemId, orderId, weekDate, qty) => {
      const response = await api.post(`/api/v1/meal/add`, {
        childId: user?.selectedChildId,
        orderId,
        menuItemId: itemId,
        weekDate,
        qty,
      });
      return response.data;
    },
    [user]
  );

  const handleRemoveMeal = useCallback(
    async (orderId, orderLineItemId, weekDate, qty) => {
      const response = await api.post(`/api/v1/meal/remove`, {
        childId: user?.selectedChildId,
        orderId,
        orderLineItemId,
        weekDate,
        qty,
      });
      return response.data;
    },
    [user]
  );

  const syncQuantityWithServer = useCallback(
    async (meal, newQuantity, oldQuantity, mealType) => {
      try {
        if (newQuantity > oldQuantity) {
          const response = await handleAddMeal(
            meal.itemId,
            meal.orderId,
            meal.weekDate,
            newQuantity
          );

          if (response?.orderLineItemId) {
            updateMealQuantity(
              selectedDay,
              mealType,
              meal.itemId,
              newQuantity,
              response.orderLineItemId,
              1
            );
            setTimeout(() => updateWeekStatusByDay(selectedDay), 50);
          }
        } else if (newQuantity < oldQuantity) {
          if (!meal.orderLineItemId || meal.orderLineItemId === -1) {
            updateMealQuantity(
              selectedDay,
              mealType,
              meal.itemId,
              oldQuantity,
              meal.orderLineItemId,
              oldQuantity > 0 ? 1 : 0
            );
            return;
          }

          await handleRemoveMeal(
            meal.orderId,
            meal.orderLineItemId,
            meal.weekDate,
            newQuantity
          );

          updateMealQuantity(
            selectedDay,
            mealType,
            meal.itemId,
            newQuantity,
            meal.orderLineItemId,
            newQuantity > 0 ? 1 : 0
          );

          setTimeout(() => updateWeekStatusByDay(selectedDay), 50);
        }
      } catch (err) {
        console.error("Error syncing meal quantity:", err);
        updateMealQuantity(
          selectedDay,
          mealType,
          meal.itemId,
          oldQuantity,
          meal.orderLineItemId,
          oldQuantity > 0 ? 1 : 0
        );
      }
    },
    [
      handleAddMeal,
      handleRemoveMeal,
      updateMealQuantity,
      updateWeekStatusByDay,
      selectedDay,
    ]
  );

  const debouncedSync = (meal, newQuantity, oldQuantity, mealType) => {
    const timerId = `${selectedDay}-${mealType}-${meal.itemId}`;
    if (debounceTimers.current[timerId])
      clearTimeout(debounceTimers.current[timerId]);
    debounceTimers.current[timerId] = setTimeout(() => {
      syncQuantityWithServer(meal, newQuantity, oldQuantity, mealType);
      delete debounceTimers.current[timerId];
    }, 600);
  };

  const getMealType = (meal) => meal.mealType;

  const handleIncrement = async (meal) => {
    const oldQuantity = meal.quantity || 0;
    const newQuantity = oldQuantity + 1;
    const mealType = getMealType(meal);
    updateMealQuantity(
      selectedDay,
      mealType,
      meal.itemId,
      newQuantity,
      meal.orderLineItemId,
      1
    );

    if (oldQuantity === 1) {
      await showMealAddedNotification(meal.itemName);
    }
    debouncedSync(meal, newQuantity, oldQuantity, mealType);
  };

  const handleDecrement = (meal) => {
    const oldQuantity = meal.quantity || 0;
    if (oldQuantity === 0) return;
    if (!meal.orderLineItemId || meal.orderLineItemId === -1) {
      console.warn("Cannot decrement: Invalid orderLineItemId", meal);
      return;
    }
    const newQuantity = oldQuantity - 1;
    const mealType = getMealType(meal);
    updateMealQuantity(
      selectedDay,
      mealType,
      meal.itemId,
      newQuantity,
      meal.orderLineItemId,
      newQuantity > 0 ? 1 : 0
    );
    debouncedSync(meal, newQuantity, oldQuantity, mealType);
  };

  const mergedMeals = availableMeals.map((meal) => {
    const selectedMeal = selectedMeals.find((sm) => sm.itemId === meal.itemId);
    const orderLineItemId =
      selectedMeal?.orderLineItemId ?? meal.orderLineItemId ?? null;
    return {
      ...meal,
      quantity: selectedMeal?.quantity || 0,
      isAdded: selectedMeal?.isAdded || 0,
      orderLineItemId,
    };
  });

  return (
    <View className="w-full gap-3">
      {mergedMeals.map((meal) => (
        <View
          key={meal.itemId}
          className={cn(
            "relative w-full overflow-hidden rounded-2xl border border-border/60 bg-card px-4 py-3.5"
          )}
        >
          {/* Top section */}
          <View className="mb-2 w-full">
            <View className="w-full flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1">
                <Text className="text-sm font-bold leading-6 text-foreground">
                  {meal.itemName}
                </Text>

                {meal.description ? (
                  <Text className="mt-1 text-xs leading-5 text-muted-foreground">
                    {meal.description}
                  </Text>
                ) : null}
              </View>

              {meal.itemUID && (
                <Badge
                  variant="outline"
                  className="rounded-full border-primary/20 bg-background px-2 py-1"
                >
                  <Text className="text-[10px] font-bold text-primary">
                    {meal.itemUID}
                  </Text>
                </Badge>
              )}
            </View>

            {/* ── Allergen Tooltip ── */}
            {meal.allergens && meal.allergens.length > 0 && (
              <Tooltip
                isVisible={tooltipMealId === meal.itemId}
                content={
                  <AllergenTooltipContent
                    allergens={meal.allergens}
                    onClose={() => setTooltipMealId(null)}
                  />
                }
                placement="top"
                onClose={() => setTooltipMealId(null)}
                contentStyle={{
                  borderRadius: 16,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  backgroundColor: "#ffffff",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 8,
                }}
                tooltipStyle={{
                  borderWidth: 1,
                  borderColor: "rgba(249,115,22,0.15)",
                }}
                backgroundColor="rgba(0,0,0,0.35)"
                arrowStyle={{ borderTopColor: "#ffffff" }}
              >
                <AllergenBadge
                  count={meal.allergens.length}
                  onPress={() => setTooltipMealId(meal.itemId)}
                />
              </Tooltip>
            )}
          </View>

          {/* Bottom section */}
          <View className="flex-row items-center justify-between">
            {/* Price */}
            <View>
              <Text className="text-base font-extrabold text-primary">
                {meal.itemPrice?.toFixed(2)}
              </Text>
              <Text className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                {meal.currency || ""}
              </Text>
            </View>

            {/* Counter */}
            {meal.quantity === 0 ? (
              <Pressable
                onPress={() => handleIncrement(meal)}
                className="h-11 min-w-[90px] items-center justify-center rounded-xl border border-primary bg-background px-5"
                style={({ pressed }) =>
                  pressed
                    ? { opacity: 0.8, transform: [{ scale: 0.98 }] }
                    : undefined
                }
              >
                <Text className="text-sm font-extrabold tracking-wide text-primary">
                  ADD
                </Text>
              </Pressable>
            ) : (
              <View className="h-11 flex-row items-center rounded-xl border border-primary/20 bg-primary/10 px-1">
                <Pressable
                  onPress={() => handleDecrement(meal)}
                  className="h-9 w-9 items-center justify-center rounded-lg bg-background"
                  style={({ pressed }) =>
                    pressed ? { opacity: 0.7 } : undefined
                  }
                >
                  <Minus size={18} color="#019C7F" strokeWidth={2.8} />
                </Pressable>

                <View className="min-w-[38px] items-center justify-center px-1">
                  <Text className="text-sm font-extrabold text-primary">
                    {meal.quantity}
                  </Text>
                </View>

                <Pressable
                  onPress={() => handleIncrement(meal)}
                  className="h-9 w-9 items-center justify-center rounded-lg bg-background"
                  style={({ pressed }) =>
                    pressed ? { opacity: 0.7 } : undefined
                  }
                >
                  <Plus size={18} color="#019C7F" strokeWidth={2.8} />
                </Pressable>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

export default MealCard;
