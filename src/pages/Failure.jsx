import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { XCircle, AlertCircle, Receipt, CreditCard, Clock } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ScreenHeader from "@/components/ScreenHeader";
import { useTranslation } from "react-i18next";
import { formatTimestamp } from "@/lib/formatters";

const Failure = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const amount = params?.amount;
  const currency = params?.curr;
  const errorMessage = params?.message;
  const invoiceId = params?.invoice_id;
  const timestamp = params?.timestamp;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title={t("payments.pageTitle")} />
      <ScrollView className="flex-1 px-4 pt-10" contentContainerStyle={{ alignItems: "center", paddingBottom: 32 }}>
        <View className="w-full max-w-md gap-6 p-4">
          <View className="items-center gap-2">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-secondary-soft">
              <XCircle size={40} color="#F37C21" />
            </View>
            <Text className="text-3xl font-bold text-gray-900">{t("payments.failureTitle")}</Text>
            <Text className="text-center text-gray-500">{t("payments.failureMessage")}</Text>
          </View>

          <Separator />

          <View className="gap-4">
            <View className="flex-row items-center gap-3">
              <View className="rounded-lg bg-red-50 p-2">
                <CreditCard size={20} color="#F37C21" />
              </View>
              <View>
                <Text className="text-sm text-gray-500">{t("payments.amount")}</Text>
                <Text className="font-semibold text-gray-900">
                  {amount} {currency}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="rounded-lg bg-red-50 p-2">
                <Receipt size={20} color="#F37C21" />
              </View>
              <View>
                <Text className="text-sm text-gray-500">{t("payments.invoiceId")}</Text>
                <Text className="font-semibold text-gray-900">{invoiceId}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="rounded-lg bg-red-50 p-2">
                <AlertCircle size={20} color="#F37C21" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500">{t("payments.status")}</Text>
                <View className="flex-row items-center gap-2">
                  <View className="h-2 w-2 rounded-full bg-secondary" />
                  <Text className="font-semibold text-gray-900">{errorMessage}</Text>
                </View>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="rounded-lg bg-red-50 p-2">
                <Clock size={20} color="#F37C21" />
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
            <Button
              onPress={() => router.replace("/(app)/(tabs)")}
              className="h-11 w-full bg-secondary"
            >
              {t("payments.backToHome")}
            </Button>
            <Button variant="outline" onPress={() => router.replace("/(app)/(tabs)")} className="h-11 w-full">
              {t("payments.tryAgain")}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Failure;
