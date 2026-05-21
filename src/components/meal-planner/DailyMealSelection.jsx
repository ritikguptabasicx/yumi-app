import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUser } from "@/contexts/UserContext";
import MealTypeSelector from "./MealTypeSelector";
import CategoryAccordion from "./CategoryAccordion";
import { useState, useEffect } from "react";
import toast from "@/lib/toast";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/apiClient";

const DailyMealSelection = ({
  isLastDay,
  selectedDay,
  selectedMeals,
  onSkipDay,
  isAllDaysHandled,
  onNextOrCheckout,
  availableMeals,
  onBack,
}) => {
  const mealTypes = Array.from(
    new Set(availableMeals[0]?.itemTypes?.map((item) => item.itemType) || [])
  );

  const [activeMealType, setActiveMealType] = useState(() =>
    mealTypes.length > 0 ? mealTypes[0] : ""
  );

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { t } = useTranslation();
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (mealTypes.length > 0 && (!activeMealType || !mealTypes.includes(activeMealType))) {
      setActiveMealType(mealTypes[0]);
    }
  }, [mealTypes, activeMealType]);

  useEffect(() => {
    if (mealTypes.length > 0) {
      setActiveMealType(mealTypes[0]);
    }
  }, [selectedDay]);

  const getCategoriesForMealType = (selectedType) => {
    const weekDetails = availableMeals[0];
    if (!weekDetails) return [];

    return (
      weekDetails.itemTypes
        ?.filter((type) => type.itemType === selectedType)
        ?.flatMap((type) =>
          type.categories.map((category) => ({
            categoryName: category.itemCategory,
            items: category.items.map((meal) => ({
              lineItemId: meal.plannerLineItemId,
              itemName: meal.itemName,
              itemPrice: meal.itemPrice,
              itemId: meal.itemId,
              isAdded: meal.isAdded,
              category: category.itemCategory,
              orderLineItemId: meal.orderLineItemId || -1,
              orderId: availableMeals[0]?.orderId || 0,
              weekDate: weekDetails.weekDate || "",
              currency: meal.currency || "",
              description: meal.description || "",
              quantity: meal.orderLineItemQty || 0,
              itemUID: meal.itemUID,
              allergens: meal.allergens || [],
            })),
          }))
        ) || []
    );
  };

  const hasMealSelections = () =>
    Object.values(selectedMeals).some(
      (mealArray) => mealArray.length > 0 && mealArray.some((meal) => meal !== null)
    );

  const handleSkipDay = async () => {
    try {
      const childId = user?.selectedChildId || 0;
      const orderId = availableMeals[0]?.orderId;
      const weekDate = availableMeals[0]?.weekDate;

      if (!childId || !orderId || !weekDate) {
        toast.error(t("errors.missingRequiredInfo"));
        return;
      }

      await api.post(`/api/v1/meal/skip`, { childId, orderId, weekDate });

      setShowConfirmDialog(false);
      onSkipDay();
      toast.success(t("meals.daySkipped"));
    } catch (error) {
      console.error("Error skipping day:", error);
      toast.error(t("errors.somethingWentWrong"));
    }
  };

  const handleNextClick = () => {
    if (isAllDaysHandled) {
      onNextOrCheckout();
    } else if (!hasMealSelections()) {
      setShowConfirmDialog(true);
    } else {
      onNextOrCheckout();
    }
  };

  const ACTION_BAR_HEIGHT = 76;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: ACTION_BAR_HEIGHT + insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <Text className="mb-3 text-base font-bold text-foreground">
            {t("meals.mealCategory")}
          </Text>
          <MealTypeSelector
            mealTypes={mealTypes.map((type) => ({ itemType: type }))}
            activeMealType={activeMealType}
            onTypeSelect={setActiveMealType}
          />
        </View>

        <CategoryAccordion
          categories={getCategoriesForMealType(activeMealType)}
          selectedMeals={selectedMeals[activeMealType] || []}
          mealType={activeMealType}
        />
      </ScrollView>

      {/* ✅ Fixed: explicit paddingBottom handles safe area, height stays clean */}
      <View
        className="absolute bottom-0 left-0 right-0 z-10 flex-row gap-3 border-t border-border/70 bg-white px-4 pt-3 shadow-lg"
        style={{
          height: ACTION_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
        }}
      >
        <Button variant="outline" className="h-12 flex-1 rounded-xl bg-white" onPress={onBack}>
          {t("actions.back")}
        </Button>
        <Button className="h-12 flex-1 rounded-xl bg-primary" onPress={handleNextClick}>
          {isAllDaysHandled && isLastDay ? t("orders.checkout") : t("orders.next")}
        </Button>
      </View>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmations.areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmations.noMealSelectedConfirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={() => setShowConfirmDialog(false)}>
              {t("actions.stay")}
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleSkipDay}>{t("actions.proceed")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
};

export default DailyMealSelection;