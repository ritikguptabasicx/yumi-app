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
      className="flex-row items-center gap-4 rounded-2xl border border-border/50 bg-white p-4 shadow-sm active:scale-[0.99]"
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10">
        <Package size={20} color="#F37C21" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-bold text-foreground">
          {t("activeOrder.order")} #{order.orderNumber}
        </Text>
        <View className="mt-1 flex-row items-center gap-1.5">
          <Calendar size={13} color="#64748B" />
          <Text className="text-xs font-semibold text-muted-foreground">
            {formatDate(order.orderDate)}
          </Text>
        </View>
      </View>
      <View className="mr-1 items-end">
        <Text className="text-base font-extrabold text-foreground">
          {Number(order.totalAmount).toFixed(2)} {getCurrency(order)}
        </Text>
        <Text className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {t("activeOrder.totalAmount")}
        </Text>
      </View>
      <ChevronRight size={16} color="#94A3B8" />
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
