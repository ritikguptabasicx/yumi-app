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
import Svg, { Circle, Path } from "react-native-svg";

const WeekCalendar = ({
  selectedDay,
  onDaySelect,
  isDaySkipped,
  menuItems,
  skippedDays = [],
}) => {
  const { t } = useTranslation();

  const weekDays = (menuItems[0]?.mealPlanner?.weekDetails || []).map(
    (weekDetail, index) => {
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
    }
  );

  const isDayOrdered = (weekDate) => {
    const week = menuItems[0]?.mealPlanner?.weekDetails?.find(
      (w) => w.weekDate === weekDate
    );
    return week?.status === "Ordered";
  };

  return (
    <Card className="overflow-hidden rounded-none border-0 border-b border-border/60 bg-white px-4 pb-5 pt-4 shadow-none">
      {/* Decorative SVG Background */}
      <View className="absolute right-0 top-0 opacity-20">
        <Svg width={120} height={120} viewBox="0 0 120 120">
          <Circle cx="100" cy="20" r="40" fill="#FFB84D" />
          <Path
            d="M0 70 Q60 20 120 80"
            stroke="#FFA726"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      {/* Header */}
      <View className="mb-5 flex-row items-center gap-3">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <AppImage
            source={images.calendar}
            width={28}
            height={28}
            contentFit="contain"
          />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-sm font-semibold tracking-wide text-primary">
            {t("meals.week")}{" "}
            {weekDays[0]?.fullDate && format(weekDays[0].fullDate, "w")}
          </Text>

          <Text
            className="text-base font-bold text-foreground"
            numberOfLines={1}
          >
            {weekDays[0]?.fullDate && format(weekDays[0].fullDate, "MMM dd")} –{" "}
            {weekDays[weekDays.length - 1]?.fullDate &&
              format(weekDays[weekDays.length - 1].fullDate, "MMM dd, yyyy")}
          </Text>
        </View>
      </View>

      {/* Days */}
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
                "relative min-h-[58px] flex-1 items-center justify-center rounded-2xl border px-1 py-3",
                isSelected
                  ? "border-primary bg-primary"
                  : isSkipped && !hasOrders
                    ? "border-border/50 bg-muted/60"
                    : "border-border/60 bg-white",
                (isSkipped || hasOrders) && "opacity-80"
              )}
            >
              <Text
                className={cn(
                  "mb-2 text-sm font-bold uppercase tracking-wide",
                  isSelected
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                )}
                numberOfLines={1}
              >
                {t(`weekdays.${getWeekdayKey(day.day)}.short`)}
              </Text>

              <Text
                className={cn(
                  "text-xl font-extrabold",
                  isSelected ? "text-primary-foreground" : "text-foreground"
                )}
              >
                {day.shortDate}
              </Text>

              {/* Status badges */}
              {hasOrders && (
                <View className="absolute -right-2 -top-1 z-10 h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-500">
                  <Check size={10} color="#fff" />
                </View>
              )}

              {isSkipped && !hasOrders && (
                <View className="absolute -right-2 -top-1 z-10 h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-400">
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
