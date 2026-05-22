import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronDown, ChevronUp, Receipt, MessageSquare } from "lucide-react-native";
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calcDayTotal = (items) =>
  items.reduce((sum, item) => sum + (item?.lineAmount ?? 0), 0);

// ─── Sub-components ───────────────────────────────────────────────────────────

const MealRow = ({ meal }) => (
  <View className="flex-row items-start justify-between py-2.5 px-1">
    <View className="flex-1 pr-3">
      <Text className="text-sm font-semibold text-gray-800">{meal.menuItem}</Text>
      <Text className="text-xs text-gray-400 mt-0.5">
        {meal.itemCategory} · qty {meal.qty}
      </Text>
    </View>
    <Text className="text-sm font-semibold text-gray-800">
      {meal.lineAmount.toFixed(2)} {meal.currency}
    </Text>
  </View>
);

const MealSection = ({ items }) => {
  const grouped = items.reduce((acc, item) => {
    if (!item) return acc;
    const key = item.itemType || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(grouped).map(([type, meals]) => (
        <View key={type} className="mb-3">
          <View className="bg-gray-50 rounded-lg px-3 py-2 mb-2">
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {type}
            </Text>
          </View>
          {meals.map((meal) => (
            <MealRow key={meal.lineItemId} meal={meal} />
          ))}
        </View>
      ))}
    </>
  );
};

const SummaryRow = ({ label, value, highlight, large, prefix }) => (
  <View className="flex-row items-center justify-between">
    <Text className={large ? "font-semibold text-gray-900" : "text-gray-500 text-sm"}>
      {label}
    </Text>
    <Text
      className={[
        "font-semibold",
        large ? "text-lg text-secondary" : "text-sm text-gray-800",
        highlight ? "text-primary" : "",
      ].join(" ")}
    >
      {prefix}{value}
    </Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const OrderSummary = () => {
  const router = useRouter();
  const { user } = useUser();
  const { t } = useTranslation();
  const { checkoutData } = useCheckoutStore();
  const insets = useSafeAreaInsets();

  const [note, setNote] = useState("");
  const [expandedDays, setExpandedDays] = useState({});

  const toggleDay = (id) =>
    setExpandedDays((prev) => ({ ...prev, [id]: !prev[id] }));

  const order = checkoutData?.orderDetails;

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <ScreenHeader title={t("orders.orderSummary")} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400 text-base">{t("orders.noOrderSummaryData")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handlePayNow = async () => {
    if (!user || !order) return;

    const paymentData = {
      amount: String(order.totalAmount),
      curr: order.currency,
      invoiceId: order.orderNumber.toString(),
      orderDesc: `Order #${order.orderNumber}`,
      childId: user.selectedChildId,
      orderId: order.orderId,
      note,
      status: order.totalAmount === 0 ? "Paid" : "Pending",
    };

    const paymentPromise = api.post("/api/v1/payment", paymentData).then(async (response) => {
      const data = response.data;
      if (!data.success) throw new Error(t("orders.paymentError"));

      if (data.skipPayment) {
        const timestamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
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

      if (data.paymentUrl) {
        router.push({
          pathname: "/(common)/webview",
          params: { url: data.paymentUrl },
        });
      } else {
        throw new Error(t("orders.paymentError"));
      }

      return data;
    });

    toast.promise(paymentPromise, {
      loading: order.totalAmount === 0 ? t("orders.processingOrder") : t("orders.processingPayment"),
      success: order.totalAmount === 0 ? t("orders.orderProcessedSuccessfully") : t("orders.redirectingToPayment"),
      error: t("orders.paymentError"),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader title={t("orders.orderSummary")} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Day cards */}
        {order.weekdayDetails?.length > 0 ? (
          order.weekdayDetails.map((day) => {
            const isExpanded = expandedDays[day.weekdayId];
            const dayTotal = calcDayTotal(day.lineItems ?? []);

            return (
              <View key={day.weekdayId} className="rounded-2xl bg-white shadow-sm overflow-hidden">
                <Pressable
                  className="flex-row items-center justify-between px-4 py-4"
                  onPress={() => toggleDay(day.weekdayId)}
                >
                  <View className="gap-0.5">
                    <Text className="text-sm font-bold text-gray-800">
                      {t(`weekdays.${getWeekdayKey(day.weekday)}.full`)}
                    </Text>
                    <Text className="text-xs text-gray-400">{day.weekdayDate}</Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-sm font-bold text-secondary">
                      {dayTotal.toFixed(2)} {order.currency}
                    </Text>
                    {isExpanded ? (
                      <ChevronUp size={18} color="#9CA3AF" />
                    ) : (
                      <ChevronDown size={18} color="#9CA3AF" />
                    )}
                  </View>
                </Pressable>

                {isExpanded && day.lineItems?.length > 0 && (
                  <View className="border-t border-gray-100 px-4 pt-3 pb-4">
                    <MealSection items={day.lineItems} />
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View className="py-12 items-center">
            <Text className="text-gray-400 text-sm">{t("orders.noMealsInOrder")}</Text>
          </View>
        )}

        {/* Notes */}
        <View className="rounded-2xl bg-white shadow-sm p-4 gap-3">
          <View className="flex-row items-center gap-2">
            <MessageSquare size={16} color="#9CA3AF" />
            <Text className="text-sm font-semibold text-gray-700">{t("orders.comments")}</Text>
          </View>
          <Textarea
            placeholder={t("orders.addComments")}
            className="min-h-20 rounded-xl border-gray-100 bg-gray-50 text-sm"
            value={note}
            onChangeText={setNote}
            maxLength={100}
          />
          <Text className="text-right text-xs text-gray-400">{note.length}/100</Text>
        </View>

        {/* Billing summary */}
        <View className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <View className="flex-row items-center gap-2 border-b border-gray-100 px-4 py-3.5">
            <Receipt size={16} color="#9CA3AF" />
            <Text className="text-sm font-bold text-gray-800">{t("orders.billingSummary")}</Text>
          </View>
          <View className="px-4 py-4 gap-3">
            <SummaryRow
              label={t("orders.grandTotal")}
              value={`${order.grandTotal?.toFixed(2)} ${order.currency}`}
            />
            {order.credits > 0 && (
              <SummaryRow
                label={t("orders.credits")}
                value={`${order.credits?.toFixed(2)} ${order.currency}`}
                highlight
                prefix="-"
              />
            )}
            <SummaryRow
              label={t("orders.discount")}
              value={`${order.discount?.toFixed(2)} ${order.currency}`}
              highlight
              prefix="-"
            />
            <SummaryRow
              label={t("orders.subtotal")}
              value={`${order.subTotal?.toFixed(2)} ${order.currency}`}
            />
            <SummaryRow
              label={t("orders.tax")}
              value={`${order.tax?.toFixed(2)} ${order.currency}`}
            />
            <View className="border-t border-gray-100 pt-3 mt-1">
              <SummaryRow
                label={t("orders.total")}
                value={`${order.totalAmount?.toFixed(2)} ${order.currency}`}
                large
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View
        style={{ paddingBottom: insets.bottom + 8 }}
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-4 shadow-lg"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-gray-400 mb-0.5">{t("orders.total")}</Text>
            <Text className="text-2xl font-extrabold text-gray-900">
              {order.totalAmount?.toFixed(2)}{" "}
              <Text className="text-base font-semibold text-gray-400">{order.currency}</Text>
            </Text>
          </View>
          <Button onPress={handlePayNow} className="h-12 rounded-2xl bg-primary px-8">
            {t("orders.OrderNow")}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OrderSummary;