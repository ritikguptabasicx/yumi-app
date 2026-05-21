import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppImage from "@/components/AppImage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ScreenHeader from "@/components/ScreenHeader";
import { useTranslation } from "react-i18next";
import Loader from "@/components/Loader";
import { useFAQData } from "@/hooks/useFAQData";
import { images } from "@/lib/assets";
import { stripHtml } from "@/lib/utils";

const FAQ = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState(null);
  const { categorizedFaqs, isLoading } = useFAQData();

  const categories = Object.keys(categorizedFaqs);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader title={t("navigation.faq")} />

      {isLoading ? (
        <Loader />
      ) : categories.length > 0 ? (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <AppImage source={images.faqBg} height={240} className="w-full" contentFit="cover" />

          <View className="gap-6 p-6">
            <View className="items-center gap-2">
              <Text className="text-3xl font-extrabold text-gray-900">{t("faq.title")}</Text>
              <Text className="max-w-sm text-center leading-relaxed text-gray-600">
                {t("faq.description")}
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 ${
                    activeCategory === category
                      ? "bg-primary"
                      : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={
                      activeCategory === category
                        ? "font-semibold text-white"
                        : "text-gray-700"
                    }
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </View>

            {categories.map((category) => (
              <View
                key={category}
                className={activeCategory === category ? "flex" : "hidden"}
              >
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  defaultValue={`${category}-item-0`}
                >
                  {categorizedFaqs[category].map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category}-item-${index}`}
                      className="mb-4 overflow-hidden rounded-lg border border-gray-200 shadow-sm"
                    >
                      <AccordionTrigger className="px-6 py-4">
                        <Text className="flex-1 text-left font-semibold text-gray-900">
                          {faq.question}
                        </Text>
                      </AccordionTrigger>
                      <AccordionContent className="bg-white px-6 py-4">
                        <Text className="leading-relaxed text-gray-700">
                          {stripHtml(faq.answer)}
                        </Text>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-4 py-20">
          <AppImage source={images.illustration3} width={160} height={160} contentFit="contain" />
          <Text className="mb-2 mt-4 text-xl font-bold text-gray-900">{t("faq.noFaqsFound")}</Text>
          <Text className="max-w-md text-center text-sm leading-relaxed text-gray-600">
            {t("faq.noFaqsMessage")}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default FAQ;
