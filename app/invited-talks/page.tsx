import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Mic } from "lucide-react";
import { siteContent } from "@/lib/content/site-content";
import { createMetadata } from "@/lib/site";

export const metadata = createMetadata(
  "Invited Talks",
  "Invited presentations and keynote speeches by Dr. Stephen Asatsa on psychology, decolonization, and cultural evolution topics.",
  "/invited-talks"
);
export const revalidate = 3600;

export default function InvitedTalksPage() {
  return (
    <div className="container-shell py-16">
      <div className="mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Mic className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl">Invited Talks</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Keynote presentations, colloquia, and invited talks sharing insights on 
            African psychology, decolonization, thanatology, and cultural evolution.
          </p>
        </div>

        {/* Recent Talks */}
        <section className="space-y-8">
          <h2 className="font-display text-3xl">Recent Presentations</h2>
          <div className="grid gap-6">
            {siteContent.invitedTalks.map((talk, index) => {
              const parts = talk.split(": ");
              const date = parts[0] || "";
              const title = parts.slice(1).join(": ");
              
              return (
                <Card key={index} className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                  <div className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {date}
                        </div>
                        <h3 className="font-semibold text-xl group-hover:text-primary transition-colors">
                          {title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {title.includes("Zurich") && "University of Zurich, Switzerland"}
                          {title.includes("Antwerp") && "Antwerp University of Applied Sciences, Belgium"}
                          {title.includes("Belfast") && "Belfast, UK"}
                          {!title.includes("Zurich") && !title.includes("Antwerp") && !title.includes("Belfast") && "Various Institutions"}
                        </div>
                      </div>
                      <Badge variant="outline" className="whitespace-nowrap">
                        <Users className="h-3 w-3 mr-1" />
                        Invited
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Talk Categories */}
        <section className="space-y-8">
          <h2 className="font-display text-3xl">Research Themes</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary">African Psychology</h3>
                <p className="text-muted-foreground">
                  Exploring Afrocentric approaches to psychology through indigenous knowledge systems 
                  and culturally grounded healing practices.
                </p>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Key Topics:</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Luhya Mourning Rituals</Badge>
                    <Badge variant="secondary">Indigenous Knowledge</Badge>
                    <Badge variant="secondary">Cultural Healing</Badge>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary">Decolonization</h3>
                <p className="text-muted-foreground">
                  Critical examination of psychology's colonial roots and pathways toward 
                  decolonized mental health practices in African contexts.
                </p>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Key Topics:</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Post-Colonial Theory</Badge>
                    <Badge variant="secondary">Cultural Evolution</Badge>
                    <Badge variant="secondary">Mental Health Sovereignty</Badge>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary">Thanatology</h3>
                <p className="text-muted-foreground">
                  Research on death preparedness, mourning practices, and meaning-making 
                  around loss and grief in cultural contexts.
                </p>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Key Topics:</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Death Preparedness</Badge>
                    <Badge variant="secondary">Grief Counseling</Badge>
                    <Badge variant="secondary">Cultural Rituals</Badge>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary">Academic Publishing</h3>
                <p className="text-muted-foreground">
                  Guidance on transforming graduate research into publishable scholarly work 
                  and navigating academic publishing landscapes.
                </p>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Key Topics:</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Research Dissemination</Badge>
                    <Badge variant="secondary">Scholarly Writing</Badge>
                    <Badge variant="secondary">Publication Strategy</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Impact Statement */}
        <section className="space-y-8">
          <Card className="p-8 border-border/50 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm">
            <div className="text-center space-y-4">
              <h2 className="font-display text-3xl">Academic Impact</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These invited talks represent a commitment to sharing research findings with diverse audiences, 
                from academic institutions to international conferences. Each presentation contributes to the 
                broader discourse on culturally grounded psychology and the decolonization of mental health practices.
              </p>
              <div className="grid gap-4 sm:grid-cols-3 pt-6">
                <div className="text-center">
                  <div className="font-display text-2xl text-primary mb-1">15+</div>
                  <div className="text-sm text-muted-foreground">Invited Presentations</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-2xl text-primary mb-1">8</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-2xl text-primary mb-1">4</div>
                  <div className="text-sm text-muted-foreground">Research Themes</div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-6 py-12">
          <h2 className="font-display text-3xl">Interested in Collaboration?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Dr. Asatsa is available for invited talks, workshops, and collaborative research 
            engagements focused on African psychology and decolonized mental health practices.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg">
              <a href="/contact">Request a Talk</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/research">View Research</a>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
