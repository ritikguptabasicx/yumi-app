import { View, Text, ScrollView, Pressable, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
  LogOut,
  Wallet,
  Pencil,
  Info,
  HelpCircle,
  Headphones,
  Globe,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ProfileSection, ProfileMenuRow } from "@/components/profile/ProfileMenuRow";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { ProfileChildrenSection } from "@/components/profile/ProfileChildrenSection";
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
  const { t, i18n } = useTranslation();
  const { user, logout } = useUser();
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || t("profile.guestName");

  const credits = user?.creditsAvailable ?? 0;
  const currentLang = i18n.language?.split("-")[0] === "en" ? "English" : "Română";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile hero */}
        <View className="items-center bg-white px-6 pb-6 pt-4">
          <Avatar className="mb-3 h-[88px] w-[88px] border-2 border-primary/20">
            <AvatarImage source={user?.profilePictureURL} />
            <AvatarFallback className="bg-primary-muted">
              <Text className="text-2xl font-bold text-primary">
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </AvatarFallback>
          </Avatar>
          <Text className="text-xl font-bold text-foreground">{displayName}</Text>
          <Text className="mt-1 text-sm text-muted-foreground">{user?.emailAddress}</Text>
          {user?.phone ? (
            <Text className="mt-0.5 text-sm text-muted-foreground">{user.phone}</Text>
          ) : null}
          <Pressable
            onPress={() => setShowEdit(true)}
            className="mt-4 flex-row items-center gap-1.5 rounded-full border border-primary px-5 py-2 active:bg-primary-muted"
          >
            <Pencil size={14} color="#019C7F" />
            <Text className="text-sm font-semibold text-primary">
              {t("profile.editProfile")}
            </Text>
          </Pressable>
        </View>

        <View className="px-4 pt-5">
          {/* Wallet / credits */}
          <View className="mb-5 flex-row items-center overflow-hidden rounded-2xl bg-primary px-4 py-4">
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-white/20">
              <Wallet size={22} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium uppercase tracking-wide text-white/80">
                {t("profile.wallet")}
              </Text>
              <Text className="mt-0.5 text-lg font-bold text-white">
                {credits > 0
                  ? `${credits} ${t("profile.creditsLabel")}`
                  : t("profile.NoAvailableCredits")}
              </Text>
            </View>
          </View>

          {/* Children */}
          <View className="mb-5">
            <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("profile.childrenSection")}
            </Text>
            <ProfileChildrenSection />
          </View>

          {/* Help */}
          <ProfileSection title={t("profile.helpSection")}>
            <ProfileMenuRow
              icon={Info}
              label={t("quickLinks.about.title")}
              subtitle={t("quickLinks.about.description")}
              onPress={() => router.push("/(app)/about")}
            />
            <ProfileMenuRow
              icon={HelpCircle}
              label={t("quickLinks.faq.title")}
              subtitle={t("quickLinks.faq.description")}
              onPress={() => router.push("/(app)/faq")}
            />
            <ProfileMenuRow
              icon={Headphones}
              label={t("quickLinks.support.title")}
              subtitle={t("quickLinks.support.description")}
              onPress={() => router.push("/(app)/support")}
              isLast
            />
          </ProfileSection>

          {/* Preferences */}
          <ProfileSection title={t("profile.preferencesSection")}>
            <ProfileMenuRow
              icon={Globe}
              label={t("profile.language")}
              subtitle={currentLang}
              onPress={() => setShowLanguage(true)}
            />
            <ProfileMenuRow
              icon={LogOut}
              label={t("navigation.logout")}
              onPress={() => setShowLogout(true)}
              destructive
              isLast
            />
          </ProfileSection>
        </View>
      </ScrollView>

      {/* Language modal trigger — reuse LanguageSelect in a hidden wrapper */}
      {showLanguage ? (
        <LanguageSelectModal onClose={() => setShowLanguage(false)} />
      ) : null}

      <ProfileEditDialog open={showEdit} onOpenChange={setShowEdit} />

      <AlertDialog open={showLogout} onOpenChange={setShowLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmations.areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmations.logoutConfirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={() => setShowLogout(false)}>
              {t("actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onPress={() => {
                setShowLogout(false);
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

/** Opens language picker when profile row is tapped */
function LanguageSelectModal({ onClose }) {
  const { i18n, t } = useTranslation();
  const languages = [
    { code: "ro", label: "Română", flag: "🇷🇴" },
    { code: "en", label: "English", flag: "🇬🇧" },
  ];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-overlay" onPress={onClose}>
      <Pressable onPress={(e) => e.stopPropagation()} className="rounded-t-3xl bg-white px-4 pb-10 pt-4">
        <Text className="mb-4 text-center text-lg font-semibold text-foreground">
          {t("profile.language")}
        </Text>
        {languages.map((lang) => {
          const active = (i18n.language?.split("-")[0] || "ro") === lang.code;
          return (
            <Pressable
              key={lang.code}
              onPress={() => {
                i18n.changeLanguage(lang.code);
                onClose();
              }}
              className={`mb-2 flex-row items-center justify-between rounded-xl px-4 py-3.5 ${
                active ? "bg-primary-muted" : "bg-muted/40"
              }`}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-xl">{lang.flag}</Text>
                <Text className={`font-medium ${active ? "text-primary" : "text-foreground"}`}>
                  {lang.label}
                </Text>
              </View>
              {active ? <Text className="font-bold text-primary">✓</Text> : null}
            </Pressable>
          );
        })}
      </Pressable>
      </Pressable>
    </Modal>
  );
}

export default Profile;
