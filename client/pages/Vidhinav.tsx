import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";

export default function Vidhinav() {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <section className="max-w-4xl mx-auto px-4 lg:px-8 py-12 lg:py-20 relative z-10">
        <h1 className="text-center font-heading font-semibold text-3xl sm:text-4xl lg:text-6xl text-black mb-8 lg:mb-12">
          {t("vidhinav.title")}
        </h1>
        
        <div className="space-y-6 lg:space-y-8 font-body text-lg lg:text-2xl text-black leading-relaxed lg:leading-9 text-center">
          <p className="font-semibold">{t("vidhinav.line1")}</p>
          <p>{t("vidhinav.line2")}</p>
          <p>{t("vidhinav.line3")}</p>
          <p>{t("vidhinav.line4")}</p>
          <p>{t("vidhinav.line5")}</p>
          <p>
            {t("vidhinav.line6")} <span className="font-bold">{t("vidhinav.line6Bold")}</span>
          </p>
          <p>{t("vidhinav.line7")}</p>
          
          <div className="pt-4 lg:pt-6">
            <p className="font-semibold mb-4">{t("vidhinav.duhaTitle")}</p>
            <div className="space-y-2 italic">
              <p>{t("vidhinav.duhaLine1")}</p>
              <p>{t("vidhinav.duhaLine2")}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-12 lg:mt-16">
          <Link to="/anumodana">
            <Button 
              variant="outline"
              className="bg-white hover:bg-gray-50 text-black border-2 border-black rounded-2xl px-6 lg:px-8 py-5 lg:py-7 text-lg lg:text-[22px] font-heading font-semibold flex items-center gap-2 w-[180px] justify-center"
            >
              <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6" />
              {t("buttons.back")}
            </Button>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
