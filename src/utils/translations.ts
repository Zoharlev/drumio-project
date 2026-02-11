type TranslationKeys =
  | "explore"
  | "search_placeholder"
  | "loading"
  | "no_results"
  | "go"
  | "logout"
  | "no_description"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "professional";

const translations: Record<string, Record<TranslationKeys, string>> = {
  en: {
    explore: "Explore",
    search_placeholder: "Search lessons by name, level, or tags...",
    loading: "Loading songs...",
    no_results: "No songs found for this category.",
    go: "GO!",
    logout: "Logout",
    no_description: "No description available",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    professional: "Professional",
  },
  he: {
    explore: "גלה",
    search_placeholder: "חפש שיעורים לפי שם, רמה או תגיות...",
    loading: "טוען שירים...",
    no_results: "לא נמצאו שירים בקטגוריה זו.",
    go: "!קדימה",
    logout: "התנתק",
    no_description: "אין תיאור זמין",
    beginner: "מתחיל",
    intermediate: "בינוני",
    advanced: "מתקדם",
    professional: "מקצועי",
  },
};

export function getLanguage(): string {
  return localStorage.getItem("drumio-language") || "en";
}

export function t(key: TranslationKeys): string {
  const lang = getLanguage();
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}

export function isRTL(): boolean {
  return getLanguage() === "he";
}
