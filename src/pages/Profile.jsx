import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Switch,
  Linking,
  RefreshControl,
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
  ChevronRight,
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

// ─── Reusable bottom sheet wrapper (Zomato/Swiggy Clean Style) ───────────────

const BottomSheet = ({ visible, onClose, title, subtitle = null, children }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
      <Pressable
        onPress={(e) => e.stopPropagation()}
        className="rounded-t-[28px] bg-white px-5 pb-10 pt-4 shadow-xl"
      >
        <View className="mb-5 items-center">
          <View className="mb-4 h-1.5 w-12 rounded-full bg-neutral-200" />
          <Text className="text-xl font-bold text-neutral-900">{title}</Text>
          {subtitle ? (
            <Text className="mt-1 text-center text-sm font-medium text-neutral-500">{subtitle}</Text>
          ) : null}
        </View>
        {children}
      </Pressable>
    </Pressable>
  </Modal>
);

// ─── Notification toggle row ──────────────────────────────────────────────────

const NotificationRow = ({ icon: Icon, label, description, value, onValueChange }) => (
  <View className="mb-3 flex-row items-center justify-between rounded-2xl border border-neutral-100 bg-neutral-50/50 p-4">
    <View className="flex-1 flex-row items-start gap-3.5 pr-2">
      <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
        <Icon size={18} color="#404040" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-neutral-900">{label}</Text>
        <Text className="mt-0.5 text-xs font-medium leading-4 text-neutral-500">{description}</Text>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#E5E5E5", true: "#019C7F" }}
      thumbColor="#FFFFFF"
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
      <View className="mt-1">
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
      </View>
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
      <View className="mt-1 gap-2.5">
        {LANGUAGES.map((lang) => {
          const isActive = activeLang === lang.code;
          return (
            <Pressable
              key={lang.code}
              onPress={() => {
                i18n.changeLanguage(lang.code);
                onClose();
              }}
              className={`flex-row items-center justify-between rounded-2xl border p-4 active:opacity-80 ${
                isActive ? "border-primary/20 bg-primary/5" : "border-neutral-100 bg-neutral-50/50"
              }`}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">{lang.flag}</Text>
                <Text className={`text-base font-semibold ${isActive ? "text-primary" : "text-neutral-800"}`}>
                  {lang.label}
                </Text>
              </View>
              {isActive ? (
                <View className="h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check size={12} color="#FFF" strokeWidth={3} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
};

// ─── Wallet card (Swiggy Money Inspired Compact Style) ──────────────────────

const WalletCard = ({ credits, t }) => (
  <View className="mx-4 mt-4 overflow-hidden rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
          <Wallet size={20} color="#D97706" strokeWidth={2.5} />
        </View>
        <View>
          <Text className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            {t("profile.wallet")}
          </Text>
          <View className="mt-0.5 flex-row items-baseline gap-1">
            <Text className="text-xl font-black text-neutral-900">{credits > 0 ? credits : 0}</Text>
            <Text className="text-xs font-semibold text-neutral-500">{t("profile.creditsLabel")}</Text>
          </View>
        </View>
      </View>
      
      {credits === 0 ? (
        <View className="rounded-full bg-neutral-100 px-3 py-1.5">
          <Text className="text-[11px] font-bold text-neutral-500">
            {t("profile.NoAvailableCredits")}
          </Text>
        </View>
      ) : (
        <ChevronRight size={16} color="#A3A3A3" strokeWidth={2.5} />
      )}
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
  const [refreshing, setRefreshing] = useState(false);

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || t("profile.guestName");

  const credits = user?.creditsAvailable ?? 0;
  const currentLang = i18n.language?.split("-")[0] === "en" ? "English" : "Română";
  const currentYear = new Date().getFullYear();

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <ScreenHeader title={t("navigation.profile")} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await new Promise((resolve) => setTimeout(resolve, 500));
              } finally {
                setRefreshing(false);
              }
            }}
            tintColor="#019C7F"
          />
        }
      >
        {/* ── Hero Unit (Clicking the profile card opens the configuration) ── */}
        <Pressable 
          onPress={() => setShowEdit(true)}
          className="bg-white px-5 pb-5 pt-4 flex-row items-center justify-between active:bg-neutral-50/60"
        >
          <View className="flex-1 flex-row items-center gap-4">
            <Avatar className="h-16 w-16 rounded-full border border-neutral-100 shadow-sm">
              <AvatarImage source={user?.profilePictureURL} />
              <AvatarFallback className="bg-primary/10">
                <Text className="text-xl font-bold text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </AvatarFallback>
            </Avatar>

            <View className="flex-1 pr-2">
              <Text className="text-xl font-black tracking-tight text-neutral-900" numberOfLines={1}>
                {displayName}
              </Text>
              <Text className="mt-0.5 text-xs font-semibold text-neutral-400" numberOfLines={1}>
                {user?.emailAddress || "No email linked"}
              </Text>
              {user?.phone ? (
                <Text className="mt-0.5 text-xs font-semibold text-neutral-400" numberOfLines={1}>
                  {user.phone}
                </Text>
              ) : null}
            </View>
          </View>

          <ChevronRight size={16} color="#A3A3A3" strokeWidth={2.5} />
        </Pressable>


        <WalletCard credits={credits} t={t} />

        <View className="px-4 pt-5">

          {!user.isTeacher && (
          <View className="mb-5 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
            <Text className="mb-3 px-1 text-xs font-extrabold uppercase tracking-widest text-neutral-400">
              {t("profile.childrenSection")}
            </Text>
            <ProfileChildrenSection />
          </View>)}


          {/* ── Help Options Card Container ── */}
          <View className="mb-5 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
            <Text className="mb-1 px-1 text-xs font-extrabold uppercase tracking-widest text-neutral-400">
              {t("profile.helpSection")}
            </Text>
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
          </View>

          {/* ── Preferences Card Container ── */}
          <View className="mb-6 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
            <Text className="mb-1 px-1 text-xs font-extrabold uppercase tracking-widest text-neutral-400">
              {t("profile.preferencesSection")}
            </Text>
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
          </View>

          {/* ── Modern App Version / Branding Footer ── */}
          <View className="items-center py-4">
            <Text className="text-xs font-bold text-neutral-300 uppercase tracking-widest">
              Version 1.0.0
            </Text>
            <Text className="mt-1 text-center text-xs font-semibold text-neutral-400">
              {currentYear} {t("ui.developedBy")}{" "}
              <Text
                className="font-bold text-primary"
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
        <AlertDialogContent className="rounded-3xl max-w-[90%]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-neutral-900">
              {t("confirmations.areYouSure")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-neutral-500 mt-1">
              {t("confirmations.logoutConfirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex-row gap-3">
            <AlertDialogCancel 
              onPress={() => setShowLogout(false)} 
              className="flex-1 rounded-xl border-neutral-200 py-3"
            >
              <Text className="font-bold text-neutral-700">{t("actions.cancel")}</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              onPress={() => {
                setShowLogout(false);
                logout();
              }}
              className="flex-1 rounded-xl bg-red-500 py-3 active:bg-red-600"
            >
              <Text className="font-bold text-white">{t("navigation.logout")}</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
};

export default Profile;