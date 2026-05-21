import * as React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export function AlertDialog({ open, onOpenChange, children }) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => onOpenChange?.(false)}
    >
      <View className="flex-1 items-center justify-center bg-overlay50 px-6">
        <View className="w-full max-w-sm rounded-xl bg-card p-6">{children}</View>
      </View>
    </Modal>
  );
}

export function AlertDialogContent({ className, children }) {
  return <View className={cn("", className)}>{children}</View>;
}

export function AlertDialogHeader({ children }) {
  return <View className="mb-2">{children}</View>;
}

export function AlertDialogTitle({ className, children }) {
  return (
    <Text className={cn("text-lg font-semibold text-foreground", className)}>
      {children}
    </Text>
  );
}

export function AlertDialogDescription({ className, children }) {
  return (
    <Text className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </Text>
  );
}

export function AlertDialogFooter({ className, children }) {
  return (
    <View className={cn("mt-4 flex-row justify-end gap-2", className)}>
      {children}
    </View>
  );
}

export function AlertDialogCancel({ children, onPress }) {
  return (
    <Pressable onPress={onPress} className="rounded-md px-4 py-2">
      <Text className="text-foreground">{children}</Text>
    </Pressable>
  );
}

export function AlertDialogAction({ children, onPress, className }) {
  return (
    <Button onPress={onPress} className={className}>
      {children}
    </Button>
  );
}
