import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link, useLocalSearchParams } from "expo-router";
import { CheckCircle2, XCircle, Clock } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/apiClient";

const EmailVerification = () => {
  const [status, setStatus] = useState("verifying");
  const { t } = useTranslation();
  const router = useRouter();
  const { token, emailAddress } = useLocalSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !emailAddress) {
        setStatus("failed");
        return;
      }

      try {
        const response = await api.post("/api/v1/verify-email", {
          token,
          emailAddress,
        });

        const data = response.data;
        setStatus(data.status === 1 ? "success" : "failed");
      } catch {
        setStatus("failed");
      }
    };

    verifyEmail();
  }, [token, emailAddress]);

  const renderContent = () => {
    switch (status) {
      case "success":
        return (
          <>
            <CheckCircle2 size={64} color="#22C55E" style={{ alignSelf: "center", marginBottom: 16 }} />
            <Text className="mb-2 text-center text-2xl font-bold text-gray-900">
              {t("emailVerification.successTitle")}
            </Text>
            <Text className="mb-6 text-center text-gray-600">
              {t("emailVerification.successMessage")}
            </Text>
            <Link href="/(auth)/signin" asChild>
              <Button className="w-full">{t("emailVerification.signIn")}</Button>
            </Link>
          </>
        );

      case "failed":
        return (
          <>
            <XCircle size={64} color="#019C7F" style={{ alignSelf: "center", marginBottom: 16 }} />
            <Text className="mb-2 text-center text-2xl font-bold text-gray-900">
              {t("emailVerification.failedTitle")}
            </Text>
            <Text className="mb-6 text-center text-gray-600">
              {t("emailVerification.failedMessage")}
            </Text>
            <Button variant="outline" className="w-full" onPress={() => router.replace("/(auth)/signup")}>
              {t("emailVerification.backToSignup")}
            </Button>
          </>
        );

      case "expired":
        return (
          <>
            <Clock size={64} color="#EAB308" style={{ alignSelf: "center", marginBottom: 16 }} />
            <Text className="mb-2 text-center text-2xl font-bold text-gray-900">
              {t("emailVerification.expiredTitle")}
            </Text>
            <Text className="mb-6 text-center text-gray-600">
              {t("emailVerification.expiredMessage")}
            </Text>
            <Button variant="outline" className="w-full" onPress={() => router.replace("/(auth)/signup")}>
              {t("emailVerification.backToSignup")}
            </Button>
          </>
        );

      default:
        return (
          <View className="items-center">
            <ActivityIndicator size="large" color="#0F172A" />
            <Text className="mt-4 text-gray-600">{t("emailVerification.verifying")}</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="items-center justify-center bg-accent py-4">
        <Logo className="h-44 w-auto" />
      </View>
      <View className="p-6">
        <Card className="mt-5 gap-6 px-4 py-6">
          <View className="items-center">{renderContent()}</View>
        </Card>
      </View>
    </SafeAreaView>
  );
};

export default EmailVerification;
