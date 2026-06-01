import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { isRtl } from "./languages";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Default to Arabic when no user/browser choice is detected
    fallbackLng: "en",
    supportedLngs: ["en", "ar"],
    resources: {
      en: { common: en },
      ar: { common: ar },
    },
    ns: ["common"],
    defaultNS: "common",
    detection: {
      // Prefer explicit URL and stored choice, then fall back to `fallbackLng`
      order: ["querystring", "localStorage", "htmlTag", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

// Sync <html dir/lang> with chosen language
const applyDir = (lng: string) => {
  const dir = isRtl(lng) ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
};
// Ensure Arabic and RTL by default on first load (until detection resolves)
applyDir(i18n.resolvedLanguage || "en");
i18n.on("languageChanged", applyDir);

// Ensure i18n is fully initialized before export
export default i18n;

// Export a function to check if i18n is ready
export const isI18nReady = (): boolean => {
  return i18n.isInitialized;
};
