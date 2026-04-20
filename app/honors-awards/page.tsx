import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, ExternalLink, Calendar, Trophy } from "lucide-react";
import { siteContent } from "@/lib/content/site-content";
import { createMetadata } from "@/lib/site";

export const metadata = createMetadata(
  "Honors & Awards",
  "Professional recognition, awards, and honors received by Dr. Stephen Asatsa for contributions to psychology research and academic leadership.",
  "/honors-awards"
);

export default function HonorsAwardsPage() {
  return (
    <div className="container-shell py-16">
      <div className="mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl">Honors & Awards</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Recognition for contributions to psychology research, academic leadership, 
            and the advancement of culturally grounded mental health practices.
          </p>
        </div>

        {/* Major Awards */}
        <section className="space-y-8">
          <h2 className="font-display text-3xl flex items-center gap-3">
            <Award className="h-8 w-8 text-primary" />
            Major Recognition
          </h2>
          <div className="grid gap-6">
            {siteContent.awards.map((award, index) => (
              <Card key={index} className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-xl group-hover:text-primary transition-colors">
                        {award.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {award.year}
                      </div>
                                          </div>
                    {award.href && (
                      <Button asChild size="sm" variant="outline">
                        <a
                          href={award.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Grants and Fellowships */}
        <section className="space-y-8">
          <h2 className="font-display text-3xl">Research Grants & Fellowships</h2>
          <div className="space-y-4">
            {siteContent.grants.map((grant, index) => (
              <Card key={index} className="p-6 border-border/30 bg-card/30 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-accent/10 p-2 mt-1">
                    <Award className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{grant}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Professional Recognition */}
        <section className="space-y-8">
          <h2 className="font-display text-3xl">Professional Leadership</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Society for Research in Child Development</h3>
                <p className="text-muted-foreground">
                  Member of the governing Council, contributing to international child development research policy and direction.
                </p>
                <Badge variant="outline">Governing Council Member</Badge>
              </div>
            </Card>
            
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">European Association of Personality Psychology</h3>
                <p className="text-muted-foreground">
                  Africa regional representative, promoting African psychology perspectives in European academic discourse.
                </p>
                <Badge variant="outline">Regional Representative</Badge>
              </div>
            </Card>
            
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">International Society for the Study of Behavioral Development</h3>
                <p className="text-muted-foreground">
                  E-newsletter editor, facilitating communication and knowledge sharing among international behavioral development researchers.
                </p>
                <Badge variant="outline">Editor</Badge>
              </div>
            </Card>
            
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Frontiers in Psychology & Reproductive Health</h3>
                <p className="text-muted-foreground">
                  Review editor for peer-reviewed journals, contributing to scholarly quality and research standards.
                </p>
                <Badge variant="outline">Review Editor</Badge>
              </div>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-6 py-12">
          <h2 className="font-display text-3xl">Academic Excellence</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These honors reflect a commitment to advancing psychology through research, 
            teaching, and culturally informed practice that bridges academic excellence with community impact.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg">
              <a href="/research">Explore Research</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/contact">Academic Inquiries</a>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
