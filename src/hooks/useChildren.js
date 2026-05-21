import useSWR from "swr";
import { api } from "@/lib/apiClient";
import { useUser } from "@/contexts/UserContext";

const fetcher = () => api.get("/api/v1/child").then(res => res.data.data || []);

export function useChildren() {
  const { user } = useUser();

  const { data, isLoading, mutate } = useSWR(
    user?.id ? "/api/v1/child" : null,
    fetcher,
    {
      revalidateOnFocus: false,     
      revalidateOnReconnect: false,  
      revalidateIfStale: false,     
    }
  );

  return {
    children: data || [],
    isChildrenLoading: isLoading,
    mutateChildren: mutate,
  };
}