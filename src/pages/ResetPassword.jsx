import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "@/components/Logo";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Lock,
  CheckCircle,
  ArrowLeft,
  EyeOff,
  Eye,
  Check,
  X,
  XCircle,
} from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import toast from "@/lib/toast";
import { api } from "@/lib/apiClient";

const ValidationItem = ({ isValid, text, show = true }) => {
  if (!show) return null;
  return (
    <View className={`flex-row items-center gap-2 ${isValid ? "text-primary" : "text-secondary"}`}>
      {isValid ? <Check size={16} color="#019C7F" /> : <X size={16} color="#F37C21" />}
      <Text className={`text-sm ${isValid ? "text-primary" : "text-secondary"}`}>{text}</Text>
    </View>
  );
};

const ResetPassword = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { token } = useLocalSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [checkingToken, setCheckingToken] = useState(true);

  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  const validations = {
    minLength: (pwd) => pwd.length >= 8,
    hasUpperCase: (pwd) => /[A-Z]/.test(pwd),
    hasNumber: (pwd) => /[0-9]/.test(pwd),
    hasSpecialChar: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  };

  const passwordsMatch = password === confirmPassword && password !== "";
  const allValidationsPassed = Object.values(validations).every((fn) => fn(password));

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setCheckingToken(false);
        return;
      }

      try {
        const response = await api.post(`/api/v1/verify-reset-token`, { token });
        const data = response.data;
        setTokenValid(data.status === 1);
      } catch {
        setTokenValid(false);
      } finally {
        setCheckingToken(false);
      }
    };

    verifyToken();
  }, [token]);

  const validatePassword = (pwd) =>
    Object.values(validations).every((fn) => fn(pwd));

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (!touched.password) {
      setTouched((prev) => ({ ...prev, password: true }));
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (!touched.confirmPassword) {
      setTouched((prev) => ({ ...prev, confirmPassword: true }));
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      toast.error(t("auth.invalidToken"));
      return;
    }

    if (!validatePassword(password)) {
      toast.error(t("auth.passwordRequirements"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("auth.passwordMismatch"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/api/v1/reset-password", {
        newPassword: password,
      });

      const data = response.data;

      if (data.status === 1) {
        setIsSuccess(true);
        toast.success(t("auth.passwordResetSuccess"));
      } else {
        toast.error(t("auth.passwordResetFailed"));
      }
    } catch {
      toast.error(t("status.requestError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 items-center bg-gray-50 px-4" edges={["top"]}>
      <View className="mb-4 w-52">
        <Logo />
      </View>

      <ScrollView className="w-full max-w-md" keyboardShouldPersistTaps="handled">
        <View className="gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {checkingToken ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#019C7F" />
            </View>
          ) : tokenValid ? (
            !isSuccess ? (
              <>
                <View className="gap-2">
                  <Text className="text-2xl font-bold text-gray-900">{t("auth.resetPassword")}</Text>
                  <Text className="text-gray-600">{t("auth.resetPasswordDescription")}</Text>
                </View>

                <View className="gap-6">
                  <View className="gap-2">
                    <Label>{t("auth.newPassword")}</Label>
                    <View className="relative">
                      <Input
                        value={password}
                        onChangeText={handlePasswordChange}
                        placeholder={t("auth.enterNewPassword")}
                        secureTextEntry={!showPassword}
                        className={cn(
                          "h-11 border pl-10 pr-10",
                          touched.password &&
                            (allValidationsPassed
                              ? "border-green-300 bg-green-muted"
                              : "border-red-300 bg-red-muted")
                        )}
                      />
                      <View className="absolute left-3 top-3">
                        <Lock size={20} color="#9CA3AF" />
                      </View>
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3"
                      >
                        {showPassword ? (
                          <EyeOff size={20} color="#9CA3AF" />
                        ) : (
                          <Eye size={20} color="#9CA3AF" />
                        )}
                      </Pressable>
                    </View>

                    {touched.password && (
                      <View className="gap-3 rounded-xl border bg-gray-50 p-4">
                        <ValidationItem
                          isValid={validations.minLength(password)}
                          text={t("auth.minLength")}
                        />
                        <ValidationItem
                          isValid={validations.hasUpperCase(password)}
                          text={t("auth.hasUpperCase")}
                        />
                        <ValidationItem
                          isValid={validations.hasNumber(password)}
                          text={t("auth.hasNumber")}
                        />
                        <ValidationItem
                          isValid={validations.hasSpecialChar(password)}
                          text={t("auth.hasSpecialChar")}
                        />
                      </View>
                    )}
                  </View>

                  <View className="gap-2">
                    <Label>{t("auth.confirmPassword")}</Label>
                    <View className="relative">
                      <Input
                        value={confirmPassword}
                        onChangeText={handleConfirmPasswordChange}
                        placeholder={t("auth.confirmNewPassword")}
                        secureTextEntry
                        className={cn(
                          "h-11 border pl-10",
                          touched.confirmPassword &&
                            (passwordsMatch
                              ? "border-green-300 bg-green-muted"
                              : "border-red-300 bg-red-muted")
                        )}
                      />
                      <View className="absolute left-3 top-3">
                        <Lock size={20} color="#9CA3AF" />
                      </View>
                    </View>

                    {touched.confirmPassword && confirmPassword && (
                      <ValidationItem
                        isValid={passwordsMatch}
                        text={t("auth.passwordMismatch") || "Passwords match"}
                      />
                    )}
                  </View>

                  <Button
                    onPress={handleSubmit}
                    disabled={isLoading || !password || !confirmPassword}
                    loading={isLoading}
                    className="h-11 w-full bg-primary"
                  >
                    {isLoading ? t("auth.saving") : t("auth.reset")}
                  </Button>
                </View>
              </>
            ) : (
              <View className="items-center gap-4">
                <CheckCircle size={48} color="#019C7F" />
                <Text className="text-2xl font-bold text-gray-900">
                  {t("auth.passwordResetSuccess")}
                </Text>
                <Text className="text-center text-gray-600">
                  {t("auth.passwordResetSuccessDescription")}
                </Text>
                <Button
                  onPress={() => router.replace("/(auth)/signin")}
                  className="mt-6 h-11 w-full bg-primary"
                >
                  <View className="flex-row items-center gap-2">
                    <ArrowLeft size={16} color="#fff" />
                    <Text className="text-white">{t("auth.backToSignIn")}</Text>
                  </View>
                </Button>
              </View>
            )
          ) : (
            <View className="items-center gap-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-6">
              <XCircle size={48} color="#F37C21" />
              <View className="items-center gap-2">
                <Text className="text-2xl font-bold text-secondary">
                  {t("auth.resetLinkExpired")}
                </Text>
                <Text className="text-center text-base text-gray-700">
                  {t("auth.resetLinkExpiredDescription")}
                </Text>
              </View>
              <Button
                onPress={() => router.replace("/(auth)/forgot-password")}
                className="h-11 w-full bg-secondary"
              >
                <View className="flex-row items-center gap-2">
                  <ArrowLeft size={16} color="#fff" />
                  <Text className="text-white">{t("auth.requestNewLink")}</Text>
                </View>
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResetPassword;
