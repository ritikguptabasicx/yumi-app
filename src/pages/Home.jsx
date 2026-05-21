import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { api } from "@/lib/apiClient";
import { useUser } from "@/contexts/UserContext";
import ActiveOrder from "@/components/ActiveOrder";
import SectionHeader from "@/components/SectionHeader";
import AlertBanner from "@/components/AlertBanner";
import { ParentProfile } from "@/components/ParentProfile";
import ChildProfileCard from "@/components/ChildProfileCard";
import AppHeader from "@/components/AppHeader";
import { CalendarDays } from "lucide-react-native";

import { useActiveOrder } from "@/hooks/useActiveOrder";

const Home = () => {
  const { t } = useTranslation();
  const { user, setUser } = useUser();
  const router = useRouter();
  const { data: ordersData, isLoading: loading } = useActiveOrder();

  const { data: dashboardData, isLoading: isAlertLoading } = useSWR(
    user?.id ? ["dashboard", user.id] : null,
    async () => {
      const res = await api.get("/api/v1/dashboard");
      const data = res.data;
      if (!data.success) throw new Error("Failed to fetch dashboard data");
      const credits = data.data.credits ?? 0;
      if (user.creditsAvailable !== credits) {
        setUser({ ...user, creditsAvailable: credits });
      }
      return data.data;
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false, revalidateIfStale: false }
  );

  const alert = dashboardData?.notifications || null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 104 }}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />
        <View className="mt-3">
          <ParentProfile />
        </View>

        <View className="mt-4">
          <ChildProfileCard />
        </View>

        <View className="mt-4">
          <AlertBanner
            isLoading={isAlertLoading}
            title={alert?.title || alert?.[0]?.title}
            message={alert?.message || alert?.[0]?.message}
          />
        </View>

        {ordersData?.length > 0 && (
          <View className="mt-5">
            <SectionHeader
              title={t("navigation.activeOrder")}
              actionText={t("common.showAll")}
              onAction={() => router.push("/(app)/(tabs)/order-history")}
            />
            <ActiveOrder orderData={ordersData} isLoading={loading} />
          </View>
        )}

        {!ordersData?.length ? (
          <View className="mx-4 mt-5 flex-row items-center gap-3 rounded-2xl bg-white p-4">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-secondary-muted">
              <CalendarDays size={21} color="#F37C21" />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="font-bold text-foreground">{t("home.readyTitle")}</Text>
              <Text className="mt-0.5 text-sm text-muted-foreground">
                {t("home.readySubtitle")}
              </Text>
            </View>
          </View>
        ) : null}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
