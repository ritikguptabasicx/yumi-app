import * as React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary",
        destructive: "bg-destructive",
        outline: "border border-input bg-background",
        secondary: "bg-secondary",
        ghost: "bg-transparent",
        link: "bg-transparent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const textVariants = cva("text-sm font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-foreground",
      link: "text-primary underline",
    },
  },
  defaultVariants: { variant: "default" },
});

const Button = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      children,
      disabled,
      loading,
      onPress,
      ...props
    },
    ref
  ) => (
    <Pressable
      ref={ref}
      className={cn(
        buttonVariants({ variant, size }),
        disabled && "opacity-50",
        className
      )}
      disabled={disabled || loading}
      onPress={onPress}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : typeof children === "string" ? (
        <Text className={cn(textVariants({ variant }))}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
