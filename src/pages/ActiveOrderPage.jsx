import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Package2,
  Receipt,
  Trash2,
} from "lucide-react-native";
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
import { useUser } from "@/contexts/UserContext";
import toast from "@/lib/toast";
import ScreenHeader from "@/components/ScreenHeader";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import Loader from "@/components/Loader";
import { api } from "@/lib/apiClient";
import { getWeekdayKey } from "@/lib/weekdays";

const getDayTotal = (lineItems = []) =>
  lineItems.reduce((total, item) => total + (item?.lineAmount || 0), 0);

const formatAmount = (amount, currency) => `${Number(amount || 0).toFixed(2)} ${currency || ""}`;

const getStatusClassName = (status = "") =>
  status === "Ordered"
    ? "bg-success-bg text-success-text"
    : status === "Skipped"
      ? "bg-muted text-muted-foreground"
      : "bg-secondary-muted text-secondary";

const ActiveOrderPage = () => {
  const { orderId } = useLocalSearchParams();
  const { user } = useUser();
  const { t } = useTranslation();
  const router = useRouter();

  const [orderData, setOrderData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDayToDelete, setSelectedDayToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState({});

  const fetchOrderDetails = useCallback(async () => {
    if (!user || !orderId) return;

    try {
      setIsLoading(true);
      const response = await api.post(`/api/v1/order/details`, {
        userId: user?.id,
        orderId,
      });

      const data = response.data;
      setOrderData(data.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error(t("orders.fetchError"));
    } finally {
      setIsLoading(false);
    }
  }, [user, orderId, t]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const toggleDay = (weekdayId) => {
    setExpandedDays((prev) => ({
      ...prev,
      [weekdayId]: !prev[weekdayId],
    }));
  };

  const handleCancelDay = async (day, item) => {
    try {
      await api.post(`/api/v1/meal/cancel-weekday`, {
        orderId,
        weekDayID: item?.weekDayId,
        userId: user?.id,
        childId: user?.selectedChildId,
      });

      await fetchOrderDetails();
      toast.success(t("activeOrder.cancellation"));
    } catch {
      toast.error(t("activeOrder.cancelFailed", { day }));
    } finally {
      setShowDeleteConfirm(false);
      setSelectedDayToDelete(null);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!orderData?.orderDetails) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background p-6" edges={["top"]}>
        <Card className="w-full max-w-md p-8">
          <Package2 size={48} color="#9CA3AF" style={{ alignSelf: "center", marginBottom: 16 }} />
          <Text className="mb-2 text-center text-2xl font-bold text-gray-900">
            {t("orders.noOrderFound")}
          </Text>
          <Text className="mb-4 text-center text-gray-600">
            {t("orders.orderDetailsNotAvailable")}
          </Text>
          <Button onPress={() => router.replace("/(app)/(tabs)")} className="w-full">
            {t("common.backToHome")}
          </Button>
        </Card>
      </SafeAreaView>
    );
  }

  const orderDetails = orderData.orderDetails;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader
        title={`${t("activeOrder.order")} #${orderDetails?.orderNumber}`}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 overflow-hidden rounded-3xl bg-primary">
          <View className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
          <View className="absolute -bottom-12 left-12 h-28 w-28 rounded-full bg-secondary/30" />
          <View className="px-5 py-5">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Receipt size={24} color="#fff" />
              </View>
              <Text className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
                {t("navigation.activeOrder")}
              </Text>
            </View>
            <Text className="text-sm font-medium text-white/80">
              {t("activeOrder.order")} #{orderDetails.orderNumber}
            </Text>
            <Text className="mt-1 text-3xl font-bold text-white">
              {formatAmount(orderDetails.totalAmount, orderDetails.currency)}
            </Text>
            {orderDetails.orderDate ? (
              <View className="mt-3 flex-row items-center gap-2">
                <CalendarDays size={15} color="rgba(255,255,255,0.8)" />
                <Text className="text-sm text-white/80">
                  {new Date(orderDetails.orderDate).toLocaleDateString()}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="gap-3">
          {orderDetails?.weekdayDetails.map((dayDetail) => {
            const isExpanded = expandedDays[dayDetail.weekdayId];
            const dayTotal = getDayTotal(dayDetail.lineItems);
            const hasItems = dayDetail?.lineItems?.length > 0;
            const statusKey = dayDetail.status?.toLowerCase?.() || "ordered";
            return (
              <View
                key={dayDetail.weekdayId}
                className={cn(
                  "overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm",
                  dayDetail.status === "Skipped" && "opacity-75"
                )}
              >
                <View className="flex-row items-center px-4 py-4">
                  <Pressable
                    className="flex-1 flex-row items-center justify-between pr-2"
                    onPress={() => toggleDay(dayDetail.weekdayId)}
                  >
                    <View className="min-w-0 flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-base font-bold text-foreground">
                          {t(`weekdays.${getWeekdayKey(dayDetail.weekday)}.full`)}
                        </Text>
                        <Text
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-bold",
                            getStatusClassName(dayDetail.status)
                          )}
                        >
                          {t(`orders.${statusKey}`)}
                        </Text>
                      </View>
                      <Text className="mt-1 text-sm text-muted-foreground">
                        {dayDetail.weekdayDate}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      {hasItems && (
                        <Text className="text-sm font-bold text-secondary">
                          {formatAmount(dayTotal, orderDetails.currency)}
                        </Text>
                      )}
                      {isExpanded ? (
                        <ChevronUp size={18} color="#94A3B8" />
                      ) : (
                        <ChevronDown size={18} color="#94A3B8" />
                      )}
                    </View>
                  </Pressable>

                  {dayDetail.cancellation === 1 && (
                    <Pressable
                      className="ml-2 h-9 w-9 items-center justify-center rounded-full bg-red-50"
                      onPress={() => {
                        setSelectedDayToDelete({
                          day: dayDetail.weekday,
                          item: {
                            weekDayId: dayDetail.weekdayId,
                            orderId: orderData.orderDetails.orderId,
                          },
                        });
                        setShowDeleteConfirm(true);
                      }}
                    >
                      <Trash2 size={16} color="#DC2626" />
                    </Pressable>
                  )}
                </View>

                {isExpanded && (
                  <View className="px-4 pb-4">
                    {hasItems ? (
                      <View className="gap-3 border-t border-border/70 pt-4">
                        {dayDetail.lineItems.map((item) => (
                          <View
                            key={item.lineItemId}
                            className="rounded-2xl bg-background p-3"
                          >
                            <View className="flex-row items-start justify-between gap-3">
                              <View className="min-w-0 flex-1">
                                <Text className="text-sm font-semibold leading-5 text-foreground">
                                  {item.menuItem}
                                </Text>
                                <View className="mt-2 flex-row flex-wrap items-center gap-2">
                                  <Text className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    {item.itemCategory}
                                  </Text>
                                  <Text className="rounded-full bg-primary-muted px-2.5 py-1 text-xs font-medium text-primary">
                                    {t("orders.quantity")}: {item.quantity}
                                  </Text>
                                </View>
                              </View>
                              <Text className="shrink-0 text-sm font-bold text-secondary">
                                {formatAmount(item.lineAmount, orderDetails.currency)}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text className="mt-4 rounded-2xl bg-background p-4 text-sm text-muted-foreground">
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

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("orders.cancelMealTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("orders.cancelMealDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={() => setShowDeleteConfirm(false)}>
              {t("orders.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onPress={() => {
                if (selectedDayToDelete) {
                  handleCancelDay(selectedDayToDelete.day, selectedDayToDelete.item);
                }
              }}
              className="bg-red-500"
            >
              {t("orders.confirmCancellation")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
};

export default ActiveOrderPage;
