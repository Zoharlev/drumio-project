import { useState } from "react";
import { Globe } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "he", label: "עברית" },
];

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => {
    return localStorage.getItem("drumio-language") || "en";
  });

  const selectedLang = LANGUAGES.find((l) => l.code === selected);

  const handleSelect = (code: string) => {
    setSelected(code);
    localStorage.setItem("drumio-language", code);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-foreground hover:bg-secondary transition-colors font-poppins"
      >
        <Globe className="w-4 h-4" />
        <span>{selectedLang?.label}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-secondary rounded-lg shadow-lg py-1 min-w-[140px]">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full text-left px-4 py-2 text-sm font-poppins transition-colors hover:bg-secondary ${
                  selected === lang.code
                    ? "text-drumio-purple font-semibold"
                    : "text-foreground"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
