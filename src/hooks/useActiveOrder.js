import useSWR from "swr";
import { useUser } from "@/contexts/UserContext";
import toast from "@/lib/toast";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/apiClient";

export const useActiveOrder = () => {
  const { user } = useUser();
  const { t } = useTranslation();

  const childId = user?.selectedChildId || null;

  const fetcher = async () => {
    if (!user?.id || !childId) return null;

    try {
      const res = await api.post(`/api/v1/order/active`, {
        childId,
      });

      const data = res.data;

      if (data?.success) {
        return data.data;
      }
    } catch (err) {
      toast.error(t("errors.somethingWentWrong"));
      return null;
    }
  };

  const { data, error, isLoading, mutate } = useSWR(
    childId ? ["active-order", childId] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};
