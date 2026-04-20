import { SectionHeading } from "@/components/layout/section-heading";
import { Card } from "@/components/ui/card";
import { siteContent } from "@/lib/content/site-content";

export function ResearchHighlight() {
  return (
    <section className="section-space">
      <div className="container-shell space-y-10">
        <SectionHeading
          eyebrow="Research and Publications"
          title="Scholarship spanning indigenous knowledge systems, decolonizing psychology, thanatology, and cultural evolution."
          description="Version 2 organizes research outputs into discoverable themes, making Dr. Asatsa’s work easier to browse for collaborators, institutions, and media."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {siteContent.researchProjects.slice(0, 4).map((project) => (
            <Card key={project.title} className="p-7">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  {project.category} • {project.status}
                </p>
                <h3 className="font-display text-3xl">{project.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">{project.summary}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
