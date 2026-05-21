import { ImageBackground } from "react-native";
import { Image } from "expo-image";
import { cssInterop } from "nativewind";

cssInterop(Image, { className: "style" });
cssInterop(ImageBackground, { className: "style" });
