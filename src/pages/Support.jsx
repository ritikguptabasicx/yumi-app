import { View, Text, Linking, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "@/components/ScreenHeader";
import Loader from "@/components/Loader";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Headset, Mail, Phone } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { useSupportData } from "@/hooks/useSupportData";

const Support = () => {
  const { t } = useTranslation();
  const { supportData, isLoading: loading } = useSupportData();

  const handleContactClick = (method) => {
    if (method === "email" && supportData.companySupportEmail) {
      Linking.openURL(`mailto:${supportData.companySupportEmail}`);
    } else if (method === "phone" && supportData.companySupportPhone) {
      Linking.openURL(`tel:${supportData.companySupportPhone}`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader title={t("navigation.support")} />

      {loading ? (
        <Loader />
      ) : (
        <ScrollView className="flex-1">
          <View className="mb-4 bg-accent py-4">
            <View className="items-center justify-center">
              <Logo className="h-44 w-auto" />
            </View>
          </View>

          <View className="mb-6 items-center px-4">
            <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-primary">
              <Headset size={28} color="#fff" />
            </View>
            <Text className="text-lg font-semibold">{t("support.reachTeam")}</Text>
            <Text className="mt-1 max-w-xs text-center text-sm text-muted-foreground">
              {t("support.feedback")}
            </Text>
          </View>

          <View className="gap-3 px-4 pb-8">
            <Card className="rounded-xl">
              <CardContent className="flex-row items-center gap-4 p-4">
                <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary-muted">
                  <Mail size={20} color="#019C7F" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium">{t("support.emailSection.title")}</Text>
                  <Text className="mt-0.5 text-xs text-muted-foreground">
                    {t("support.emailSection.description")}
                  </Text>
                </View>
                <Button size="sm" onPress={() => handleContactClick("email")}>
                  {t("support.emailSection.action")}
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardContent className="flex-row items-center gap-4 p-4">
                <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary-muted">
                  <Phone size={20} color="#019C7F" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium">{t("support.phoneSection.title")}</Text>
                  <Text className="mt-0.5 text-xs text-muted-foreground">
                    {t("support.phoneSection.description")}
                  </Text>
                </View>
                <Button size="sm" variant="outline" onPress={() => handleContactClick("phone")}>
                  {t("support.phoneSection.action")}
                </Button>
              </CardContent>
            </Card>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Support;
