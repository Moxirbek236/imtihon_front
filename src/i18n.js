import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/translation.json";
import ru from "./locales/ru/translation.json";
import uz from "./locales/uz/translation.json";

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  uz: { translation: uz },
};

i18n.use(initReactI18next).init({
  resources,
  lng:
    (typeof window !== "undefined" &&
      window.localStorage.getItem("i18nextLng")) ||
    "uz",
  fallbackLng: "uz",
  interpolation: { escapeValue: false },
});

export default i18n;
