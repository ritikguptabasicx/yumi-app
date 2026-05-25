import { ImageBackground, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";

import Logo from "./Logo";
import { images } from "@/lib/assets";

const SplashScreenView = () => (
  <ImageBackground
    source={images.splashBg}
    resizeMode="cover"
    className="flex-1"
  >
  </ImageBackground>
);

export default SplashScreenView