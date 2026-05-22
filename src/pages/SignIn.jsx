import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { LanguageSelect } from "@/components/LanguageSelect";
import { api } from "@/lib/apiClient";
import toast from "@/lib/toast";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Reusable Rounded Box Input Field ─────────────────────────────────

const SimpleInput = ({
  label,
  value,
  onChangeText,
  isFocused,
  onFocus,
  onBlur,
  secureTextEntry,
  showToggle,
  onToggle,
  error,
  ...props
}) => (
  <View className="gap-1.5">
    <Text
      className={`ml-1 text-[11px] font-bold uppercase tracking-wider ${
        error ? "text-destructive" : isFocused ? "text-primary" : "text-neutral-400"
      }`}
    >
      {label}
    </Text>
    <View
      className={`h-16 flex-row items-center rounded-2xl border-2 px-4 transition-all duration-200 ${
        error
          ? "border-destructive bg-destructive/5"
          : isFocused
          ? "border-primary bg-white"
          : "border-neutral-200 bg-neutral-50/50"
      }`}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry}
        className="h-full flex-1 text-base font-bold text-neutral-900"
        placeholderTextColor="#A3A3A3"
        {...props}
      />
      {showToggle && (
        <Pressable onPress={onToggle} className="p-1.5" hitSlop={8}>
          {secureTextEntry ? (
            <EyeOff size={18} color={error ? "#EF4444" : "#737373"} />
          ) : (
            <Eye size={18} color={error ? "#EF4444" : "#737373"} />
          )}
        </Pressable>
      )}
    </View>
    {error && (
      <Text className="ml-1 text-xs font-semibold text-destructive">
        {error}
      </Text>
    )}
  </View>
);

// ─── Main Component ──────────────────────────────────────────────────

const SignIn = () => {
  const { setUser } = useUser();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [showPassword, setShowPassword] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState({});

  // Define runtime translation-backed Zod Schema
  const loginSchema = z.object({
    emailAddress: z
      .string()
      .min(1, { message: t("validation.emailRequired") || "Email is required" })
      .email({ message: t("validation.invalidEmail") || "Invalid email layout" }),
    password: z
      .string()
      .min(1, { message: t("validation.passwordRequired") || "Password is required" }),
  });

  const handleSignIn = async () => {
    setErrors({});
    
    // Validate inputs with Zod
    const result = loginSchema.safeParse({ emailAddress, password });

    if (!result.success) {
      const formattedErrors = {};
      result.error.errors.forEach((err) => {
        formattedErrors[err.path[0]] = err.message;
      });
      setErrors(formattedErrors);
      return;
    }

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
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Selector Top Bar */}
        <View className="mt-4 flex-row justify-end px-5">
          <LanguageSelect />
        </View>

        {/* Minimal Typography Header */}
        <View className="mt-8 px-6 pb-4">
          <Logo className="mb-10 h-8 w-24" />

          <Text className="text-3xl font-black tracking-tight text-neutral-900">
            {t("auth.welcomeBack")}
          </Text>
          <Text className="mt-2 text-sm font-medium leading-5 text-neutral-400">
            {t("auth.loginTitle")}
          </Text>
        </View>

        {/* Clean Interactive Input Fields */}
        <View className="mt-8 gap-5 px-6">
          <SimpleInput
            label={t("auth.email")}
            placeholder={t("auth.email")}
            value={emailAddress}
            onChangeText={(val) => {
              setEmailAddress(val);
              if (errors.emailAddress) setErrors((prev) => ({ ...prev, emailAddress: null }));
            }}
            isFocused={isEmailFocused}
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.emailAddress}
          />

          <View>
            <SimpleInput
              label={t("auth.password")}
              placeholder={t("auth.password")}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              isFocused={isPasswordFocused}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              secureTextEntry={!showPassword}
              showToggle
              onToggle={() => setShowPassword(!showPassword)}
              error={errors.password}
            />

            {/* Absolute Fallback Route for Forgot Password */}
            <View className="mt-3 items-end">
              <Pressable
                onPress={() => router.push("/forgot-password")}
                hitSlop={10}
              >
                <Text className="text-sm font-bold text-primary">
                  {t("auth.forgotPassword")}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Core Action CTA Button */}
          <Button
            onPress={handleSignIn}
            disabled={isLoading}
            loading={isLoading}
            className="mt-4 h-16 w-full items-center justify-center rounded-2xl bg-primary active:opacity-90"
          >
            <Text className="text-base font-black text-white">
              {isLoading ? t("auth.signInProcessing") : t("auth.signIn")}
            </Text>
          </Button>
        </View>

        {/* Native Linking Footer for Webview Web Safeties */}
        <View className="mt-auto items-center px-8 pt-16">
          <Text className="text-center text-[11px] font-medium leading-4 text-neutral-400">
            {t("auth.byContinuing")}{" "}
            <Text
              className="font-bold text-neutral-600 underline"
              onPress={() =>
                Linking.openURL(
                  "https://yumi.ro/politica-de-confidentialitate/"
                )
              }
            >
              {t("auth.privacyPolicy")}
            </Text>{" "}
            &{" "}
            <Text
              className="font-bold text-neutral-600 underline"
              onPress={() =>
                Linking.openURL("https://yumi.ro/termeni-si-conditii/")
              }
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