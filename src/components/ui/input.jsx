import * as React from "react";
import { TextInput } from "react-native";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, ...props }, ref) => (
  <TextInput
    ref={ref}
    className={cn(
      "h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground",
      className
    )}
    placeholderTextColor="#94A3B8"
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
