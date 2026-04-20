"use client";

import { motion } from "framer-motion";
import { siteContent } from "@/lib/content/site-content";
import { Card } from "@/components/ui/card";
import { Brain, Users, BookOpen, GraduationCap, Building, Calendar } from "lucide-react";

const serviceIcons = [Brain, Users, BookOpen, GraduationCap, Building, Calendar];

export function InteractiveServicesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container-shell">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-4xl mb-4">Our Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive psychological care, research leadership, and professional development services
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {siteContent.services.map((service, index) => {
            const Icon = serviceIcons[index] || Brain;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="h-full p-6 hover:shadow-lg transition-all duration-300 border-border/70 hover:border-accent/30">
                  <motion.div
                    className="mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                  </motion.div>

                  <h3 className="font-display text-xl mb-3 group-hover:text-accent transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="space-y-2">
                    {service.bullets.map((bullet, bulletIndex) => (
                      <motion.li
                        key={bulletIndex}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: (index * 0.1) + (bulletIndex * 0.05) + 0.3
                        }}
                        viewport={{ once: true }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                        {bullet}
                      </motion.li>
                    ))}
                  </ul>

                  {/* Hover effect overlay */}
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                  />
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}