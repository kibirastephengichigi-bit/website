import Image from "next/image";

import { SectionHeading } from "@/components/layout/section-heading";
import { Card } from "@/components/ui/card";
import { siteContent } from "@/lib/content/site-content";
import { getCachedGalleryAssets } from "@/lib/gallery";

export async function GallerySection() {
  const items = await getCachedGalleryAssets();

  return (
    <section className="section-space">
      <div className="container-shell space-y-10">
        <SectionHeading
          eyebrow="Gallery and Media"
          title="A curated visual narrative of scholarship, service, and public engagement."
          description={`${siteContent.quote.text} — ${siteContent.quote.author}`}
        />
        {items.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No gallery images yet. Upload them from the admin media panel and they will appear here.
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {items.map((item, index) => (
              <Card key={item.url} className={`overflow-hidden p-2 ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
                <Image
                  src={item.url}
                  alt={item.title}
                  width={1200}
                  height={900}
                  sizes={index === 0 ? "(max-width: 768px) 100vw, 40vw" : "(max-width: 768px) 100vw, 20vw"}
                  className="h-full min-h-[220px] w-full rounded-[20px] object-cover"
                />
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
