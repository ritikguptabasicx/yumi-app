import useSWR from "swr";
import { api } from "@/lib/apiClient";

/**
 * Cached SWR hook for fetching legal links (privacy policy, terms).
 * Legal links rarely change — cached globally, fetched once per session.
 */
export const useLegalLinks = () => {
  const { data, error, isLoading } = useSWR(
    "legal-links",
    async () => {
      const res = await api.get("/api/v1/legal/links");
      const data = res.data;
      if (data.success && data.data) {
        return {
          privacy: data.data.privacy || "#",
          terms: data.data.terms || "#",
        };
      }
      return { privacy: "#", terms: "#" };
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );

  return {
    legalLinks: data || { privacy: "#", terms: "#" },
    error,
    isLoading,
  };
};
