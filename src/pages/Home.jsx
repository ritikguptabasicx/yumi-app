import { View, Text, ScrollView, Pressable } from "react-native";
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
import AppImage from "@/components/AppImage";
import { CalendarDays, ChevronRight, Shield } from "lucide-react-native";
import { useActiveOrder } from "@/hooks/useActiveOrder";
import { images } from "@/lib/assets";

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
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );

  const alert = dashboardData?.notifications || null;
  const hasActiveOrders = ordersData?.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 104 }}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />

        <ParentProfile />

        <View className="mt-1">
          <ChildProfileCard showActions={false} showSwitchChild />
        </View>

        <View className="mt-4">
          <AlertBanner
            isLoading={isAlertLoading}
            title={alert?.title || alert?.[0]?.title}
            message={alert?.message || alert?.[0]?.message}
          />
        </View>

        {hasActiveOrders ? (
          <View className="mt-5">
            <SectionHeader
              title={t("navigation.activeOrder")}
              actionText={t("common.showAll")}
              onAction={() => router.push("/(app)/(tabs)/order-history")}
            />
            <ActiveOrder orderData={ordersData} isLoading={loading} />
          </View>
        ) : (
          <Pressable
            onPress={() => router.push("/(app)/(tabs)/meal-planner")}
            className="mx-4 mt-5 flex-row items-center gap-4 rounded-2xl border border-border/50 bg-white p-4 active:opacity-90"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-secondary-muted">
              <CalendarDays size={22} color="#F37C21" />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-base font-bold text-foreground">{t("home.readyTitle")}</Text>
              <Text className="mt-0.5 text-sm leading-5 text-muted-foreground">
                {t("home.readySubtitle")}
              </Text>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </Pressable>
        )}

        <View className="mx-4 mt-5 overflow-hidden rounded-2xl bg-primary-muted">
          <View className="flex-row items-center p-4">
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-white/80">
              <Shield size={22} color="#019C7F" strokeWidth={2} />
            </View>
            <View className="min-w-0 flex-1 pr-2">
              <Text className="text-base font-bold text-foreground">{t("home.promoTitle")}</Text>
              <Text className="mt-1 text-sm leading-5 text-muted-foreground">
                {t("home.promoSubtitle")}
              </Text>
            </View>
            <AppImage
              source={images.illustration5}
              width={72}
              height={64}
              contentFit="contain"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
