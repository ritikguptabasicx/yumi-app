import { Image } from "expo-image";
import { images } from "@/lib/assets";
import { cn } from "@/lib/utils";

const Logo = ({ className }) => (
  <Image
    source={images.logo}
    className={cn("h-16 w-32", className)}
    contentFit="contain"
  />
);

export default Logo;