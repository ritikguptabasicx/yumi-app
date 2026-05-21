import { View } from "react-native";
import Logo from "./Logo";
import { LanguageSelect } from "./LanguageSelect";

const AppHeader = () => (
  <View className="flex-row items-center justify-between px-4 py-2">
    <Logo />
    <LanguageSelect />
  </View>
);

export default AppHeader;
