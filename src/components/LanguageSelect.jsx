import { useState } from "react";
import { View, Text, Pressable, Modal, FlatList } from "react-native";
import { Globe } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

const AVAILABLE_LANGUAGES = [
  { code: "ro", label: "Română", flag: "🇷🇴" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export function LanguageSelect() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const currentLanguage = i18n.language?.split("-")[0] || "ro";

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-10 gap-2 rounded-full bg-primary px-3"
        onPress={() => setOpen(true)}
      >
        <Globe size={20} color="#fff" />
      </Button>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-center bg-overlay px-6"
          onPress={() => setOpen(false)}
        >
          <View className="rounded-xl bg-card p-2">
            <FlatList
              data={AVAILABLE_LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => {
                const isActive = currentLanguage === item.code;
                return (
                  <Pressable
                    className={`flex-row items-center justify-between rounded-lg px-4 py-3 ${
                      isActive ? "bg-primary-muted" : ""
                    }`}
                    onPress={() => changeLanguage(item.code)}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="text-lg">{item.flag}</Text>
                      <Text
                        className={`font-medium ${
                          isActive ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {item.label}
                      </Text>
                    </View>
                    {isActive && (
                      <Text className="text-primary">✓</Text>
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
