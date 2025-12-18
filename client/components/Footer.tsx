import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-orange-50 py-8 lg:py-12 mt-12 lg:mt-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 flex justify-center items-center gap-4 lg:gap-8">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/7db75a60b7ce3191c11bafa8eb33aa60be77c5fd"
          alt="Decorative icon"
          className="w-10 h-10 lg:w-[60px] lg:h-[60px]"
        />
        <p className="text-amber-800 font-heading font-semibold text-xl lg:text-2xl">
          {t("footer.greeting")}
        </p>
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/7db75a60b7ce3191c11bafa8eb33aa60be77c5fd"
          alt="Decorative icon"
          className="w-10 h-10 lg:w-[60px] lg:h-[60px]"
        />
      </div>
    </footer>
  );
}
