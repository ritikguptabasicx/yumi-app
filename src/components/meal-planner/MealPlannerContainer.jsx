import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppImage from "@/components/AppImage";
import { useRouter } from "expo-router";
import WeekCalendar from "./WeekCalendar";
import { useUser } from "@/contexts/UserContext";
import toast from "@/lib/toast";
import { useMealPlannerStore } from "@/store/useMealStore";
import { useTranslation } from "react-i18next";
import DailyMealSelection from "./DailyMealSelection";
import { api } from "@/lib/apiClient";
import { useCheckoutStore } from "@/store/checkoutStore";
import { images } from "@/lib/assets";

const MealPlannerContainer = () => {
  const {
    selectedDay,
    setSelectedDay,
    addSkippedDay,
    menuItems,
    setMenuItems,
    selectedMeals,
    isLoading,
    setIsLoading,
    setSelectedMeals,
    clearDayMeals,
    isDaySelected,
    isDaySkipped,
    hasAtLeastOneMealSelected,
    getAvailableMealsForDay,
    getAvailableWeekdays,
  } = useMealPlannerStore();

  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useUser();
  const { setCheckoutData } = useCheckoutStore();
  const insets = useSafeAreaInsets();

  const initializePreSelectedMeals = (menuData) => {
    const preSelected = {};

    menuData.forEach((order) => {
      const weekDetails = order?.mealPlanner?.weekDetails || [];

      weekDetails.forEach((week, dayIndex) => {
        const dayNumber = dayIndex + 1;

        week.itemTypes?.forEach((itemType) => {
          const mealType = itemType.itemType;

          itemType.categories?.forEach((category) => {
            category.items?.forEach((item) => {
              if (item.isAdded === 1 && item.orderLineItemQty > 0) {
                if (!preSelected[dayNumber]) preSelected[dayNumber] = {};
                if (!preSelected[dayNumber][mealType]) preSelected[dayNumber][mealType] = [];

                preSelected[dayNumber][mealType].push({
                  itemId: item.itemId,
                  itemName: item.itemName,
                  itemPrice: item.itemPrice,
                  currency: item.currency,
                  description: item.description,
                  isAdded: item.isAdded,
                  quantity: item.orderLineItemQty,
                  orderLineItemId: item.orderLineItemId,
                });
              }
            });
          });
        });
      });
    });

    return preSelected;
  };

  const loadMenuItems = async () => {
    if (!user?.selectedChildId) return;

    try {
      setIsLoading(true);
      const childId = user.selectedChildId;

      const response = await api.post(`/api/v1/meal/items`, { childId });
      const data = response.data;
      setMenuItems(data.data);

      const preSelectedMeals = initializePreSelectedMeals(data.data);
      setSelectedMeals(preSelectedMeals);
    } catch (err) {
      console.error(err);
      toast.error(t("errors.somethingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.selectedChildId) return;
    loadMenuItems();
  }, [user?.selectedChildId]);

  const handleBack = () => {
    if (selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else {
      router.replace("/(app)/(tabs)");
    }
  };

  const handleSkipDay = () => {
    clearDayMeals(selectedDay);
    addSkippedDay(selectedDay);

    const availableWeekdays = getAvailableWeekdays();
    if (selectedDay < availableWeekdays) {
      setSelectedDay(selectedDay + 1);
    }
  };

  const areAllDaysHandled = () => {
    const availableWeekdays = getAvailableWeekdays();
    return Array.from({ length: availableWeekdays }, (_, i) => i + 1).every(
      (day) => isDaySelected(day) || isDaySkipped(day)
    );
  };

  const handleNextOrCheckout = async () => {
    const availableWeekdays = getAvailableWeekdays();

    if (!areAllDaysHandled() || selectedDay < availableWeekdays) {
      setSelectedDay(selectedDay + 1);
      return;
    }

    if (!hasAtLeastOneMealSelected()) {
      toast.error(t("meals.selectAtLeastOneMeal"));
      return;
    }

    try {
      const response = await api.post(`/api/v1/order/checkout`, {
        userId: parseInt(user.id),
        childId: user.selectedChildId,
        orderId: menuItems?.[0]?.orderId,
      });

      const checkoutData = response.data;
      setCheckoutData(checkoutData.data);
      router.push("/(app)/order-summary");
    } catch {
      toast.error("Checkout failed");
    }
  };

  // ✅ Fix 2: Safe area aware loading state
  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }}
      >
        <ActivityIndicator size="large" color="#00A76F" />
      </View>
    );
  }

  // ✅ Fix 2 & 3: Safe area aware + responsive empty state
  if (!menuItems?.length) {
    return (
      <View
        className="flex-1 items-center justify-center gap-6 px-4"
        style={{ paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }}
      >
        <AppImage source={images.illustration3} width={160} height={160} contentFit="contain" />
        <Text className="w-full max-w-xs px-6 text-center text-base font-semibold text-gray-600">
          {t("meals.noMealsMessage")}
        </Text>
      </View>
    );
  }

  // ✅ Fix 1: Removed redundant nested View
  return (
    <View className="flex-1 bg-background">
      <WeekCalendar
        selectedDay={selectedDay}
        isDaySkipped={isDaySkipped}
        menuItems={menuItems}
      />
      <DailyMealSelection
        selectedDay={selectedDay}
        selectedMeals={selectedMeals[selectedDay] || {}}
        onSkipDay={handleSkipDay}
        isAllDaysHandled={areAllDaysHandled()}
        onNextOrCheckout={handleNextOrCheckout}
        availableMeals={getAvailableMealsForDay(selectedDay)}
        onBack={handleBack}
        isLastDay={selectedDay === getAvailableWeekdays()}
      />
    </View>
  );
};

export default MealPlannerContainer;