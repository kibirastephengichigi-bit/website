"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { siteContent } from "@/lib/content/site-content";

export function HeroSection() {
  return (
    <section className="section-space overflow-hidden">
      <div className="container-shell grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          <Badge>{siteContent.hero.eyebrow}</Badge>
          <div className="space-y-6">
            <h1 className="max-w-4xl font-display text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              {siteContent.hero.headline}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              {siteContent.hero.subheadline}
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href={siteContent.hero.primaryCta.href}>{siteContent.hero.primaryCta.label}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={siteContent.hero.secondaryCta.href}>{siteContent.hero.secondaryCta.label}</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              "Licensed consultant psychologist",
              "Head of Department, CUEA Psychology",
              "Researcher in decolonization and thanatology",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-border/70 bg-white/70 p-4 text-sm text-muted-foreground shadow-soft">
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 translate-x-6 translate-y-8 rounded-[32px] bg-accent/10" />
          <div className="relative overflow-hidden rounded-[32px] border border-border/70 bg-white p-4 shadow-soft">
            <Image
              src="/assets/people/hero.jpeg"
              alt="Dr. Stephen Asatsa"
              width={900}
              height={1200}
              className="h-[560px] w-full rounded-[24px] object-cover object-top"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
