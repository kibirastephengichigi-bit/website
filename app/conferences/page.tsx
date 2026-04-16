import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ExternalLink, Play } from "lucide-react";
import { siteContent } from "@/lib/content/site-content";
import { createMetadata } from "@/lib/site";

export const metadata = createMetadata(
  "Conferences",
  "Conference presentations and interviews by Dr. Stephen Asatsa featuring international academic engagements and research dissemination.",
  "/conferences"
);

export default function ConferencesPage() {
  return (
    <div className="container-shell py-16">
      <div className="mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl">Conferences</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            International conference presentations, interviews, and academic engagements 
            showcasing research on psychology, mental health, and cultural evolution.
          </p>
        </div>

        {/* Featured Video Content */}
        <section className="space-y-8">
          <h2 className="font-display text-3xl">Featured Presentations</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {siteContent.media
              .filter(media => media.kind === "Conference presentation" || media.kind === "Conference interview")
              .slice(0, 4)
              .map((media, index) => (
                <Card key={index} className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-primary/20 p-4 backdrop-blur-sm">
                        <Play className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    {media.year && (
                      <Badge className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm">
                        {media.year}
                      </Badge>
                    )}
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {media.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {media.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {media.kind}
                      </Badge>
                      <Button asChild size="sm" variant="ghost">
                        <a
                          href={media.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gap-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Watch
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </section>

        {/* Conference Timeline */}
        <section className="space-y-8">
          <h2 className="font-display text-3xl">Conference History</h2>
          <div className="space-y-4">
            {siteContent.conferences.map((conference, index) => {
              const parts = conference.split(", ");
              const date = parts[0] || "";
              const title = parts.slice(1).join(", ");
              
              return (
                <Card key={index} className="p-6 border-border/50 bg-card/30 backdrop-blur-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {date}
                      </div>
                      <h3 className="font-medium text-lg">{title}</h3>
                    </div>
                    {title.includes("University") || title.includes("Conference") ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {title.includes("UK") && "United Kingdom"}
                        {title.includes("Germany") && "Germany"}
                        {title.includes("Greece") && "Greece"}
                        {title.includes("Portugal") && "Portugal"}
                        {title.includes("Switzerland") && "Switzerland"}
                        {title.includes("Italy") && "Italy"}
                        {title.includes("Morocco") && "Morocco"}
                        {title.includes("Thailand") && "Thailand"}
                        {title.includes("Colorado") && "USA"}
                        {title.includes("Greece") && "Greece"}
                        {title.includes("Abu Dhabi") && "UAE"}
                        {title.includes("USA") && "USA"}
                        {title.includes("Netherlands") && "Netherlands"}
                        {title.includes("Australia") && "Australia"}
                        {title.includes("South Africa") && "South Africa"}
                        {title.includes("Thailand") && "Thailand"}
                        {title.includes("Lithuania") && "Lithuania"}
                        {title.includes("Kenya") && "Kenya"}
                        {title.includes("Uganda") && "Uganda"}
                      </div>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-6 py-12">
          <h2 className="font-display text-3xl">Interested in Collaboration?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Dr. Asatsa regularly participates in international conferences and is open to 
            collaborative research opportunities and speaking engagements.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg">
              <a href="/contact">Get in Touch</a>
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
