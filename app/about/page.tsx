import Link from "next/link";

import { SectionHeading } from "@/components/layout/section-heading";
import { Card } from "@/components/ui/card";
import { createMetadata } from "@/lib/site";
import { siteContent } from "@/lib/content/site-content";

export const metadata = createMetadata("About", "Full professional bio and affiliations for Dr. Stephen Asatsa.", "/about");

export default function AboutPage() {
  return (
    <section className="section-space">
      <div className="container-shell space-y-10">
        <SectionHeading
          eyebrow="About"
          title="Full biography, affiliations, and professional focus."
          description="This page carries forward the detailed biography and leadership profile from the original website."
        />
        <div className="space-y-8">
          <Card className="p-8 sm:p-10">
            <div className="prose-copy">
              {siteContent.aboutFull.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Card>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-7">
              <h3 className="font-display text-3xl">Affiliations</h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                <li>Head of Department of Psychology, Catholic University of Eastern Africa</li>
                <li>Kenya Counselors and Psychologists Board licensed practitioner</li>
                <li>Society for Research in Child Development Governing Council</li>
                <li>European Association of Personality Psychology regional representative</li>
                <li>International Society for the Study of Behavioral Development e-newsletter editor</li>
              </ul>
            </Card>
            <Card className="p-7">
              <h3 className="font-display text-3xl">Research Interests</h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                <li>Indigenous knowledge systems</li>
                <li>Decolonization of psychology</li>
                <li>Thanatology</li>
                <li>Cultural evolution</li>
                <li>Indigenization of psychological practice</li>
              </ul>
            </Card>
            <Card className="p-7">
              <h3 className="font-display text-3xl">Honors and Awards</h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                {siteContent.awards.map((award) => (
                  <li key={`${award.title}-${award.year}`}>
                    <span className="font-semibold text-foreground">{award.year}</span> {award.title}
                    {award.href ? (
                      <>
                        {" "}
                        <Link href={award.href} className="text-foreground underline-offset-4 hover:underline">
                          View
                        </Link>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-7">
              <h3 className="font-display text-3xl">Profiles and Networks</h3>
              <ul className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
                {siteContent.externalProfiles.map((profile) => (
                  <li key={profile.label}>
                    <Link href={profile.href} className="font-semibold text-foreground underline-offset-4 hover:underline">
                      {profile.label}
                    </Link>
                    <p>{profile.description}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
