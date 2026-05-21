import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { cn } from "@/lib/utils";
import ScreenHeader from "@/components/ScreenHeader";
import { useTranslation } from "react-i18next";
import { getWeekdayKey } from "@/lib/weekdays";

const calculateDayTotal = (items) => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((total, item) => total + (item?.lineAmount || 0), 0);
};

const formatCurrency = (amount, currency) => `${amount.toFixed(2)} ${currency}`;

const OrderSummaryCard = ({ orderDetails, t }) => (
  <View className="rounded-xl bg-white p-4 shadow-sm">
    <View className="gap-3">
      <View className="flex-row justify-between">
        <Text className="text-sm text-gray-500">{t("orders.orderDate")}</Text>
        <Text className="text-sm font-medium">
          {new Date(orderDetails.orderDate).toLocaleDateString()}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-sm text-gray-500">{t("orders.total")}</Text>
        <Text className="text-sm font-medium text-secondary">
          {formatCurrency(orderDetails.totalAmount, orderDetails.currency)}
        </Text>
      </View>
    </View>
  </View>
);

const LineItem = ({ item, currency, t }) => (
  <View className="mt-4 gap-2">
    <View className="flex-row justify-between">
      <View className="flex-1 gap-1 pr-2">
        <Text className="text-sm font-medium">{item.menuItem}</Text>
        <View className="flex-row items-center gap-2">
          <Text className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{item.itemCategory}</Text>
          <Text className="text-xs text-gray-500">
            {t("orders.quantity")}: {item.quantity}
          </Text>
        </View>
      </View>
      <Text className="text-sm font-medium">{formatCurrency(item.lineAmount, currency)}</Text>
    </View>
  </View>
);

const DayCard = ({ day, currency, expandedDays, toggleDay, t }) => {
  const isExpanded = expandedDays[day.weekdayId];
  const hasItems = day.lineItems && day.lineItems.length > 0;

  return (
    <View
      className={cn(
        "overflow-hidden rounded-xl bg-white shadow-sm",
        day.status === "Skipped" && "opacity-75"
      )}
    >
      <Pressable
        className="flex-row items-center justify-between p-4"
        onPress={() => hasItems && toggleDay(day.weekdayId)}
        disabled={!hasItems}
      >
        <View>
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-medium">
              {t(`weekdays.${getWeekdayKey(day.weekday)}.full`)}
            </Text>
            <Text
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                day.status === "Ordered" && "bg-success-bg text-success-text",
                day.status === "Skipped" && "bg-gray-100 text-gray-600"
              )}
            >
              {t(`orders.${day.status.toLowerCase()}`)}
            </Text>
          </View>
          <Text className="text-sm text-gray-500">{day.weekdayDate}</Text>
        </View>

        {hasItems && (
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-medium">
              {formatCurrency(calculateDayTotal(day.lineItems), currency)}
            </Text>
            {isExpanded ? (
              <ChevronUp size={16} color="#9CA3AF" />
            ) : (
              <ChevronDown size={16} color="#9CA3AF" />
            )}
          </View>
        )}
      </Pressable>

      {isExpanded && hasItems && (
        <View className="border-t border-gray-100 px-4 pb-4">
          {day.lineItems.map((item) => (
            <LineItem key={item.lineItemId} item={item} currency={currency} t={t} />
          ))}
        </View>
      )}
    </View>
  );
};

const OrderDetails = ({ data, onBack }) => {
  const { t } = useTranslation();
  const [expandedDays, setExpandedDays] = useState({});

  const toggleDay = (weekdayId) => {
    setExpandedDays((prev) => ({
      ...prev,
      [weekdayId]: !prev[weekdayId],
    }));
  };

  const { orderDetails } = data;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScreenHeader
        title={`${t("orders.orderNumber")}${orderDetails.orderNumber}`}
        showBackButton
      />
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          <OrderSummaryCard orderDetails={orderDetails} t={t} />
          {orderDetails.weekdayDetails?.map((day) => (
            <DayCard
              key={day.weekdayId}
              day={day}
              currency={orderDetails.currency}
              expandedDays={expandedDays}
              toggleDay={toggleDay}
              t={t}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetails;
