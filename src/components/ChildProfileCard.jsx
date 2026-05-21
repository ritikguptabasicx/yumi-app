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

const ChildProfileCard = () => {
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
    <View className="gap-3 px-4">
      <View className="flex-row items-center justify-end">
        {hasChildren && (
          <Pressable
            onPress={() => setOpen(true)}
            className="flex-row items-center gap-1"
          >
            <Text className="text-sm font-semibold text-primary">{t("child.myKids")}</Text>
            <ChevronRight size={16} color="#019C7F" />
          </Pressable>
        )}
      </View>

      {!hasChildren ? (
        <Pressable onPress={handleAddChild}>
          <Card className="flex-row overflow-hidden rounded-2xl bg-primary px-4 py-3">
            <View className="flex-1 gap-4">
              <View>
                <Text className="mb-1 text-lg font-bold text-white">
                  {t("child.addYourChildHeading")}
                </Text>
                <Text className="text-sm text-gray-200">{t("child.personalizedMeals")}</Text>
              </View>
              <Button
                variant="outline"
                onPress={handleAddChild}
                className="self-start rounded-full border-primary bg-white"
              >
                <Text className="text-primary">{t("child.addChild")} +</Text>
              </Button>
            </View>
            <AppImage source={images.illustration5} width={160} height={144} contentFit="contain" />
          </Card>
        </Pressable>
      ) : selectedChild ? (
        <Card className="rounded-2xl bg-primary-soft p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <Avatar className="h-12 w-12 rounded-md border border-white-muted">
                <AvatarImage source={selectedChild?.profilePictureURL} />
                <AvatarFallback className="rounded-md bg-white">
                  <Text className="font-semibold text-primary">
                    {selectedChild?.firstName?.charAt(0) ?? "C"}
                  </Text>
                </AvatarFallback>
              </Avatar>
              <Text className="font-semibold text-white">
                {selectedChild?.firstName ?? "Unknown"} {selectedChild?.lastName ?? ""}
              </Text>
            </View>

            <Button
              onPress={handleEditChild}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-secondary"
            >
              <Pencil size={16} color="#fff" />
            </Button>
          </View>

          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <School size={16} color="#fff" />
              <Text className="text-sm text-white">
                {selectedChild?.school?.name ?? t("child.noSchoolAssigned")}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <GraduationCap size={16} color="#fff" />
              <Text className="text-sm text-white">
                {t("child.grade")} :{" "}
                {selectedChild?.school?.class?.[0]?.name ?? "No class assigned"}
              </Text>
            </View>
          </View>
        </Card>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-overlay" onPress={() => setOpen(false)}>
          <View className="max-h-96 rounded-t-2xl bg-background pb-8">
            <View className="items-center border-b border-border py-3">
              <View className="mb-2 h-1 w-12 rounded-full bg-gray-300" />
              <Text className="text-lg font-semibold text-foreground">
                {t("child.switchChildProfile")}
              </Text>
              <Text className="text-sm text-muted-foreground">{t("child.selectChild")}</Text>
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
              <Button variant="outline" onPress={() => setOpen(false)} className="w-full">
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
