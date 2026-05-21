import * as React from "react";
import { View, Text, Pressable, Modal, FlatList } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { cn } from "@/lib/utils";

const SelectContext = React.createContext({
  value: "",
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
  placeholder: "",
});

export function Select({ value, onValueChange, children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <SelectContext.Provider
      value={{ value, onValueChange, open, setOpen, placeholder: "" }}
    >
      {children}
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className, children }) {
  const { value, setOpen, placeholder } = React.useContext(SelectContext);
  return (
    <Pressable
      className={cn(
        "flex-row h-12 items-center justify-between rounded-md border border-input bg-background px-3",
        className
      )}
      onPress={() => setOpen(true)}
    >
      <Text className="text-foreground">
        {children || value || placeholder || "Select..."}
      </Text>
      <ChevronDown size={16} color="#64748B" />
    </Pressable>
  );
}

export function SelectValue({ placeholder }) {
  const { value } = React.useContext(SelectContext);
  return <Text>{value || placeholder}</Text>;
}

export function SelectContent({ children }) {
  const { open, setOpen } = React.useContext(SelectContext);
  const items = React.Children.toArray(children).filter(
    (c) => c?.type === SelectItem
  );
  const { onValueChange } = React.useContext(SelectContext);

  return (
    <Modal visible={open} transparent animationType="slide">
      <Pressable
        className="flex-1 justify-end bg-overlay"
        onPress={() => setOpen(false)}
      >
        <View className="max-h-96 rounded-t-2xl bg-card pb-8">
          <FlatList
            data={items}
            keyExtractor={(item) => item.props.value}
            renderItem={({ item }) => (
              <Pressable
                className="border-b border-border px-4 py-4"
                onPress={() => {
                  onValueChange(item.props.value);
                  setOpen(false);
                }}
              >
                <Text className="text-base text-foreground">
                  {item.props.children}
                </Text>
              </Pressable>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

export function SelectGroup({ children }) {
  return <>{children}</>;
}

export function SelectItem({ value, children }) {
  return null;
}
