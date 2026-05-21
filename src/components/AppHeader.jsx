import { View } from "react-native";
import Logo from "./Logo";
import { LanguageSelect } from "./LanguageSelect";
import NotificationButton from "./NotificationButton";

const AppHeader = () => (
  <View className="flex-row items-center justify-between px-4 py-3">
    <Logo />
    <View className="flex-row items-center gap-2">
      <LanguageSelect />
      <NotificationButton />
    </View>
  </View>
);

export default AppHeader;
