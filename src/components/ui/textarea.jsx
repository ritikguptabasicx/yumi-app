import * as React from "react";
import { TextInput } from "react-native";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <TextInput
    ref={ref}
    multiline
    textAlignVertical="top"
    className={cn(
      "min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-base text-foreground",
      className
    )}
    placeholderTextColor="#94A3B8"
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
