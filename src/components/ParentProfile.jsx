import { View, Text, Pressable } from "react-native";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { Wallet, ChevronRight } from "lucide-react-native";
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

      <Pressable
        onPress={() => router.push("/(app)/(tabs)/profile")}
        className="flex-row items-center gap-2 rounded-2xl border border-primary/15 bg-primary-muted px-3.5 py-2.5 active:opacity-80"
      >
        <Wallet size={16} color="#019C7F" strokeWidth={2} />
        <Text className="text-xs font-bold text-primary">
          {credits} {t("profile.creditsLabel")}
        </Text>
        <ChevronRight size={14} color="#019C7F" />
      </Pressable>
    </View>
  );
};
