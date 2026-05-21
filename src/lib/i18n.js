import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "../../assets/locales/en.json";
import ro from "../../assets/locales/ro.json";

const LANGUAGE_KEY = "i18nextLng";

const getDeviceLanguage = () => {
  const locale = Localization.getLocales()[0]?.languageCode ?? "ro";
  return locale === "en" ? "en" : "ro";
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ro: { translation: ro },
  },
  lng: getDeviceLanguage(),
  fallbackLng: "ro",
  supportedLngs: ["en", "ro"],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  pluralSeparator: "_",
  contextSeparator: "_",
});

export async function initLanguage() {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored) {
      await i18n.changeLanguage(stored);
    }
  } catch {
    // use device default
  }
}

i18n.on("languageChanged", (lng) => {
  AsyncStorage.setItem(LANGUAGE_KEY, lng).catch(() => {});
});

export default i18n;
