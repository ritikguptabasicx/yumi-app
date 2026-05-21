import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { LogOut } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ParentProfile } from "@/components/ParentProfile";
import ChildProfileCard from "@/components/ChildProfileCard";
import { LanguageSelect } from "@/components/LanguageSelect";
import QuickLinkCards from "@/components/QuickLinkCards";
import { Info, HelpCircle, Headphones } from "lucide-react-native";
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

const Profile = () => {
  const { t } = useTranslation();
  const { logout } = useUser();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const quickLinks = [
    {
      icon: Info,
      title: t("quickLinks.about.title"),
      description: t("quickLinks.about.description"),
      href: "/(app)/about",
    },
    {
      icon: HelpCircle,
      title: t("quickLinks.faq.title"),
      description: t("quickLinks.faq.description"),
      href: "/(app)/faq",
    },
    {
      icon: Headphones,
      title: t("quickLinks.support.title"),
      description: t("quickLinks.support.description"),
      href: "/(app)/support",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-homeBg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-2xl font-bold text-foreground">{t("navigation.profile")}</Text>
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

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="mt-2">
          <ParentProfile />
        </View>
        <View className="mt-6">
          <ChildProfileCard />
        </View>
        <View className="mt-8 px-4">
          <Text className="mb-3 text-lg font-semibold text-foreground">{t("ui.quickActions")}</Text>
          <View className="gap-3">
            {quickLinks.map((link) => (
              <QuickLinkCards key={link.title} {...link} />
            ))}
          </View>
        </View>
      </ScrollView>

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
    </SafeAreaView>
  );
};

export default Profile;
