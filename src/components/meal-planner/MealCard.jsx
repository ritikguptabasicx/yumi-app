import { useCallback, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { Plus, Minus, AlertTriangle } from "lucide-react-native";
import { useMealPlannerStore } from "@/store/useMealStore";
import { api } from "@/lib/apiClient";
import { useTranslation } from "react-i18next";

const MealCard = ({ selectedMeals, availableMeals }) => {
  const { user } = useUser();
  const { t } = useTranslation();
  const debounceTimers = useRef({});
  const { selectedDay, updateMealQuantity, updateWeekStatusByDay } = useMealPlannerStore();

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

            setTimeout(() => {
              updateWeekStatusByDay(selectedDay);
            }, 50);
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

          setTimeout(() => {
            updateWeekStatusByDay(selectedDay);
          }, 50);
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
    [handleAddMeal, handleRemoveMeal, updateMealQuantity, updateWeekStatusByDay, selectedDay]
  );

  const debouncedSync = (meal, newQuantity, oldQuantity, mealType) => {
    const timerId = `${selectedDay}-${mealType}-${meal.itemId}`;

    if (debounceTimers.current[timerId]) {
      clearTimeout(debounceTimers.current[timerId]);
    }

    debounceTimers.current[timerId] = setTimeout(() => {
      syncQuantityWithServer(meal, newQuantity, oldQuantity, mealType);
      delete debounceTimers.current[timerId];
    }, 600);
  };

  const getMealType = (meal) => meal.mealType;

  const handleIncrement = (meal) => {
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
    const orderLineItemId = selectedMeal?.orderLineItemId ?? meal.orderLineItemId ?? null;

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
            "relative w-full rounded-2xl border bg-card p-4",
            meal.isAdded === 1 ? "border-primary bg-primary-muted" : "border-border"
          )}
          style={{ width: "100%" }}
        >
          <View className="mb-3 w-full">
            <View className="w-full flex-row items-start gap-2">
              <Text className="min-w-0 flex-1 text-sm font-semibold leading-5 text-foreground">
                {meal.itemName}
              </Text>
              {meal.itemUID && (
                <Badge variant="outline" className="h-5 shrink-0 px-1.5">
                  <Text className="text-xs">{meal.itemUID}</Text>
                </Badge>
              )}
            </View>

            {meal.description ? (
              <Text className="mt-1.5 text-xs leading-4 text-muted-foreground">
                {meal.description}
              </Text>
            ) : null}

            {meal.allergens && meal.allergens.length > 0 && (
              <View className="mt-2 flex-row items-start gap-1.5">
                <AlertTriangle size={12} color="#F97316" />
                <Text className="min-w-0 flex-1 text-xs leading-4 text-muted-foreground">
                  {t("meals.contains")} {meal.allergens.map((a) => a.name).join(", ")}
                </Text>
              </View>
            )}
          </View>

          <View className="w-full flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1 flex-row items-baseline gap-1">
              <Text className="text-base font-bold text-primary">
                {meal.itemPrice?.toFixed(2)}
              </Text>
              <Text className="text-xs font-medium text-primary">{meal.currency || ""}</Text>
            </View>

            <View className="flex-row h-11 items-center rounded-full border border-primary/20 bg-primary-muted p-1">
              <Pressable
                onPress={() => handleDecrement(meal)}
                disabled={meal.quantity === 0}
                className={cn(
                  "h-9 w-9 items-center justify-center rounded-full bg-white",
                  meal.quantity === 0 && "opacity-40"
                )}
                style={({ pressed }) =>
                  pressed && (meal.quantity || 0) > 0 ? { opacity: 0.7 } : undefined
                }
              >
                <Minus size={16} color="#019C7F" strokeWidth={2.5} />
              </Pressable>

              <View className="min-w-[40px] items-center justify-center px-2">
                <Text className="text-sm font-bold text-primary">{meal.quantity || 0}</Text>
              </View>

              <Pressable
                onPress={() => handleIncrement(meal)}
                className="h-9 w-9 items-center justify-center rounded-full bg-white"
                style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
              >
                <Plus size={16} color="#019C7F" strokeWidth={2.5} />
              </Pressable>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default MealCard;
