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
  | "professional"
  | "professionals"
  | "continue"
  | "preview"
  | "song_not_found"
  | "sessions"
  | "no_sessions"
  | "loading_generic";

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
    professionals: "Professional",
    continue: "Continue!",
    preview: "Preview",
    song_not_found: "Song not found.",
    sessions: "Sessions",
    no_sessions: "No practice sessions available for this song.",
    loading_generic: "Loading...",
  },
  he: {
    explore: "עיון",
    search_placeholder: "חפש שיעורים לפי שם, רמה או תגיות...",
    loading: "טוען שירים...",
    no_results: "לא נמצאו שירים בקטגוריה זו.",
    go: "!התחל",
    logout: "התנתק",
    no_description: "אין תיאור זמין",
    beginner: "מתחיל",
    intermediate: "בינוני",
    advanced: "מתקדם",
    professional: "מקצועי",
    professionals: "מתקדם",
    continue: "!המשך",
    preview: "תצוגה מקדימה",
    song_not_found: "השיר לא נמצא.",
    sessions: "תרגולים",
    no_sessions: "אין תרגולים זמינים לשיר זה.",
    loading_generic: "...טוען",
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
