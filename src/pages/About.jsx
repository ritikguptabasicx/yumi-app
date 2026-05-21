import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppImage from "@/components/AppImage";
import { Card, CardContent } from "@/components/ui/card";
import ScreenHeader from "@/components/ScreenHeader";
import { useTranslation } from "react-i18next";
import Loader from "@/components/Loader";
import { useAboutData } from "@/hooks/useAboutData";
import { images } from "@/lib/assets";
import { stripHtml } from "@/lib/utils";

const About = () => {
  const { t } = useTranslation();
  const { aboutData, isLoading: loading } = useAboutData();

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader title={t("navigation.aboutApp")} />
      <ScrollView className="flex-1 pb-4" showsVerticalScrollIndicator={false}>
        <AppImage source={images.aboutBg} height={240} className="w-full" contentFit="cover" />

        <View className="gap-6 p-4">
          <Card className="border">
            <CardContent className="p-4">
              <Text className="text-sm leading-relaxed text-gray-600">
                {stripHtml(aboutData.aboutCompany || "")}
              </Text>
            </CardContent>
          </Card>

          <View className="items-center gap-2">
            {aboutData.companySupportEmail && (
              <Text className="text-center text-sm text-gray-600">
                Have questions? Contact us at{" "}
                <Text
                  className="text-blue-600 underline"
                  onPress={() => Linking.openURL(`mailto:${aboutData.companySupportEmail}`)}
                >
                  {aboutData.companySupportEmail}
                </Text>
              </Text>
            )}
            {aboutData.companySupportPhone && (
              <Text className="text-center text-sm text-gray-600">
                Or call us at{" "}
                <Text
                  className="text-blue-600 underline"
                  onPress={() => Linking.openURL(`tel:${aboutData.companySupportPhone}`)}
                >
                  {aboutData.companySupportPhone}
                </Text>
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default About;
