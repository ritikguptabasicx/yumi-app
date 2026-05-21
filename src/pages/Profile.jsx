import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Switch,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
  Bell,
  LogOut,
  Pencil,
  Info,
  HelpCircle,
  Headphones,
  Globe,
  Mail,
  Smartphone,
  Check,
  Wallet,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ProfileSection, ProfileMenuRow } from "@/components/profile/ProfileMenuRow";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";
import { ProfileChildrenSection } from "@/components/profile/ProfileChildrenSection";
import ScreenHeader from "@/components/ScreenHeader";
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

// ─── Reusable bottom sheet wrapper ───────────────────────────────────────────

const BottomSheet = ({ visible, onClose, title, subtitle = null, children }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable className="flex-1 justify-end bg-overlay" onPress={onClose}>
      <Pressable
        onPress={(e) => e.stopPropagation()}
        className="rounded-t-3xl bg-white px-4 pb-10 pt-5"
      >
        <View className="mb-1 items-center">
          <View className="mb-4 h-1 w-10 rounded-full bg-muted" />
          <Text className="text-lg font-semibold text-foreground">{title}</Text>
          {subtitle ? (
            <Text className="mt-1 text-center text-sm text-muted-foreground">{subtitle}</Text>
          ) : null}
        </View>
        {children}
      </Pressable>
    </Pressable>
  </Modal>
);

// ─── Notification toggle row ──────────────────────────────────────────────────

const NotificationRow = ({ icon: Icon, label, description, value, onValueChange }) => (
  <View className="mb-3 flex-row items-center rounded-2xl bg-muted/40 px-4 py-3">
    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary-muted">
      <Icon size={18} color="#019C7F" />
    </View>
    <View className="min-w-0 flex-1">
      <Text className="font-semibold text-foreground">{label}</Text>
      <Text className="mt-0.5 text-xs leading-4 text-muted-foreground">{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#CBD5E1", true: "#BDEDE4" }}
      thumbColor={value ? "#019C7F" : "#F8FAFC"}
    />
  </View>
);

// ─── Notification preferences modal ─────────────────────────────────────────

const NotificationPreferencesModal = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState({ order: true, email: true, push: true });

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const rows = [
    {
      key: "order",
      icon: Bell,
      label: t("notifications.orderUpdates"),
      description: t("notifications.orderUpdatesDescription"),
    },
    {
      key: "email",
      icon: Mail,
      label: t("notifications.emailUpdates"),
      description: t("notifications.emailUpdatesDescription"),
    },
    {
      key: "push",
      icon: Smartphone,
      label: t("notifications.pushUpdates"),
      description: t("notifications.pushUpdatesDescription"),
    },
  ];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t("navigation.notifications")}
      subtitle={t("notifications.preferencesDescription")}
    >
      {rows.map((row) => (
        <NotificationRow
          key={row.key}
          icon={row.icon}
          label={row.label}
          description={row.description}
          value={prefs[row.key]}
          onValueChange={() => toggle(row.key)}
        />
      ))}
    </BottomSheet>
  );
};

// ─── Language picker modal ────────────────────────────────────────────────────

const LANGUAGES = [
  { code: "ro", label: "Română", flag: "🇷🇴" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

const LanguageSelectModal = ({ visible, onClose }) => {
  const { i18n, t } = useTranslation();
  const activeLang = i18n.language?.split("-")[0] || "ro";

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("profile.language")}>
      {LANGUAGES.map((lang) => {
        const isActive = activeLang === lang.code;
        return (
          <Pressable
            key={lang.code}
            onPress={() => {
              i18n.changeLanguage(lang.code);
              onClose();
            }}
            className={`mb-2 flex-row items-center justify-between rounded-xl px-4 py-3.5 active:opacity-70 ${
              isActive ? "bg-primary-muted" : "bg-muted/40"
            }`}
          >
            <View className="flex-row items-center gap-3">
              <Text className="text-xl">{lang.flag}</Text>
              <Text className={`font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                {lang.label}
              </Text>
            </View>
            {isActive ? <Check size={16} color="#019C7F" /> : null}
          </Pressable>
        );
      })}
    </BottomSheet>
  );
};

// ─── Wallet card ──────────────────────────────────────────────────────────────

const WalletCard = ({ credits, t }) => (
  <View className="mt-5 w-full overflow-hidden rounded-2xl bg-[#0C172A] px-5 py-4">
    <View className="flex-row items-center justify-between">
      <View className="min-w-0 flex-1 pr-4">
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
          {t("profile.wallet")}
        </Text>
        <View className="mt-1.5 flex-row items-baseline gap-1.5">
          <Text className="text-3xl font-bold text-white">{credits > 0 ? credits : 0}</Text>
          <Text className="text-sm font-medium text-white/70">{t("profile.creditsLabel")}</Text>
        </View>
        {credits === 0 ? (
          <Text className="mt-1.5 text-xs text-white/45">{t("profile.NoAvailableCredits")}</Text>
        ) : null}
      </View>
      <View className="h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
        <Wallet size={22} color="#fff" strokeWidth={2} />
      </View>
    </View>
  </View>
);

// ─── Main Profile screen ──────────────────────────────────────────────────────

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useUser();
  const router = useRouter();

  const [showEdit, setShowEdit] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || t("profile.guestName");

  const credits = user?.creditsAvailable ?? 0;
  const currentLang = i18n.language?.split("-")[0] === "en" ? "English" : "Română";
  const currentYear = new Date().getFullYear();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader title={t("navigation.profile")} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 104 }}
      >
        {/* ── Hero ── */}
        <View className="border-b border-border/50 bg-white px-4 pb-5 pt-4">
          <View className="flex-row items-start gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary/15">
              <AvatarImage source={user?.profilePictureURL} />
              <AvatarFallback className="bg-primary-muted">
                <Text className="text-2xl font-bold text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </AvatarFallback>
            </Avatar>

            <View className="min-w-0 flex-1 pt-1">
              <View className="flex-row items-start justify-between gap-2">
                <Text className="flex-1 text-xl font-bold text-foreground" numberOfLines={2}>
                  {displayName}
                </Text>
                <Pressable
                  onPress={() => setShowEdit(true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/60 active:bg-muted"
                >
                  <Pencil size={16} color="#374151" strokeWidth={2} />
                </Pressable>
              </View>
              <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={1}>
                {user?.emailAddress}
              </Text>
              {user?.phone ? (
                <Text className="mt-0.5 text-sm text-muted-foreground" numberOfLines={1}>
                  {user.phone}
                </Text>
              ) : null}
            </View>
          </View>

          <WalletCard credits={credits} t={t} />
        </View>

        <View className="px-4 pt-4">
          {/* ── Children ── */}
          <View className="mb-5">
            <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("profile.childrenSection")}
            </Text>
            <ProfileChildrenSection />
          </View>

          {/* ── Help ── */}
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

          {/* ── Preferences ── */}
          <ProfileSection title={t("profile.preferencesSection")}>
            <ProfileMenuRow
              icon={Globe}
              label={t("profile.language")}
              subtitle={currentLang}
              onPress={() => setShowLanguage(true)}
            />
            <ProfileMenuRow
              icon={Bell}
              label={t("profile.notifications")}
              subtitle={t("profile.notificationsSubtitle")}
              onPress={() => setShowNotifications(true)}
            />
            <ProfileMenuRow
              icon={LogOut}
              label={t("navigation.logout")}
              onPress={() => setShowLogout(true)}
              destructive
              isLast
            />
          </ProfileSection>

          {/* ── Footer ── */}
          <View className="pb-2 pt-1">
            <Text className="text-center text-sm text-muted-foreground">
              {currentYear} {t("ui.developedBy")}{" "}
              <Text
                className="font-semibold text-primary"
                onPress={() => Linking.openURL("https://weblike.ro/")}
              >
                weblike.ro
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Modals ── */}
      <LanguageSelectModal visible={showLanguage} onClose={() => setShowLanguage(false)} />
      <NotificationPreferencesModal visible={showNotifications} onClose={() => setShowNotifications(false)} />
      <ProfileEditDialog open={showEdit} onOpenChange={setShowEdit} />

      <AlertDialog open={showLogout} onOpenChange={setShowLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmations.areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirmations.logoutConfirmation")}</AlertDialogDescription>
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

export default Profile;