"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import { SectionHeading } from "@/components/layout/section-heading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { siteContent } from "@/lib/content/site-content";

interface GalleryPhoto {
  id: string;
  title: string;
  description: string;
  image_url: string;
  thumbnail_url: string;
  upload_date: string;
  file_size: number;
  dimensions: { width: number; height: number };
  category?: string;
  tags?: string[];
  uploaded_by?: string;
  filename?: string;
}

export function GallerySection() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGalleryPhotos();
  }, []);

  const fetchGalleryPhotos = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/gallery/photos");
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
      } else {
        setError("Failed to load gallery photos");
      }
    } catch (error) {
      console.error("Error fetching gallery photos:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="section-space">
        <div className="container-shell space-y-10">
          <SectionHeading
            eyebrow="Gallery and Media"
            title="A curated visual narrative of scholarship, service, and public engagement."
            description={`${siteContent.quote.text} — ${siteContent.quote.author}`}
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="overflow-hidden p-2 animate-pulse">
                <div className="h-full min-h-[220px] w-full rounded-[20px] bg-muted" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-space">
        <div className="container-shell space-y-10">
          <SectionHeading
            eyebrow="Gallery and Media"
            title="A curated visual narrative of scholarship, service, and public engagement."
            description={`${siteContent.quote.text} — ${siteContent.quote.author}`}
          />
          <Card className="p-8 text-center text-muted-foreground">
            {error}
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="section-space">
      <div className="container-shell space-y-10">
        <SectionHeading
          eyebrow="Gallery and Media"
          title="A curated visual narrative of scholarship, service, and public engagement."
          description={`${siteContent.quote.text} — ${siteContent.quote.author}`}
        />
        {photos.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No gallery images yet. Upload them from the admin panel and they will appear here.
          </Card>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {photos.map((photo, index) => (
                <Card key={photo.id} className={`overflow-hidden p-2 ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
                  <Image
                    src={photo.image_url}
                    alt={photo.title}
                    width={1200}
                    height={900}
                    sizes={index === 0 ? "(max-width: 768px) 100vw, 40vw" : "(max-width: 768px) 100vw, 20vw"}
                    className="h-full min-h-[220px] w-full rounded-[20px] object-cover"
                  />
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transform hover:scale-105">
                <Link href="/gallery">
                  View Full Gallery
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
