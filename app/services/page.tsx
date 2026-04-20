import Link from "next/link";
import Image from "next/image";

import { SectionHeading } from "@/components/layout/section-heading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/site";
import { siteContent } from "@/lib/content/site-content";
import { ProcessSection } from "@/components/sections/process-section";

export const metadata = createMetadata("Services", "Therapy, consulting, mentorship, and institutional training.", "/services");

export default function ServicesPage() {
  return (
    <>
      <section className="pt-16 sm:pt-20">
        <div className="container-shell">
          <div className="overflow-hidden rounded-[32px] border border-border bg-white p-3 shadow-[0_24px_70px_rgba(63,39,24,0.10)]">
            <Image
              src="/uploads/gallery/project.jpeg"
              alt="Services"
              width={1600}
              height={900}
              className="h-[300px] w-full rounded-[24px] object-cover object-center sm:h-[420px] lg:h-[520px]"
              priority
            />
          </div>
        </div>
      </section>

      <ProcessSection />

      <section className="section-space">
        <div className="container-shell space-y-10">
          <SectionHeading
            eyebrow="Services"
            title="Detailed offerings for individuals, couples, families, institutions, and collaborators."
            description="This page adapts the original services messaging into a clearer conversion-focused structure with stronger booking calls to action."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {siteContent.services.map((service) => (
              <Card key={service.title} className="p-7 sm:p-8">
                <div className="space-y-4">
                  <h2 className="font-display text-4xl">{service.title}</h2>
                  <p className="text-muted-foreground">{service.description}</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {service.bullets.map((bullet) => (
                      <li key={bullet}>• {bullet}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
          <Card id="booking" className="grid gap-6 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h3 className="font-display text-4xl">Book an appointment today.</h3>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                The new site supports a Calendly-style flow, contact follow-up, and a future admin-managed bookings pipeline.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href={siteContent.contact.bookingUrl}>Launch Calendly</Link>
            </Button>
          </Card>
          <Card className="overflow-hidden p-3">
            <iframe
              src={siteContent.contact.bookingUrl}
              title="Booking"
              className="h-[720px] w-full rounded-[24px] border-0"
            />
          </Card>
        </div>
      </section>
    </>
  );
}
