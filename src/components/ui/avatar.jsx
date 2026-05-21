import * as React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { cn } from "@/lib/utils";

function resolveImageSource(source) {
  if (!source) return null;
  if (typeof source === "number") return source;
  if (typeof source === "string") return { uri: source };
  if (source?.uri) return source;
  return null;
}

const Avatar = React.forwardRef(({ className, children, ...props }, ref) => (
  <View
    ref={ref}
    className={cn(
      "relative h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  >
    {children}
  </View>
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(({ className, source, ...props }, ref) => {
  const resolved = resolveImageSource(source);
  if (!resolved) return null;
  return (
    <Image
      ref={ref}
      source={resolved}
      className={cn("h-full w-full", className)}
      style={{ width: "100%", height: "100%" }}
      contentFit="cover"
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className="font-medium text-primary">{children}</Text>
      ) : (
        children
      )}
    </View>
  )
);
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
