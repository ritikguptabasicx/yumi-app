import { View, Text } from "react-native";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { Sparkles, UtensilsCrossed } from "lucide-react-native";

const getGreetingKey = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "home.goodMorning";
  if (hour < 17) return "home.goodAfternoon";
  return "home.goodEvening";
};

export const ParentProfile = () => {
  const { user } = useUser();
  const { t } = useTranslation();

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || t("profile.guestName");
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <View className="px-4">
      <View className="relative overflow-hidden rounded-3xl bg-primary">
        <View className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10" />
        <View className="absolute -bottom-14 right-16 h-32 w-32 rounded-full bg-secondary/35" />
        <View className="absolute bottom-5 right-5 h-14 w-14 items-center justify-center rounded-full bg-white/15">
          <UtensilsCrossed size={26} color="#FFFFFF" />
        </View>

        <View className="px-5 py-5">
          <View className="mb-5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2 rounded-full bg-white/15 px-3 py-1.5">
              <Sparkles size={14} color="#FFFFFF" />
              <Text className="text-xs font-semibold text-white">
                {t("home.freshMeals")}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white/40">
              <AvatarImage source={user?.profilePictureURL} />
              <AvatarFallback className="bg-white">
                <Text className="text-xl font-bold text-primary">{initials}</Text>
              </AvatarFallback>
            </Avatar>

            <View className="min-w-0 flex-1">
              <Text className="text-sm font-medium text-white/80">
                {t(getGreetingKey())}
              </Text>
              <Text className="mt-1 text-2xl font-bold text-white" numberOfLines={2}>
                {displayName}
              </Text>
              <Text className="mt-1.5 text-sm leading-5 text-white/85" numberOfLines={2}>
                {t("home.planSubtitle")}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
