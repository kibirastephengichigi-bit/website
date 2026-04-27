"use client";

import Image from "next/image";
import { siteContent } from "@/lib/content/site-content";
import { useState, useEffect } from "react";
import { BookOpen, Globe, Brain, Target, Award, Sparkles } from "lucide-react";

const keyPoints = [
  {
    icon: BookOpen,
    title: "Research Advocacy",
    description: "Strong advocate for indigenization of psychological practice and decolonization of psychology"
  },
  {
    icon: Globe,
    title: "Global Impact",
    description: "Serves on governing councils and editorial boards for international organizations"
  },
  {
    icon: Brain,
    title: "Research Focus",
    description: "Indigenous knowledge systems, Thanatology, Cultural evolution, and behavioral development"
  }
];

export function ParallaxAboutSection() {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  return (
    <section id="who-we-are" className="py-12 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container-shell relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2 className="font-display text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Who We Are
                </h2>
              </div>
            </div>

            <div className="space-y-3 text-slate-600 leading-relaxed text-base">
              {siteContent.aboutFull.map((paragraph, index) => (
                <p key={index} className="hover:text-slate-900 transition-colors">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Interactive Key Points */}
            <div className="space-y-3 pt-2">
              {keyPoints.map((point, index) => (
                <div
                  key={index}
                  className={`
                    group relative p-3 rounded-lg border border-slate-200 bg-white
                    transition-all duration-300 cursor-pointer
                    ${hoveredPoint === index ? 'transform scale-102 shadow-md border-blue-300' : 'hover:shadow-sm'}
                  `}
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                        bg-gradient-to-br from-blue-500 to-indigo-600
                        transition-all duration-300
                        ${hoveredPoint === index ? 'scale-110 rotate-6' : 'scale-100'}
                      `}
                    >
                      <point.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1 text-sm">{point.title}</h3>
                      <p className="text-xs text-slate-600">{point.description}</p>
                    </div>
                  </div>
                  {hoveredPoint === index && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-indigo-500/5 pointer-events-none" />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2">
              <blockquote className="border-l-4 border-blue-500 pl-4 italic bg-gradient-to-r from-blue-50 to-white p-3 rounded-r-lg">
                <p className="text-base mb-1 text-slate-800">"{siteContent.quote.text}"</p>
                <cite className="text-xs font-medium text-blue-600">{siteContent.quote.author}</cite>
              </blockquote>
            </div>
          </div>

          <div className="relative">
            <div className="relative">
              <div className="absolute -top-3 -right-3 h-24 w-24 rounded-full bg-blue-200/30 animate-pulse" />
              <div className="absolute -bottom-3 -left-3 h-20 w-20 rounded-full bg-indigo-200/30 animate-pulse" style={{ animationDelay: '0.5s' }} />

              <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-3 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl" />
                <Image
                  src="/assets/people/asatsa.webp"
                  alt="Dr. Stephen Asatsa"
                  width={500}
                  height={700}
                  sizes="(max-width: 1024px) 100vw, 38vw"
                  className="w-full rounded-xl object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-full shadow-md flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span className="font-semibold text-xs">Expert Psychologist</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
