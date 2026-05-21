import * as React from "react";
import { View, Pressable } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { cn } from "@/lib/utils";

const CollapsibleContext = React.createContext({
  open: true,
  setOpen: () => {},
});

export function Collapsible({ defaultOpen = true, children }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <CollapsibleContext.Provider value={{ open, setOpen }}>
      {children}
    </CollapsibleContext.Provider>
  );
}

export function CollapsibleTrigger({ children, className }) {
  const { open, setOpen } = React.useContext(CollapsibleContext);
  return (
    <Pressable
      className={cn("flex-row w-full items-center justify-between", className)}
      onPress={() => setOpen(!open)}
    >
      {children}
      <ChevronDown
        size={16}
        color="#64748B"
        style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
      />
    </Pressable>
  );
}

export function CollapsibleContent({ children, className }) {
  const { open } = React.useContext(CollapsibleContext);
  if (!open) return null;
  return (
    <View className={cn("w-full pt-0", className)} style={{ width: "100%" }}>
      {children}
    </View>
  );
}
