import useSWR from "swr";
import { api } from "@/lib/apiClient";

/**
 * Cached SWR hook for fetching FAQ data.
 * FAQs rarely change — cached globally, fetched once per session.
 */
export const useFAQData = () => {
  const { data, error, isLoading } = useSWR(
    "faq-data",
    async () => {
      const res = await api.get("/api/v1/faq");
      const data = res.data;

      if (data?.data) {
        const faqsByCategory = {};
        Object.keys(data.data).forEach((category) => {
          faqsByCategory[category] = data.data[category].map((faq) => ({
            question: faq.question,
            answer: faq.answer,
            category: faq.category || category,
          }));
        });
        return faqsByCategory;
      }

      return {};
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );

  return {
    categorizedFaqs: data || {},
    error,
    isLoading,
  };
};
