import { View, Text } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import MealCard from "./MealCard";

const CategoryAccordion = ({ categories, selectedMeals, mealType }) => (
  <View className="w-full gap-3" style={{ width: "100%" }}>
    {categories.map((category) => (
      <Collapsible
        key={`${category.categoryName}-${category.items[0]?.itemId || Date.now()}`}
        defaultOpen
      >
        <Card
          className="w-full overflow-hidden rounded-2xl border-border/70 bg-white shadow-sm"
          style={{ width: "100%" }}
        >
          <CardContent className="w-full p-0">
            <CollapsibleTrigger className="w-full px-4 py-3.5">
              <Text className="text-left text-sm font-bold text-foreground">
                {category.categoryName}
              </Text>
            </CollapsibleTrigger>

            <CollapsibleContent className="w-full">
              <View className="w-full px-4 pb-4" style={{ width: "100%" }}>
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
