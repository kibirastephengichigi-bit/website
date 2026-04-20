"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/layout/section-heading";
import { Card } from "@/components/ui/card";
import { Users, Award, TrendingUp, BookOpen } from "lucide-react";

export function ResultsMetrics() {
  const metrics = [
    { number: "15+", label: "Years Experience", description: "Clinical psychology practice and research", icon: Users },
    { number: "1000+", label: "Clients Helped", description: "Across various demographics and backgrounds", icon: TrendingUp },
    { number: "95%", label: "Success Rate", description: "Achieving therapeutic goals and positive outcomes", icon: Award },
    { number: "25+", label: "Research Publications", description: "Peer-reviewed academic work and contributions", icon: BookOpen }
  ];

  return (
    <section className="section-space">
      <div className="container-shell">
        <div className="overflow-hidden rounded-[36px] border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(22,78,99,0.20),_transparent_40%),linear-gradient(135deg,_rgba(16,24,40,0.98),_rgba(35,58,86,0.94))] px-6 py-10 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-8 sm:py-12 lg:px-10 lg:py-14">
        <div className="text-center space-y-4 mb-12">
          <h2 className="font-display text-4xl sm:text-5xl text-white">Proven Results, Measurable Impact</h2>
          <p className="text-lg max-w-2xl mx-auto text-white/80">
            Evidence-based approaches with documented outcomes for individuals, couples, and institutions
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-white/15 bg-white/10 p-6 text-center backdrop-blur-sm">
                <div className="font-display text-3xl text-white mb-2">{metric.number}</div>
                <div className="font-semibold text-white mb-1">{metric.label}</div>
                <div className="text-sm text-white/75">{metric.description}</div>
              </Card>
            </motion.div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
