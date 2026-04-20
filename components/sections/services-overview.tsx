import Link from "next/link";

import { SectionHeading } from "@/components/layout/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteContent } from "@/lib/content/site-content";

export function ServicesOverview() {
  return (
    <section className="section-space bg-primary/[0.03]">
      <div className="container-shell space-y-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Services"
            title="Consulting, therapy, mentorship, and research support designed for real-world impact."
            description="The new site carries forward the original service areas while presenting them in a clearer, more professional flow for individuals and organizations."
          />
          <Button asChild variant="outline">
            <Link href="/services">Explore Services</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {siteContent.services.map((service) => (
            <Card key={service.title} className="p-7">
              <div className="space-y-4">
                <h3 className="font-display text-3xl">{service.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">{service.description}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {service.bullets.map((bullet) => (
                    <li key={bullet}>• {bullet}</li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
