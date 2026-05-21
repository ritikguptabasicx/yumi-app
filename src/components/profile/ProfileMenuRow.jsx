import { View, Text, Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { cn } from "@/lib/utils";

export function ProfileMenuRow({
  icon: Icon,
  label,
  subtitle,
  onPress,
  showChevron = true,
  destructive = false,
  isLast = false,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className={cn(
        "flex-row items-center px-4 py-3.5 active:bg-muted/50",
        !isLast && "border-b border-border/80"
      )}
    >
      {Icon && (
        <View
          className={cn(
            "mr-3 h-9 w-9 items-center justify-center rounded-full",
            destructive ? "bg-red-50" : "bg-primary-muted"
          )}
        >
          <Icon size={18} color={destructive ? "#EF4444" : "#019C7F"} />
        </View>
      )}
      <View className="min-w-0 flex-1">
        <Text
          className={cn(
            "text-[15px] font-medium",
            destructive ? "text-destructive" : "text-foreground"
          )}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-xs text-muted-foreground">{subtitle}</Text>
        ) : null}
      </View>
      {showChevron && onPress ? (
        <ChevronRight size={18} color="#94A3B8" />
      ) : null}
    </Pressable>
  );
}

export function ProfileSection({ title, children }) {
  return (
    <View className="mb-5">
      {title ? (
        <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </Text>
      ) : null}
      <View className="overflow-hidden rounded-2xl border border-border/60 bg-white">
        {children}
      </View>
    </View>
  );
}
