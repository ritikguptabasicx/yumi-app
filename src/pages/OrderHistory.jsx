import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { format } from "date-fns";
import { ShoppingCart, PackageX } from "lucide-react-native";
import { useUser } from "@/contexts/UserContext";
import toast from "@/lib/toast";
import ScreenHeader from "@/components/ScreenHeader";
import OrderDetails from "@/components/OrderDetails";
import { useTranslation } from "react-i18next";
import Loader from "@/components/Loader";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/apiClient";

const OrderHistory = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

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

  if (isLoadingOrders || isLoadingDetails) {
    return <Loader />;
  }

  if (selectedOrder) {
    return <OrderDetails data={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader title={t("navigation.orderHistory")} />
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {orders.length > 0 ? (
          <View className="gap-4">
            {orders.map((order) => (
              <Pressable key={order.id} onPress={() => handleOrderDetails(order.id)}>
                <Card className="shadow-sm">
                  <CardContent className="gap-4 p-6">
                    <View className="flex-row items-start justify-between">
                      <Text className="text-base font-bold text-gray-900">
                        {t("activeOrder.order")} #{order.orderNo}
                      </Text>
                      <Text className="rounded-full bg-success-bg px-3 py-0.5 text-xs font-medium text-success-text">
                        {order.orderStatus}
                      </Text>
                    </View>

                    <Text className="text-sm font-semibold text-gray-500">
                      {t("orders.orderedDate")} :{" "}
                      {order.orderDate
                        ? format(new Date(order.orderDate), "MMMM d, yyyy")
                        : t("orders.notAvailable")}
                    </Text>

                    <View className="flex-row items-center gap-2">
                      <ShoppingCart size={16} color="#F37C21" />
                      <Text className="text-base font-bold text-secondary">
                        {order.totalAmount.toFixed(2)} RON
                      </Text>
                    </View>
                  </CardContent>
                </Card>
              </Pressable>
            ))}
          </View>
        ) : (
          <View className="flex-1 min-h-96 items-center justify-center">
            <PackageX size={64} color="#9CA3AF" />
            <Text className="mb-2 mt-4 text-lg font-semibold text-gray-500">
              {t("orders.noOrdersYet")}
            </Text>
            <Text className="text-sm text-gray-500">{t("orders.noOrdersMessage")}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderHistory;
