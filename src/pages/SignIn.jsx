import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import AppImage from "@/components/AppImage";
import { useRouter, Link } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { LanguageSelect } from "@/components/LanguageSelect";
import { api } from "@/lib/apiClient";
import { useLegalLinks } from "@/hooks/useLegalLinks";
import toast from "@/lib/toast";
import { images } from "@/lib/assets";
import * as WebBrowser from "expo-web-browser";

const SignIn = () => {
  const router = useRouter();
  const { setUser } = useUser();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { legalLinks } = useLegalLinks();

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/v1/auth/sign-in", {
        emailAddress,
        password,
      });
      const data = response.data;
      if (data.success && data.data) {
        const user = { ...data.data, token: data.token };
        await setUser(user);
        toast.success(t("auth.successSignIn"));
        router.replace("/(app)/(tabs)");
      } else {
        toast.error(t("auth.invalidCredentials"));
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error(t("errors.somethingWentWrong"));
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
              <Text className="mb-2 text-3xl font-bold text-neutral-darkest">
                {t("auth.welcomeBack")}
              </Text>
              <Text className="text-base text-neutral-dark">
                {t("auth.loginTitle")}
              </Text>
            </View>
            <AppImage source={images.illustration2} width={112} height={112} contentFit="contain" />
          </View>

          <View className="gap-5">
            <View>
              <Input
                value={emailAddress}
                onChangeText={setEmailAddress}
                placeholder={t("auth.email")}
                keyboardType="email-address"
                autoCapitalize="none"
                className="rounded-xl border-2 border-gray-200 py-4"
              />
            </View>

            <View className="relative">
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder={t("auth.password")}
                secureTextEntry={!showPassword}
                className="rounded-xl border-2 border-gray-200 py-4 pr-12"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 p-1"
              >
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </Pressable>
            </View>

            <View className="items-end">
              <Link href="/(auth)/forgot-password" asChild>
                <Pressable>
                  <Text className="text-sm font-semibold text-primary">
                    {t("auth.forgotPassword")}
                  </Text>
                </Pressable>
              </Link>
            </View>

            <Button
              onPress={handleSignIn}
              disabled={isLoading}
              loading={isLoading}
              className="w-full rounded-full bg-primary py-4"
            >
              {isLoading ? t("auth.signInProcessing") : t("auth.signIn")}
            </Button>
          </View>
        </View>

        <View className="mx-auto max-w-xs py-8 px-6">
          <Text className="text-center text-xs text-gray-600">
            {t("auth.loginAgreement")}{" "}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;
