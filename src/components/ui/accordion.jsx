import * as React from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { cn } from "@/lib/utils";

const AccordionContext = React.createContext({
  openItems: [],
  toggle: () => {},
});

const AccordionItemContext = React.createContext(null);

export function Accordion({ type = "single", children, className, defaultValue }) {
  const initial = defaultValue
    ? Array.isArray(defaultValue)
      ? defaultValue
      : [defaultValue]
    : [];
  const [openItems, setOpenItems] = React.useState(initial);
  const toggle = (value) => {
    setOpenItems((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : type === "single"
          ? [value]
          : [...prev, value]
    );
  };
  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <View className={className}>{children}</View>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, children, className }) {
  return (
    <AccordionItemContext.Provider value={value}>
      <View className={cn("border-b border-border", className)}>{children}</View>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({ children, className }) {
  const value = React.useContext(AccordionItemContext);
  const { openItems, toggle } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(value);
  return (
    <Pressable
      className={cn("flex-row items-center justify-between py-4", className)}
      onPress={() => toggle(value)}
    >
      {typeof children === "string" ? (
        <Text className="flex-1 font-medium text-foreground">{children}</Text>
      ) : (
        <View className="flex-1">{children}</View>
      )}
      <ChevronDown
        size={20}
        color="#64748B"
        style={{ transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }}
      />
    </Pressable>
  );
}

export function AccordionContent({ children, className }) {
  const value = React.useContext(AccordionItemContext);
  const { openItems } = React.useContext(AccordionContext);
  if (!openItems.includes(value)) return null;
  return <View className={cn("pb-4", className)}>{children}</View>;
}
