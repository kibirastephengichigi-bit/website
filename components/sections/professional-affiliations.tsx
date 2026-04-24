import Link from "next/link";
import { ExternalLink, Users, Globe, BookOpen, Award, Brain } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const affiliations = [
  {
    name: "BeautifulMind Consultants",
    role: "Co-founder",
    description: "Kenyan mental health social enterprise",
    url: "https://beautifulmind.cc/",
    icon: Brain,
    color: "emerald"
  },
  {
    name: "Society for Research in Child Development",
    role: "Governing Council Member",
    description: "SRCD Governing Council",
    url: "https://www.srcd.org/about-us/who-we-are/governing-council",
    icon: Users,
    color: "blue"
  },
  {
    name: "European Association of Personality Psychology",
    role: "Africa Regional Representative",
    description: "EAPP Regional Promoter",
    url: "https://eapp.org/organization/regional-promoters/",
    icon: Globe,
    color: "purple"
  },
  {
    name: "International Society for the Study of Behavioral Development",
    role: "E-newsletter Editor",
    description: "ISSBD Publications",
    url: "https://issbd.org/publications-2/",
    icon: BookOpen,
    color: "orange"
  },
  {
    name: "Frontiers in Psychology",
    role: "Review Editor",
    description: "Editorial Board Member",
    url: "https://loop.frontiersin.org/people/828729/editorial",
    icon: Award,
    color: "red"
  },
  {
    name: "Frontiers in Reproductive Health",
    role: "Review Editor",
    description: "Editorial Board Member",
    url: "https://loop.frontiersin.org/people/828729/editorial",
    icon: Award,
    color: "pink"
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
          {affiliations.map((affiliation, index) => {
            const colors = getColorClasses(affiliation.color);
            const Icon = affiliation.icon;
            
            return (
              <Card 
                key={index}
                className={`group relative overflow-hidden border ${colors.border} ${colors.bg} p-6 transition-all duration-300 hover:scale-105 ${colors.hover} hover:shadow-xl cursor-pointer`}
              >
                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.iconBg} text-white shadow-lg`}>
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
                    {affiliation.description}
                  </p>
                  
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
