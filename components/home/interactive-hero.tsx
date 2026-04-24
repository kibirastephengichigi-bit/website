import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CalendarDays, ChevronDown, Download, ExternalLink, Mail, PhoneCall } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteContent } from "@/lib/content/site-content";
import { siteConfig } from "@/lib/site";

export function InteractiveHeroSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8f3ea_0%,#fcfaf6_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(180,140,92,0.10),transparent_28%)]" />

      <div className="container-shell relative z-10 py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          {/* Content First - Better for mobile and SEO */}
          <div className="space-y-8 lg:space-y-10 order-2 lg:order-1">
            {/* Eyebrow and badges */}
            <div className="space-y-4">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent animate-in fade-in slide-in-from-bottom-4 duration-700">
                {siteContent.hero.eyebrow}
              </p>
              
              <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-xs font-semibold text-accent backdrop-blur-sm">
                  Licensed Psychologist
                </span>
                <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-xs font-semibold text-accent backdrop-blur-sm">
                  Senior Lecturer
                </span>
                <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-xs font-semibold text-accent backdrop-blur-sm">
                  Research Leader
                </span>
              </div>
            </div>

            {/* Main headline */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <h1 className="font-display text-4xl leading-[0.95] text-foreground sm:text-5xl lg:text-6xl xl:text-7xl font-bold">
                {siteContent.hero.headline}
              </h1>
              
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground lg:text-xl">
                {siteContent.hero.subheadline}
              </p>
            </div>

            {/* Call to action buttons */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
                >
                  <a href={siteContent.contact.bookingUrl} target="_blank" rel="noopener noreferrer">
                    <CalendarDays className="mr-2 h-5 w-5" />
                    {siteContent.hero.primaryCta.label}
                  </a>
                </Button>
                
                <Button asChild size="lg" variant="outline" className="border-2 border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white">
                  <a href={siteContent.hero.publicationsCta.href} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    {siteContent.hero.publicationsCta.label}
                  </a>
                </Button>
              </div>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button asChild size="lg" variant="outline" className="border-2 border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white">
                  <Link href="#who-we-are">Explore Profile</Link>
                </Button>
                
                <Button asChild size="lg" variant="outline" className="border-2 border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white">
                  <Link href={siteContent.hero.secondaryCta.href}>
                    <Download className="mr-2 h-5 w-5" />
                    {siteContent.hero.secondaryCta.label}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
              <div className="rounded-[24px] border border-white/20 bg-white/10 backdrop-blur-sm p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                    <BadgeCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Trusted Credentials</p>
                    <p className="text-sm text-white/80">CUEA leadership, licensed practice, international research.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/20 bg-white/10 backdrop-blur-sm p-6 shadow-lg">
                <div className="space-y-3 text-sm">
                  <a href={`tel:${siteContent.contact.phones[0].replace(/\s+/g, "")}`} className="flex items-center gap-3 text-white hover:text-emerald-400 transition-colors">
                    <PhoneCall className="h-5 w-5" />
                    <span>{siteContent.contact.phones[0]}</span>
                  </a>
                  <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-3 text-white hover:text-emerald-400 transition-colors">
                    <Mail className="h-5 w-5" />
                    <span>{siteConfig.email}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Image Second - Better visual hierarchy */}
          <div className="relative order-1 lg:order-2 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
            <div className="relative">
              {/* Background glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 rounded-[32px] blur-2xl opacity-60" />
              
              {/* Main image container */}
              <div className="relative overflow-hidden rounded-[32px] border border-white/20 bg-white/10 backdrop-blur-sm shadow-[0_25px_50px_rgba(16,185,129,0.15)]">
                <div className="aspect-[3/4] lg:aspect-[4/5]">
                  <Image
                    src="/assets/people/hero.webp"
                    alt="Dr. Stephen Asatsa"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    className="object-cover object-top"
                    priority
                  />
                </div>
                
                {/* Overlay gradient for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
              
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-3 shadow-lg animate-bounce">
                <BadgeCheck className="h-6 w-6 text-white" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-3 shadow-lg animate-pulse">
                <PhoneCall className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground">
        <div className="flex animate-[bounce_2s_ease-in-out_infinite] flex-col items-center gap-2">
          <span className="text-xs font-medium">Scroll to explore</span>
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}
