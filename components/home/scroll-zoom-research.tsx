"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { siteContent } from "@/lib/content/site-content";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const researchImages = [
  "/assets/gallery/project.jpeg",
  "/assets/gallery/awards.jpeg",
  "/assets/gallery/steve15-scaled.jpg",
  "/assets/gallery/steve3.jpg",
];

export function ScrollZoomResearchSection() {
  const { scrollYProgress } = useScroll();

  return (
    <section className="py-20">
      <div className="container-shell">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-4xl mb-4">Research & Scholarship</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Groundbreaking work in decolonizing psychology, thanatology, and cultural evolution
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {siteContent.researchProjects.slice(0, 4).map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {project.category}
                  </Badge>
                  <Badge
                    variant={project.status === "Active" ? "default" : "outline"}
                    className="text-xs"
                  >
                    {project.status}
                  </Badge>
                </div>

                <h3 className="font-display text-xl mb-3 group-hover:text-accent transition-colors">
                  {project.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed">
                  {project.summary}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Image Gallery with Zoom Effects */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {researchImages.map((image, index) => {
            const scale = useTransform(
              scrollYProgress,
              [0.3 + index * 0.1, 0.5 + index * 0.1],
              [1, 1.1]
            );

            return (
              <motion.div
                key={index}
                className="relative overflow-hidden rounded-2xl group cursor-pointer"
                style={{ scale }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="relative h-64"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={image}
                    alt={`Research project ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Publications Preview */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="font-display text-2xl mb-4">Recent Publications</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {siteContent.publications.slice(0, 3).map((pub, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-4 text-left hover:shadow-md transition-shadow">
                  <Badge variant="outline" className="mb-2 text-xs">
                    {pub.year} • {pub.type}
                  </Badge>
                  <h4 className="font-medium mb-2 line-clamp-2">{pub.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {pub.summary}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}