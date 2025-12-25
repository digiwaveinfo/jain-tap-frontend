import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface GalleryImage {
  id: string;
  url: string;
  date: string;
  description?: string;
}

const toGujaratiNumeral = (num: number): string => {
  const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
  return String(num).split('').map(d => gujaratiDigits[parseInt(d)]).join('');
};

export default function Anumodana() {
  const { t, i18n } = useTranslation();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await api.getAnumodanaImages();
      if (response.success && response.data) {
        setImages(response.data as GalleryImage[]);
      }
    } catch (error) {
      console.error("Failed to fetch images", error);
    } finally {
      setLoading(false);
    }
  };

  const imageCount = i18n.language === 'gu' ? toGujaratiNumeral(images.length) : images.length;

  // Helper to chunk images for the grid layout (2 per row: 7 col + 5 col)
  const renderImageRows = () => {
    const rows = [];
    for (let i = 0; i < images.length; i += 2) {
      const img1 = images[i];
      const img2 = images[i + 1];

      // Alternate layout: Row 1 (7-5), Row 2 (5-7), Row 3 (7-5)...
      const isEvenRow = (i / 2) % 2 === 0;

      rows.push(
        <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
          <div className={isEvenRow ? 'md:col-span-7' : 'md:col-span-5'}>
            <GalleryCard image={img1} />
          </div>
          {img2 && (
            <div className={isEvenRow ? 'md:col-span-5' : 'md:col-span-7'}>
              <GalleryCard image={img2} />
            </div>
          )}
        </div>
      );
    }
    return rows;
  };

  return (
    <PageLayout>
      <section className="max-w-6xl mx-auto px-4 lg:px-8 py-12 lg:py-20 relative z-10">
        <h1 className="text-center font-heading font-semibold text-3xl sm:text-4xl lg:text-6xl text-amber-900 mb-4 lg:mb-6">
          {t("anumodana.title")}
        </h1>

        <p className="text-center font-body text-lg lg:text-2xl text-amber-900 mb-8 lg:mb-12">
          <span className="font-['Roboto']">{imageCount}</span> {t("anumodana.imageCount")}
        </p>

        <div className="space-y-4 lg:space-y-6">
          {loading ? (
            <div className="text-center py-20">Loading...</div>
          ) : (
            renderImageRows()
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 lg:gap-8 mt-12 lg:mt-16">
          <Link to="/booking">
            <Button
              variant="outline"
              className="bg-white hover:bg-amber-50 text-amber-900 border-2 border-amber-700 rounded-2xl px-6 lg:px-8 py-5 lg:py-7 text-lg lg:text-[22px] font-heading font-semibold flex items-center gap-2 w-[180px] justify-center"
            >
              <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6" />
              {t("buttons.back")}
            </Button>
          </Link>

          <Link to="/vidhinav">
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-2xl px-6 lg:px-8 py-5 lg:py-7 text-lg lg:text-[22px] font-heading font-semibold flex items-center gap-2 w-[180px] justify-center"
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



function GalleryCard({ image }: { image: GalleryImage }) {
  return (
    <div className="relative h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden bg-zinc-300 group">
      <img
        src={image.url}
        alt={image.description || "Gallery image"}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute bottom-0 left-0 right-0 h-20 lg:h-24 bg-gradient-to-t from-orange-900/80 to-transparent">
        <div className="absolute bottom-3 lg:bottom-4 left-4 lg:left-5">
          <span className="text-white font-body text-base lg:text-xl font-medium">
            {image.date}
          </span>
        </div>
      </div>
    </div>
  );
}
