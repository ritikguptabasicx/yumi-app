import { useCallback, useRef } from "react";
import { View, Text } from "react-native";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
    <View className="gap-3">
      {mergedMeals.map((meal) => (
        <View
          key={meal.itemId}
          className={cn(
            "relative rounded-lg border bg-card p-3",
            meal.isAdded === 1 ? "border-primary bg-primary-muted" : "border-border"
          )}
        >
          <View className="mb-3">
            <View className="flex-row items-start justify-between gap-2">
              <Text className="flex-1 text-sm font-medium text-foreground">{meal.itemName}</Text>
              {meal.itemUID && (
                <Badge variant="outline" className="h-4 px-1">
                  <Text className="text-xs">{meal.itemUID}</Text>
                </Badge>
              )}
            </View>

            {meal.description ? (
              <Text className="mt-1 text-xs text-muted-foreground">{meal.description}</Text>
            ) : null}

            {meal.allergens && meal.allergens.length > 0 && (
              <View className="mt-4 flex-row items-center gap-1">
                <AlertTriangle size={12} color="#F97316" />
                <Text className="text-xs text-muted-foreground">
                  {t("meals.contains")} {meal.allergens.map((a) => a.name).join(", ")}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <Text className="text-base font-medium text-primary">
                {meal.itemPrice?.toFixed(2)}
              </Text>
              <Text className="text-xs text-primary">{meal.currency || ""}</Text>
            </View>

            <View className="flex-row items-center rounded-full p-1">
              <Button
                variant="outline"
                onPress={() => handleDecrement(meal)}
                disabled={meal.quantity === 0}
                className={cn(
                  "h-7 w-7 rounded-full border-primary p-0",
                  meal.quantity === 0 && "opacity-50"
                )}
                size="icon"
              >
                <Minus size={12} color="#019C7F" />
              </Button>

              <Text className="mx-1 w-6 text-center text-sm font-medium">
                {meal.quantity || 0}
              </Text>

              <Button
                variant="outline"
                onPress={() => handleIncrement(meal)}
                className="h-7 w-7 rounded-full border-primary p-0"
                size="icon"
              >
                <Plus size={12} color="#019C7F" />
              </Button>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default MealCard;
