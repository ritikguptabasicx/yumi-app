import { Image } from "expo-image";
import { cn } from "@/lib/utils";

/**
 * Wrapper around expo-image with explicit dimensions so assets render
 * reliably with NativeWind className on SDK 54.
 */
export function AppImage({ className, style, width, height, ...props }) {
  return (
    <Image
      className={className}
      style={[
        width != null || height != null ? { width, height } : undefined,
        style,
      ]}
      {...props}
    />
  );
}

export default AppImage;
