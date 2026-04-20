import Link from "next/link";

import { InteractiveHeroSection } from "@/components/home/interactive-hero";
import { StatisticsSection } from "@/components/home/statistics-section";
import { ParallaxAboutSection } from "@/components/home/parallax-about";
import { InteractiveServicesSection } from "@/components/home/interactive-services";
import { ScrollZoomResearchSection } from "@/components/home/scroll-zoom-research";
import { TestimonialsCarousel } from "@/components/sections/testimonials-carousel";
import { ResultsMetrics } from "@/components/sections/results-metrics";
import { GallerySection } from "@/components/sections/gallery-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createMetadata } from "@/lib/site";
import { siteContent } from "@/lib/content/site-content";

export const metadata = createMetadata("Home", undefined, "/");
export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <InteractiveHeroSection />
      <StatisticsSection />
      <ParallaxAboutSection />
      <InteractiveServicesSection />
      <ScrollZoomResearchSection />
      <TestimonialsCarousel />
      <ResultsMetrics />
      <GallerySection />
      <NewsletterSection />
    </>
  );
}
