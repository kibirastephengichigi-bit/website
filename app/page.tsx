import Link from "next/link";

import { AboutPreview } from "@/components/sections/about-preview";
import { GallerySection } from "@/components/sections/gallery-section";
import { HeroSection } from "@/components/sections/hero-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { ResearchHighlight } from "@/components/sections/research-highlight";
import { ServicesOverview } from "@/components/sections/services-overview";
import { TestimonialsCarousel } from "@/components/sections/testimonials-carousel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createMetadata } from "@/lib/site";
import { siteContent } from "@/lib/content/site-content";

export const metadata = createMetadata("Home", undefined, "/");

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutPreview />
      <ServicesOverview />
      <ResearchHighlight />
      <TestimonialsCarousel />
      <GallerySection />
      <section className="section-space">
        <div className="container-shell">
          <Card className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Booking</p>
              <h2 className="font-display text-4xl sm:text-5xl">Get in touch with Dr. Stephen.</h2>
              <p className="max-w-3xl text-muted-foreground">
                The original site includes a Calendly booking flow. Version 2 keeps that path front and center while adding a cleaner consultation journey.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href={siteContent.contact.bookingUrl}>Open Booking</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Contact</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
      <NewsletterSection />
    </>
  );
}
