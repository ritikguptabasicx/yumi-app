import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronDown, ChevronUp, MessageSquare, Receipt } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import TeacherScreenHeader from "@/components/teachers/TeacherScreenHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { api } from "@/lib/apiClient";
import toast from "@/lib/toast";
import { getWeekdayKey } from "@/lib/weekdays";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useMealPlannerStore } from "@/store/useMealStore";

const dayTotal = (items = []) =>
  items.reduce((sum, item) => sum + (item?.lineAmount || 0), 0);

const TeacherOrderSummary = () => {
  const router = useRouter();
  const { user } = useUser();
  const { t } = useTranslation();
  const { checkoutData, clearCheckoutData } = useCheckoutStore();
  const { resetStore } = useMealPlannerStore();
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState("");
  const [expandedDays, setExpandedDays] = useState({});
  const order = checkoutData?.orderDetails;

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <TeacherScreenHeader title={t("orders.orderSummary")} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base font-semibold text-slate-400">
            {t("orders.noOrderSummaryData")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handlePayNow = async () => {
    const paymentData = {
      amount: String(order.totalAmount),
      curr: order.currency,
      invoiceId: order.orderNumber.toString(),
      orderDesc: `Order #${order.orderNumber}`,
      userId: user.id,
      orderId: order.orderId,
      note,
      status: order.totalAmount === 0 ? "Paid" : "Pending",
    };

    const paymentPromise = api.post("/api/v1/t/payment", paymentData).then((response) => {
      const data = response.data;
      if (!data.success) throw new Error(t("orders.paymentError"));

      if (data.skipPayment) {
        const timestamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
        resetStore();
        clearCheckoutData();
        router.replace({
          pathname: "/(auth)/success",
          params: {
            amount: String(order.totalAmount),
            curr: order.currency,
            invoice_id: String(order.orderNumber),
            message: t("orders.orderProcessedSuccessfully"),
            approval: "FREE",
            timestamp,
            ep_id: String(order.orderId),
          },
        });
        return data;
      }

      const url = data.paymentUrl || data.redirect_url;
      if (!url) throw new Error(t("orders.paymentError"));
      router.push({ pathname: "/(common)/webview", params: { url } });
      return data;
    });

    toast.promise(paymentPromise, {
      loading:
        order.totalAmount === 0
          ? t("orders.processingOrder")
          : t("orders.processingPayment"),
      success:
        order.totalAmount === 0
          ? t("orders.orderProcessedSuccessfully")
          : t("orders.redirectingToPayment"),
      error: t("orders.paymentError"),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <TeacherScreenHeader title={t("orders.orderSummary")} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {order.weekdayDetails?.map((day) => {
          const isExpanded = expandedDays[day.weekdayId];
          const total = dayTotal(day.lineItems);
          return (
            <View key={day.weekdayId} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <Pressable
                className="flex-row items-center justify-between px-4 py-4"
                onPress={() =>
                  setExpandedDays((prev) => ({
                    ...prev,
                    [day.weekdayId]: !prev[day.weekdayId],
                  }))
                }
              >
                <View>
                  <Text className="text-sm font-black text-slate-800">
                    {t(`weekdays.${getWeekdayKey(day.weekday)}.full`)}
                  </Text>
                  <Text className="mt-0.5 text-xs font-semibold text-slate-400">
                    {day.weekdayDate}
                  </Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Text className="text-sm font-black text-secondary">
                    {total.toFixed(2)} {order.currency}
                  </Text>
                  {isExpanded ? (
                    <ChevronUp size={18} color="#94A3B8" />
                  ) : (
                    <ChevronDown size={18} color="#94A3B8" />
                  )}
                </View>
              </Pressable>

              {isExpanded && (
                <View className="gap-2 border-t border-slate-100 px-4 py-3">
                  {day.lineItems?.map((meal) => (
                    <View key={meal.lineItemId} className="flex-row justify-between gap-3 py-2">
                      <View className="min-w-0 flex-1">
                        <Text className="text-sm font-bold text-slate-800" numberOfLines={2}>
                          {meal.menuItem}
                        </Text>
                        <Text className="mt-0.5 text-xs font-semibold text-slate-400">
                          {meal.itemCategory} · qty {meal.qty}
                        </Text>
                      </View>
                      <Text className="text-sm font-bold text-slate-800">
                        {meal.lineAmount?.toFixed(2)} {meal.currency}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View className="rounded-2xl bg-white p-4 shadow-sm">
          <View className="mb-3 flex-row items-center gap-2">
            <MessageSquare size={16} color="#94A3B8" />
            <Text className="text-sm font-bold text-slate-700">{t("orders.comments")}</Text>
          </View>
          <Textarea
            value={note}
            onChangeText={setNote}
            placeholder={t("orders.addComments")}
            className="min-h-20 rounded-xl border-slate-100 bg-slate-50"
            maxLength={100}
          />
        </View>

        <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="flex-row items-center gap-2 border-b border-slate-100 px-4 py-3">
            <Receipt size={16} color="#94A3B8" />
            <Text className="text-sm font-black text-slate-800">
              {t("orders.billingSummary")}
            </Text>
          </View>
          <View className="gap-3 px-4 py-4">
            {[
              [t("orders.grandTotal"), order.grandTotal],
              [t("orders.credits"), -Number(order.credits || 0)],
              [t("orders.discount"), -Number(order.discount || 0)],
              [t("orders.subtotal"), order.subTotal],
              [t("orders.tax"), order.tax],
            ].map(([label, value]) => (
              <View key={label} className="flex-row justify-between">
                <Text className="text-sm font-semibold text-slate-500">{label}</Text>
                <Text className="text-sm font-bold text-slate-800">
                  {Number(value || 0).toFixed(2)} {order.currency}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        style={{ paddingBottom: insets.bottom + 8 }}
        className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-4 pt-4 shadow-lg"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="mb-0.5 text-xs font-semibold text-slate-400">
              {t("orders.total")}
            </Text>
            <Text className="text-2xl font-black text-slate-900">
              {order.totalAmount?.toFixed(2)}{" "}
              <Text className="text-base font-bold text-slate-400">{order.currency}</Text>
            </Text>
          </View>
          <Button onPress={handlePayNow} className="h-12 rounded-2xl px-8">
            {t("orders.OrderNow")}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TeacherOrderSummary;
