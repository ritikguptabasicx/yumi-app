import { ImageBackground, View } from "react-native";
import Container from "./Container";
import Logo from "./Logo";
import { images } from "@/lib/assets";

const SplashScreenView = () => (
  <Container>
    <ImageBackground
      source={images.splashBg}
      className="min-h-screen flex-1 items-center justify-center"
      style={{ flex: 1, width: "100%", minHeight: "100%" }}
      resizeMode="cover"
    >
      <View className="items-center justify-center">
        <Logo className="h-24 w-60" />
      </View>
    </ImageBackground>
  </Container>
);

export default SplashScreenView;
