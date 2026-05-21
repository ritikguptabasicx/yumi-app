import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalendarDays, ChevronDown, ChevronUp, Receipt } from "lucide-react-native";
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
  <View className="overflow-hidden rounded-3xl bg-primary">
    <View className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
    <View className="absolute -bottom-12 left-12 h-28 w-28 rounded-full bg-secondary/30" />
    <View className="px-5 py-5">
      <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
        <Receipt size={24} color="#fff" />
      </View>
      <Text className="text-sm font-medium text-white/80">
        {t("orders.orderNumber")}{orderDetails.orderNumber}
      </Text>
      <Text className="mt-1 text-3xl font-bold text-white">
        {formatCurrency(orderDetails.totalAmount, orderDetails.currency)}
      </Text>
      <View className="mt-3 flex-row items-center gap-2">
        <CalendarDays size={15} color="rgba(255,255,255,0.8)" />
        <Text className="text-sm text-white/80">
          {new Date(orderDetails.orderDate).toLocaleDateString()}
        </Text>
      </View>
    </View>
  </View>
);

const LineItem = ({ item, currency, t }) => (
  <View className="mt-3 rounded-2xl bg-background p-3">
    <View className="flex-row items-start justify-between gap-3">
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold leading-5 text-foreground">{item.menuItem}</Text>
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
        {formatCurrency(item.lineAmount, currency)}
      </Text>
    </View>
  </View>
);

const DayCard = ({ day, currency, expandedDays, toggleDay, t }) => {
  const isExpanded = expandedDays[day.weekdayId];
  const hasItems = day.lineItems && day.lineItems.length > 0;

  return (
    <View
      className={cn(
        "overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm",
        day.status === "Skipped" && "opacity-75"
      )}
    >
      <Pressable
        className="flex-row items-center justify-between p-4"
        onPress={() => hasItems && toggleDay(day.weekdayId)}
        disabled={!hasItems}
      >
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-bold text-foreground">
              {t(`weekdays.${getWeekdayKey(day.weekday)}.full`)}
            </Text>
            <Text
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-bold",
                day.status === "Ordered" && "bg-success-bg text-success-text",
                day.status === "Skipped" && "bg-muted text-muted-foreground"
              )}
            >
              {t(`orders.${day.status.toLowerCase()}`)}
            </Text>
          </View>
          <Text className="mt-1 text-sm text-muted-foreground">{day.weekdayDate}</Text>
        </View>

        {hasItems && (
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-bold text-secondary">
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
        <View className="border-t border-border/70 px-4 pb-4">
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
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader
        title={`${t("orders.orderNumber")}${orderDetails.orderNumber}`}
        showBackButton
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
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
