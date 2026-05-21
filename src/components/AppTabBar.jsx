import { View, Text, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, UtensilsCrossed, History, User } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const TAB_CONFIG = [
  { name: "index", labelKey: "navigation.home", Icon: Home },
  { name: "meal-planner", labelKey: "navigation.mealPlanner", Icon: UtensilsCrossed },
  { name: "order-history", labelKey: "navigation.orderHistory", Icon: History },
  { name: "profile", labelKey: "navigation.profile", Icon: User },
];

export default function AppTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View
      className="border-t border-border/40 bg-white px-3 pt-2"
      style={{
        paddingBottom: Math.max(insets.bottom, Platform.OS === "ios" ? 10 : 12),
        shadowColor: "#0C0C20",
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 18,
      }}
    >
      <View className="flex-row items-center justify-between rounded-3xl bg-white px-1.5 py-1">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const tab = TAB_CONFIG.find((t) => t.name === route.name);
          if (!tab) return null;

          const isFocused = state.index === index;
          const { Icon } = tab;
          const color = isFocused ? "#F37C21" : "#94A3B8";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.title ?? t(tab.labelKey)}
              className="min-w-[70px] flex-1 items-center"
            >
              <View
                className={cn(
                  "mb-1 h-10 min-w-[48px] items-center justify-center rounded-2xl border px-3",
                  isFocused ? "border-secondary bg-white" : "border-transparent"
                )}
              >
                <Icon size={22} color={color} strokeWidth={isFocused ? 2.5 : 2} />
              </View>
              <Text
                className={cn(
                  "text-[11px] font-medium",
                  isFocused ? "text-secondary" : "text-muted-foreground"
                )}
                numberOfLines={1}
              >
                {t(tab.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
