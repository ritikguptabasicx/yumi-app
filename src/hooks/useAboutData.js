import useSWR from "swr";
import { api } from "@/lib/apiClient";

/**
 * Cached SWR hook for fetching About page data.
 * About content rarely changes — cached globally, fetched once per session.
 */
export const useAboutData = () => {
  const { data, error, isLoading } = useSWR(
    "about-page",
    async () => {
      const res = await api.get("/api/v1/about");
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
    aboutData: data || {},
    error,
    isLoading,
  };
};
