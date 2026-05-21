import useSWR from "swr";
import { api } from "@/lib/apiClient";

/**
 * Cached SWR hook for fetching Support page data.
 * Support info rarely changes — cached globally, fetched once per session.
 */
export const useSupportData = () => {
  const { data, error, isLoading } = useSWR(
    "support-page",
    async () => {
      const res = await api.get("/api/v1/t/about");
      const data = res.data;
      return data?.data?.[0] || {};
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );

  return {
    supportData: data || {},
    error,
    isLoading,
  };
};
