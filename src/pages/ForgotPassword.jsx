import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import toast from "@/lib/toast";
import ScreenHeader from "@/components/ScreenHeader";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/apiClient";

const ForgotPassword = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const response = await api.post("/api/v1/forgot-password", {
        emailAddress: email,
      });

      const data = response.data;

      if (data.status === 1) {
        setIsSuccess(true);
        toast.success(
          t("auth.passwordResetEmailSent") || "Email has been sent successfully!"
        );
        setEmail("");
      } else {
        toast.error(t("auth.passwordResetEmailFailed") || "Failed to send email");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        t("status.requestError") || "An error occurred while processing your request"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScreenHeader title={t("actions.back")} />
      <ScrollView className="flex-1 px-4 pb-8 pt-8" keyboardShouldPersistTaps="handled">
        <View className="mx-auto w-full max-w-md">
          <View className="gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {!isSuccess ? (
              <>
                <View className="gap-2">
                  <Text className="text-2xl font-bold text-gray-900">
                    {t("auth.forgotPassword") || "Forgot Password?"}
                  </Text>
                  <Text className="text-gray-600">
                    {t("auth.forgotPasswordDescription") ||
                      "Please enter your email address to reset the password"}
                  </Text>
                </View>

                <View className="gap-6">
                  <View className="gap-2">
                    <Label className="text-sm font-medium text-gray-700">
                      {t("auth.email") || "Email Address"}
                    </Label>
                    <View className="relative">
                      <Input
                        value={email}
                        onChangeText={setEmail}
                        placeholder={t("auth.enterEmail") || "name@example.com"}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="h-11 pl-10"
                      />
                      <View className="absolute left-3 top-3">
                        <Mail size={20} color="#9CA3AF" />
                      </View>
                    </View>
                  </View>

                  <Button
                    onPress={handleSubmit}
                    disabled={isLoading || !email}
                    loading={isLoading}
                    className={cn(
                      "h-11 w-full bg-primary",
                      (isLoading || !email) && "opacity-50"
                    )}
                  >
                    {isLoading ? t("auth.sending") || "Sending..." : t("auth.reset") || "Reset"}
                  </Button>
                </View>
              </>
            ) : (
              <View className="items-center gap-4">
                <CheckCircle size={48} color="#22C55E" />
                <Text className="text-2xl font-bold text-gray-900">
                  {t("auth.emailSent") || "Email Sent"}
                </Text>
                <Text className="text-center text-gray-600">
                  {t("auth.checkEmailDescription") ||
                    "Please check your email for further instructions."}
                </Text>

                <Button
                  onPress={() => router.replace("/(auth)/signin")}
                  className="mt-6 h-11 w-full bg-primary"
                >
                  <View className="flex-row items-center gap-2">
                    <ArrowLeft size={16} color="#fff" />
                    <Text className="font-medium text-white">
                      {t("auth.backToSignIn") || "Back to Sign In"}
                    </Text>
                  </View>
                </Button>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
