import { useState } from "react";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import toast from "@/lib/toast";
import ScreenHeader from "@/components/ScreenHeader";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/apiClient";
import { getWeekdayKey } from "@/lib/weekdays";
import { useCheckoutStore } from "@/store/checkoutStore";

const OrderSummary = () => {
  const router = useRouter();
  const { user } = useUser();
  const { t } = useTranslation();
  const { checkoutData } = useCheckoutStore();
  const [note, setNote] = useState("");
  const [expandedDays, setExpandedDays] = useState({});

  if (!checkoutData?.orderDetails) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={["top"]}>
        <ScreenHeader title={t("orders.orderSummary")} />
        <Text className="text-lg text-gray-500">{t("orders.noOrderSummaryData")}</Text>
      </SafeAreaView>
    );
  }

  const toggleDay = (weekdayId) => {
    setExpandedDays((prev) => ({
      ...prev,
      [weekdayId]: !prev[weekdayId],
    }));
  };

  const calculateDayTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item?.lineAmount || 0), 0);
  };

  const renderMealSection = (items) => {
    if (!items || !Array.isArray(items)) return null;

    const groupedItems = items.reduce((acc, item) => {
      if (!item) return acc;
      const key = item.itemType || "Other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    if (Object.keys(groupedItems).length === 0) return null;

    return Object.entries(groupedItems).map(([type, meals]) => (
      <View key={type} className="mb-4">
        <Text className="mb-4 bg-gray-50 py-4 text-center text-sm font-medium text-gray-600">
          {type}
        </Text>
        <View className="gap-2">
          {meals?.map((meal) => (
            <View
              key={meal.lineItemId}
              className="flex-row items-start justify-between rounded-lg px-4 py-2"
            >
              <View className="flex-1 pr-2">
                <Text className="text-sm font-medium text-orderText">{meal?.menuItem}</Text>
                <Text className="text-xs text-gray-500">
                  {meal?.itemCategory} • {t("orders.quantity")}: {meal?.qty}
                </Text>
              </View>
              <Text className="text-sm font-medium text-orderText">
                {meal?.lineAmount.toFixed(2)} {meal?.currency}
              </Text>
            </View>
          ))}
        </View>
      </View>
    ));
  };

  const handlePayNow = async () => {
    if (!user || !checkoutData) return;

    const orderTotalAmount = checkoutData.orderDetails.totalAmount;
    const orderCurrency = checkoutData.orderDetails.currency;
    const orderNumber = checkoutData.orderDetails.orderNumber;
    const orderId = checkoutData.orderDetails.orderId;

    const paymentData = {
      amount: String(orderTotalAmount),
      curr: orderCurrency,
      invoiceId: orderNumber.toString(),
      orderDesc: `Order #${orderNumber}`,
      childId: user.selectedChildId,
      orderId,
      note,
      status: orderTotalAmount === 0 ? "Paid" : "Pending",
    };

    const paymentPromise = api.post(`/api/v1/payment`, paymentData).then(async (response) => {
      const data = response.data;
      if (data.success) {
        if (data.skipPayment) {
          const currentTimestamp = new Date()
            .toISOString()
            .replace(/\D/g, "")
            .slice(0, 14);
          router.replace({
            pathname: "/(auth)/success",
            params: {
              amount: String(orderTotalAmount),
              curr: orderCurrency,
              invoice_id: String(orderNumber),
              message: t("orders.orderProcessedSuccessfully"),
              approval: "FREE",
              timestamp: currentTimestamp,
              ep_id: String(orderId),
            },
          });
          return data;
        }
        if (data.paymentUrl) {
          await Linking.openURL(data.paymentUrl);
        } else {
          throw new Error(t("orders.paymentError"));
        }
        return data;
      }
      throw new Error(t("orders.paymentError"));
    });

    const toastMessages = {
      loading:
        orderTotalAmount === 0
          ? t("orders.processingOrder")
          : t("orders.processingPayment"),
      success:
        orderTotalAmount === 0
          ? t("orders.orderProcessedSuccessfully")
          : t("orders.redirectingToPayment"),
      error: t("orders.paymentError"),
    };

    toast.promise(paymentPromise, toastMessages);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader title={t("orders.orderSummary")} />
      <ScrollView className="flex-1 p-4 pb-36" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {checkoutData?.orderDetails?.weekdayDetails?.length > 0 ? (
            checkoutData.orderDetails.weekdayDetails.map((day) => (
              <View key={day.weekdayId} className="rounded-xl bg-white shadow-sm">
                <Pressable
                  className="flex-row items-center justify-between p-4"
                  onPress={() => toggleDay(day.weekdayId)}
                >
                  <View className="gap-1">
                    <Text className="text-base font-medium">
                      {t(`weekdays.${getWeekdayKey(day.weekday)}.full`)}
                    </Text>
                    <Text className="text-sm text-gray-500">{day.weekdayDate}</Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-base font-semibold text-secondary">
                      {calculateDayTotal(day.lineItems || []).toFixed(2)}{" "}
                      {checkoutData.orderDetails.currency}
                    </Text>
                    {expandedDays[day.weekdayId] ? (
                      <ChevronUp size={20} color="#9CA3AF" />
                    ) : (
                      <ChevronDown size={20} color="#9CA3AF" />
                    )}
                  </View>
                </Pressable>

                {expandedDays[day.weekdayId] && day.lineItems && (
                  <View className="px-4 pb-4">{renderMealSection(day.lineItems)}</View>
                )}
              </View>
            ))
          ) : (
            <View className="py-8">
              <Text className="text-center text-gray-500">{t("orders.noMealsInOrder")}</Text>
            </View>
          )}

          <View className="gap-3 rounded-xl bg-white p-4 shadow-sm">
            <Text className="text-sm font-medium text-gray-700">{t("orders.comments")}</Text>
            <Textarea
              placeholder={t("orders.addComments")}
              className="min-h-20 rounded-lg border-gray-200"
              value={note}
              onChangeText={setNote}
              maxLength={100}
            />
            <Text className="text-right text-xs text-gray-500">{note.length}/100</Text>
          </View>

          <View className="overflow-hidden rounded-xl bg-white shadow-sm">
            <View className="border-b border-gray-100 p-4">
              <Text className="font-medium text-gray-900">{t("orders.billingSummary")}</Text>
            </View>
            <View className="gap-3 p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600">{t("orders.grandTotal")}</Text>
                <Text className="font-medium text-black">
                  {checkoutData?.orderDetails?.grandTotal?.toFixed(2)}{" "}
                  {checkoutData?.orderDetails?.currency}
                </Text>
              </View>

              {checkoutData?.orderDetails?.credits > 0 && (
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">{t("orders.credits")}</Text>
                  <Text className="font-medium text-primary">
                    -{checkoutData?.orderDetails?.credits?.toFixed(2)}{" "}
                    {checkoutData?.orderDetails?.currency}
                  </Text>
                </View>
              )}

              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600">{t("orders.discount")}</Text>
                <Text className="font-medium text-primary">
                  -{checkoutData?.orderDetails?.discount?.toFixed(2)}{" "}
                  {checkoutData?.orderDetails?.currency}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600">{t("orders.subtotal")}</Text>
                <Text className="font-medium">
                  {checkoutData?.orderDetails?.subTotal?.toFixed(2)}{" "}
                  {checkoutData?.orderDetails?.currency}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600">{t("orders.tax")}</Text>
                <Text className="font-medium">
                  {checkoutData?.orderDetails?.tax?.toFixed(2)}{" "}
                  {checkoutData?.orderDetails?.currency}
                </Text>
              </View>

              <View className="border-t border-gray-100 pt-3">
                <View className="flex-row items-center justify-between">
                  <Text className="font-medium text-gray-900">{t("orders.total")}</Text>
                  <Text className="text-lg font-bold text-secondary">
                    {checkoutData?.orderDetails?.totalAmount.toFixed(2)}{" "}
                    {checkoutData?.orderDetails?.currency}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t bg-white px-4 py-4 shadow-lg">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-gray-500">{t("orders.total")}</Text>
            <Text className="text-2xl font-bold">
              {checkoutData?.orderDetails?.totalAmount.toFixed(2)}{" "}
              {checkoutData?.orderDetails?.currency}
            </Text>
          </View>
          <Button onPress={handlePayNow} className="h-12 rounded-xl bg-primary px-8">
            {t("orders.OrderNow")}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OrderSummary;
