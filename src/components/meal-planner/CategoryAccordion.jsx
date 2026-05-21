import { View, Text } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import MealCard from "./MealCard";

const CategoryAccordion = ({ categories, selectedMeals, mealType }) => (
  <View className="mb-32 gap-3">
    {categories.map((category) => (
      <Collapsible key={`${category.categoryName}-${category.items[0]?.itemId || Date.now()}`} defaultOpen>
        <Card className="border-none bg-white">
          <CardContent className="p-6">
            <CollapsibleTrigger>
              <Text className="text-left text-sm font-bold">{category.categoryName}</Text>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <MealCard
                selectedMeals={selectedMeals}
                availableMeals={category.items.map((item) => ({
                  ...item,
                  mealType,
                }))}
              />
            </CollapsibleContent>
          </CardContent>
        </Card>
      </Collapsible>
    ))}
  </View>
);

export default CategoryAccordion;
