import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

const QuickLinkCards = ({ icon: Icon, title, description, href }) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(href)}
      className="flex-1 items-center rounded-2xl border border-border bg-card p-5"
    >
      <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-primary-muted">
        <Icon size={24} color="#019C7F" />
      </View>
      <Text className="mb-1 text-center text-sm font-semibold text-foreground">
        {title}
      </Text>
      <Text className="text-center text-xs text-muted-foreground">
        {description}
      </Text>
    </Pressable>
  );
};

export default QuickLinkCards;
