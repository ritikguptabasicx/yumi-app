import { useState } from "react";
import { View, Pressable } from "react-native";
import { LogOut } from "lucide-react-native";
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
import { useTranslation } from "react-i18next";
import { useUser } from "@/contexts/UserContext";
import { LanguageSelect } from "./LanguageSelect";
import Logo from "./Logo";

const Navbar = () => {
  const { t } = useTranslation();
  const { logout } = useUser();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  return (
    <>
      <View className="py-2">
        <View className="mx-auto flex-row h-16 items-center justify-between px-6">
          <Logo className="h-12 w-32" />
          <View className="flex-row items-center gap-2">
            <LanguageSelect />
            <Pressable
              onPress={() => setShowConfirmDialog(true)}
              className="h-10 w-10 items-center justify-center rounded-full bg-primary"
            >
              <LogOut size={20} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>

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
            <AlertDialogAction
              onPress={() => {
                setShowConfirmDialog(false);
                logout();
              }}
              className="bg-secondary"
            >
              {t("navigation.logout")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Navbar;
