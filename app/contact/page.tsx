import Link from "next/link";

import { ContactForm } from "@/components/forms/contact-form";
import { SectionHeading } from "@/components/layout/section-heading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/site";
import { siteContent } from "@/lib/content/site-content";

export const metadata = createMetadata("Contact", "Contact Dr. Stephen Asatsa for consultations, collaboration, or media inquiries.", "/contact");
export const revalidate = 3600;

export default function ContactPage() {
  return (
    <section className="section-space">
      <div className="container-shell space-y-10">
        <SectionHeading
          eyebrow="Contact"
          title="Get in touch for therapy, consulting, research, or speaking."
          description="The contact details below come directly from the current site, now presented in a cleaner responsive contact experience."
        />
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Card className="p-7">
              <h2 className="font-display text-3xl">Contact details</h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground">Address</p>
                  {siteContent.contact.addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-foreground">Phone</p>
                  {siteContent.contact.phones.map((phone) => (
                    <p key={phone}>{phone}</p>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-foreground">WhatsApp</p>
                  <Link href={siteContent.contact.whatsapp} className="block hover:text-foreground">
                    Start WhatsApp chat
                  </Link>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Social</p>
                  {siteContent.contact.socialLinks.map((item) => (
                    <Link key={item.label} href={item.href} className="block hover:text-foreground">
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-foreground">Academic profiles</p>
                  {siteContent.externalProfiles.map((item) => (
                    <Link key={item.label} href={item.href} className="block hover:text-foreground">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </Card>
            <Card className="overflow-hidden p-3">
              <iframe
                src={siteContent.contact.mapEmbed}
                title="Map"
                className="h-[320px] w-full rounded-[22px] border-0"
                loading="lazy"
              />
            </Card>
          </div>
          <Card className="p-7">
            <h2 className="font-display text-3xl">Send a message</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Send us a message and we will respond as quickly as possible.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </Card>
        </div>

        {/* Booking Section */}
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
  );
}
