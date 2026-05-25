import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Calendar, ChevronRight, Package } from "lucide-react-native";
import { format, isValid } from "date-fns";
import { useTranslation } from "react-i18next";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (!isValid(date)) return "";
  return format(date, "MMM d, yyyy");
};

const TeacherActiveOrderList = ({ orderData, isLoading }) => {
  const router = useRouter();
  const { t } = useTranslation();

  if (isLoading || !orderData?.length) return null;

  return (
    <View className="gap-3 px-4">
      {orderData.map((item) => {
        const order = item.orderDetails || item;
        const currency =
          order?.currency || order?.weekdayDetails?.[0]?.lineItems?.[0]?.currency || "RON";

        return (
          <Pressable
            key={order.orderId || order.id}
            onPress={() =>
              router.push({
                pathname: "/(app)/teacher-active-order",
                params: { orderId: String(order.orderId || order.id) },
              })
            }
            className="flex-row items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/60"
          >
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
              <Package size={20} color="#F37C21" strokeWidth={2.5} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-sm font-black text-slate-900" numberOfLines={1}>
                {t("activeOrder.order")} #{order.orderNumber || order.orderNo}
              </Text>
              <View className="mt-1 flex-row items-center gap-1.5">
                <Calendar size={13} color="#64748B" />
                <Text className="text-xs font-semibold text-slate-500">
                  {formatDate(order.orderDate)}
                </Text>
              </View>
            </View>
            <Text className="text-sm font-black text-slate-900">
              {Number(order.totalAmount || 0).toFixed(2)} {currency}
            </Text>
            <ChevronRight size={16} color="#94A3B8" strokeWidth={2.5} />
          </Pressable>
        );
      })}
    </View>
  );
};

export default TeacherActiveOrderList;
