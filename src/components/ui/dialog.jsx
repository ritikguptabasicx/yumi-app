import * as React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { cn } from "@/lib/utils";

const DialogContext = React.createContext({ open: false, setOpen: () => {} });

export function Dialog({ open, onOpenChange, children }) {
  const setOpen = (value) => onOpenChange?.(value);
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children, asChild }) {
  const { setOpen } = React.useContext(DialogContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onPress: () => setOpen(true),
    });
  }
  return (
    <Pressable onPress={() => setOpen(true)}>{children}</Pressable>
  );
}

export function DialogContent({ className, children }) {
  const { open, setOpen } = React.useContext(DialogContext);
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable
          className="flex-1 items-center justify-center bg-overlay50 px-4"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className={cn(
              "w-full max-w-sm rounded-xl bg-card p-6 shadow-lg",
              className
            )}
            onPress={(e) => e.stopPropagation?.()}
          >
            <ScrollView keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function DialogHeader({ className, children }) {
  return <View className={cn("mb-4", className)}>{children}</View>;
}

export function DialogTitle({ className, children }) {
  return (
    <Text className={cn("text-lg font-semibold text-foreground", className)}>
      {children}
    </Text>
  );
}

export function DialogDescription({ className, children }) {
  return (
    <Text className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </Text>
  );
}

export function DialogFooter({ className, children }) {
  return (
    <View className={cn("mt-4 flex-row justify-end gap-2", className)}>
      {children}
    </View>
  );
}
