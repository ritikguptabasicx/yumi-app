import { View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import ScreenHeader from "@/components/ScreenHeader";
import MealPlannerContainer from "@/components/meal-planner/MealPlannerContainer";
import { useTranslation } from "react-i18next";

const MealPlanner = () => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <ScreenHeader title={t("navigation.mealPlanner")} />
      <MealPlannerContainer
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#019C7F"
          />
        }
      />
    </SafeAreaView>
  );
};

export default MealPlanner;
