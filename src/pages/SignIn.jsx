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
      const response = await api.post("/api/v1/auth/sign-in", { emailAddress, password });
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
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Top bar: language selector */}
        <View className="w-full flex-row items-center justify-end bg-secondary-light-muted px-6 py-4">
          <LanguageSelect />
        </View>

        {/* Hero section */}
        <View className="items-center bg-secondary-light-muted px-6 pb-10 pt-4">
          <AppImage source={images.illustration2} width={120} height={120} contentFit="contain" />
        </View>

        {/* Form card */}
        <View className="flex-1 rounded-t-3xl bg-white px-6 pt-8">
          <View className="mb-8">
            <Text className="mb-1 text-2xl font-bold text-neutral-darkest">
              {t("auth.welcomeBack")}
            </Text>
            <Text className="text-sm text-neutral-dark">
              {t("auth.loginTitle")}
            </Text>
          </View>

          <View className="gap-4">
            {/* Email */}
            <Input
              value={emailAddress}
              onChangeText={setEmailAddress}
              placeholder={t("auth.email")}
              keyboardType="email-address"
              autoCapitalize="none"
              className="rounded-xl border-2 border-gray-200"
            />

            {/* Password */}
            <View>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder={t("auth.password")}
                secureTextEntry={!showPassword}
                className="rounded-xl border-2 border-gray-200 pr-12"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                  position: "absolute",
                  right: 14,
                  top: 0,
                  bottom: 0,
                  justifyContent: "center",
                }}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </Pressable>
            </View>

            {/* Forgot password */}
            <View className="items-end">
              <Link href="/(auth)/forgot-password" asChild>
                <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text className="text-sm font-semibold text-primary">
                    {t("auth.forgotPassword")}
                  </Text>
                </Pressable>
              </Link>
            </View>

            {/* Submit */}
            <Button
              onPress={handleSignIn}
              disabled={isLoading}
              loading={isLoading}
              className="w-full rounded-full bg-primary py-3"
            >
              {isLoading ? t("auth.signInProcessing") : t("auth.signIn")}
            </Button>
          </View>

          {/* Legal */}
          <View className="py-8">
            <Text className="text-center text-xs leading-5 text-gray-500">
              {t("auth.loginAgreement")}{" "}
              <Text
                className="font-semibold text-primary"
                onPress={() =>
                  legalLinks?.privacy && WebBrowser.openBrowserAsync(legalLinks.privacy)
                }
              >
                {t("auth.privacyPolicy")}
              </Text>
              {" & "}
              <Text
                className="font-semibold text-primary"
                onPress={() =>
                  legalLinks?.terms && WebBrowser.openBrowserAsync(legalLinks.terms)
                }
              >
                {t("auth.termsOfService")}
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;