import useSWR from "swr";
import { api } from "@/lib/apiClient";

/**
 * Cached SWR hook for fetching institutions (schools).
 * Schools rarely change — cached globally, fetched once per session.
 */
export const useInstitutions = () => {
  const { data, error, isLoading } = useSWR(
    "institutions",
    async () => {
      const res = await api.get("/api/v1/institutions");
      const data = res.data;
      if (data.success) return data.data;
      throw new Error("Failed to fetch institutions");
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );

  return {
    schools: data || [],
    error,
    isLoading,
  };
};
