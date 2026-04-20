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
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative">
            <div className="overflow-hidden rounded-[28px] border border-stone-200 bg-white p-3 shadow-[0_22px_60px_rgba(63,39,24,0.10)]">
              <Image
                src="/assets/people/hero.webp"
                alt="Dr. Stephen Asatsa"
                width={900}
                height={1200}
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="h-[420px] w-full rounded-[22px] object-cover object-top sm:h-[520px] lg:h-[600px]"
                priority
              />
            </div>
          </div>

          <div className="space-y-6 lg:max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
              {siteContent.hero.eyebrow}
            </p>

            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="rounded-full border border-border bg-white/80 px-3 py-2">Licensed Psychologist</span>
              <span className="rounded-full border border-border bg-white/80 px-3 py-2">Senior Lecturer</span>
              <span className="rounded-full border border-border bg-white/80 px-3 py-2">Research Leader</span>
            </div>

            <h1 className="font-display text-5xl leading-[0.95] text-foreground sm:text-6xl lg:text-7xl">
              {siteContent.hero.headline}
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              {siteContent.hero.subheadline}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild size="lg">
                <a href={siteContent.contact.bookingUrl} target="_blank" rel="noopener noreferrer">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {siteContent.hero.primaryCta.label}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={siteContent.hero.publicationsCta.href} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {siteContent.hero.publicationsCta.label}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#who-we-are">Explore Profile</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={siteContent.hero.secondaryCta.href}>
                  <Download className="mr-2 h-4 w-4" />
                  {siteContent.hero.secondaryCta.label}
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-border/80 bg-white/85 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Trusted Credentials</p>
                    <p className="text-sm text-muted-foreground">CUEA leadership, licensed practice, international research profile.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-border/80 bg-white/85 p-5 shadow-sm">
                <div className="space-y-3 text-sm">
                  <a href={`tel:${siteContent.contact.phones[0].replace(/\s+/g, "")}`} className="flex items-center gap-3 text-foreground transition hover:text-accent">
                    <PhoneCall className="h-4 w-4" />
                    <span>{siteContent.contact.phones[0]}</span>
                  </a>
                  <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-3 text-foreground transition hover:text-accent">
                    <Mail className="h-4 w-4" />
                    <span>{siteConfig.email}</span>
                  </a>
                </div>
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
