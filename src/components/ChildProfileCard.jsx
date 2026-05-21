import { useState, useMemo } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import AppImage from "@/components/AppImage";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  GraduationCap,
  School,
  ChevronRight,
  Check,
  Pencil,
} from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import { useChildren } from "@/hooks/useChildren";
import toast from "@/lib/toast";
import { useTranslation } from "react-i18next";
import Loader from "./Loader";
import { api } from "@/lib/apiClient";
import { images } from "@/lib/assets";

const ChildProfileCard = ({ showActions = true }) => {
  const [open, setOpen] = useState(false);
  const { user, setUser } = useUser();
  const { children, isChildrenLoading, mutateChildren } = useChildren();
  const { t } = useTranslation();
  const router = useRouter();

  const selectedChild = useMemo(() => {
    if (!user?.selectedChildId || !children?.length) return null;
    return children.find((c) => c.id === user.selectedChildId) || null;
  }, [user?.selectedChildId, children]);

  const drawerChildrens = children || [];
  const hasChildren = !!user?.selectedChildId;

  const handleSwitchChild = async (child) => {
    if (!user?.id || !child?.id) {
      toast.error(t("errors.invalidUserOrChild"));
      return;
    }

    if (user?.selectedChildId === child.id) return;

    try {
      const response = await api.post(`/api/v1/child/switch`, {
        childId: child.id,
      });

      const data = response.data;

      if (data.status === 1) {
        const updatedUser = {
          ...user,
          selectedChildId: child.id,
        };

        await setUser(updatedUser);
        await mutateChildren();

        toast.success(t("status.childSwitched"));
        setOpen(false);
      } else {
        toast.error(t("errors.somethingWentWrong"));
      }
    } catch (error) {
      console.error("Error switching child:", error);
      toast.error(t("errors.somethingWentWrong"));
    }
  };

  const handleAddChild = () => {
    setOpen(false);
    router.push("/(app)/add-child");
  };

  const handleEditChild = () => {
    router.push("/(app)/edit-child");
  };

  if (!user || isChildrenLoading) {
    return <Loader height="h-40" />;
  }

  return (
    <View className="px-4">
      {!hasChildren ? (
        <Pressable
          onPress={handleAddChild}
          className="transition-all active:scale-[0.98]"
        >
          <Card className="flex-row items-center overflow-hidden rounded-3xl border-0 bg-primary p-5 pr-2">
            <View className="z-10 flex-1 gap-4">
              <View>
                <Text className="mb-1 text-xl font-bold text-white">
                  {t("child.addYourChildHeading")}
                </Text>
                <Text className="text-sm leading-5 text-emerald-50">
                  {t("child.personalizedMeals")}
                </Text>
              </View>
              <Button
                variant="outline"
                onPress={handleAddChild}
                className="h-9 self-start rounded-full border-white bg-white/10 px-4 active:bg-white/20"
              >
                <Text className="font-semibold text-white">
                  {t("child.addChild")} +
                </Text>
              </Button>
            </View>
            <View className="relative h-28 w-36 items-center justify-center">
              <AppImage
                source={images.illustration5}
                width={130}
                height={110}
                contentFit="contain"
              />
            </View>
          </Card>
        </Pressable>
      ) : selectedChild ? (
        <Card className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3.5">
              <Avatar className="h-14 w-14 rounded-2xl border-2 border-primary-muted">
                <AvatarImage source={selectedChild?.profilePictureURL} />
                <AvatarFallback className="rounded-2xl bg-primary-muted">
                  <Text className="text-lg font-bold text-primary">
                    {selectedChild?.firstName?.charAt(0) ?? "C"}
                  </Text>
                </AvatarFallback>
              </Avatar>
              <View className="min-w-0">
                <Text
                  className="text-base font-bold text-foreground"
                  numberOfLines={1}
                >
                  {selectedChild?.firstName ?? "Unknown"}{" "}
                  {selectedChild?.lastName ?? ""}
                </Text>
                <Text className="mt-0.5 text-xs font-medium text-muted-foreground">
                  {t("navigation.childProfile")}
                </Text>
              </View>
            </View>

            {showActions ? (
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => setOpen(true)}
                  className="flex-row items-center gap-1 rounded-full bg-secondary-muted px-3 py-1.5 active:opacity-80"
                >
                  <Text className="text-xs font-bold text-secondary">
                    {t("child.myKids")}
                  </Text>
                  <ChevronRight size={12} color="#F37C21" />
                </Pressable>
                <Pressable
                  onPress={handleEditChild}
                  className="h-8 w-8 items-center justify-center rounded-full bg-muted active:bg-border/60"
                >
                  <Pencil size={14} color="#64748B" />
                </Pressable>
              </View>
            ) : null}
          </View>

          <View className="my-3.5 h-[1px] bg-border/40" />

          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <View className="mb-1 flex-row items-center gap-1.5">
                <School size={13} color="#64748B" />
                <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("child.school")}
                </Text>
              </View>
              <Text
                className="text-sm font-semibold text-foreground"
                numberOfLines={1}
              >
                {selectedChild?.school?.name ?? t("child.noSchoolAssigned")}
              </Text>
            </View>

            <View className="mx-4 h-8 w-[1px] bg-border/45" />

            <View className="flex-1 pl-2">
              <View className="mb-1 flex-row items-center gap-1.5">
                <GraduationCap size={14} color="#64748B" />
                <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("child.grade")}
                </Text>
              </View>
              <Text
                className="text-sm font-semibold text-foreground"
                numberOfLines={1}
              >
                {selectedChild?.school?.class?.[0]?.name ?? "—"}
              </Text>
            </View>
          </View>
        </Card>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-overlay"
          onPress={() => setOpen(false)}
        >
          <View className="max-h-96 rounded-t-2xl bg-background pb-8">
            <View className="items-center border-b border-border py-3">
              <View className="mb-2 h-1 w-12 rounded-full bg-gray-300" />
              <Text className="text-lg font-semibold text-foreground">
                {t("child.switchChildProfile")}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {t("child.selectChild")}
              </Text>
            </View>

            <ScrollView className="max-h-64 px-4 py-2">
              {drawerChildrens?.length > 0 ? (
                drawerChildrens.map((child) => (
                  <Pressable
                    key={child?.id ?? "temp-id"}
                    onPress={() => handleSwitchChild(child)}
                    className="mb-2 flex-row items-center gap-4 rounded-lg border p-3"
                  >
                    <Avatar className="h-10 w-10 rounded-md">
                      <AvatarImage source={child?.profilePictureURL} />
                      <AvatarFallback className="bg-accent">
                        <Text className="font-medium text-primary">
                          {child?.firstName?.charAt(0) ?? "C"}
                        </Text>
                      </AvatarFallback>
                    </Avatar>

                    <View className="min-w-0 flex-1">
                      <Text className="font-medium text-foreground">
                        {child?.firstName ?? "Unknown"} {child?.lastName ?? ""}
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        {child?.school?.name ?? t("child.noSchoolAssigned")}
                      </Text>
                    </View>

                    {user?.selectedChildId === child?.id && (
                      <Check size={20} color="#019C7F" />
                    )}
                  </Pressable>
                ))
              ) : (
                <View className="items-center py-8">
                  <Text className="text-sm text-muted-foreground">
                    {t("child.noChildrenFound")}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View className="gap-2 px-4 pt-2">
              <Button onPress={handleAddChild} className="w-full bg-primary">
                {t("child.addNewChild")}
              </Button>
              <Button
                variant="outline"
                onPress={() => setOpen(false)}
                className="w-full"
              >
                {t("actions.cancel")}
              </Button>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ChildProfileCard;
