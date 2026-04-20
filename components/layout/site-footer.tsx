import Link from "next/link";

import { siteContent } from "@/lib/content/site-content";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-primary text-primary-foreground">
      <div className="container-shell grid gap-10 py-14 md:grid-cols-3">
        <div className="space-y-4">
          <p className="font-display text-3xl">Dr. Stephen Asatsa</p>
          <p className="max-w-sm text-sm leading-7 text-primary-foreground/80">
            Professional psychological services, research leadership, and mentorship rooted in rigor, compassion, and cultural relevance.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">Reach Out</p>
          <p>{siteContent.contact.addressLines.join(", ")}</p>
          <Link href={`mailto:${siteConfig.email}`} className="block text-primary-foreground/85 transition hover:text-white">
            {siteConfig.email}
          </Link>
          {siteContent.contact.phones.map((phone) => (
            <p key={phone}>{phone}</p>
          ))}
          <Link href={siteContent.contact.bookingUrl} className="block text-primary-foreground/85 transition hover:text-white">
            Book a consultation
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">Trust Signals</p>
          <p className="text-primary-foreground/85">Licensed by Kenya Counselors and Psychologists Board</p>
          <p className="text-primary-foreground/85">Head of Department of Psychology, CUEA</p>
          <p className="text-primary-foreground/85">Co-founder, BeautifulMind Consultants</p>
          {siteContent.contact.socialLinks.map((item) => (
            <Link key={item.label} href={item.href} className="block text-primary-foreground/85 transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
