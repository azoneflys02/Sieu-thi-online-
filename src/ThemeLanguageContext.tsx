import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations } from "./translations";

type Theme = "light" | "dark";

interface ThemeLanguageContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations["vi"] | string, replacements?: Record<string, string | number>) => string;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export function ThemeLanguageProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("vinamart-theme");
    return (saved === "dark" || saved === "light") ? saved : "light";
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("vinamart-lang");
    return (saved === "en" || saved === "vi") ? saved : "vi";
  });

  // Apply theme class to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("vinamart-theme", theme);
  }, [theme]);

  // Save language to localStorage
  useEffect(() => {
    localStorage.setItem("vinamart-lang", language);
  }, [language]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translation helper function
  const t = (key: string, replacements?: Record<string, string | number>): string => {
    // Falls back to key if translation is missing, and works off both languages
    const langDict = translations[language] as Record<string, string>;
    const fallbackDict = translations["vi"] as Record<string, string>;
    
    let text = langDict[key] || fallbackDict[key] || key;

    if (replacements) {
      Object.keys(replacements).forEach(rKey => {
        text = text.replace(`{${rKey}}`, String(replacements[rKey]));
      });
    }

    return text;
  };

  return (
    <ThemeLanguageContext.Provider value={{ theme, language, toggleTheme, setLanguage, t }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export function useThemeLanguage() {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error("useThemeLanguage must be used within a ThemeLanguageProvider");
  }
  return context;
}
