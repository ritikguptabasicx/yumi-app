import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import AppTabBar from "@/components/AppTabBar";

export default function TeacherTabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false, tabBarShowLabel: false }}
    >
      <Tabs.Screen name="index" options={{ title: t("navigation.home") }} />
      <Tabs.Screen name="children" options={{ title: t("navigation.children") }} />
      <Tabs.Screen name="meal-planner" options={{ title: t("navigation.mealPlanner") }} />
      <Tabs.Screen name="order-history" options={{ title: t("navigation.orderHistory") }} />
      <Tabs.Screen name="profile" options={{ title: t("navigation.profile") }} />
    </Tabs>
  );
}
