import { View, Text, Pressable } from "react-native";
import AppImage from "@/components/AppImage";
import { Check, X } from "lucide-react-native";
import { parse, format } from "date-fns";
import { useTranslation } from "react-i18next";
import { getWeekdayKey } from "@/lib/weekdays";
import { Card } from "@/components/ui/card";
import { images } from "@/lib/assets";
import { cn } from "@/lib/utils";

const WeekCalendar = ({ selectedDay, isDaySkipped, menuItems, skippedDays = [] }) => {
  const { t } = useTranslation();

  const uniqueWeekdates = [
    ...new Set(
      menuItems[0]?.mealPlanner?.weekDetails?.map((item) => item.weekDate) || []
    ),
  ].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const weekDays = uniqueWeekdates.map((date, index) => {
    const dateObj = parse(date, "dd-MM-yyyy", new Date());
    const weekDetail = menuItems[0]?.mealPlanner?.weekDetails?.find(
      (w) => w.weekDate === date
    );

    return {
      id: `day-${index}`,
      day: format(dateObj, "EEE"),
      shortDate: format(dateObj, "dd"),
      fullDate: dateObj,
      status: weekDetail?.status || "",
      weekDate: date,
      dayIndex: index + 1,
    };
  });

  const isDayOrdered = (weekDate) => {
    const week = menuItems[0]?.mealPlanner?.weekDetails?.find((w) => w.weekDate === weekDate);
    return week?.status === "Ordered";
  };

  return (
    <Card className="rounded-none border-0 border-b border-border/70 bg-white px-4 py-3 shadow-none">
      <View className="mb-3 flex-row items-center gap-2.5">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-muted">
          <AppImage source={images.calendar} width={22} height={22} contentFit="contain" />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-xs font-medium text-muted-foreground">
            {t("meals.week")} {weekDays[0]?.fullDate && format(weekDays[0].fullDate, "w")}
          </Text>
          <Text className="mt-0.5 text-sm font-semibold text-foreground" numberOfLines={1}>
            {weekDays[0]?.fullDate && format(weekDays[0].fullDate, "MMM dd")} –{" "}
            {weekDays[weekDays.length - 1]?.fullDate &&
              format(weekDays[weekDays.length - 1].fullDate, "MMM dd, yyyy")}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-1.5">
        {weekDays.map((day) => {
          const isSelected = selectedDay === day.dayIndex;
          const hasOrders = isDayOrdered(day.weekDate);
          const isSkipped =
            day.status === "Skipped" ||
            skippedDays.includes(day.dayIndex) ||
            isDaySkipped(day.dayIndex);

          return (
            <Pressable
              key={day.id}
              disabled={isSkipped || hasOrders}
              className={cn(
                "relative min-h-[58px] flex-1 items-center justify-center rounded-xl border px-1 py-2",
                isSelected
                  ? "border-primary bg-primary"
                  : isSkipped && !hasOrders
                    ? "bg-muted"
                    : "bg-background"
              )}
            >
              <Text
                className={cn(
                  "mb-1 text-[11px] font-semibold uppercase",
                  isSelected ? "text-primary-foreground" : "text-foreground"
                )}
                numberOfLines={1}
              >
                {t(`weekdays.${getWeekdayKey(day.day)}.short`)}
              </Text>
              <Text
                className={cn(
                  "text-sm font-bold",
                  isSelected ? "text-primary-foreground" : "text-foreground"
                )}
              >
                {day.shortDate}
              </Text>

              {hasOrders && (
                <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <Check size={10} color="#fff" />
                </View>
              )}

              {isSkipped && !hasOrders && (
                <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-secondary">
                  <X size={10} color="#fff" />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
};

export default WeekCalendar;
