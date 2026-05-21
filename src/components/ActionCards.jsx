import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScrollText, UtensilsCrossed } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useUser } from "@/contexts/UserContext";
import { images } from "@/lib/assets";

export const ActionCards = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useUser();

  if (!user?.selectedChildId) return null;

  const cards = [
    {
      image: images.actionCard1,
      icon: UtensilsCrossed,
      title: t("navigation.mealPlanner"),
      desc: t("meals.scheduleMeal"),
      route: "/(app)/(tabs)/meal-planner",
    },
    {
      image: images.actionCard2,
      icon: ScrollText,
      title: t("navigation.orderHistory"),
      desc: t("meals.managePastOrders"),
      route: "/(app)/(tabs)/order-history",
    },
  ];

  return (
    <View className="px-4">
      <Text className="mb-4 text-xl font-semibold text-gray-800">
        {t("meals.mealInfo")}
      </Text>
      <View className="flex-row gap-4">
        {cards.map((card) => (
          <Pressable
            key={card.route}
            className="flex-1"
            onPress={() => router.push(card.route)}
          >
            <View className="h-44 overflow-hidden rounded-xl">
              <Image
                source={card.image}
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                className="h-full w-full"
                contentFit="cover"
              />
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.25)",
                }}
              />
              <card.icon size={32} color="#fff" style={{ position: "absolute", left: 16, top: 16 }} />
              <View className="absolute bottom-0 left-0 right-0 bg-overlay60 p-4">
                <Text className="text-lg font-semibold text-white">{card.title}</Text>
                <Text className="text-sm text-white-muted">{card.desc}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};
