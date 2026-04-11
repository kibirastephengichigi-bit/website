import Image from "next/image";

import { SectionHeading } from "@/components/layout/section-heading";
import { Card } from "@/components/ui/card";
import { siteContent } from "@/lib/content/site-content";

export function GallerySection() {
  return (
    <section className="section-space">
      <div className="container-shell space-y-10">
        <SectionHeading
          eyebrow="Gallery and Media"
          title="A curated visual narrative of scholarship, service, and public engagement."
          description={`${siteContent.quote.text} — ${siteContent.quote.author}`}
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {siteContent.gallery.map((image, index) => (
            <Card key={image} className={`overflow-hidden p-2 ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
              <Image
                src={image}
                alt="Gallery image"
                width={1200}
                height={900}
                className="h-full min-h-[220px] w-full rounded-[20px] object-cover"
              />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
