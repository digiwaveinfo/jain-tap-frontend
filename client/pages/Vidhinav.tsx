import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";

export default function Vidhinav() {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <section className="max-w-3xl mx-auto px-4 lg:px-8 py-12 lg:py-20 relative z-10">
        <h1 className="text-center font-heading font-semibold text-4xl lg:text-6xl text-amber-900 mb-12 lg:mb-16">
          {t("tapVidhi.title")}
        </h1>

        <div className="space-y-8 font-body text-lg lg:text-2xl text-amber-900 leading-[1.5]">
          {/* Item 1 */}
          <div className="flex gap-3 lg:gap-4">
            <span className="font-bold font-['Roboto'] flex-shrink-0">1)</span>
            <div>
              <span className="font-bold">{t("tapVidhi.item1")}</span>
              <span> {t("tapVidhi.item1And")} </span>
              <span className="font-bold">{t("tapVidhi.item1Bold")}</span>
              <span> {t("tapVidhi.item1End")}</span>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex gap-3 lg:gap-4">
            <span className="font-bold font-['Roboto'] flex-shrink-0">2)</span>
            <div className="space-y-4">
              <p className="font-bold">{t("tapVidhi.item2Title")}</p>

              <div className="pl-4 lg:pl-6 space-y-2">
                <p className="font-normal">{t("tapVidhi.item2Subtitle")}</p>

                <div className="font-normal space-y-1">
                  <p>{t("tapVidhi.item2Line1")}</p>
                  <p>{t("tapVidhi.item2Line2")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex gap-3 lg:gap-4">
            <span className="font-bold font-['Roboto'] flex-shrink-0">3)</span>
            <p className="font-bold">{t("tapVidhi.item3")}</p>
          </div>

          {/* Item 4 */}
          <div className="flex gap-2 lg:gap-4">
            <span className="font-bold font-['Roboto'] flex-shrink-0">4)</span>
            <div className="space-y-4 min-w-0 flex-1">
              <p className="font-bold">{t("tapVidhi.item4Title")}</p>

              <div className="pl-0 sm:pl-4 lg:pl-6 -ml-1 sm:ml-0">
                <p className="font-normal text-[13px] sm:text-base lg:text-2xl whitespace-nowrap leading-tight">
                  {t("tapVidhi.item4Mantra")} <span className="font-bold">{t("tapVidhi.item4MantraBold")}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Button */}
        <div className="flex justify-center mt-12 lg:mt-16">
          <Link to="/anumodana">
            <Button
              variant="outline"
              className="bg-white hover:bg-amber-50 text-amber-900 border-2 border-amber-700 rounded-2xl px-6 lg:px-8 py-5 lg:py-7 text-lg lg:text-[22px] font-heading font-semibold flex items-center gap-2 w-[180px] justify-center"
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
