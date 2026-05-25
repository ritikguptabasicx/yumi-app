import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const TeacherBudgetCard = ({
  budget,
  currency = "RON",
  isLoading,
}) => {
  const { t } = useTranslation();

  const totalBudget = Number(budget?.approvedBudget || 0);
  const usedAmount = Number(budget?.usedBudget || 0);
  const availableAmount = Number(budget?.availableBudget || 0);

  const usedPercentage =
    totalBudget > 0
      ? Math.min((usedAmount / totalBudget) * 100, 100)
      : 0;

  if (isLoading) {
    return (
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 16,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: "#f1f5f9",
          backgroundColor: "#ffffff",
          padding: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="#019C7F" size="small" />
      </View>
    );
  }

  return (
    <View className="mx-4 mt-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/60">
      <View className="mb-3 flex-row items-center gap-2">
        <Ionicons
          name="wallet-outline"
          size={18}
          color="#64748B"
        />

        <Text className="text-sm font-bold text-slate-500">
          {t("budget.weeklyBudget")}
        </Text>
      </View>

      <Text className="text-3xl font-black text-slate-900">
        {totalBudget.toFixed(2)}{" "}
        <Text className="text-lg font-bold text-slate-400">
          {currency}
        </Text>
      </Text>

      <View className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <View
          className="h-full rounded-full bg-amber-400"
          style={{ width: `${usedPercentage}%` }}
        />
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-xs font-semibold text-slate-500">
          {t("budget.used")}{" "}
          <Text className="text-slate-900">
            {usedAmount.toFixed(2)} {currency}
          </Text>
        </Text>

        <Text className="text-xs font-semibold text-slate-500">
          {t("budget.available")}{" "}
          <Text className="text-primary">
            {availableAmount.toFixed(2)} {currency}
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default TeacherBudgetCard;