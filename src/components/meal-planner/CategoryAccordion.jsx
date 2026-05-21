import { View, Text } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import MealCard from "./MealCard";

const CategoryAccordion = ({ categories, selectedMeals, mealType }) => (
  <View className="mb-32 gap-2 sm:gap-3">
    {categories.map((category) => (
      <Collapsible key={`${category.categoryName}-${category.items[0]?.itemId || Date.now()}`} defaultOpen>
        <Card className="border-none bg-white">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <CollapsibleTrigger>
              <Text className="text-left text-xs font-bold sm:text-sm">{category.categoryName}</Text>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <View className="mt-3 sm:mt-4">
                <MealCard
                  selectedMeals={selectedMeals}
                  availableMeals={category.items.map((item) => ({
                    ...item,
                    mealType,
                  }))}
                />
              </View>
            </CollapsibleContent>
          </CardContent>
        </Card>
      </Collapsible>
    ))}
  </View>
);

export default CategoryAccordion;
