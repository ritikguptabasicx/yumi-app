import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { format, isValid } from "date-fns";
import { useRouter } from "expo-router";
import useSWR from "swr";
import {
  Calendar,
  ChevronRight,
  PackageCheck,
  PackageX,
  Receipt,
  ShoppingCart,
} from "lucide-react-native";
import { useUser } from "@/contexts/UserContext";
import toast from "@/lib/toast";
import ScreenHeader from "@/components/ScreenHeader";
import OrderDetails from "@/components/OrderDetails";
import { useTranslation } from "react-i18next";
import Loader from "@/components/Loader";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

const statusStyles = {
  cancelled: "bg-red-50 text-red-600",
  canceled: "bg-red-50 text-red-600",
  completed: "bg-success-bg text-success-text",
  delivered: "bg-success-bg text-success-text",
  paid: "bg-primary-muted text-primary",
  pending: "bg-secondary-muted text-secondary",
};

const getStatusClass = (status = "") =>
  statusStyles[String(status).toLowerCase()] || "bg-muted text-muted-foreground";

const getOrderAmount = (order) => Number(order?.totalAmount || 0);

const formatOrderDate = (date, fallback) => {
  if (!date) return fallback;
  const parsedDate = new Date(date);
  if (!isValid(parsedDate)) return fallback;
  return format(parsedDate, "MMM d, yyyy");
};

const OrderHistory = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [activeStatus, setActiveStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const { mutate: mutateOrderHistory } = useSWR(
    user?.id ? ["order-history", user.id] : null,
    async () => {
      const userId = user?.id ? parseInt(user.id) : 0;
      const childId = user?.selectedChildId || 0;
      const response = await api.post("/api/v1/order/history", { userId, childId });
      setOrders(response.data.data || []);
      return response.data.data || [];
    }
  );

  useEffect(() => {
    const fetchOrderHistory = async () => {
      setIsLoadingOrders(true);
      try {
        const userId = user?.id ? parseInt(user.id) : 0;
        const childId = user?.selectedChildId || 0;

        const response = await api.post("/api/v1/order/history", {
          userId,
          childId,
        });

        const data = response.data;
        setOrders(data.data || []);
      } catch (error) {
        console.error("Error fetching order history:", error);
        toast.error(t("status.fetchOrderHistoryFailed"));
      } finally {
        setIsLoadingOrders(false);
      }
    };

    if (user) fetchOrderHistory();
  }, [user, t]);

  const handleOrderDetails = async (orderId) => {
    setIsLoadingDetails(true);
    try {
      const userId = user?.id ? parseInt(user.id) : 0;

      const response = await api.post("/api/v1/order/details", {
        userId,
        orderId,
      });

      const data = response.data;
      if (!data?.data?.orderDetails) throw new Error("Invalid order data received");

      setSelectedOrder(data.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error(t("status.fetchOrderDetailsFailed"));
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const statusFilters = useMemo(() => {
    const statuses = orders
      .map((order) => order.orderStatus)
      .filter(Boolean)
      .filter((status, index, list) => list.indexOf(status) === index);
    return ["all", ...statuses];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (activeStatus === "all") return orders;
    return orders.filter((order) => order.orderStatus === activeStatus);
  }, [activeStatus, orders]);

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + getOrderAmount(order), 0),
    [orders]
  );

  const latestOrderDate = useMemo(() => {
    const dates = orders
      .map((order) => (order.orderDate ? new Date(order.orderDate) : null))
      .filter((date) => date && !Number.isNaN(date.getTime()))
      .sort((a, b) => b.getTime() - a.getTime());
    return dates[0] ? format(dates[0], "MMM d, yyyy") : t("orders.notAvailable");
  }, [orders, t]);

  if (isLoadingOrders || isLoadingDetails) {
    return <Loader />;
  }

  if (selectedOrder) {
    return <OrderDetails data={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader title={t("navigation.orderHistory")} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {orders.length > 0 ? (
          <View>
            <View className="mb-5 overflow-hidden rounded-2xl bg-primary">
              <View className="px-5 py-5">
                <Text className="text-sm font-medium text-white/80">
                  {t("orders.historyOverview")}
                </Text>
                <Text className="mt-1 text-3xl font-bold text-white">
                  {orders.length}
                </Text>
                <Text className="mt-1 text-sm text-white/80">
                  {t("orders.ordersPlaced")}
                </Text>
              </View>
              <View className="flex-row border-t border-white/15">
                <View className="flex-1 px-5 py-3">
                  <Text className="text-xs uppercase text-white/70">
                    {t("orders.totalSpent")}
                  </Text>
                  <Text className="mt-1 font-bold text-white">
                    {totalSpent.toFixed(2)} RON
                  </Text>
                </View>
                <View className="w-px bg-white/15" />
                <View className="flex-1 px-5 py-3">
                  <Text className="text-xs uppercase text-white/70">
                    {t("orders.latestOrder")}
                  </Text>
                  <Text className="mt-1 font-bold text-white">{latestOrderDate}</Text>
                </View>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4 -mx-1"
              contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
            >
              {statusFilters.map((status) => {
                const active = activeStatus === status;
                return (
                  <Pressable
                    key={status}
                    onPress={() => setActiveStatus(status)}
                    className={cn(
                      "rounded-full border px-4 py-2",
                      active
                        ? "border-primary bg-primary"
                        : "border-border bg-white"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-sm font-semibold capitalize",
                        active ? "text-white" : "text-muted-foreground"
                      )}
                    >
                      {status === "all" ? t("orders.allOrders") : status}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View className="gap-3">
              {filteredOrders.map((order) => (
                <Pressable key={order.id} onPress={() => handleOrderDetails(order.id)}>
                  <Card className="overflow-hidden rounded-2xl border-border/70 bg-white shadow-sm">
                    <CardContent className="p-4">
                      <View className="flex-row items-start gap-3">
                        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-secondary-muted">
                          <Receipt size={22} color="#F37C21" />
                        </View>
                        <View className="min-w-0 flex-1">
                          <View className="flex-row items-start justify-between gap-2">
                            <View className="min-w-0 flex-1">
                              <Text className="text-base font-bold text-foreground">
                                {t("activeOrder.order")} #{order.orderNo}
                              </Text>
                              <View className="mt-1 flex-row items-center gap-1.5">
                                <Calendar size={14} color="#64748B" />
                                <Text className="text-sm text-muted-foreground">
                                  {formatOrderDate(order.orderDate, t("orders.notAvailable"))}
                                </Text>
                              </View>
                            </View>
                            <Text
                              className={cn(
                                "rounded-full px-3 py-1 text-xs font-bold capitalize",
                                getStatusClass(order.orderStatus)
                              )}
                            >
                              {order.orderStatus}
                            </Text>
                          </View>

                          <View className="mt-4 flex-row items-center justify-between">
                            <View className="flex-row items-center gap-2">
                              <ShoppingCart size={16} color="#019C7F" />
                              <Text className="text-xs font-medium uppercase text-muted-foreground">
                                {t("orders.totalPrice")}
                              </Text>
                            </View>
                            <View className="flex-row items-center gap-2">
                              <Text className="text-lg font-bold text-secondary">
                                {getOrderAmount(order).toFixed(2)} RON
                              </Text>
                              <ChevronRight size={18} color="#94A3B8" />
                            </View>
                          </View>
                        </View>
                      </View>
                    </CardContent>
                  </Card>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <View className="min-h-96 items-center justify-center rounded-2xl bg-white px-6 py-10">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary-muted">
              <PackageX size={42} color="#019C7F" />
            </View>
            <Text className="mb-2 text-xl font-bold text-foreground">
              {t("orders.noOrdersYet")}
            </Text>
            <Text className="text-center text-sm leading-5 text-muted-foreground">
              {t("orders.noOrdersMessage")}
            </Text>
            <Pressable
              onPress={() => router.push("/(app)/(tabs)/meal-planner")}
              className="mt-6 flex-row items-center gap-2 rounded-full bg-primary px-5 py-3"
            >
              <PackageCheck size={18} color="#fff" />
              <Text className="font-semibold text-white">{t("orders.OrderNow")}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderHistory;
