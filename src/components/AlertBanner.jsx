import { View, Text } from "react-native";
import { Megaphone } from "lucide-react-native";

const stripHtml = (html) =>
  html?.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ") ?? "";

const AlertBanner = ({ isLoading, title, message }) => {
  if (isLoading || !title || !message) return null;

  return (
    <View className="px-4">
      <View className="flex-row gap-3 rounded-2xl border border-secondary/20 bg-white p-4">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary-muted">
          <Megaphone size={20} color="#F37C21" />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-base font-bold text-foreground" numberOfLines={2}>
            {title}
          </Text>
          <Text className="mt-1 text-sm leading-5 text-muted-foreground">
            {stripHtml(message)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AlertBanner;
