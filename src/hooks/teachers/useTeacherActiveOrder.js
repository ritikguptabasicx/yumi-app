import useSWR from "swr";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/apiClient";
import { useUser } from "@/contexts/UserContext";
import toast from "@/lib/toast";

const fetchTeacherActiveOrder = async ([, userId]) => {
  const response = await api.post("/api/v1/t/get-active-order", { userId });
  const data = response.data;

  if (!data?.success) {
    throw new Error("Failed to fetch active teacher orders");
  }

  return data.data || [];
};

export const useTeacherActiveOrder = () => {
  const { user } = useUser();
  const { t } = useTranslation();

  return useSWR(
    user?.id ? ["teacher-active-order", user.id] : null,
    fetchTeacherActiveOrder,
    {
      revalidateOnFocus: false,
      onError: () => toast.error(t("errors.somethingWentWrong")),
    }
  );
};
