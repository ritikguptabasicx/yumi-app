import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Package2, Trash2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/apiClient";
import { useUser } from "@/contexts/UserContext";
import Loader from "@/components/Loader";
import toast from "@/lib/toast";
import TeacherScreenHeader from "@/components/teachers/TeacherScreenHeader";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getWeekdayKey } from "@/lib/weekdays";

const TeacherActiveOrderPage = () => {
  const { orderId } = useLocalSearchParams();
  const { user } = useUser();
  const { t } = useTranslation();
  const router = useRouter();
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState({});
  const [selectedDayToDelete, setSelectedDayToDelete] = useState(null);

  const fetchOrderDetails = useCallback(async () => {
    if (!user?.id || !orderId) return;
    setIsLoading(true);
    try {
      const response = await api.post("/api/v1/t/order-details", {
        userId: user.id,
        orderId,
      });
      setOrderData(response.data?.data);
    } catch (error) {
      console.error("Teacher active order details error:", error);
      toast.error(t("orders.fetchError"));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, orderId, t]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleCancelDay = async (day) => {
    try {
      await api.post("/api/v1/t/cancel-week-day-meal", {
        orderId,
        weekDayID: day?.weekdayId,
        userId: user?.id,
      });
      toast.success(t("activeOrder.cancellation"));
      await fetchOrderDetails();
    } catch {
      toast.error(`${t("activeOrder.cancelFailed")} ${day?.weekday}`);
    } finally {
      setSelectedDayToDelete(null);
    }
  };

  if (isLoading) return <Loader />;

  const order = orderData?.orderDetails;

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full rounded-2xl bg-white p-8">
            <Package2 size={48} color="#CBD5E1" />
            <Text className="mt-4 text-2xl font-black text-slate-900">
              {t("orders.noOrderFound")}
            </Text>
            <Text className="mt-2 text-sm font-semibold text-slate-500">
              {t("orders.orderDetailsNotAvailable")}
            </Text>
            <Button
              onPress={() => router.replace("/(app)/teacher")}
              className="mt-5 rounded-xl"
            >
              {t("common.backToHome")}
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <TeacherScreenHeader title={`${t("activeOrder.order")} #${order.orderNumber}`} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          {order.weekdayDetails?.map((day) => {
            const isExpanded = expandedDays[day.weekdayId];
            const total = (day.lineItems || []).reduce(
              (sum, item) => sum + (item.lineAmount || 0),
              0
            );
            const skipped = day.status === "Skipped";

            return (
              <View
                key={day.weekdayId}
                className={`overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm ${skipped ? "opacity-70" : ""}`}
              >
                <Pressable
                  onPress={() =>
                    setExpandedDays((prev) => ({
                      ...prev,
                      [day.weekdayId]: !prev[day.weekdayId],
                    }))
                  }
                  className="flex-row items-center justify-between gap-3 px-4 py-4"
                >
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-base font-black text-slate-900">
                        {t(`weekdays.${getWeekdayKey(day.weekday)}.full`)}
                      </Text>
                      <View className={`rounded-full px-2 py-0.5 ${skipped ? "bg-slate-100" : "bg-emerald-50"}`}>
                        <Text className={`text-xs font-bold ${skipped ? "text-slate-500" : "text-emerald-700"}`}>
                          {t(`orders.${String(day.status).toLowerCase()}`)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {day.cancellation === 1 && (
                    <Pressable
                      onPress={() => setSelectedDayToDelete(day)}
                      className="h-9 w-9 items-center justify-center rounded-xl bg-red-50"
                    >
                      <Trash2 size={16} color="#DC2626" strokeWidth={2.5} />
                    </Pressable>
                  )}
                  <Text className="text-sm font-black text-secondary">
                    {total.toFixed(2)} {order.currency}
                  </Text>
                </Pressable>

                {isExpanded && (
                  <View className="gap-3 border-t border-slate-100 px-4 py-4">
                    {day.lineItems?.length ? (
                      day.lineItems.map((item) => (
                        <View
                          key={item.lineItemId}
                          className="flex-row items-start justify-between gap-3"
                        >
                          <View className="min-w-0 flex-1">
                            <Text className="text-sm font-bold text-slate-800">
                              {item.menuItem}
                            </Text>
                            <Text className="mt-1 text-xs font-semibold text-slate-400">
                              {item.itemCategory} · {t("orders.quantity")}: {item.quantity}
                            </Text>
                          </View>
                          <Text className="text-sm font-bold text-slate-800">
                            {item.lineAmount?.toFixed(2)} {order.currency}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text className="text-sm font-semibold text-slate-400">
                        {t("orders.noMealsForDay")}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <AlertDialog
        open={!!selectedDayToDelete}
        onOpenChange={() => setSelectedDayToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("orders.cancelMealTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("orders.cancelMealDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={() => setSelectedDayToDelete(null)}>
              {t("orders.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onPress={() => handleCancelDay(selectedDayToDelete)}>
              {t("orders.confirmCancellation")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
};

export default TeacherActiveOrderPage;
