import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.tapNiVidhi"), path: "/tapp-ni-vidhi" },
    { label: t("nav.bookingForm"), path: "/booking" },
    { label: t("nav.anumodana"), path: "/anumodana" },
    { label: t("nav.vidhinav"), path: "/vidhinav" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const currentLang = i18n.language;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-transparent py-6 px-4 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-end items-center">
          <div className="flex items-center gap-10 font-body text-2xl">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-black hover:text-gray-700 transition-colors relative pb-3",
                  isActive(item.path) ? "font-medium" : "font-normal"
                )}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-black rounded-full"></span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Header */}
      <nav className="lg:hidden bg-stone-100 py-4 px-4 relative z-50">
        <div className="flex justify-end items-center">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 text-gray-800"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100]">
          <div 
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsMenuOpen(false)}
          />
          
          <div className="absolute top-0 right-0 w-full max-w-md h-full bg-white overflow-y-auto">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-800"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-8 py-8 font-body text-2xl">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "text-black hover:text-gray-700 transition-colors relative",
                    isActive(item.path) ? "font-semibold" : "font-normal"
                  )}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black"></span>
                  )}
                </Link>
              ))}
            </div>

            <div className="mx-7 border-t border-black my-6"></div>

            {/* Language Switcher */}
            <div className="flex justify-center items-center gap-3 pb-8">
              <button 
                onClick={() => changeLanguage('gu')}
                className={cn(
                  "w-20 h-14 border-2 border-black rounded-lg font-['Abhaya_Libre'] font-semibold text-2xl transition-colors",
                  currentLang === 'gu' ? "bg-stone-800 text-stone-100" : "bg-white text-black hover:bg-gray-50"
                )}
              >
                {t("language.gu")}
              </button>
              <button 
                onClick={() => changeLanguage('en')}
                className={cn(
                  "w-20 h-14 border-2 border-black rounded-lg font-['Sansita'] text-2xl transition-colors",
                  currentLang === 'en' ? "bg-stone-800 text-stone-100" : "bg-white text-black hover:bg-gray-50"
                )}
              >
                {t("language.en")}
              </button>
              <button 
                onClick={() => changeLanguage('hi')}
                className={cn(
                  "w-20 h-14 border-2 border-black rounded-lg font-['Abhaya_Libre'] font-semibold text-2xl transition-colors",
                  currentLang === 'hi' ? "bg-stone-800 text-stone-100" : "bg-white text-black hover:bg-gray-50"
                )}
              >
                {t("language.hi")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
