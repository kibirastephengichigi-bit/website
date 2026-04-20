"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/layout/section-heading";
import { Card } from "@/components/ui/card";
import { Target, Users, TrendingUp, Award } from "lucide-react";

export function ProcessSection() {
  const processes = [
    {
      icon: Target,
      title: "Assessment & Strategy",
      description: "Comprehensive evaluation of psychological needs and goal setting for effective intervention"
    },
    {
      icon: Users,
      title: "Evidence-Based Intervention", 
      description: "Customized treatment plans using proven methodologies and culturally grounded approaches"
    },
    {
      icon: TrendingUp,
      title: "Progress Monitoring",
      description: "Regular assessment and adjustment of therapeutic approaches for optimal outcomes"
    },
    {
      icon: Award,
      title: "Long-term Success",
      description: "Sustainable strategies for lasting positive mental health and wellbeing"
    }
  ];

  return (
    <section className="section-space bg-muted/30">
      <div className="container-shell space-y-12">
        <SectionHeading
          eyebrow="Our Process"
          title="Evidence-Based Approach to Mental Wellness"
          description="Systematic methodology ensuring measurable results and lasting impact through culturally informed psychology."
        />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {processes.map((process, index) => (
            <motion.div
              key={process.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="rounded-full bg-primary/10 p-3 w-16 h-16 mx-auto mb-4">
                  <process.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{process.title}</h3>
                <p className="text-sm text-muted-foreground">{process.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
