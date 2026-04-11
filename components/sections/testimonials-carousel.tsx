"use client";

import { motion } from "framer-motion";

import { SectionHeading } from "@/components/layout/section-heading";
import { Card } from "@/components/ui/card";
import { siteContent } from "@/lib/content/site-content";

export function TestimonialsCarousel() {
  return (
    <section className="section-space bg-primary text-primary-foreground">
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
              <Card className="h-full border-white/10 bg-white/10 p-7 text-primary-foreground backdrop-blur-sm">
                <p className="text-base leading-8">“{testimonial.quote}”</p>
                <div className="mt-6">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-primary-foreground/70">{testimonial.role}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
