import { useState } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import {
  CalendarDays,
  ClipboardList,
  HelpCircle,
  Headphones,
  Info,
  Users,
} from "lucide-react-native";
import { api } from "@/lib/apiClient";
import { useUser } from "@/contexts/UserContext";
import AlertBanner from "@/components/AlertBanner";
import AppHeader from "@/components/AppHeader";
import SectionHeader from "@/components/SectionHeader";
import TeacherActiveOrderList from "@/components/teachers/TeacherActiveOrderList";
import TeacherBudgetCard from "@/components/teachers/TeacherBudgetCard";
import TeacherProfileCard from "@/components/teachers/TeacherProfileCard";
import { useTeacherActiveOrder } from "@/hooks/teachers/useTeacherActiveOrder";

const TeacherQuickLink = ({ icon: Icon, title, description, onPress }) => (
  <Pressable
    onPress={onPress}
    className="min-h-[112px] flex-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/60"
  >
    <View className="mb-3 h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
      <Icon size={19} color="#019C7F" strokeWidth={2.5} />
    </View>
    <Text className="text-sm font-black text-slate-900" numberOfLines={2}>
      {title}
    </Text>
    <Text className="mt-1 text-xs font-semibold leading-4 text-slate-400" numberOfLines={2}>
      {description}
    </Text>
  </Pressable>
);

const TeacherHome = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: ordersData,
    isLoading: loadingOrders,
    mutate: mutateOrders,
  } = useTeacherActiveOrder();

  const {
    data: dashboardData,
    isLoading: loadingDashboard,
    mutate: mutateDashboard,
  } = useSWR(
    user?.id ? ["teacher-dashboard", user.id] : null,
    async ([, userId]) => {
      const response = await api.post("/api/v1/t/dashboard", { userId });
      const data = response.data;
      if (!data?.success) throw new Error("Failed to fetch teacher dashboard");
      return data.data;
    },
    { revalidateOnFocus: false }
  );

  const quickLinks = [
    {
      Icon: CalendarDays,
      title: t("quickLinks.mealPlanner.title"),
      description: t("quickLinks.mealPlanner.description"),
      href: "/(app)/teacher-meal-planner",
    },
    {
      Icon: Users,
      title: t("quickLinks.children.title"),
      description: t("quickLinks.children.description"),
      href: "/(app)/teacher-children",
    },
    {
      Icon: ClipboardList,
      title: t("quickLinks.childrenOrders.title"),
      description: t("quickLinks.childrenOrders.description"),
      href: "/(app)/teacher-children-meals",
    },
    {
      Icon: ClipboardList,
      title: t("quickLinks.orderHistory.title"),
      description: t("quickLinks.orderHistory.description"),
      href: "/(app)/teacher-order-history",
    },
    {
      Icon: Info,
      title: t("quickLinks.about.title"),
      description: t("quickLinks.about.description"),
      href: "/(app)/about",
    },
    {
      Icon: HelpCircle,
      title: t("quickLinks.faq.title"),
      description: t("quickLinks.faq.description"),
      href: "/(app)/faq",
    },
    {
      Icon: Headphones,
      title: t("quickLinks.support.title"),
      description: t("quickLinks.support.description"),
      href: "/(app)/support",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor="#019C7F"
            onRefresh={async () => {
              setRefreshing(true);
              await Promise.all([mutateOrders(), mutateDashboard()]);
              setRefreshing(false);
            }}
          />
        }
      >
        <AppHeader />
        <TeacherProfileCard />
        <TeacherBudgetCard
          budget={dashboardData?.budget}
          isLoading={loadingDashboard}
        />

        <View className="mt-4">
          <AlertBanner
            isLoading={loadingDashboard}
            title={dashboardData?.notifications?.title}
            message={dashboardData?.notifications?.message}
          />
        </View>

        {ordersData?.length > 0 && (
          <View className="mt-6">
            <SectionHeader
              title={t("navigation.activeOrder", { count: ordersData.length })}
              actionText={t("common.showAll")}
              onAction={() => router.push("/(app)/teacher-order-history")}
            />
            <TeacherActiveOrderList orderData={ordersData} isLoading={loadingOrders} />
          </View>
        )}

        {/* <View className="mt-7">
          <SectionHeader title={t("ui.quickActions")} />
          <View className="gap-3 px-4">
            {quickLinks.reduce((rows, item, index) => {
              if (index % 2 === 0) rows.push(quickLinks.slice(index, index + 2));
              return rows;
            }, []).map((row, rowIndex) => (
              <View key={rowIndex} className="flex-row gap-3">
                {row.map((link) => (
                  <TeacherQuickLink
                    key={link.href}
                    icon={link.Icon}
                    title={link.title}
                    description={link.description}
                    onPress={() => router.push(link.href)}
                  />
                ))}
                {row.length === 1 && <View className="flex-1" />}
              </View>
            ))}
          </View>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TeacherHome;
