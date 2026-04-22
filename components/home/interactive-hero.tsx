import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ChevronDown, Download, ExternalLink, Mail, PhoneCall } from "lucide-react";

import { HeroPersonalizer } from "@/components/home/hero-personalizer";
import { Button } from "@/components/ui/button";
import { siteContent } from "@/lib/content/site-content";
import { siteConfig } from "@/lib/site";

export function InteractiveHeroSection() {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Enhanced gradient overlays for full space utilization */}
      <div className="absolute inset-0 bg-gradient-to-br from-[radial-gradient(circle_at_top_left,rgba(74,112,67,0.08),transparent_40%)] via-[radial-gradient(circle_at_top_right,rgba(224,122,95,0.06),transparent_35%)] to-[radial-gradient(circle_at_bottom_left,rgba(147,51,234,0.04),transparent_30%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,112,67,0.03),transparent_50%)]" />

      <div className="container-shell relative z-10 py-12 sm:py-16 lg:py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[600px]">
          {/* Text Content - Left Side */}
          <div className="space-y-6 lg:pr-8 order-2 lg:order-1">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
                {siteContent.hero.eyebrow}
              </p>

              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span className="rounded-full border border-border bg-white/90 px-3 py-1.5">Licensed Psychologist</span>
                <span className="rounded-full border border-border bg-white/90 px-3 py-1.5">Senior Lecturer</span>
                <span className="rounded-full border border-border bg-white/90 px-3 py-1.5">Research Leader</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[0.95] text-foreground">
                {siteContent.hero.headline}
              </h1>

              <p className="text-base sm:text-lg leading-7 text-muted-foreground max-w-2xl">
                {siteContent.hero.subheadline}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <a href={siteContent.hero.publicationsCta.href} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {siteContent.hero.publicationsCta.label}
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link href="#who-we-are">Explore Profile</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link href={siteContent.hero.secondaryCta.href}>
                    <Download className="mr-2 h-4 w-4" />
                    {siteContent.hero.secondaryCta.label}
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="rounded-[20px] border border-border/70 bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <BadgeCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Trusted Credentials</p>
                      <p className="text-xs text-muted-foreground">CUEA leadership, licensed practice</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-border/70 bg-white/90 p-4 shadow-sm">
                  <div className="space-y-2 text-sm">
                    <a href={`tel:${siteContent.contact.phones[0].replace(/\s+/g, "")}`} className="flex items-center gap-2 text-foreground hover:text-accent">
                      <PhoneCall className="h-4 w-4" />
                      <span>{siteContent.contact.phones[0]}</span>
                    </a>
                    <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 text-foreground hover:text-accent">
                      <Mail className="h-4 w-4" />
                      <span>{siteConfig.email}</span>
                    </a>
                  </div>
                </div>
              </div>

              <HeroPersonalizer />
            </div>

          {/* Hero Image - Right Side */}
          <div className="relative order-1 lg:order-2 flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-0 rounded-2xl border border-border/20 bg-white/95 backdrop-blur-sm p-1">
                <div className="aspect-[4/5] rounded-xl overflow-hidden">
                  <Image
                    src="/assets/people/hero.webp"
                    alt="Dr. Stephen Asatsa"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
                    className="object-cover object-center"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Enhanced scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium animate-pulse">Scroll to explore</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
