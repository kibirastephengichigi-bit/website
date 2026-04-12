"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { siteContent } from "@/lib/content/site-content";

export function ParallaxAboutSection() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <section className="py-20 overflow-hidden">
      <div className="container-shell">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="font-display text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Who We Are
            </motion.h2>

            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {siteContent.aboutFull.map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>

            <motion.div
              className="pt-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <blockquote className="border-l-4 border-accent pl-6 italic text-accent">
                <p className="text-lg mb-2">"{siteContent.quote.text}"</p>
                <cite className="text-sm font-medium">— {siteContent.quote.author}</cite>
              </blockquote>
            </motion.div>
          </motion.div>

          {/* Image with Parallax */}
          <motion.div
            className="relative"
            style={{ y: y2 }}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              {/* Background decorative elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-32 h-32 bg-accent/10 rounded-full"
                style={{ y: y1 }}
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                className="absolute -bottom-4 -left-4 w-24 h-24 bg-accent/5 rounded-full"
                style={{ y: y1 }}
                animate={{
                  scale: [1, 0.9, 1],
                  rotate: [0, -3, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />

              <motion.div
                className="relative overflow-hidden rounded-3xl border border-border/70 bg-white p-4 shadow-soft"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="/assets/people/asatsa.png"
                  alt="Dr. Stephen Asatsa"
                  width={600}
                  height={800}
                  className="w-full rounded-2xl object-cover"
                  priority
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}