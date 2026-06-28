"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Language = "uz" | "ru" | "en";

interface LanguageContextProps {
  lang: Language;
  changeLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Sidebar / Header
  home: { uz: "Asosiy", ru: "Главная", en: "Home" },
  teachers: { uz: "O'qituvchilar", ru: "Учителя", en: "Teachers" },
  groups: { uz: "Guruhlar", ru: "Группы", en: "Groups" },
  students: { uz: "Talabalar", ru: "Студенты", en: "Students" },
  gifts: { uz: "Sovg'alar", ru: "Подарки", en: "Gifts" },
  management: { uz: "Boshqarish", ru: "Управление", en: "Management" },
  creator: { uz: "Creator paneli", ru: "Панель Создателя", en: "Creator Panel" },
  search: { uz: "Qidirish...", ru: "Поиск...", en: "Search..." },
  logout: { uz: "Chiqish", ru: "Выйти", en: "Logout" },
  add: { uz: "Qo'shish", ru: "Добавить", en: "Add" },
  rating: { uz: "Reyting", ru: "Рейтинг", en: "Rating" },
  shop: { uz: "Do'kon", ru: "Магазин", en: "Shop" },
  settings: { uz: "Sozlamalar", ru: "Настройки", en: "Settings" },
  notifications: { uz: "Bildirishnomalar", ru: "Уведомления", en: "Notifications" },
  no_notifications: { uz: "Bildirishnomalar topilmadi", ru: "Уведомления не найдены", en: "No notifications found" },
  
  // Rating Page
  rating_title: { uz: "Foydalanuvchilar reytingi", ru: "Рейтинг пользователей", en: "User Rating" },
  rating_subtitle: { uz: "O'quvchilar ballari va reyting jadvali", ru: "Таблица очков и рейтинга студентов", en: "Student points and rating leaderboard" },
  period_weekly: { uz: "Haftalik", ru: "Еженедельно", en: "Weekly" },
  period_monthly: { uz: "Oylik", ru: "Ежемесячно", en: "Monthly" },
  period_3month: { uz: "3 Oylik", ru: "3 Месяца", en: "3 Months" },
  period_all: { uz: "Barchasi", ru: "Все время", en: "All Time" },
  filter_group: { uz: "Guruh bo'yicha", ru: "По группе", en: "By Group" },
  filter_branch: { uz: "Filial bo'yicha", ru: "По филиалу", en: "By Branch" },
  filter_center: { uz: "Markaz bo'yicha", ru: "По центру", en: "By Center" },
  rank: { uz: "O'rin", ru: "Место", en: "Rank" },
  full_name: { uz: "F.I.SH", ru: "Ф.И.О", en: "Full Name" },
  xp: { uz: "XP", ru: "XP", en: "XP" },
  coins: { uz: "Coinlar", ru: "Монеты", en: "Coins" },
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("uz");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Language;
    if (saved && ["uz", "ru", "en"].includes(saved)) {
      setLang(saved);
    }
  }, []);

  const changeLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
