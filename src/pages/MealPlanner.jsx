import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "@/components/ScreenHeader";
import MealPlannerContainer from "@/components/meal-planner/MealPlannerContainer";
import { useTranslation } from "react-i18next";

const MealPlanner = () => {
  const { t } = useTranslation();
  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top", "bottom"]}
      style={{ flex: 1, minHeight: "100%" }}
    >
      <ScreenHeader title={t("navigation.mealPlanner")} />
      <MealPlannerContainer />
    </SafeAreaView>
  );
};

export default MealPlanner;
