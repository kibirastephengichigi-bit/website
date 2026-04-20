import Link from "next/link";
import { BadgeCheck, BookOpen, Building2, CalendarDays, PhoneCall } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteContent } from "@/lib/content/site-content";
import { siteConfig } from "@/lib/site";

const trustPoints = [
  {
    title: "Licensed Practice",
    description: "Registered and licensed by the Kenya Counselors and Psychologists Board.",
    icon: BadgeCheck,
  },
  {
    title: "University Leadership",
    description: "Senior Lecturer and Head of Department of Psychology at CUEA.",
    icon: Building2,
  },
  {
    title: "Research Credibility",
    description: "50+ publications, international collaborations, and active grant-backed work.",
    icon: BookOpen,
  },
];

export function TrustStrip() {
  return (
    <section className="pb-16 sm:pb-20">
      <div className="container-shell space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-border/70 bg-white/90 px-6 py-5 shadow-[0_18px_50px_rgba(24,45,62,0.08)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Quick Trust Signals</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              Built for people who scan quickly: clear credentials, easy contact, and one-step booking.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href={siteContent.contact.bookingUrl} target="_blank" rel="noopener noreferrer">
                <CalendarDays className="mr-2 h-4 w-4" />
                Book a Session
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={`tel:${siteContent.contact.phones[0].replace(/\s+/g, "")}`}>
                <PhoneCall className="mr-2 h-4 w-4" />
                Call Now
              </a>
            </Button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {trustPoints.map((point) => {
            const Icon = point.icon;

            return (
              <Card key={point.title} className="rounded-[28px] border-border/70 bg-card/90 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{point.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{point.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="rounded-full border border-border bg-background px-4 py-2">CUEA Psychology Department</span>
          <span className="rounded-full border border-border bg-background px-4 py-2">BeautifulMind Consultants</span>
          <span className="rounded-full border border-border bg-background px-4 py-2">SRCD Governing Council</span>
          <span className="rounded-full border border-border bg-background px-4 py-2">EAPP Africa Representative</span>
          <Link href={`mailto:${siteConfig.email}`} className="rounded-full border border-border bg-background px-4 py-2 transition hover:border-accent hover:text-foreground">
            {siteConfig.email}
          </Link>
        </div>
      </div>
    </section>
  );
}
