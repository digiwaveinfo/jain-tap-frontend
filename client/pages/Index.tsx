import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";

export default function Index() {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <section className="max-w-5xl mx-auto px-4 lg:px-8 py-12 lg:py-20 relative z-10">
        <h1 className="text-center font-heading font-semibold text-4xl lg:text-6xl text-black mb-6 lg:mb-8">
          {t("home.title")}
        </h1>
        
        <p className="text-center font-body font-bold text-xl lg:text-2xl text-black mb-6 lg:mb-8">
          {t("home.subtitle")}
        </p>

        <div className="space-y-6 font-body text-lg lg:text-2xl text-black leading-relaxed">
          <p>{t("home.intro")}</p>

          <div className="space-y-4 lg:space-y-6 leading-[1.5]">
            <p>
              {t("home.content1")} <span className="font-bold">{t("home.content1Bold")}</span> {t("home.content1End")}
            </p>
            <p>{t("home.content2")}</p>
            <p>
              {t("home.content3")} <span className="font-bold">{t("home.content3Bold")}</span> {t("home.content3End")}
            </p>
            <p>{t("home.content4")}</p>
            <p className="font-bold">{t("home.content5")}</p>
            <p>
              {t("home.content6")} <span className="font-bold">{t("home.content6Bold")}</span> {t("home.content6End")}
            </p>
            <p>
              {t("home.content7")} <span className="font-bold">{t("home.content7Bold")}</span>
            </p>
            <p>
              {t("home.content8")} <span className="font-bold">{t("home.content8Bold")}</span> {t("home.content8End")}
            </p>
            <p className="font-bold">{t("home.content9")}</p>
            <p>{t("home.content10")}</p>
          </div>
        </div>

        <div className="flex justify-center mt-12 lg:mt-16">
          <Link to="/tapp-ni-vidhi">
            <Button 
              className="bg-black hover:bg-gray-800 text-white rounded-2xl px-6 lg:px-8 py-5 lg:py-7 text-lg lg:text-[22px] font-heading font-semibold flex items-center gap-2"
            >
              {t("buttons.next")}
              <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6" />
            </Button>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
