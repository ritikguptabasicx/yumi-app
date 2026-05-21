import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  CheckCircle,
  Clock,
  Receipt,
  CreditCard,
  MessageCircle,
} from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ScreenHeader from "@/components/ScreenHeader";
import { useTranslation } from "react-i18next";
import { formatTimestamp } from "@/lib/formatters";

const Success = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const amount = params?.amount;
  const currency = params?.curr;
  const invoiceId = params?.invoice_id;
  const message = params?.message;
  const timestamp = params?.timestamp;
  const transactionId = params?.ep_id;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title={t("payments.pageTitle")} />
      <ScrollView className="flex-1 px-4 pt-10" contentContainerStyle={{ alignItems: "center", paddingBottom: 32 }}>
        <View className="w-full max-w-md gap-6 p-4">
          <View className="items-center gap-2">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-muted">
              <CheckCircle size={40} color="#019C7F" />
            </View>
            <Text className="text-3xl font-bold text-gray-900">{t("payments.successTitle")}</Text>
            <Text className="text-center text-gray-500">{t("payments.successMessage")}</Text>
          </View>

          <Separator />

          <View className="gap-4">
            <View className="flex-row items-center gap-3">
              <View className="rounded-lg bg-green-50 p-2">
                <CreditCard size={20} color="#019C7F" />
              </View>
              <View>
                <Text className="text-sm text-gray-500">{t("payments.amountPaid")}</Text>
                <Text className="font-semibold text-gray-900">
                  {amount} {currency}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="rounded-lg bg-green-50 p-2">
                <Receipt size={20} color="#019C7F" />
              </View>
              <View>
                <Text className="text-sm text-gray-500">{t("payments.invoiceId")}</Text>
                <Text className="font-semibold text-gray-900">{invoiceId}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="rounded-lg bg-green-50 p-2">
                <MessageCircle size={20} color="#019C7F" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500">{t("payments.status")}</Text>
                <View className="flex-row items-center gap-2">
                  <View className="h-2 w-2 rounded-full bg-primary" />
                  <Text className="font-semibold text-gray-900">{message}</Text>
                </View>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="rounded-lg bg-green-50 p-2">
                <Clock size={20} color="#019C7F" />
              </View>
              <View>
                <Text className="text-sm text-gray-500">{t("payments.transactionTime")}</Text>
                <Text className="font-semibold text-gray-900">
                  {formatTimestamp(timestamp)}
                </Text>
              </View>
            </View>
          </View>

          <Separator />

          <View className="gap-4">
            <Button onPress={() => router.replace("/(app)/(tabs)")} className="h-11 w-full bg-primary">
              {t("payments.backToHome")}
            </Button>
            <Button
              variant="outline"
              onPress={() => router.push("/(app)/(tabs)/order-history")}
              className="h-11 w-full"
            >
              {t("payments.viewOrderHistory")}
            </Button>
          </View>

          {amount && parseFloat(amount) > 0 && (
            <Text className="text-center text-sm text-gray-500">
              {t("payments.transactionId")}: {transactionId}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Success;
