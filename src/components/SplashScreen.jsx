import { ImageBackground, View } from "react-native";
import Logo from "./Logo";
import { images } from "@/lib/assets";

const SplashScreenView = () => (
  <ImageBackground
    source={images.splashBg}
    className="flex-1 items-center justify-center"
    style={{ flex: 1, width: "100%" }}
    resizeMode="cover"
  >
    <View className="rounded-3xl bg-white/90 px-8 py-6">
      <Logo className="h-24 w-60" />
    </View>
  </ImageBackground>
);

export default SplashScreenView;
