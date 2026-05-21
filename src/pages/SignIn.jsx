import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform, TextInput } from "react-native";
import AppImage from "@/components/AppImage";
import { useRouter, Link } from "expo-router";
import { Eye, EyeOff, Mail, Lock } from "lucide-react-native";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
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
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
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
      className="flex-1 bg-[#FFFDF9]"
    >
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Background Ambient Glow Elements */}
        <View 
          className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden" 
          pointerEvents="none" 
          style={{ position: "absolute", zIndex: 0 }}
        >
          {/* Top-Left Ambient Circle */}
          <View 
            className="w-72 h-72 rounded-full bg-primary absolute -top-16 -left-16" 
            style={{ opacity: 0.08 }}
          />
          {/* Bottom-Right Ambient Circle */}
          <View 
            className="w-80 h-80 rounded-full bg-secondary absolute -bottom-20 -right-20" 
            style={{ opacity: 0.1 }}
          />
        </View>

        {/* Dedicated Language Selector Row */}
        <View className="w-full flex-row justify-end px-6 pt-12 pb-2" style={{ zIndex: 10 }}>
          <LanguageSelect />
        </View>

        {/* Main Content Container */}
        <View className="flex-1 px-6 pb-8 justify-between" style={{ zIndex: 1 }}>
          {/* Header section (Branding & Welcome) */}
          <View className="items-center mt-2">
            <Logo className="h-12 w-32 mb-6" />
            
            {/* Elegant Illustration wrapper */}
            <View className="items-center justify-center my-4 relative">
              <View 
                className="w-36 h-36 rounded-full bg-secondary absolute" 
                style={{ opacity: 0.15 }}
              />
              <AppImage source={images.illustration2} width={130} height={130} contentFit="contain" />
            </View>

            <View className="items-center mt-3 mb-6">
              {/* Premium Welcome Badge */}
              <View className="bg-accent px-3 py-1 rounded-full mb-3 flex-row items-center">
                <Text className="text-xs font-extrabold text-accent-foreground tracking-wider uppercase">
                  YUMI CATERING
                </Text>
              </View>
              <Text className="text-3xl font-extrabold text-neutral-darkest tracking-tight text-center">
                {t("auth.welcomeBack")} 👋
              </Text>
              <Text className="text-sm font-semibold text-neutral-dark mt-2 text-center px-4">
                {t("auth.loginTitle")}
              </Text>
            </View>
          </View>

          {/* Form and Action Area wrapped in a floating card */}
          <View className="flex-1 justify-center max-w-md w-full mx-auto">
            <View className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 gap-5">
              
              {/* Email Input Container */}
              <View className="gap-2">
                <Text className="text-xs font-bold text-neutral-darkest/70 ml-1">
                  {t("auth.email")}
                </Text>
                <View className={`flex-row items-center h-14 w-full rounded-2xl border-2 px-4 bg-slate-50 ${
                  isEmailFocused ? "border-primary bg-white" : "border-slate-100"
                }`}>
                  <Mail size={18} color={isEmailFocused ? "#019C7F" : "#9CA3AF"} />
                  {/* Subtle vertical separator */}
                  <View className="w-[1px] h-6 bg-slate-200 mx-3" />
                  <TextInput
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    placeholder={t("auth.email")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex-1 h-full text-base text-neutral-darkest font-medium"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Password Input Container */}
              <View className="gap-2">
                <Text className="text-xs font-bold text-neutral-darkest/70 ml-1">
                  {t("auth.password")}
                </Text>
                <View className={`flex-row items-center h-14 w-full rounded-2xl border-2 px-4 bg-slate-50 ${
                  isPasswordFocused ? "border-primary bg-white" : "border-slate-100"
                }`}>
                  <Lock size={18} color={isPasswordFocused ? "#019C7F" : "#9CA3AF"} />
                  {/* Subtle vertical separator */}
                  <View className="w-[1px] h-6 bg-slate-200 mx-3" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    placeholder={t("auth.password")}
                    secureTextEntry={!showPassword}
                    className="flex-1 h-full pr-10 text-base text-neutral-darkest font-medium"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    className="absolute right-4"
                  >
                    {showPassword ? (
                      <EyeOff size={18} color="#9CA3AF" />
                    ) : (
                      <Eye size={18} color="#9CA3AF" />
                    )}
                  </Pressable>
                </View>

                {/* Forgot password */}
                <View className="items-end mt-1">
                  <Link href="/(auth)/forgot-password" asChild>
                    <Pressable hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Text className="text-sm font-bold text-primary">
                        {t("auth.forgotPassword")}
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              </View>

              {/* Submit Button */}
              <Button
                onPress={handleSignIn}
                disabled={isLoading}
                loading={isLoading}
                className="w-full h-14 rounded-2xl bg-primary flex-row items-center justify-center shadow-md mt-2"
              >
                {isLoading ? t("auth.signInProcessing") : t("auth.signIn")}
              </Button>
            </View>

            {/* Legal Links Footer */}
            <View className="mt-8 mb-4 px-4">
              <Text className="text-center text-xs leading-5 text-neutral-dark/80 font-semibold">
                {t("auth.loginAgreement")}{" "}
                <Text
                  className="font-extrabold text-primary underline"
                  onPress={() =>
                    legalLinks?.privacy && WebBrowser.openBrowserAsync(legalLinks.privacy)
                  }
                >
                  {t("auth.privacyPolicy")}
                </Text>
                {" & "}
                <Text
                  className="font-extrabold text-primary underline"
                  onPress={() =>
                    legalLinks?.terms && WebBrowser.openBrowserAsync(legalLinks.terms)
                  }
                >
                  {t("auth.termsOfService")}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;