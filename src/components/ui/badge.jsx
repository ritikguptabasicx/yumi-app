import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

export function Badge({ className, children, variant = "default" }) {
  const variants = {
    default: "bg-primary",
    secondary: "bg-secondary",
    outline: "border border-input bg-transparent",
  };
  const textVariants = {
    default: "text-primary-foreground",
    secondary: "text-secondary-foreground",
    outline: "text-foreground",
  };
  return (
    <View className={cn("rounded-full px-2.5 py-0.5", variants[variant], className)}>
      <Text className={cn("text-xs font-semibold", textVariants[variant])}>
        {children}
      </Text>
    </View>
  );
}
