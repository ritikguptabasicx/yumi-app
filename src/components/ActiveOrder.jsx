import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Calendar, ChevronRight, Package } from "lucide-react-native";
import { format, isValid } from "date-fns";
import { useTranslation } from "react-i18next";

const formatDate = (dateString) => {
  if (!dateString) return "No date available";
  const date = new Date(dateString);
  if (!isValid(date)) return "Invalid date";
  return format(date, "MMM d, yyyy");
};

const getCurrency = (order) =>
  order?.weekdayDetails?.[0]?.lineItems?.[0]?.currency ?? "RON";

const OrderCard = ({ order, onClick }) => {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={() => onClick(order)}
      className="flex-row items-center gap-4 rounded-2xl bg-card p-4"
    >
      <View className="h-12 w-12 items-center justify-center rounded-xl bg-secondary-muted">
        <Package size={20} color="#F37C21" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="font-semibold text-foreground">
          {t("activeOrder.order")} #{order.orderNumber}
        </Text>
        <View className="mt-1 flex-row items-center gap-1.5">
          <Calendar size={14} color="#64748B" />
          <Text className="text-sm text-muted-foreground">
            {formatDate(order.orderDate)}
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-lg font-bold text-foreground">
          {Number(order.totalAmount).toFixed(2)} {getCurrency(order)}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {t("activeOrder.totalAmount")}
        </Text>
      </View>
      <ChevronRight size={20} color="#94A3B8" />
    </Pressable>
  );
};

const ActiveOrder = ({ orderData, isLoading }) => {
  const router = useRouter();

  if (isLoading || !orderData?.length) return null;

  return (
    <View className="gap-3 px-4">
      {orderData.map((item) => (
        <OrderCard
          key={item.orderDetails.orderId}
          order={item.orderDetails}
          onClick={(order) =>
            router.push({
              pathname: "/(app)/active-order",
              params: { orderId: String(order.orderId) },
            })
          }
        />
      ))}
    </View>
  );
};

export default ActiveOrder;
