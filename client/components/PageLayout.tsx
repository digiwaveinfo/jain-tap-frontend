import { ReactNode } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import Navigation from "./Navigation";
import HeroCarousel from "./HeroCarousel";
import Footer from "./Footer";

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Top Background Section - orange-50/80 */}
      <div className="absolute top-0 left-0 w-full h-[400px] sm:h-[500px] lg:h-[700px] bg-orange-50/80 pointer-events-none" />

      {/* Large Decorative Image - Top Left Corner (75% visible) */}
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/3496fd96f13fb10c046fd513a0019a7f07b206ae"
        alt=""
        className="absolute w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] lg:w-[1062px] lg:h-[1062px] -left-[100px] -top-[100px] sm:-left-[150px] sm:-top-[150px] lg:-left-[265px] lg:-top-[265px] pointer-events-none opacity-100"
      />

      {/* Decorative Image - Bottom Left (75% visible) */}
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/0a23954bcbfdb3ef5a17e6690a1e3a78ec9c204e"
        alt=""
        className="absolute w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] lg:w-[568px] lg:h-[568px] -left-[70px] sm:-left-[100px] lg:-left-[142px] bottom-[200px] sm:bottom-[300px] lg:bottom-[400px] pointer-events-none opacity-100"
      />

      {/* Decorative Image - Right Side (75% visible) */}
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/85c3fe526dad2cbe3d3014adb5bd64489e4de47a"
        alt=""
        className="absolute w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] lg:w-[568px] lg:h-[568px] -right-[70px] sm:-right-[100px] lg:-right-[142px] top-[600px] sm:top-[800px] lg:top-[1000px] pointer-events-none opacity-100"
      />

      <LanguageSwitcher />
      <Navigation />
      <HeroCarousel />

      {children}

      <Footer />
    </div>
  );
}
