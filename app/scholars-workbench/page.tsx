import { redirect } from "next/navigation";
import Link from "next/link";
import { Github, ExternalLink, BookOpen, Users, Code, Database } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/layout/section-heading";

export const metadata = {
  title: "Scholars Workbench - Academic Research Platform",
  description: "Explore the Scholars Workbench - a comprehensive platform for academic research collaboration and data management.",
};

const features = [
  {
    icon: BookOpen,
    title: "Research Management",
    description: "Organize and manage academic research papers, citations, and bibliographies in one centralized platform."
  },
  {
    icon: Users,
    title: "Collaboration Tools",
    description: "Work together with research teams, share findings, and collaborate on academic projects seamlessly."
  },
  {
    icon: Database,
    title: "Data Organization",
    description: "Store, categorize, and retrieve research data with advanced filtering and search capabilities."
  },
  {
    icon: Code,
    title: "Open Source",
    description: "Built with modern technologies and open for contributions from the academic community."
  }
];

export default function ScholarsWorkbenchPage() {
  return (
    <section className="section-space">
      <div className="container-shell">
        <div className="mx-auto max-w-4xl text-center">
          <SectionHeading
            eyebrow="Academic Platform"
            title="Scholars Workbench"
            description="A comprehensive research platform designed for academics, researchers, and students to collaborate, organize, and share their scholarly work."
          />
          
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2">
              <a 
                href="https://github.com/Cyberverse-cent0/Schoolars-work-bench.git" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
                View on GitHub
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center">
              <div className="mx-flex mb-4 h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-20">
          <Card className="p-8">
            <div className="text-center">
              <h2 className="mb-4 font-display text-3xl">Integration with Academic Excellence</h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                Scholars Workbench integrates seamlessly with existing academic workflows and tools, 
                providing researchers with a powerful platform to enhance their scholarly work.
              </p>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-lg border border-border/50 p-6">
                  <h3 className="mb-2 font-semibold">Key Features</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Paper management and organization</li>
                    <li>• Collaborative research tools</li>
                    <li>• Citation management system</li>
                    <li>• Data visualization and analysis</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-border/50 p-6">
                  <h3 className="mb-2 font-semibold">Technical Stack</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Modern web technologies</li>
                    <li>• Secure data storage</li>
                    <li>• RESTful API architecture</li>
                    <li>• Responsive design</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                <Button asChild size="lg" className="gap-2">
                  <a 
                    href="https://github.com/Cyberverse-cent0/Schoolars-work-bench.git" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Github className="h-5 w-5" />
                    Explore the Repository
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
