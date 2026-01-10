import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroCarousel() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      desktopImage: "/home.png",
      mobileImage: "/home-mobile-view.png",
      quote: t("carousel.slide1Quote"),
      description: t("carousel.slide1Desc"),
    },
    {
      desktopImage: "/home-carosole1.jpeg",
      mobileImage: "/home-carosole1.jpeg",
      quote: t("carousel.slide2Quote"),
      description: t("carousel.slide2Desc"),
    },
    {
      desktopImage: "/home-carosole2.jpeg",
      mobileImage: "/home-carosole2.jpeg",
      quote: t("carousel.slide3Quote"),
      description: t("carousel.slide3Desc"),
    },
    {
      desktopImage: "/home-carosole3.jpeg",
      mobileImage: "/home-carosole3.jpeg",
      quote: t("carousel.slide4Quote"),
      description: t("carousel.slide4Desc"),
    },
    {
      desktopImage: "/home-carosole4.jpeg",
      mobileImage: "/home-carosole4.jpeg",
      quote: t("carousel.slide5Quote"),
      description: t("carousel.slide5Desc"),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative max-w-7xl mx-auto px-4 lg:px-8 mt-4 lg:mt-8">
      <div className="relative w-full h-[400px] lg:h-[695px] rounded-lg overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
          >
            <img
              src={slide.desktopImage}
              alt={`Slide ${index + 1}`}
              className="hidden sm:block w-full h-full object-fill"
            />
            <img
              src={slide.mobileImage}
              alt={`Slide ${index + 1}`}
              className="sm:hidden w-full h-full object-fill"
              style={index === 0 ? { transform: 'rotate(-90deg) scale(1.5)', transformOrigin: 'center center' } : undefined}
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-transparent pointer-events-none" />

        <div className="absolute inset-0 flex flex-col justify-end items-center pb-12 lg:pb-20 px-4">
          <div className="text-center max-w-4xl">
            <h2 className="text-white font-heading font-semibold text-xl sm:text-2xl lg:text-[34px] mb-3 lg:mb-4">
              "{slides[currentSlide].quote}"
            </h2>
            <p className="text-white font-body text-sm sm:text-base lg:text-xl max-w-2xl mx-auto">
              {slides[currentSlide].description}
            </p>
          </div>

          <div className="flex gap-2 mt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-all ${index === currentSlide
                  ? "bg-white w-6 lg:w-8"
                  : "bg-white/50 hover:bg-white/70"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={goToPrevious}
          className="absolute left-2 sm:left-4 lg:left-16 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-1 sm:p-2 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-8" strokeWidth={2} />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-4 lg:right-16 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-1 sm:p-2 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-8" strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}
