import useSWR from "swr";
import { api } from "@/lib/apiClient";

export const useAllergens = () => {
  const { data, error, isLoading } = useSWR(
    "allergens",
    async () => {
      const res = await api.get("/api/v1/allergens");
      const data = res.data;
      if (data.success) return data.data.map((a) => ({ id: a.id, name: a.name }));
      throw new Error("Failed to fetch allergens");
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );

  return {
    allergyOptions: data || [],
    error,
    isLoading,
  };
};
