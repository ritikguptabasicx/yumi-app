import { View, Text, ActivityIndicator } from "react-native";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import toast from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/apiClient";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^\d{10}$/.test(phone);

export function ProfileEditDialog({ open, onOpenChange }) {
  const { user, setUser } = useUser();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && open) {
      const data = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.emailAddress || "",
        phone: user.phone || "",
      };
      setProfile(data);
      setEditForm(data);
      setHasChanges(false);
      setErrors({});
    }
  }, [user, open]);

  const handleInputChange = (id, value) => {
    setErrors((prev) => ({ ...prev, [id]: "" }));
    let validatedValue = value;
    if (id === "phone") validatedValue = value.replace(/\D/g, "").slice(0, 10);
    else if (id === "firstName" || id === "lastName")
      validatedValue = value
        .split("")
        .filter((c) => /[a-zA-Z\s-]/.test(c))
        .join("");

    setEditForm((prev) => {
      const updated = { ...prev, [id]: validatedValue };
      if (profile) {
        setHasChanges(
          updated.firstName !== profile.firstName ||
            updated.lastName !== profile.lastName ||
            updated.email !== profile.email ||
            updated.phone !== profile.phone
        );
      }
      return updated;
    });
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
      await setUser({
        ...user,
        name: `${editForm.firstName.trim()} ${editForm.lastName.trim()}`,
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        emailAddress: editForm.email.trim(),
        phone: editForm.phone,
      });
      onOpenChange(false);
      toast.success(t("status.profileUpdated"));
    } catch {
      toast.error(t("status.updateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                keyboardType={
                  field === "email" ? "email-address" : field === "phone" ? "phone-pad" : "default"
                }
                className={cn(errors[field] && "border-destructive")}
              />
              {errors[field] ? (
                <Text className="text-sm text-destructive">{errors[field]}</Text>
              ) : null}
            </View>
          ))}
          <Button
            onPress={handleSaveEdit}
            disabled={!hasChanges || isLoading}
            className="mt-2 w-full bg-primary"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              t("actions.saveChanges")
            )}
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}
