import { View, Text } from "react-native";

const stripHtml = (html) =>
  html?.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ") ?? "";

const AlertBanner = ({ isLoading, title, message }) => {
  if (isLoading || !title || !message) return null;

  return (
    <View className="px-4">
      <View className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-4">
        <Text className="mb-2 text-lg font-semibold text-orange-800">{title}</Text>
        <Text className="text-sm text-neutral-700">{stripHtml(message)}</Text>
      </View>
    </View>
  );
};

export default AlertBanner;
