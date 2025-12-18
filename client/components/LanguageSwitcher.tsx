import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <>
      {/* Desktop Language Switcher - Fixed Right Side */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3">
        <button 
          onClick={() => changeLanguage('gu')}
          className={cn(
            "border-2 border-amber-700 rounded-l-lg px-3 py-4 font-heading font-semibold text-2xl transition-colors",
            currentLang === 'gu' ? "bg-orange-600 text-white" : "bg-white text-amber-900 hover:bg-amber-50"
          )}
        >
          {t("language.gu")}
        </button>
        <button 
          onClick={() => changeLanguage('en')}
          className={cn(
            "border-2 border-amber-700 rounded-l-lg px-3 py-4 font-['Sansita'] text-2xl transition-colors",
            currentLang === 'en' ? "bg-orange-600 text-white" : "bg-white text-amber-900 hover:bg-amber-50"
          )}
        >
          {t("language.en")}
        </button>
        <button 
          onClick={() => changeLanguage('hi')}
          className={cn(
            "border-2 border-amber-700 rounded-l-lg px-3 py-4 font-heading font-semibold text-2xl transition-colors",
            currentLang === 'hi' ? "bg-orange-600 text-white" : "bg-white text-amber-900 hover:bg-amber-50"
          )}
        >
          {t("language.hi")}
        </button>
      </div>
    </>
  );
}
