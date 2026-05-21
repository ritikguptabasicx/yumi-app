import { Pressable, View } from "react-native";
import { Check } from "lucide-react-native";
import { cn } from "@/lib/utils";

export function Checkbox({ checked, onCheckedChange, className }) {
  return (
    <Pressable
      className={cn(
        "h-5 w-5 items-center justify-center rounded border border-primary",
        checked && "bg-primary",
        className
      )}
      onPress={() => onCheckedChange?.(!checked)}
    >
      {checked && <Check size={14} color="#fff" />}
    </Pressable>
  );
}
