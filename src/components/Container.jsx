import { View } from "react-native";
import { cn } from "@/lib/utils";

const Container = ({ children, className }) => (
  <View className={cn("mx-auto w-full max-w-md flex-1", className)}>
    {children}
  </View>
);

export default Container;
