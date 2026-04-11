import Link from "next/link";

import { SectionHeading } from "@/components/layout/section-heading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/site";
import { siteContent } from "@/lib/content/site-content";

export const metadata = createMetadata("Research and Publications", "Filterable research, publications, grants, and talks.", "/research");

export default function ResearchPage() {
  return (
    <section className="section-space">
      <div className="container-shell space-y-12">
        <SectionHeading
          eyebrow="Research"
          title="Projects, publications, grants, conferences, and invited talks."
          description="The original WordPress content is reorganized here into a modern research profile that is easier to browse and expand."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {siteContent.researchProjects.map((project) => (
            <Card key={project.title} className="p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {project.category} • {project.status}
              </p>
              <h2 className="mt-3 font-display text-3xl">{project.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{project.summary}</p>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="p-7">
            <h3 className="font-display text-3xl">Publications</h3>
            <ul className="mt-4 space-y-4">
              {siteContent.publications.map((publication) => (
                <li key={publication.title} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <p className="font-medium">{publication.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {publication.type} • {publication.year}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{publication.summary}</p>
                  {publication.fileUrl ? (
                    <Button asChild variant="ghost" className="mt-2 px-0">
                      <Link href={publication.fileUrl}>Open file</Link>
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-7">
            <h3 className="font-display text-3xl">Grants</h3>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              {siteContent.grants.map((grant) => (
                <li key={grant}>• {grant}</li>
              ))}
            </ul>
          </Card>
          <Card className="p-7">
            <h3 className="font-display text-3xl">Conferences & Talks</h3>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              {siteContent.conferences.map((conference) => (
                <li key={conference}>• {conference}</li>
              ))}
              {siteContent.invitedTalks.map((talk) => (
                <li key={talk}>• {talk}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
