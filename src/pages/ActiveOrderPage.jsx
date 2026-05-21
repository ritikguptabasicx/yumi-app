import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, ChevronUp } from "lucide-react-native";
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
import { Package2, Trash2 } from "lucide-react-native";
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScreenHeader
        title={`${t("activeOrder.order")} #${orderData?.orderDetails?.orderNumber}`}
      />

      <ScrollView className="flex-1 p-4 pb-24" showsVerticalScrollIndicator={false}>
        <View className="gap-3">
          {orderData?.orderDetails?.weekdayDetails.map((dayDetail) => {
            const isExpanded = expandedDays[dayDetail.weekdayId];
            return (
              <View
                key={dayDetail.weekdayId}
                className={cn(
                  "overflow-hidden rounded-xl border bg-white shadow-sm",
                  dayDetail.status === "Skipped" && "opacity-75"
                )}
              >
                <View className="flex-row items-center px-4 py-3">
                  <Pressable
                    className="flex-1 flex-row items-center justify-between pr-2"
                    onPress={() => toggleDay(dayDetail.weekdayId)}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="text-base font-medium">
                        {t(`weekdays.${getWeekdayKey(dayDetail.weekday)}.full`)}
                      </Text>
                      <Text
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          dayDetail.status === "Ordered" && "bg-success-bg text-success-text",
                          dayDetail.status === "Skipped" && "bg-gray-100 text-gray-600"
                        )}
                      >
                        {t(`orders.${dayDetail.status.toLowerCase()}`)}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      {dayDetail?.lineItems?.length > 0 && (
                        <Text className="text-sm font-medium text-red-600">
                          {dayDetail.lineItems
                            .reduce((total, item) => total + item.lineAmount, 0)
                            .toFixed(2)}{" "}
                          {orderData.orderDetails.currency}
                        </Text>
                      )}
                      {isExpanded ? (
                        <ChevronUp size={16} color="#9CA3AF" />
                      ) : (
                        <ChevronDown size={16} color="#9CA3AF" />
                      )}
                    </View>
                  </Pressable>

                  {dayDetail.cancellation === 1 && (
                    <Pressable
                      className="ml-2 h-8 w-8 items-center justify-center"
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
                    {dayDetail?.lineItems?.length > 0 ? (
                      <View className="gap-3 border-t border-gray-100 pt-4">
                        {dayDetail.lineItems.map((item) => (
                          <View
                            key={item.lineItemId}
                            className="flex-row items-start justify-between"
                          >
                            <View className="flex-1 gap-1 pr-2">
                              <Text className="text-sm font-medium">{item.menuItem}</Text>
                              <View className="flex-row items-center gap-2">
                                <Text className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                                  {item.itemCategory}
                                </Text>
                                <Text className="text-xs text-gray-500">
                                  {t("orders.quantity")}: {item.quantity}
                                </Text>
                              </View>
                            </View>
                            <Text className="text-sm font-medium text-red-600">
                              {item.lineAmount.toFixed(2)} {orderData.orderDetails.currency}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text className="mt-4 text-sm italic text-gray-500">
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
