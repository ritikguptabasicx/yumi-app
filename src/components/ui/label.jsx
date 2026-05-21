import * as React from "react";
import { Text } from "react-native";
import { cn } from "@/lib/utils";

const Label = React.forwardRef(({ className, children, ...props }, ref) => (
  <Text
    ref={ref}
    className={cn("text-sm font-medium text-foreground", className)}
    {...props}
  >
    {children}
  </Text>
));
Label.displayName = "Label";

export { Label };
