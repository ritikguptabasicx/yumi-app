import { View, Text, Pressable } from "react-native";
import AppImage from "@/components/AppImage";
import { Check, X } from "lucide-react-native";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { getWeekdayKey } from "@/lib/weekdays";
import { parseWeekDate } from "@/lib/mealPlanner";
import { Card } from "@/components/ui/card";
import { images } from "@/lib/assets";
import { cn } from "@/lib/utils";

const WeekCalendar = ({
  selectedDay,
  onDaySelect,
  isDaySkipped,
  menuItems,
  skippedDays = [],
}) => {
  const { t } = useTranslation();

  const weekDays = (menuItems[0]?.mealPlanner?.weekDetails || []).map((weekDetail, index) => {
    const dateObj = parseWeekDate(weekDetail.weekDate);

    return {
      id: `day-${index}`,
      day: format(dateObj, "EEE"),
      shortDate: format(dateObj, "dd"),
      fullDate: dateObj,
      status: weekDetail?.status || "",
      weekDate: weekDetail.weekDate,
      dayIndex: index + 1,
    };
  });

  const isDayOrdered = (weekDate) => {
    const week = menuItems[0]?.mealPlanner?.weekDetails?.find((w) => w.weekDate === weekDate);
    return week?.status === "Ordered";
  };

  return (
    <Card className="rounded-none border-0 border-b border-border/70 bg-white px-4 py-4 shadow-none">
      <View className="mb-4 flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-muted">
          <AppImage source={images.calendar} width={24} height={24} contentFit="contain" />
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

      <View className="flex-row gap-2">
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
              onPress={() => onDaySelect?.(day.dayIndex)}
              disabled={isSkipped || hasOrders}
              className={cn(
                "relative min-h-[76px] flex-1 items-center justify-center rounded-xl border px-1 py-3",
                isSelected
                  ? "border-primary bg-primary"
                  : isSkipped && !hasOrders
                    ? "bg-muted"
                    : "bg-background",
                (isSkipped || hasOrders) && "opacity-70"
              )}
            >
              <Text
                className={cn(
                  "mb-1.5 text-xs font-semibold uppercase",
                  isSelected ? "text-primary-foreground" : "text-foreground"
                )}
                numberOfLines={1}
              >
                {t(`weekdays.${getWeekdayKey(day.day)}.short`)}
              </Text>
              <Text
                className={cn(
                  "text-base font-bold",
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
