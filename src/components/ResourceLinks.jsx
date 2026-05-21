import { View, Text, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { Info, Headphones, LogOut, HelpCircle, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";

const ResourceLinks = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { logout } = useUser();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/signin");
  };

  const linkClass = "flex-row items-center gap-3 rounded-lg bg-white p-3 shadow-sm";

  return (
    <View className="gap-4 pb-6">
      <Text className="mb-4 text-xl font-semibold text-gray-700">{t("ui.otherLinks")}</Text>

      <Link href="/(app)/about" asChild>
        <Pressable className={linkClass}>
          <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Info size={20} color="#fff" />
          </View>
          <Text className="flex-1 text-base text-gray-900">{t("navigation.aboutApp")}</Text>
          <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>
      </Link>

      <Link href="/(app)/support" asChild>
        <Pressable className={linkClass}>
          <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Headphones size={20} color="#fff" />
          </View>
          <Text className="flex-1 text-base text-gray-900">{t("navigation.support")}</Text>
          <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>
      </Link>

      <Link href="/(app)/faq" asChild>
        <Pressable className={linkClass}>
          <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <HelpCircle size={20} color="#fff" />
          </View>
          <Text className="flex-1 text-base text-gray-900">{t("navigation.faq")}</Text>
          <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>
      </Link>

      <Pressable
        onPress={() => setShowConfirmDialog(true)}
        className="flex-row items-center gap-3 rounded-lg bg-red-50 p-3 shadow-sm"
      >
        <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <LogOut size={20} color="#fff" />
        </View>
        <Text className="text-base text-red-600">{t("navigation.logout")}</Text>
      </Pressable>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmations.areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmations.logoutConfirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={() => setShowConfirmDialog(false)}>
              {t("actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleLogout}>{t("navigation.logout")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
};

export { ResourceLinks };
