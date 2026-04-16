"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Download, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteContent } from "@/lib/content/site-content";

export function InteractiveHeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!heroRef.current) {
        return;
      }

      const rect = heroRef.current.getBoundingClientRect();
      mouseX.set((event.clientX - rect.left) / rect.width);
      mouseY.set((event.clientY - rect.top) / rect.height);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const imageX = useTransform(mouseX, [0, 1], [-6, 6]);
  const imageY = useTransform(mouseY, [0, 1], [-8, 8]);
  const frameY = useTransform(scrollYProgress, [0, 1], [0, -24]);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-[linear-gradient(180deg,#f8f3ea_0%,#fcfaf6_100%)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(180,140,92,0.10),transparent_28%)]" />

      <div className="container-shell relative z-10 py-16 sm:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative"
            style={{ y: frameY }}
          >
            <div className="overflow-hidden rounded-[28px] border border-stone-200 bg-white p-3 shadow-[0_22px_60px_rgba(63,39,24,0.10)]">
              <motion.div style={{ x: imageX, y: imageY }}>
                <Image
                  src="/assets/people/hero.jpeg"
                  alt="Dr. Stephen Asatsa"
                  width={900}
                  height={1200}
                  className="h-[420px] w-full rounded-[22px] object-cover object-top sm:h-[520px] lg:h-[600px]"
                  priority
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="space-y-6 lg:max-w-3xl"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
              {siteContent.hero.eyebrow}
            </p>

            <h1 className="font-display text-5xl leading-[0.95] text-foreground sm:text-6xl lg:text-7xl">
              Stephen
              <br />
              Asatsa, PhD
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              is a senior Lecturer and Head of Department of Psychology at the Catholic University of Eastern Africa
              with extensive experience in academic strategy and research. Proven track record as a Lecturer of
              Psychology, excelling in teaching, research, and student mentorship.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild size="lg">
                <Link href="#who-we-are">Read More</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={siteContent.hero.publicationsCta.href} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {siteContent.hero.publicationsCta.label}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/research">
                  View Research
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-xs font-medium">Scroll to explore</span>
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
