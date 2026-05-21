import { Image } from "expo-image";
import { images } from "@/lib/assets";
import { cn } from "@/lib/utils";

const Logo = ({ className }) => (
  <Image
    source={images.logo}
    className={cn("h-12 w-32", className)}
    style={{ height: 48, width: 128 }}
    contentFit="contain"
  />
);

export default Logo;
