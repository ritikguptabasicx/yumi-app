import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Info, HelpCircle, Headphones } from "lucide-react-native";
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
import QuickLinkCards from "@/components/QuickLinkCards";
import AppHeader from "@/components/AppHeader";
import { ActionCards } from "@/components/ActionCards";
import { useActiveOrder } from "@/hooks/useActiveOrder";

const Home = () => {
  const { t } = useTranslation();
  const { user, setUser } = useUser();
  const router = useRouter();
  const currentYear = new Date().getFullYear();
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

  const quickLinks = [
    { icon: Info, title: t("quickLinks.about.title"), description: t("quickLinks.about.description"), href: "/(app)/about" },
    { icon: HelpCircle, title: t("quickLinks.faq.title"), description: t("quickLinks.faq.description"), href: "/(app)/faq" },
    { icon: Headphones, title: t("quickLinks.support.title"), description: t("quickLinks.support.description"), href: "/(app)/support" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-homeBg" edges={["top"]}>
      <AppHeader />
      <ScrollView className="flex-1 pb-4" showsVerticalScrollIndicator={false}>
        <View className="mt-6">
          <ParentProfile />
        </View>
        <View className="mt-6">
          <ChildProfileCard />
        </View>
        <View className="mt-8">
          <AlertBanner
            isLoading={isAlertLoading}
            title={alert?.title || alert?.[0]?.title}
            message={alert?.message || alert?.[0]?.message}
          />
        </View>
        {ordersData?.length > 0 && (
          <View className="mt-8">
            <SectionHeader
              title={t("navigation.activeOrder", { count: ordersData.length })}
              actionText={t("common.showAll")}
              onAction={() => router.push("/(app)/(tabs)/order-history")}
            />
            <ActiveOrder orderData={ordersData} isLoading={loading} />
          </View>
        )}
        <View className="mt-8">
          <ActionCards />
        </View>
        <View className="mt-8">
          <SectionHeader title={t("ui.quickActions")} />
          <View className="flex-row flex-wrap gap-3 px-4">
            {quickLinks.map((link) => (
              <View key={link.title} className="flex-1">
                <QuickLinkCards {...link} />
              </View>
            ))}
          </View>
        </View>
        <View className="py-4">
          <Text className="text-center text-sm text-muted-foreground">
            {currentYear} {t("ui.developedBy")}{" "}
            <Text
              className="font-medium text-primary"
              onPress={() => Linking.openURL("https://weblike.ro/")}
            >
              weblike.ro
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
