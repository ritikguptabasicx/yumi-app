import * as React from "react";
import { View, Text, Pressable, Modal, FlatList } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { cn } from "@/lib/utils";

export function Picker({
  value,
  onValueChange,
  options = [],
  placeholder = "Select...",
  disabled = false,
  className,
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label || value || "";

  return (
    <>
      <Pressable
        disabled={disabled}
        className={cn(
          "mt-1.5 flex-row h-12 items-center justify-between rounded-md border border-input bg-background px-3",
          disabled && "opacity-50",
          className
        )}
        onPress={() => setOpen(true)}
      >
        <Text className={displayLabel ? "text-foreground" : "text-muted-foreground"}>
          {displayLabel || placeholder}
        </Text>
        <ChevronDown size={16} color="#64748B" />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-overlay" onPress={() => setOpen(false)}>
          <View className="max-h-96 rounded-t-2xl bg-card pb-8">
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <Pressable
                  className="border-b border-border px-4 py-4"
                  onPress={() => {
                    onValueChange?.(item.value);
                    setOpen(false);
                  }}
                >
                  <Text className="text-base text-foreground">{item.label}</Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <View className="px-4 py-6">
                  <Text className="text-center text-muted-foreground">{placeholder}</Text>
                </View>
              }
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
