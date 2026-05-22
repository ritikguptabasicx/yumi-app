import { ScrollView, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils";

const MealTypeSelector = ({ mealTypes, activeMealType, onTypeSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    className="-mx-4 py-2"
    contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
  >
    {mealTypes?.map((type) => {
      const isActive = type.itemType === activeMealType;

      return (
        <Pressable
          key={type.itemType}
          onPress={() => onTypeSelect(type.itemType)}
          className={cn(
            "h-12 min-w-[112px] items-center justify-center rounded-full border px-4",
            isActive ? "border-primary bg-primary" : "border-border bg-white"
          )}
        >
          <Text
            className={cn(
              "text-sm font-semibold",
              isActive ? "text-primary-foreground" : "text-foreground"
            )}
            numberOfLines={1}
          >
            {type.itemType}
          </Text>
        </Pressable>
      );
    })}
  </ScrollView>
);

export default MealTypeSelector;
