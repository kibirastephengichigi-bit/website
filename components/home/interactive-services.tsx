import { siteContent } from "@/lib/content/site-content";
import { Card } from "@/components/ui/card";
import { Brain, Users, BookOpen, GraduationCap, Building, Calendar } from "lucide-react";

const serviceIcons = [Brain, Users, BookOpen, GraduationCap, Building, Calendar];

export function InteractiveServicesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container-shell">
        <div className="mb-16 text-center">
          <h2 className="font-display text-4xl mb-4">Our Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive psychological care, research leadership, and professional development services
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {siteContent.services.map((service, index) => {
            const Icon = serviceIcons[index] || Brain;

            return (
              <div key={service.title} className="group">
                <Card className="relative h-full border-border/70 p-6 transition-all duration-300 hover:border-accent/30 hover:shadow-lg">
                  <div className="mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 transition-colors group-hover:bg-accent/20">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                  </div>

                  <h3 className="font-display text-xl mb-3 group-hover:text-accent transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="space-y-2">
                    {service.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
