import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import Logo from "@/components/Logo";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-background px-4">
      <Logo className="h-40 w-auto" />

      <Text className="text-5xl font-extrabold tracking-tight text-foreground">404</Text>

      <Text className="text-center text-xl font-semibold text-foreground">
        {t("notFound.pageNotFound")}
      </Text>

      <Text className="max-w-sm text-center text-sm text-muted-foreground">
        {t("notFound.pageUnavailable")}
      </Text>

      <Link href="/(app)/(tabs)" asChild>
        <Pressable className="mt-6 rounded-lg bg-primary px-6 py-3 shadow-md">
          <Text className="text-sm font-semibold text-primary-foreground">
            {t("notFound.goHome")}
          </Text>
        </Pressable>
      </Link>
    </SafeAreaView>
  );
};

export default NotFound;
