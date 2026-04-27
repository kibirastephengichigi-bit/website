"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Users, Globe, BookOpen, Award, Brain } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Affiliation {
  id: string;
  name: string;
  role: string;
  shortDescription: string;
  detailedDescription: string;
  url: string;
  icon: string;
  color: string;
  displayOrder: number;
}

const iconMap = {
  Brain,
  Users,
  Globe,
  BookOpen,
  Award
};

const fallbackAffiliations: Affiliation[] = [
  {
    id: "1",
    name: "BeautifulMind Consultants",
    role: "Co-founder",
    shortDescription: "Kenyan mental health social enterprise",
    detailedDescription: "Co-founded by Dr. Stephen Asatsa, BeautifulMind provides training, counseling, and consulting in Mental Health and Psycho-Social Support (MHPSS) across East Africa and Europe, drawing on traditional, mainstream, and alternative approaches.",
    url: "https://beautifulmind.cc/",
    icon: "Brain",
    color: "emerald",
    displayOrder: 1
  },
  {
    id: "2",
    name: "Society for Research in Child Development",
    role: "Governing Council Member",
    shortDescription: "SRCD Governing Council",
    detailedDescription: "Dr. Asatsa serves as a Governing Council Member (2023-2029) representing the Catholic University of Eastern Africa, contributing to governance and policy decisions in child development research globally.",
    url: "https://www.srcd.org/about-us/who-we-are/governing-council",
    icon: "Users",
    color: "blue",
    displayOrder: 2
  },
  {
    id: "3",
    name: "European Association of Personality Psychology",
    role: "Africa Regional Representative",
    shortDescription: "EAPP Regional Promoter",
    detailedDescription: "As Africa Regional Representative, Dr. Asatsa promotes personality psychology across the continent, recruits new members, and ensures African perspectives are well-represented in European personality psychology discourse.",
    url: "https://eapp.org/organization/regional-promoters/",
    icon: "Globe",
    color: "blue",
    displayOrder: 3
  },
  {
    id: "4",
    name: "International Society for the Study of Behavioral Development",
    role: "E-newsletter Editor",
    shortDescription: "ISSBD Publications",
    detailedDescription: "Dr. Asatsa serves as E-newsletter Editor for ISSBD, managing publications and disseminating research on behavioral development to the international academic community.",
    url: "https://issbd.org/publications-2/",
    icon: "BookOpen",
    color: "green",
    displayOrder: 4
  },
  {
    id: "5",
    name: "Frontiers in Psychology",
    role: "Review Editor",
    shortDescription: "Editorial Board Member",
    detailedDescription: "As Review Editor for Frontiers in Psychology, Dr. Asatsa contributes to the peer review process, ensuring quality research publication in the field of psychology.",
    url: "https://loop.frontiersin.org/people/828729/editorial",
    icon: "Award",
    color: "blue",
    displayOrder: 5
  },
  {
    id: "6",
    name: "Frontiers in Reproductive Health",
    role: "Review Editor",
    shortDescription: "Editorial Board Member",
    detailedDescription: "Dr. Asatsa serves as Review Editor for Frontiers in Reproductive Health, contributing scholarly expertise to the editorial board of this specialized research journal.",
    url: "https://loop.frontiersin.org/people/828729/editorial",
    icon: "Award",
    color: "green",
    displayOrder: 6
  }
];

const getColorClasses = (color: string) => {
  const colors = {
    emerald: {
      bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
      border: "border-emerald-200/50",
      iconBg: "bg-emerald-500",
      iconColor: "text-emerald-600",
      text: "text-emerald-900",
      subtext: "text-emerald-700",
      hover: "hover:shadow-emerald-500/25"
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-emerald-50",
      border: "border-green-200/50",
      iconBg: "bg-green-500",
      iconColor: "text-green-600",
      text: "text-green-900",
      subtext: "text-green-700",
      hover: "hover:shadow-green-500/25"
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
      border: "border-blue-200/50",
      iconBg: "bg-blue-500",
      iconColor: "text-blue-600",
      text: "text-blue-900",
      subtext: "text-blue-700",
      hover: "hover:shadow-blue-500/25"
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-pink-50",
      border: "border-purple-200/50",
      iconBg: "bg-purple-500",
      iconColor: "text-purple-600",
      text: "text-purple-900",
      subtext: "text-purple-700",
      hover: "hover:shadow-purple-500/25"
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-red-50",
      border: "border-orange-200/50",
      iconBg: "bg-orange-500",
      iconColor: "text-orange-600",
      text: "text-orange-900",
      subtext: "text-orange-700",
      hover: "hover:shadow-orange-500/25"
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-pink-50",
      border: "border-red-200/50",
      iconBg: "bg-red-500",
      iconColor: "text-red-600",
      text: "text-red-900",
      subtext: "text-red-700",
      hover: "hover:shadow-red-500/25"
    },
    pink: {
      bg: "bg-gradient-to-br from-pink-50 to-rose-50",
      border: "border-pink-200/50",
      iconBg: "bg-pink-500",
      iconColor: "text-pink-600",
      text: "text-pink-900",
      subtext: "text-pink-700",
      hover: "hover:shadow-pink-500/25"
    }
  };
  return colors[color as keyof typeof colors] || colors.emerald;
};

export function ProfessionalAffiliations() {
  const [affiliations, setAffiliations] = useState<Affiliation[]>(fallbackAffiliations);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/affiliations')
      .then(res => res.json())
      .then(data => {
        if (data.affiliations && data.affiliations.length > 0) {
          setAffiliations(data.affiliations);
        }
      })
      .catch(err => {
        console.log('Using fallback affiliations data');
      });
  }, []);

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container-shell">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Professional Affiliations
          </h2>
          <p className="text-lg text-muted-foreground leading-8">
            Active involvement in leading psychological and academic organizations worldwide, 
            contributing to research, education, and mental health advocacy.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {affiliations.map((affiliation) => {
            const colors = getColorClasses(affiliation.color);
            const Icon = iconMap[affiliation.icon as keyof typeof iconMap] || Award;
            
            return (
              <Card 
                key={affiliation.id}
                className={`group relative overflow-hidden border ${colors.border} ${colors.bg} p-6 transition-all duration-300 hover:scale-105 ${colors.hover} hover:shadow-xl cursor-pointer`}
                onMouseEnter={() => setHoveredCard(affiliation.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.iconBg} text-white shadow-lg ${hoveredCard === affiliation.id ? 'animate-pulse' : ''}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-lg ${colors.text} group-hover:${colors.iconColor} transition-colors`}>
                        {affiliation.name}
                      </h3>
                      <p className={`text-sm font-medium ${colors.subtext} mt-1`}>
                        {affiliation.role}
                      </p>
                    </div>
                  </div>
                  
                  <p className={`text-sm ${colors.subtext} mb-4 leading-relaxed`}>
                    {affiliation.shortDescription}
                  </p>
                  
                  {/* Hover Tooltip */}
                  {hoveredCard === affiliation.id && (
                    <div className={`mb-4 p-3 rounded-lg ${colors.bg} border ${colors.border} animate-in fade-in slide-in-from-top-2 duration-300`}>
                      <p className={`text-xs ${colors.subtext} leading-relaxed`}>
                        {affiliation.detailedDescription}
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    asChild 
                    size="sm" 
                    className={`w-full bg-gradient-to-r ${colors.iconBg} hover:opacity-90 text-white border-0 transition-opacity`}
                  >
                    <a 
                      href={affiliation.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit Organization
                    </a>
                  </Button>
                </div>
                
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent" />
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/50 bg-background/80 backdrop-blur-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-sm text-muted-foreground">
              Active contributor to advancing psychological science and practice globally
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
