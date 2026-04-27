import Image from "next/image";
import { siteContent } from "@/lib/content/site-content";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const researchImages = [
  "/assets/gallery/project.jpeg",
  "/assets/gallery/awards.jpeg",
  "/assets/gallery/steve15-scaled.jpg",
  "/assets/gallery/steve3.jpg",
];

export function ScrollZoomResearchSection() {
  return (
    <section className="py-20">
      <div className="container-shell">
        <div className="mb-16 text-center">
          <h2 className="font-display text-4xl mb-4">Research & Scholarship</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Groundbreaking work in decolonizing psychology, thanatology, and cultural evolution
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {siteContent.researchProjects.slice(0, 4).map((project, index) => (
            <div key={project.title} className="group">
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {project.category}
                  </Badge>
                  <Badge
                    variant={project.status === "Active" ? "default" : "outline"}
                    className="text-xs"
                  >
                    {project.status}
                  </Badge>
                </div>

                <h3 className="font-display text-xl mb-3 group-hover:text-accent transition-colors">
                  {project.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed">
                  {project.summary}
                </p>
              </Card>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {researchImages.map((image, index) => {
            return (
              <div key={image} className="group relative cursor-pointer overflow-hidden rounded-2xl">
                <div className="relative h-64">
                  <Image
                    src={image.replace(/\.(png|jpe?g)$/i, ".webp")}
                    alt={`Research project ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <h3 className="font-display text-2xl mb-4">Recent Publications</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {siteContent.publications.slice(0, 3).map((pub, index) => (
              <div key={pub.title}>
                <Card className="p-4 text-left hover:shadow-md transition-shadow">
                  <Badge variant="outline" className="mb-2 text-xs">
                    {pub.year} • {pub.type}
                  </Badge>
                  <h4 className="font-medium mb-2 line-clamp-2">{pub.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {pub.summary}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
