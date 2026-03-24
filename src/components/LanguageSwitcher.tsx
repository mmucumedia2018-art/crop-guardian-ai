import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage, Language, LANGUAGE_LABELS } from "@/contexts/LanguageContext";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "am", label: "አማርኛ", flag: "🇪🇹" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border text-xs font-medium hover:bg-accent transition-colors"
      >
        <Globe className="w-3.5 h-3.5" />
        {LANGUAGES.find((l) => l.code === language)?.flag}{" "}
        {LANGUAGE_LABELS[language]}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              className="absolute top-full mt-1 right-0 z-50 bg-card border rounded-xl shadow-lg p-1 min-w-[160px]"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors ${
                    language === lang.code ? "font-semibold text-primary" : ""
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="flex-1 text-left">{lang.label}</span>
                  {language === lang.code && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
