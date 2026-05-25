import { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronRight, GraduationCap, School } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/apiClient";
import toast from "@/lib/toast";

const TeacherProfileCard = () => {
  const { user, setUser } = useUser();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });

  const initials = useMemo(() => {
    const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    return name
      ? name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "T";
  }, [user?.firstName, user?.lastName]);

  const openEditor = () => {
    setForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await api.post("/api/v1/t/update-user-profile", {
        userId: user.id,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        emailAddress: user.emailAddress,
        phone: form.phone,
      });

      await setUser({
        ...user,
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone,
      });
      toast.success(t("status.profileUpdated"));
      setIsOpen(false);
    } catch (error) {
      console.error("Teacher profile update error:", error);
      toast.error(t("status.updateFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Pressable
        onPress={openEditor}
        className="mx-4 mt-4 rounded-3xl bg-primary p-5 shadow-sm shadow-primary/20"
      >
        <View className="flex-row items-center gap-3">
          <Avatar className="h-14 w-14 bg-white">
            <AvatarImage source={{ uri: user?.profilePictureURL }} />
            <AvatarFallback className="bg-white">
              <Text className="text-lg font-black text-primary">{initials}</Text>
            </AvatarFallback>
          </Avatar>

          <View className="min-w-0 flex-1">
            <Text className="text-lg font-black text-white" numberOfLines={1}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="mt-0.5 text-sm font-semibold text-white/75" numberOfLines={1}>
              {user?.emailAddress}
            </Text>
          </View>

          <View className="h-8 w-8 items-center justify-center rounded-full bg-white">
            <ChevronRight size={17} color="#019C7F" strokeWidth={2.6} />
          </View>
        </View>

        <View className="mt-4 gap-2">
          <View className="flex-row items-center gap-2">
            <School size={16} color="#fff" strokeWidth={2.5} />
            <Text className="text-sm font-semibold text-white/90" numberOfLines={1}>
              {user?.schoolName || t("orders.notAvailable")}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <GraduationCap size={16} color="#fff" strokeWidth={2.5} />
            <Text className="text-sm font-semibold text-white/90" numberOfLines={1}>
              {t("child.primaryClass")} : {user?.primaryClass || t("orders.notAvailable")}
            </Text>
          </View>
        </View>
      </Pressable>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("profile.editProfile")}</DialogTitle>
          </DialogHeader>

          <View className="gap-3">
            <Input
              value={form.firstName}
              onChangeText={(firstName) => setForm((prev) => ({ ...prev, firstName }))}
              placeholder={t("child.enterFirstName")}
            />
            <Input
              value={form.lastName}
              onChangeText={(lastName) => setForm((prev) => ({ ...prev, lastName }))}
              placeholder={t("child.enterLastName")}
            />
            <Input value={user?.emailAddress || ""} editable={false} />
            <Input
              value={form.phone}
              onChangeText={(phone) => setForm((prev) => ({ ...prev, phone }))}
              keyboardType="phone-pad"
              placeholder={t("profile.phone")}
            />
            <Button
              onPress={handleSave}
              loading={isSaving}
              disabled={isSaving || !form.firstName.trim() || !form.lastName.trim()}
              className="mt-2 rounded-xl"
            >
              {t("actions.saveChanges")}
            </Button>
          </View>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TeacherProfileCard;
