import { View, Text, Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";

const SectionHeader = ({ title, actionText, onAction }) => (
  <View className="mb-3 flex-row items-center justify-between px-4">
    <Text className="text-lg font-bold text-foreground">{title}</Text>
    {actionText && (
      <Pressable onPress={onAction} className="flex-row items-center gap-1">
        <Text className="text-sm font-semibold text-primary">{actionText}</Text>
        <ChevronRight size={16} color="#019C7F" />
      </Pressable>
    )}
  </View>
);

export default SectionHeader;
