import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
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
import { 
  CalendarDays, 
  ChevronRight, 
  Shield, 
  Wallet, 
  Sparkles, 
  Clock, 
  CircleCheck,
  UtensilsCrossed 
} from "lucide-react-native";
import { useActiveOrder } from "@/hooks/useActiveOrder";
import { images } from "@/lib/assets";

const Home = () => {
  const { t } = useTranslation();
  const { user, setUser } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { data: ordersData, isLoading: loading, mutate: mutateOrders } = useActiveOrder();
  
  const { data: dashboardData, isLoading: isAlertLoading, mutate: mutateDashboard } = useSWR(
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

  // Mock array block to safely construct structural schedule tracking visual layout
  const trackerWeekdays = [
    { day: "Mon", status: "delivered", active: false },
    { day: "Tue", status: "delivered", active: false },
    { day: "Wed", status: "active", active: true },
    { day: "Thu", status: "pending", active: false },
    { day: "Fri", status: "pending", active: false },
  ];

  return (
    <SafeAreaView className="flex-1 bg-neutral-50/40" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await Promise.all([mutateOrders(), mutateDashboard()]);
              setRefreshing(false);
            }}
            tintColor="#019C7F"
          />
        }
      >
        {/* Core Global Application Header Wrapper */}
        <AppHeader />

        {/* User Engagement Profile Nodes */}
        <ParentProfile />

        <View className="mt-2">
          <ChildProfileCard showActions={false} showSwitchChild />
        </View>

      
        <View className="mx-5 mt-4 flex-row gap-3.5">
    

      
        </View>

        {/* Global Structural Push Alert Notification Node */}
        <View className="mt-4">
          <AlertBanner
            isLoading={isAlertLoading}
            title={alert?.title || alert?.[0]?.title}
            message={alert?.message || alert?.[0]?.message}
          />
        </View>

        {/* Conditional Layout Routing Stack: Active History Cards vs Call-To-Action Triggers */}
        {hasActiveOrders ? (
          <View className="mt-6">
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
            className="mx-5 mt-5 flex-row items-center gap-4 rounded-3xl border border-slate-100 bg-white p-4.5 shadow-sm shadow-slate-200/60 active:scale-[0.99] transition-all duration-150"
          >
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100/70">
              <CalendarDays size={20} color="#F37C21" strokeWidth={2.5} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-[15px] font-black text-slate-800 tracking-tight">{t("home.readyTitle")}</Text>
              <Text className="mt-0.5 text-xs font-semibold leading-relaxed text-slate-400">
                {t("home.readySubtitle")}
              </Text>
            </View>
            <ChevronRight size={16} color="#94A3B8" strokeWidth={2.5} />
          </Pressable>
        )}

        {/* ─── NEW ADDITION: Weekly Menu Tracking Schedule Framework Visual Node ─── */}
        <View className="mx-5 mt-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/60">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <Clock size={16} color="#019C7F" strokeWidth={2.5} />
              <Text className="text-[14px] font-black text-slate-800 tracking-tight">
                {t("home.weeklySchedule") || "Weekly Catering Schedule"}
              </Text>
            </View>
            <View className="bg-emerald-50 px-2.5 py-1 rounded-xl">
              <Text className="text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider">
                Current Week
              </Text>
            </View>
          </View>

          {/* Visual Day Pipeline Grid Tracker layout */}
          <View className="flex-row justify-between items-center pt-1">
            {trackerWeekdays.map((item, index) => (
              <View key={index} className="items-center flex-1">
                <Text className={`text-[11px] font-extrabold mb-2.5 ${item.active ? "text-primary font-black" : "text-slate-400"}`}>
                  {item.day}
                </Text>
                
                {item.status === "delivered" ? (
                  <CircleCheck size={20} color="#10B981" strokeWidth={2.5} />
                ) : item.status === "active" ? (
                  <View className="h-5 w-5 rounded-full bg-primary items-center justify-center animate-pulse shadow-sm shadow-primary/40">
                    <UtensilsCrossed size={11} color="#FFF" strokeWidth={2.5} />
                  </View>
                ) : (
                  <View className="h-5 w-5 rounded-full border-2 border-dashed border-slate-200 bg-slate-50" />
                )}
                
                <View className={`h-1 w-8 rounded-full mt-2.5 ${item.status === "delivered" ? "bg-emerald-100" : item.status === "active" ? "bg-primary/20" : "bg-slate-100"}`} />
              </View>
            ))}
          </View>
        </View>

        {/* Premium Structural Safety Promo Anchor Banner */}
        <View className="mx-5 mt-5 overflow-hidden rounded-3xl bg-teal-50/40 border border-teal-50 shadow-sm shadow-teal-700/5">
          <View className="flex-row items-center p-4.5">
            <View className="mr-3.5 h-12 w-12 items-center justify-center rounded-2xl bg-white/90 border border-teal-100/50 shadow-sm shadow-teal-500/5">
              <Shield size={20} color="#019C7F" strokeWidth={2.5} />
            </View>
            <View className="min-w-0 flex-1 pr-2">
              <Text className="text-[15px] font-black text-slate-800 tracking-tight">{t("home.promoTitle")}</Text>
              <Text className="mt-0.5 text-xs font-semibold leading-relaxed text-slate-400">
                {t("home.promoSubtitle")}
              </Text>
            </View>
            <View className="opacity-95 transform scale-105">
              <AppImage
                source={images.illustration5}
                width={76}
                height={68}
                contentFit="contain"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;