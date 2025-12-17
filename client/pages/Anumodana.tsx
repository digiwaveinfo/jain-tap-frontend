import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";

const galleryImages = [
  { id: 1, src: "/galary-image-1.png", date: "05/07/2025", size: "large" },
  { id: 2, src: "/galary-image-2.png", date: "05/07/2025", size: "small" },
  { id: 3, src: "/galary-image-3.png", date: "06/07/2025", size: "small" },
  { id: 4, src: "/galary-image-4.png", date: "06/07/2025", size: "large" },
  { id: 5, src: "/galary-image-5.png", date: "07/07/2025", size: "large" },
  { id: 6, src: "/galary-image-1.png", date: "07/07/2025", size: "small" },
  { id: 7, src: "/galary-image-2.png", date: "08/07/2025", size: "small" },
  { id: 8, src: "/galary-image-3.png", date: "08/07/2025", size: "large" },
];

const toGujaratiNumeral = (num: number): string => {
  const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
  return String(num).split('').map(d => gujaratiDigits[parseInt(d)]).join('');
};

export default function Anumodana() {
  const { t, i18n } = useTranslation();
  const imageCount = i18n.language === 'gu' ? toGujaratiNumeral(galleryImages.length) : galleryImages.length;

  return (
    <PageLayout>
      <section className="max-w-6xl mx-auto px-4 lg:px-8 py-12 lg:py-20 relative z-10">
        <h1 className="text-center font-heading font-semibold text-3xl sm:text-4xl lg:text-6xl text-black mb-4 lg:mb-6">
          {t("anumodana.title")}
        </h1>
        
        <p className="text-center font-body text-lg lg:text-2xl text-black mb-8 lg:mb-12">
          <span className="font-['Roboto']">{imageCount}</span> {t("anumodana.imageCount")}
        </p>

        <div className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
            <div className="md:col-span-7">
              <GalleryCard image={galleryImages[0]} />
            </div>
            <div className="md:col-span-5">
              <GalleryCard image={galleryImages[1]} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
            <div className="md:col-span-5">
              <GalleryCard image={galleryImages[2]} />
            </div>
            <div className="md:col-span-7">
              <GalleryCard image={galleryImages[3]} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
            <div className="md:col-span-7">
              <GalleryCard image={galleryImages[4]} />
            </div>
            <div className="md:col-span-5">
              <GalleryCard image={galleryImages[5]} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
            <div className="md:col-span-5">
              <GalleryCard image={galleryImages[6]} />
            </div>
            <div className="md:col-span-7">
              <GalleryCard image={galleryImages[7]} />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 lg:gap-8 mt-12 lg:mt-16">
          <Link to="/booking">
            <Button 
              variant="outline"
              className="bg-white hover:bg-gray-50 text-black border-2 border-black rounded-2xl px-6 lg:px-8 py-5 lg:py-7 text-lg lg:text-[22px] font-heading font-semibold flex items-center gap-2 w-[180px] justify-center"
            >
              <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6" />
              {t("buttons.back")}
            </Button>
          </Link>
          
          <Link to="/vidhinav">
            <Button 
              className="bg-black hover:bg-gray-800 text-white rounded-2xl px-6 lg:px-8 py-5 lg:py-7 text-lg lg:text-[22px] font-heading font-semibold flex items-center gap-2 w-[180px] justify-center"
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

interface GalleryImage {
  id: number;
  src: string;
  date: string;
  size: string;
}

function GalleryCard({ image }: { image: GalleryImage }) {
  return (
    <div className="relative h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden bg-zinc-300 group">
      <img 
        src={image.src} 
        alt={`Gallery image ${image.id}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute bottom-0 left-0 right-0 h-20 lg:h-24 bg-gradient-to-t from-black/80 to-transparent">
        <div className="absolute bottom-3 lg:bottom-4 left-4 lg:left-5">
          <span className="text-white font-body text-base lg:text-xl font-medium">
            {image.date}
          </span>
        </div>
      </div>
    </div>
  );
}
