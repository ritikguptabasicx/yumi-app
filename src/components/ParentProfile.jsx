import { View, Text, Pressable } from "react-native";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { Wallet } from "lucide-react-native";
import { useRouter } from "expo-router";

const getGreetingKey = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "home.goodMorning";
  if (hour < 17) return "home.goodAfternoon";
  return "home.goodEvening";
};

export const ParentProfile = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const router = useRouter();

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || t("profile.guestName");
  const initials = displayName.charAt(0).toUpperCase();

  const credits = user?.creditsAvailable ?? 0;

  return (
    <View className="flex-row items-center justify-between px-4 py-4">
      <View className="flex-row items-center gap-4">
        <Pressable onPress={() => router.push("/(app)/(tabs)/profile")} className="active:opacity-85">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage source={user?.profilePictureURL} />
            <AvatarFallback className="bg-primary-muted">
              <Text className="text-2xl font-bold text-primary">{initials}</Text>
            </AvatarFallback>
          </Avatar>
        </Pressable>
        <View className="min-w-0">
          <Text className="text-sm font-medium text-muted-foreground">{t(getGreetingKey())},</Text>
          <Text className="text-lg font-bold text-foreground" numberOfLines={1}>
            {displayName}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-1.5 rounded-full border border-primary/10 bg-accent px-3 py-1.5">
        <Wallet size={15} color="#019C7F" />
        <Text className="text-xs font-semibold text-primary">
          {credits > 0
            ? `${credits} ${t("profile.creditsLabel")}`
            : `0 ${t("profile.creditsLabel")}`}
        </Text>
      </View>
    </View>
  );
};
