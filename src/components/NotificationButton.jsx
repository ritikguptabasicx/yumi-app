import { useMemo, useState } from "react";
import { View, Text, Pressable, Modal, ActivityIndicator } from "react-native";
import { Bell, BellRing } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { api } from "@/lib/apiClient";
import { useUser } from "@/contexts/UserContext";

const normalizeNotifications = (notifications) => {
  if (!notifications) return [];
  if (Array.isArray(notifications)) return notifications.filter(Boolean);
  return [notifications].filter(Boolean);
};

const NotificationButton = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useSWR(
    user?.id ? ["header-notifications", user.id] : null,
    async () => {
      const res = await api.get("/api/v1/dashboard");
      return res.data?.data?.notifications || [];
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const notifications = useMemo(() => normalizeNotifications(data), [data]);
  const hasUnread = notifications.length > 0;
  const Icon = hasUnread ? BellRing : Bell;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t("navigation.notifications")}
        className="relative h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-white active:bg-muted"
      >
        <Icon size={21} color="#111827" />
        {hasUnread ? (
          <View className="absolute right-2.5 top-2 h-2.5 w-2.5 rounded-full border border-white bg-secondary" />
        ) : null}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-start bg-overlay px-4 pt-20" onPress={() => setOpen(false)}>
          <Pressable
            onPress={(event) => event.stopPropagation()}
            className="overflow-hidden rounded-2xl bg-white shadow-lg"
          >
            <View className="border-b border-border/70 px-4 py-4">
              <Text className="text-lg font-bold text-foreground">
                {t("navigation.notifications")}
              </Text>
            </View>

            {isLoading ? (
              <View className="items-center justify-center px-4 py-8">
                <ActivityIndicator color="#019C7F" />
              </View>
            ) : notifications.length > 0 ? (
              <View>
                {notifications.map((item, index) => (
                  <View
                    key={`${item?.title || "notification"}-${index}`}
                    className="border-b border-border/60 px-4 py-3 last:border-b-0"
                  >
                    <Text className="font-semibold text-foreground">
                      {item?.title || t("navigation.notifications")}
                    </Text>
                    {item?.message ? (
                      <Text className="mt-1 text-sm leading-5 text-muted-foreground">
                        {item.message}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center px-6 py-8">
                <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-primary-muted">
                  <Bell size={22} color="#019C7F" />
                </View>
                <Text className="text-base font-semibold text-foreground">
                  {t("status.noNotifications")}
                </Text>
                <Text className="mt-1 text-center text-sm text-muted-foreground">
                  {t("notifications.emptyMessage")}
                </Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default NotificationButton;
