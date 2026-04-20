"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { SectionHeading } from "@/components/layout/section-heading";
import { Card } from "@/components/ui/card";
import { siteContent } from "@/lib/content/site-content";

export function TestimonialsCarousel() {
  return (
    <section className="section-space">
      <div className="container-shell space-y-10">
        <SectionHeading
          eyebrow="Testimonials"
          title="Trusted by collaborators, colleagues, and mentees."
          description="A calm, professional proof layer that supports the credibility of the practice and academic profile."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {siteContent.testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className="h-full border-border/50 bg-card/50 p-7 backdrop-blur-sm">
                <div className="mb-5 flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-base leading-8 text-foreground">“{testimonial.quote}”</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
