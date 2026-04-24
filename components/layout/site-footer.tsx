import Link from "next/link";

import { siteContent } from "@/lib/content/site-content";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-transparent text-white relative overflow-hidden" style={{
      backgroundImage: 'url("/images/footer-bg.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
            
      <div className="container-shell grid gap-10 py-14 md:grid-cols-3 relative z-10">
        <div className="space-y-4">
          <p className="font-display text-3xl">Dr. Stephen Asatsa</p>
          <p className="max-w-sm text-sm leading-7 text-white/90">
            Professional psychological services, research leadership, and mentorship rooted in rigor, compassion, and cultural relevance.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold uppercase tracking-[0.2em] text-white/80">Reach Out</p>
          <p className="text-white/90">{siteContent.contact.addressLines.join(", ")}</p>
          <Link href={`mailto:${siteConfig.email}`} className="block text-white/85 transition hover:text-white">
            {siteConfig.email}
          </Link>
          {siteContent.contact.phones.map((phone) => (
            <p key={phone} className="text-white/90">{phone}</p>
          ))}
          <Link href={siteContent.contact.bookingUrl} className="block text-white/85 transition hover:text-white">
            Book a consultation
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold uppercase tracking-[0.2em] text-white/80">Trust Signals</p>
          <p className="text-white/90">Licensed by Kenya Counselors and Psychologists Board</p>
          <p className="text-white/90">Head of Department of Psychology, CUEA</p>
          <p className="text-white/90">Co-founder, BeautifulMind Consultants</p>
          {siteContent.contact.socialLinks.map((item) => (
            <Link key={item.label} href={item.href} className="block text-white/85 transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
