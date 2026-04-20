"use client";

import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  label: string;
  duration?: number;
}

function AnimatedCounter({ value, suffix = "", label, duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        setCount(Math.floor(progress * value));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, value, duration]);

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="text-4xl font-display font-bold text-accent mb-2">
        {count}{suffix}
      </div>
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
    </motion.div>
  );
}

export function StatisticsSection() {
  const stats = [
    { value: 15, suffix: "+", label: "Years of Experience" },
    { value: 50, suffix: "+", label: "Publications" },
    { value: 1000, suffix: "+", label: "People Helped" },
    { value: 25, suffix: "+", label: "Research Projects" },
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-accent/5 via-background to-accent/5">
      <div className="container-shell">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl mb-4">Impact & Experience</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Years of dedicated service in psychology, research, and academic leadership
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <AnimatedCounter
              key={index}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              duration={2000 + index * 200}
            />
          ))}
        </div>
      </div>
    </section>
  );
}