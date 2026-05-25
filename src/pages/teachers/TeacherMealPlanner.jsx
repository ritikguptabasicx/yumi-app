import { useEffect } from "react";
import { View, Text, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AppImage from "@/components/AppImage";
import TeacherScreenHeader from "@/components/teachers/TeacherScreenHeader";
import WeekCalendar from "@/components/meal-planner/WeekCalendar";
import DailyMealSelection from "@/components/meal-planner/DailyMealSelection";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { api } from "@/lib/apiClient";
import { images } from "@/lib/assets";
import { normalizeMenuItems } from "@/lib/mealPlanner";
import toast from "@/lib/toast";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useMealPlannerStore } from "@/store/useMealStore";

const TeacherMealPlanner = () => {
  const {
    selectedDay,
    setSelectedDay,
    addSkippedDay,
    skippedDays,
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
    resetStore,
  } = useMealPlannerStore();
  const { user } = useUser();
  const { t } = useTranslation();
  const router = useRouter();
  const { setCheckoutData } = useCheckoutStore();

  const initializePreSelectedMeals = (menuData) => {
    const preSelected = {};
    menuData.forEach((order) => {
      order?.mealPlanner?.weekDetails?.forEach((week, dayIndex) => {
        const dayNumber = dayIndex + 1;
        week.itemTypes?.forEach((itemType) => {
          itemType.categories?.forEach((category) => {
            category.items?.forEach((item) => {
              if (item.isAdded === 1 && item.orderLineItemQty > 0) {
                if (!preSelected[dayNumber]) preSelected[dayNumber] = {};
                if (!preSelected[dayNumber][itemType.itemType]) {
                  preSelected[dayNumber][itemType.itemType] = [];
                }
                preSelected[dayNumber][itemType.itemType].push({
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
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await api.post("/api/v1/t/get-menu-items", {
        userId: parseInt(user.id),
      });
      const normalizedMenu = normalizeMenuItems(response.data?.data || []);
      setMenuItems(normalizedMenu);
      setSelectedMeals(initializePreSelectedMeals(normalizedMenu));
    } catch (error) {
      console.error("Teacher menu items error:", error);
      toast.error(t("errors.somethingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    resetStore();
    loadMenuItems();
  }, [user?.id]);

  const handleBack = () => {
    if (selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else {
      router.replace("/(app)/teacher");
    }
  };

  const handleSkipDay = () => {
    clearDayMeals(selectedDay);
    addSkippedDay(selectedDay);
    if (selectedDay < getAvailableWeekdays()) {
      setSelectedDay(selectedDay + 1);
    }
  };

  const areAllDaysHandled = () =>
    Array.from({ length: getAvailableWeekdays() }, (_, index) => index + 1).every(
      (day) => isDaySelected(day) || isDaySkipped(day)
    );

  const handleNextOrCheckout = async () => {
    if (!areAllDaysHandled() || selectedDay < getAvailableWeekdays()) {
      setSelectedDay(selectedDay + 1);
      return;
    }

    if (!hasAtLeastOneMealSelected()) {
      toast.error(t("meals.selectAtLeastOneMeal"));
      return;
    }

    try {
      const response = await api.post("/api/v1/t/checkout", {
        userId: parseInt(user.id),
        orderId: menuItems?.[0]?.orderId,
      });
      setCheckoutData(response.data?.data);
      router.push("/(app)/teacher-order-summary");
    } catch {
      toast.error("Checkout failed");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <TeacherScreenHeader title={t("navigation.mealPlanner")} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#019C7F" />
        </View>
      </SafeAreaView>
    );
  }

  if (!menuItems?.length) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <TeacherScreenHeader title={t("navigation.mealPlanner")} />
        <View className="flex-1 items-center justify-center gap-6 px-4">
          <AppImage source={images.illustration3} width={160} height={160} contentFit="contain" />
          <Text className="text-center text-base font-semibold text-gray-600">
            {t("meals.noMealsMessage")}
          </Text>
          <Button onPress={() => router.replace("/(app)/teacher")} className="rounded-xl px-6">
            {t("navigation.home")}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <TeacherScreenHeader title={t("navigation.mealPlanner")} />
      <View className="flex-1 bg-background">
        <WeekCalendar
          selectedDay={selectedDay}
          onDaySelect={setSelectedDay}
          isDaySkipped={isDaySkipped}
          menuItems={menuItems}
          skippedDays={skippedDays}
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
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={loadMenuItems} tintColor="#019C7F" />
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default TeacherMealPlanner;
