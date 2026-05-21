import { View, Text, ActivityIndicator } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import { ChevronRight, Wallet } from "lucide-react-native";
import toast from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/apiClient";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^\d{10}$/.test(phone);

export const ParentProfile = () => {
  const { user, setUser } = useUser();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.emailAddress || "",
        phone: user.phone || "",
        profilePictureURL: user.profilePictureURL || "",
      });
    }
  }, [user]);

  const handleOpenDialog = useCallback(() => {
    if (profile) {
      setEditForm({ ...profile });
      setIsOpen(true);
      setHasChanges(false);
      setErrors({});
    }
  }, [profile]);

  const handleInputChange = (id, value) => {
    setErrors((prev) => ({ ...prev, [id]: "" }));
    let validatedValue = value;
    if (id === "phone") validatedValue = value.replace(/\D/g, "").slice(0, 10);
    else if (id === "firstName" || id === "lastName")
        validatedValue = value
          .split("")
          .filter((c) => /[a-zA-Z\s-]/.test(c))
          .join("");

    setEditForm((prev) => ({ ...prev, [id]: validatedValue }));
    if (profile) {
      const updated = { ...editForm, [id]: validatedValue };
      setHasChanges(
        updated.firstName !== profile.firstName ||
          updated.lastName !== profile.lastName ||
          updated.email !== profile.email ||
          updated.phone !== profile.phone
      );
    }
  };

  const validateForm = () => {
    if (!editForm) return false;
    const newErrors = {};
    if (!editForm.firstName?.trim()) newErrors.firstName = t("validation.firstNameRequired");
    if (!editForm.lastName?.trim()) newErrors.lastName = t("validation.lastNameRequired");
    if (!editForm.email?.trim()) newErrors.email = t("validation.emailRequired");
    else if (!validateEmail(editForm.email)) newErrors.email = t("validation.invalidEmail");
    if (editForm.phone && !validatePhone(String(editForm.phone)))
      newErrors.phone = t("validation.invalidPhone");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!editForm || !user || !validateForm()) {
      toast.error(t("validation.pleaseFixErrors"));
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/api/v1/user/update", {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        emailAddress: editForm.email.trim(),
        phone: editForm.phone,
      });
      const updatedUser = {
        ...user,
        name: `${editForm.firstName.trim()} ${editForm.lastName.trim()}`,
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        emailAddress: editForm.email.trim(),
        phone: editForm.phone,
      };
      await setUser(updatedUser);
      setProfile(editForm);
      setIsOpen(false);
      toast.success(t("status.profileUpdated"));
    } catch {
      toast.error(t("status.updateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="px-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Card onTouchEnd={handleOpenDialog} className="rounded-2xl">
            <CardContent className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage source={user?.profilePictureURL} />
                    <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">
                      {t("profile.helloUser")} {user?.firstName} {user?.lastName}!
                    </Text>
                    <Text className="text-sm text-muted-foreground">{user?.emailAddress}</Text>
                  </View>
                </View>
                <ChevronRight size={16} color="#F37C21" />
              </View>
            </CardContent>
            <View className="flex-row items-center gap-2 rounded-b-2xl bg-accent px-6 py-2">
              <Wallet size={18} color="#019C7F" />
              <Text className="text-sm font-medium text-primary">
                {user?.creditsAvailable > 0
                  ? `${t("profile.AvailableCredits")}: ${user.creditsAvailable}`
                  : t("profile.NoAvailableCredits")}
              </Text>
            </View>
          </Card>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("profile.editProfile")}</DialogTitle>
          </DialogHeader>
          <View className="gap-4 py-4">
            {["firstName", "lastName", "email", "phone"].map((field) => (
              <View key={field} className="gap-1">
                <Label>{t(field === "email" ? "profile.email" : `child.${field}`)}</Label>
                <Input
                  value={editForm?.[field] || ""}
                  onChangeText={(v) => handleInputChange(field, v)}
                  keyboardType={field === "email" ? "email-address" : field === "phone" ? "phone-pad" : "default"}
                  className={cn(errors[field] && "border-destructive")}
                />
                {errors[field] && (
                  <Text className="text-sm text-destructive">{errors[field]}</Text>
                )}
              </View>
            ))}
            <Button onPress={handleSaveEdit} disabled={!hasChanges || isLoading} className="mt-4 w-full bg-primary">
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                t("actions.saveChanges")
              )}
            </Button>
          </View>
        </DialogContent>
      </Dialog>
    </View>
  );
};
