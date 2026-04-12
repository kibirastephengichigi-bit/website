"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen, Download, Brain, Users, Award, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { siteContent } from "@/lib/content/site-content";

// Floating elements data
const floatingElements = [
  { icon: Brain, x: 15, y: 20, delay: 0, size: 24 },
  { icon: Users, x: 85, y: 15, delay: 1, size: 28 },
  { icon: Award, x: 10, y: 70, delay: 2, size: 26 },
  { icon: Heart, x: 90, y: 75, delay: 0.5, size: 22 },
  { icon: BookOpen, x: 75, y: 45, delay: 1.5, size: 30 },
];

export function InteractiveHeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Typewriter effect for headline
  const headline = siteContent.hero.headline;
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (isVisible && isTyping) {
      if (displayedText.length < headline.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(headline.slice(0, displayedText.length + 1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        setIsTyping(false);
      }
    }
  }, [displayedText, headline, isVisible, isTyping]);

  // Staggered text animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-accent/5"
    >
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{ y }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/5 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-accent/10" />
      </motion.div>

      {/* Floating Elements */}
      {floatingElements.map((element, index) => {
        const Icon = element.icon;
        const parallaxX = useTransform(
          scrollYProgress,
          [0, 1],
          [0, (mousePosition.x - 0.5) * 20]
        );
        const parallaxY = useTransform(
          scrollYProgress,
          [0, 1],
          [0, (mousePosition.y - 0.5) * 15]
        );

        return (
          <motion.div
            key={index}
            className="absolute pointer-events-none"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              x: parallaxX,
              y: parallaxY,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [0.8, 1, 0.8],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 6,
              delay: element.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="rounded-full bg-accent/10 p-3 backdrop-blur-sm border border-accent/20">
              <Icon className="text-accent" size={element.size} />
            </div>
          </motion.div>
        );
      })}

      <div className="container-shell relative z-10 flex min-h-screen items-center">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          {/* Content */}
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onAnimationComplete={() => setIsVisible(true)}
          >
            <motion.div variants={itemVariants}>
              <Badge className="text-sm">{siteContent.hero.eyebrow}</Badge>
            </motion.div>

            <div className="space-y-6">
              <motion.h1
                className="max-w-4xl font-display text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
                variants={itemVariants}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={displayedText}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-gradient-to-r from-foreground via-foreground to-accent bg-clip-text text-transparent"
                  >
                    {displayedText}
                    {isTyping && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="text-accent"
                      >
                        |
                      </motion.span>
                    )}
                  </motion.span>
                </AnimatePresence>
              </motion.h1>

              <motion.p
                className="max-w-2xl text-lg leading-8 text-muted-foreground"
                variants={itemVariants}
              >
                {siteContent.hero.subheadline}
              </motion.p>
            </div>

            <motion.div
              className="flex flex-wrap gap-4"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild size="lg" className="group relative overflow-hidden">
                  <Link href={siteContent.hero.primaryCta.href}>
                    <span className="relative z-10">{siteContent.hero.primaryCta.label}</span>
                    <motion.div
                      className="absolute inset-0 bg-accent/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild size="lg" variant="outline" className="group">
                  <Link href={siteContent.hero.secondaryCta.href}>
                    <Download className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    {siteContent.hero.secondaryCta.label}
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid gap-4 sm:grid-cols-3"
              variants={itemVariants}
            >
              {[
                "Licensed consultant psychologist",
                "Head of Department, CUEA Psychology",
                "Researcher in decolonization and thanatology",
              ].map((item, index) => (
                <motion.div
                  key={item}
                  className="rounded-3xl border border-border/70 bg-white/70 dark:bg-white/5 p-4 text-sm text-muted-foreground shadow-soft backdrop-blur-sm"
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(var(--accent), 0.05)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              className="absolute inset-0 translate-x-6 translate-y-8 rounded-[32px] bg-accent/10"
              style={{
                x: useTransform(mousePosition.x, [0, 1], [-10, 10]),
                y: useTransform(mousePosition.y, [0, 1], [-10, 10]),
              }}
            />
            <motion.div
              className="relative overflow-hidden rounded-[32px] border border-border/70 bg-white p-4 shadow-soft"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                style={{
                  x: useTransform(mousePosition.x, [0, 1], [-5, 5]),
                  y: useTransform(mousePosition.y, [0, 1], [-5, 5]),
                }}
              >
                <Image
                  src="/assets/people/hero.jpeg"
                  alt="Dr. Stephen Asatsa"
                  width={900}
                  height={1200}
                  className="h-[560px] w-full rounded-[24px] object-cover object-top"
                  priority
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-xs font-medium">Scroll to explore</span>
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>

      {/* Mouse Follow Glow Effect */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(var(--accent), 0.03), transparent 40%)`,
        }}
      />
    </section>
  );
}