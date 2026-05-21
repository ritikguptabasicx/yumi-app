import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import AppImage from "@/components/AppImage";
import { useRouter, Link, useLocalSearchParams } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import toast from "@/lib/toast";
import { LanguageSelect } from "@/components/LanguageSelect";
import { api } from "@/lib/apiClient";
import { useTranslation } from "react-i18next";
import { useLegalLinks } from "@/hooks/useLegalLinks";
import { images } from "@/lib/assets";
import * as WebBrowser from "expo-web-browser";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [cateringName, setCateringName] = useState("");
  const { t } = useTranslation();
  const { legalLinks } = useLegalLinks();
  const router = useRouter();
  const { invitecode: urlCode } = useLocalSearchParams();

  useEffect(() => {
    if (!urlCode) {
      router.replace("/(auth)/signin");
      return;
    }

    const fetchInvitationInfo = async () => {
      setInvitationCode(urlCode);
      try {
        const response = await api.get(`/api/v1/auth/invitation-info/${urlCode}`);
        const data = response.data;
        if (data.success && data.data) {
          setCateringName(data.data.tenantName);
        }
      } catch (error) {
        console.error("Error fetching invitation info:", error);
      }
    };

    fetchInvitationInfo();
  }, [urlCode, router]);

  const handleSignUp = async () => {
    if (!agreedToTerms) return;
    setIsLoading(true);

    try {
      const response = await api.post("/api/v1/auth/sign-up", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        emailAddress: email.trim(),
        code: invitationCode?.trim() || "",
      });

      const data = response.data;

      if (data?.success || data?.status === 1) {
        setShowSuccessDialog(true);
      } else {
        if (data?.message) {
          if (data.message.toLowerCase().includes("email already exists")) {
            toast.error(t("auth.emailExists"));
          } else {
            toast.error(data.message);
          }
        } else {
          toast.error(t("auth.signUpFailed"));
        }
      }
    } catch (error) {
      console.error("Sign-up error:", error);
      toast.error(t("auth.signUpFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="h-48 w-full flex-row items-start justify-end bg-secondary-light-muted p-6">
          <LanguageSelect />
        </View>

        <View className="-mt-20 flex-1 px-6">
          <View className="mb-10 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              {cateringName ? (
                <View>
                  <Text className="text-sm font-medium uppercase tracking-wider text-primary">
                    {t("auth.welcomeTo")}
                  </Text>
                  <Text className="mt-1 text-3xl font-bold leading-tight text-neutral-darkest">
                    {cateringName}
                  </Text>
                </View>
              ) : (
                <Text className="mb-2 text-3xl font-bold text-neutral-darkest">
                  {t("auth.getStarted")}
                </Text>
              )}
              <Text className="text-base leading-relaxed text-neutral-dark">
                {cateringName ? t("auth.completeRegistration") : t("auth.createAccount")}
              </Text>
            </View>
            <AppImage source={images.illustration1} width={112} height={112} contentFit="contain" />
          </View>

          <View className="gap-6">
            <View className="gap-2">
              <Label>{t("auth.firstName")}</Label>
              <Input
                value={firstName}
                onChangeText={setFirstName}
                placeholder={t("auth.firstName")}
                className="rounded-xl border-2 border-gray-200 py-4"
              />
            </View>

            <View className="gap-2">
              <Label>{t("auth.lastName")}</Label>
              <Input
                value={lastName}
                onChangeText={setLastName}
                placeholder={t("auth.lastName")}
                className="rounded-xl border-2 border-gray-200 py-4"
              />
            </View>

            <View className="gap-2">
              <Label>{t("auth.email")}</Label>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder={t("auth.email")}
                keyboardType="email-address"
                autoCapitalize="none"
                className="rounded-xl border-2 border-gray-200 py-4"
              />
            </View>

            <View className="flex-row items-start gap-3 py-4">
              <Checkbox checked={agreedToTerms} onCheckedChange={setAgreedToTerms} className="mt-1" />
              <Text className="flex-1 text-sm leading-relaxed text-gray-600">
                {t("auth.agreeToTerms")}{" "}
                <Text
                  className="font-semibold text-primary"
                  onPress={() => legalLinks?.privacy && WebBrowser.openBrowserAsync(legalLinks.privacy)}
                >
                  {t("auth.privacyPolicy")}
                </Text>
                {" & "}
                <Text
                  className="font-semibold text-primary"
                  onPress={() => legalLinks?.terms && WebBrowser.openBrowserAsync(legalLinks.terms)}
                >
                  {t("auth.termsOfService")}
                </Text>
              </Text>
            </View>

            <Button
              onPress={handleSignUp}
              disabled={isLoading || !agreedToTerms}
              loading={isLoading}
              className="w-full rounded-full bg-primary p-6"
            >
              {isLoading ? t("auth.signingUp") : t("auth.signUp")}
            </Button>
          </View>
        </View>

        <View className="px-6 py-8">
          <Text className="text-center text-base text-gray-600">
            {t("auth.haveAccount")}{" "}
            <Link href="/(auth)/signin" asChild>
              <Pressable>
                <Text className="font-semibold text-primary">{t("auth.signIn")}</Text>
              </Pressable>
            </Link>
          </Text>
        </View>
      </ScrollView>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <View className="mb-6 items-center">
              <CheckCircle size={64} color="#22C55E" />
            </View>
            <AlertDialogTitle className="text-center text-xl">
              {t("auth.emailVerificationRequired")}
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-3 text-center leading-relaxed">
              {t("auth.emailVerificationSent")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <Button
              className="w-full rounded-xl bg-primary py-3"
              onPress={() => {
                setShowSuccessDialog(false);
                router.replace("/(auth)/signin");
              }}
            >
              {t("actions.close")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
