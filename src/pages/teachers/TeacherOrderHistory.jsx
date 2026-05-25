import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { format, isValid } from "date-fns";
import { PackageX, ShoppingCart } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/apiClient";
import { useUser } from "@/contexts/UserContext";
import Loader from "@/components/Loader";
import OrderDetails from "@/components/OrderDetails";
import toast from "@/lib/toast";
import TeacherScreenHeader from "@/components/teachers/TeacherScreenHeader";

const formatOrderDate = (date, fallback) => {
  if (!date) return fallback;
  const parsed = new Date(date);
  if (!isValid(parsed)) return fallback;
  return format(parsed, "MMMM d, yyyy");
};

const TeacherOrderHistory = () => {
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
        const response = await api.post("/api/v1/t/order-history", {
          userId: user?.id ? parseInt(user.id) : 0,
        });
        setOrders(response.data?.data || []);
      } catch (error) {
        console.error("Teacher order history error:", error);
        toast.error(t("status.fetchOrderHistoryFailed"));
      } finally {
        setIsLoadingOrders(false);
      }
    };

    if (user?.id) fetchOrderHistory();
  }, [user?.id, t]);

  const handleOrderDetails = async (orderId) => {
    setIsLoadingDetails(true);
    try {
      const response = await api.post("/api/v1/t/order-details", {
        userId: user?.id ? parseInt(user.id) : 0,
        orderId,
      });

      if (!response.data?.data?.orderDetails) {
        throw new Error("Invalid teacher order details");
      }
      setSelectedOrder(response.data.data);
    } catch (error) {
      console.error("Teacher order details error:", error);
      toast.error(t("status.fetchOrderDetailsFailed"));
    } finally {
      setIsLoadingDetails(false);
    }
  };

  if (isLoadingOrders || isLoadingDetails) return <Loader />;

  if (selectedOrder) {
    return <OrderDetails data={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <TeacherScreenHeader title={t("navigation.orderHistory")} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {orders.length ? (
          <View className="gap-3">
            {orders.map((order) => (
              <Pressable
                key={order.id}
                onPress={() => handleOrderDetails(order.id)}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/60"
              >
                <View className="flex-row items-start justify-between gap-3">
                  <Text className="flex-1 text-base font-black text-slate-900">
                    {t("activeOrder.order")} #{order.orderNo}
                  </Text>
                  <View className="rounded-full bg-emerald-50 px-3 py-1">
                    <Text className="text-xs font-bold text-emerald-700">
                      {order.orderStatus}
                    </Text>
                  </View>
                </View>

                <Text className="mt-3 text-sm font-semibold text-slate-500">
                  {t("orders.orderedDate")} :{" "}
                  {formatOrderDate(order.orderDate, t("orders.notAvailable"))}
                </Text>

                <View className="mt-3 flex-row items-center gap-2">
                  <ShoppingCart size={16} color="#F37C21" strokeWidth={2.5} />
                  <Text className="text-base font-black text-secondary">
                    {Number(order.totalAmount || 0).toFixed(2)} RON
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View className="items-center justify-center py-24">
            <PackageX size={52} color="#CBD5E1" strokeWidth={2.2} />
            <Text className="mt-4 text-lg font-black text-slate-700">
              {t("orders.noOrdersYet")}
            </Text>
            <Text className="mt-1 text-sm font-semibold text-slate-400">
              {t("orders.noOrdersMessage")}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TeacherOrderHistory;
