import Link from "next/link";

import { SectionHeading } from "@/components/layout/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteContent } from "@/lib/content/site-content";

export function AboutPreview() {
  return (
    <section id="who-we-are" className="section-space">
      <div className="container-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionHeading
          eyebrow="Who We Are"
          title="Professional excellence shaped by scholarship, service, and cultural insight."
          description={siteContent.aboutShort}
        />
        <Card className="p-8 sm:p-10">
          <div className="prose-copy">
            {siteContent.aboutFull.slice(0, 2).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Button asChild className="mt-4">
            <Link href="/about">Read Full Bio</Link>
          </Button>
        </Card>
      </div>
    </section>
  );
}
