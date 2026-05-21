import { View, ActivityIndicator } from "react-native";
import { cn } from "@/lib/utils";

const Loader = ({ height = "h-screen" }) => (
  <View className={cn("flex-1 items-center justify-center", height)}>
    <ActivityIndicator size="large" color="#019C7F" />
  </View>
);

export default Loader;
