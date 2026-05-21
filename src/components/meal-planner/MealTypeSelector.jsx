import { View, Text } from "react-native";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MealTypeSelector = ({ mealTypes, activeMealType, onTypeSelect }) => (
  <View className="gap-2 sm:gap-3">
    {mealTypes?.map((type) => {
      const isActive = type.itemType === activeMealType;

      return (
        <Button
          key={type.itemType}
          variant="outline"
          onPress={() => onTypeSelect(type.itemType)}
          className={cn(
            "h-11 w-full rounded-lg sm:h-12 sm:rounded-full",
            isActive ? "border-transparent bg-primary" : "border-border bg-card"
          )}
        >
          <Text
            className={cn(
              "text-sm font-medium",
              isActive ? "text-primary-foreground" : "text-foreground"
            )}
          >
            {type.itemType}
          </Text>
        </Button>
      );
    })}
  </View>
);

export default MealTypeSelector;
