import Image from "next/image";
import { siteContent } from "@/lib/content/site-content";

export function ParallaxAboutSection() {
  return (
    <section id="who-we-are" className="py-20 overflow-hidden">
      <div className="container-shell">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="font-display text-4xl">Who We Are</h2>

            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {siteContent.aboutFull.map((paragraph, index) => (
                <p key={index}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="pt-4">
              <blockquote className="border-l-4 border-accent pl-6 italic text-accent">
                <p className="text-lg mb-2">"{siteContent.quote.text}"</p>
                <cite className="text-sm font-medium">{siteContent.quote.author}</cite>
              </blockquote>
            </div>
          </div>

          <div className="relative">
            <div className="relative">
              <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-accent/10" />
              <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-accent/5" />

              <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-white p-4 shadow-soft">
                <Image
                  src="/assets/people/asatsa.webp"
                  alt="Dr. Stephen Asatsa"
                  width={600}
                  height={800}
                  sizes="(max-width: 1024px) 100vw, 38vw"
                  className="w-full rounded-2xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
