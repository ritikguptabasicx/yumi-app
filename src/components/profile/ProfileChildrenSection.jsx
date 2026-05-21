import { useState, useMemo } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { School, ChevronRight, Check, Pencil, Plus, Users } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import { useChildren } from "@/hooks/useChildren";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import toast from "@/lib/toast";
import { useTranslation } from "react-i18next";
import Loader from "@/components/Loader";
import { api } from "@/lib/apiClient";
export function ProfileChildrenSection() {
  const [open, setOpen] = useState(false);
  const { user, setUser } = useUser();
  const { children, isChildrenLoading, mutateChildren } = useChildren();
  const { t } = useTranslation();
  const router = useRouter();

  const selectedChild = useMemo(() => {
    if (!user?.selectedChildId || !children?.length) return null;
    return children.find((c) => c.id === user.selectedChildId) || null;
  }, [user?.selectedChildId, children]);

  const handleSwitchChild = async (child) => {
    if (!user?.id || !child?.id || user?.selectedChildId === child.id) return;
    try {
      const response = await api.post(`/api/v1/child/switch`, { childId: child.id });
      if (response.data.status === 1) {
        await setUser({ ...user, selectedChildId: child.id });
        await mutateChildren();
        toast.success(t("status.childSwitched"));
        setOpen(false);
      } else {
        toast.error(t("errors.somethingWentWrong"));
      }
    } catch {
      toast.error(t("errors.somethingWentWrong"));
    }
  };

  if (!user || isChildrenLoading) {
    return <Loader height="h-24" />;
  }

  const hasChildren = (children?.length ?? 0) > 0;

  return (
    <>
      {!hasChildren ? (
        <Pressable
          onPress={() => router.push("/(app)/add-child")}
          className="flex-row items-center rounded-2xl border border-dashed border-primary/40 bg-primary-muted/30 px-4 py-5 active:opacity-80"
        >
          <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-primary">
            <Plus size={22} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">
              {t("child.addYourChildHeading")}
            </Text>
            <Text className="mt-0.5 text-sm text-muted-foreground">
              {t("child.personalizedMeals")}
            </Text>
          </View>
          <ChevronRight size={18} color="#019C7F" />
        </Pressable>
      ) : (
        <View className="overflow-hidden rounded-2xl border border-border/60 bg-white">
          <Pressable
            onPress={() => setOpen(true)}
            className="flex-row items-center border-b border-border/80 px-4 py-4 active:bg-muted/40"
          >
            <Avatar className="mr-3 h-12 w-12 rounded-xl">
              <AvatarImage source={selectedChild?.profilePictureURL} />
              <AvatarFallback className="rounded-xl bg-primary-muted">
                <Text className="font-semibold text-primary">
                  {selectedChild?.firstName?.charAt(0) ?? "C"}
                </Text>
              </AvatarFallback>
            </Avatar>
            <View className="min-w-0 flex-1">
              <Text className="text-xs font-medium uppercase tracking-wide text-primary">
                {t("profile.activeChild")}
              </Text>
              <Text className="mt-0.5 text-base font-semibold text-foreground">
                {selectedChild
                  ? `${selectedChild.firstName} ${selectedChild.lastName}`
                  : t("child.selectChild")}
              </Text>
              {selectedChild?.school?.name ? (
                <View className="mt-1 flex-row items-center gap-1">
                  <School size={12} color="#64748B" />
                  <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                    {selectedChild.school.name}
                  </Text>
                </View>
              ) : null}
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </Pressable>

          <Pressable
            onPress={() => router.push("/(app)/edit-child")}
            className="flex-row items-center border-b border-border/80 px-4 py-3.5 active:bg-muted/40"
          >
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-muted">
              <Pencil size={16} color="#64748B" />
            </View>
            <Text className="flex-1 text-[15px] font-medium text-foreground">
              {t("child.editChildProfile")}
            </Text>
            <ChevronRight size={18} color="#94A3B8" />
          </Pressable>

          <Pressable
            onPress={() => setOpen(true)}
            className="flex-row items-center px-4 py-3.5 active:bg-muted/40"
          >
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-muted">
              <Users size={16} color="#64748B" />
            </View>
            <Text className="flex-1 text-[15px] font-medium text-foreground">
              {t("profile.switchChild")}
            </Text>
            <Text className="mr-1 text-sm text-muted-foreground">
              {children.length}
            </Text>
            <ChevronRight size={18} color="#94A3B8" />
          </Pressable>
        </View>
      )}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-overlay" onPress={() => setOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} className="rounded-t-3xl bg-white pb-8">
            <View className="items-center border-b border-border/80 py-4">
              <View className="mb-3 h-1 w-10 rounded-full bg-border" />
              <Text className="text-lg font-semibold text-foreground">
                {t("child.switchChildProfile")}
              </Text>
            </View>

            <ScrollView className="max-h-72 px-4 py-2">
              {children?.map((child) => (
                <Pressable
                  key={child.id}
                  onPress={() => handleSwitchChild(child)}
                  className="mb-2 flex-row items-center rounded-xl border border-border/80 bg-white px-3 py-3 active:bg-muted/30"
                >
                  <Avatar className="mr-3 h-11 w-11 rounded-xl">
                    <AvatarImage source={child.profilePictureURL} />
                    <AvatarFallback className="rounded-xl bg-primary-muted">
                      <Text className="font-medium text-primary">
                        {child.firstName?.charAt(0) ?? "C"}
                      </Text>
                    </AvatarFallback>
                  </Avatar>
                  <View className="min-w-0 flex-1">
                    <Text className="font-medium text-foreground">
                      {child.firstName} {child.lastName}
                    </Text>
                    <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                      {child.school?.name ?? t("child.noSchoolAssigned")}
                    </Text>
                  </View>
                  {user?.selectedChildId === child.id ? (
                    <Check size={20} color="#019C7F" />
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>

            <View className="gap-2 px-4 pt-2">
              <Button onPress={() => { setOpen(false); router.push("/(app)/add-child"); }} className="w-full bg-primary">
                {t("child.addNewChild")}
              </Button>
              <Button variant="outline" onPress={() => setOpen(false)} className="w-full">
                {t("actions.close")}
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
