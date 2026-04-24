import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CalendarDays, ChevronDown, Download, ExternalLink, Mail, PhoneCall } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteContent } from "@/lib/content/site-content";
import { siteConfig } from "@/lib/site";

export function InteractiveHeroSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8f3ea_0%,#fcfaf6_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(180,140,92,0.10),transparent_28%)]" />

      <div className="container-shell relative z-10 py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          {/* Content First - Better for mobile and SEO */}
          <div className="space-y-8 lg:space-y-10 order-2 lg:order-1">
            {/* Eyebrow and badges */}
            <div className="space-y-4">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-600 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {siteContent.hero.eyebrow}
              </p>
              
              <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 text-xs font-bold text-emerald-700 shadow-sm hover:shadow-md transition-all duration-200">
                  Licensed Psychologist
                </span>
                <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 text-xs font-bold text-blue-700 shadow-sm hover:shadow-md transition-all duration-200">
                  Senior Lecturer
                </span>
                <span className="inline-flex items-center rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 text-xs font-bold text-purple-700 shadow-sm hover:shadow-md transition-all duration-200">
                  Research Leader
                </span>
              </div>
            </div>

            {/* First Section - Headline with Image */}
            <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="space-y-4">
                <h1 className="font-display text-4xl leading-[0.95] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent sm:text-5xl lg:text-6xl xl:text-7xl font-bold">
                  {siteContent.hero.headline}
                </h1>
              </div>
              
              {/* Image beside headline */}
              <div className="relative order-first lg:order-last">
                <div className="relative">
                  {/* Background glow effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 rounded-[32px] blur-2xl opacity-60" />
                  
                  {/* Main image */}
                  <div className="relative aspect-[4/3] lg:aspect-[3/4] rounded-[24px] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                            <div className="w-6 h-6 bg-emerald-500 rounded-full"></div>
                          </div>
                        </div>
                        <p className="text-white/90 font-semibold">Dr. Stephen Asatsa</p>
                        <p className="text-white/70 text-sm">Professional Psychology</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spacer between sections */}
            <div className="h-8 lg:h-12"></div>

            {/* Second Section - Description */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <p className="max-w-4xl text-lg leading-8 text-slate-700 lg:text-xl font-medium">
                Dr. Stephen Asatsa is a senior Lecturer and Head of Department of Psychology at the Catholic University of Eastern Africa with extensive experience in academic strategy and research. Proven track record as a Lecturer of Psychology, excelling in teaching, research, and student mentorship. He is an experienced Consultant Psychologist registered and licensed by the Kenya Counselors and Psychologists Board and co-founder of BeautifulMind Consultants, a Kenyan mental health social enterprise.
              </p>
              
              <div className="max-w-4xl text-base leading-7 text-slate-600 space-y-3">
                <p>• <strong>Research Advocacy:</strong> Strong advocate for indigenization of psychological practice and decolonization of psychology</p>
                <p>• <strong>Global Impact:</strong> Serves on governing councils and editorial boards for international organizations</p>
                <p>• <strong>Research Focus:</strong> Indigenous knowledge systems, Thanatology, Cultural evolution, and behavioral development</p>
              </div>
            </div>

            {/* Call to action buttons */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
                >
                  <a href={siteContent.contact.bookingUrl} target="_blank" rel="noopener noreferrer">
                    <CalendarDays className="mr-2 h-5 w-5" />
                    {siteContent.hero.primaryCta.label}
                  </a>
                </Button>
                
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                >
                  <a href={siteContent.hero.publicationsCta.href} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    {siteContent.hero.publicationsCta.label}
                  </a>
                </Button>
              </div>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                >
                  <Link href="#who-we-are">Explore Profile</Link>
                </Button>
                
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105"
                >
                  <Link href={siteContent.hero.secondaryCta.href}>
                    <Download className="mr-2 h-5 w-5" />
                    {siteContent.hero.secondaryCta.label}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
              <div className="group relative rounded-[24px] border border-emerald-500/30 bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-50 p-6 shadow-lg hover:shadow-emerald-500/30 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 animate-pulse" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      {/* Floating particles */}
                      <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-300 opacity-0 group-hover:opacity-100 animate-ping" />
                      <div className="absolute -bottom-1 -left-1 h-1.5 w-1.5 rounded-full bg-teal-300 opacity-0 group-hover:opacity-100 animate-ping animation-delay-200" />
                      
                      <BadgeCheck className="h-6 w-6 relative z-10 group-hover:animate-bounce" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-emerald-900 group-hover:text-emerald-800 transition-colors duration-300 flex items-center gap-2">
                        Trusted Credentials
                        <div className="h-2 w-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 animate-pulse" />
                      </h3>
                      <p className="text-sm text-emerald-700 group-hover:text-emerald-600 transition-colors duration-300 mt-1">
                        CUEA leadership, licensed practice, international research.
                      </p>
                      
                      {/* Interactive verification badges */}
                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Licensed
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-medium">
                          <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse animation-delay-300" />
                          Certified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-[24px] border border-blue-500/30 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 p-6 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 animate-pulse" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
                </div>
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <h3 className="text-sm font-bold text-blue-900 group-hover:text-blue-800 transition-colors duration-300">
                      Contact Information
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    <a 
                      href={`tel:${siteContent.contact.phones[0].replace(/\s+/g, "")}`} 
                      className="group/link flex items-center gap-3 text-blue-700 hover:text-blue-900 transition-all duration-300 hover:translate-x-1"
                    >
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md group-hover/link:shadow-lg group-hover/link:scale-110 group-hover/link:rotate-6 transition-all duration-300">
                        {/* Animated ring effect */}
                        <div className="absolute -inset-1 rounded-xl bg-blue-500/20 opacity-0 group-hover/link:opacity-100 animate-ping" />
                        
                        <PhoneCall className="h-5 w-5 relative z-10 group-hover/link:animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-base">{siteContent.contact.phones[0]}</span>
                        <span className="block text-xs text-blue-600 group-hover/link:text-blue-500 transition-colors">
                          Click to call • Available 24/7
                        </span>
                      </div>
                      <div className="opacity-0 group-hover/link:opacity-100 transition-opacity duration-300">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </a>
                    
                    <a 
                      href={`mailto:${siteConfig.email}`} 
                      className="group/mail flex items-center gap-3 text-blue-700 hover:text-blue-900 transition-all duration-300 hover:translate-x-1"
                    >
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md group-hover/mail:shadow-lg group-hover/mail:scale-110 group-hover/mail:-rotate-6 transition-all duration-300">
                        {/* Animated ring effect */}
                        <div className="absolute -inset-1 rounded-xl bg-indigo-500/20 opacity-0 group-hover/mail:opacity-100 animate-ping" />
                        
                        <Mail className="h-5 w-5 relative z-10 group-hover/mail:animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-base">{siteConfig.email}</span>
                        <span className="block text-xs text-blue-600 group-hover/mail:text-blue-500 transition-colors">
                          Click to email • Quick response
                        </span>
                      </div>
                      <div className="opacity-0 group-hover/mail:opacity-100 transition-opacity duration-300">
                        <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                          <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </a>
                  </div>
                  
                  {/* Quick action buttons */}
                  <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    <button className="flex-1 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-colors">
                      Schedule Call
                    </button>
                    <button className="flex-1 px-3 py-2 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-medium hover:bg-indigo-200 transition-colors">
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Second - Better visual hierarchy */}
          <div className="relative order-1 lg:order-2 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
            <div className="relative">
              {/* Background glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 rounded-[32px] blur-2xl opacity-60" />
              
              {/* Main image container */}
              <div className="relative overflow-hidden rounded-[32px] border border-white/20 bg-white/10 backdrop-blur-sm shadow-[0_25px_50px_rgba(16,185,129,0.15)]">
                <div className="aspect-[3/4] lg:aspect-[4/5]">
                  <Image
                    src="/assets/people/hero.webp"
                    alt="Dr. Stephen Asatsa"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    className="object-cover object-top"
                    priority
                  />
                </div>
                
                {/* Overlay gradient for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
              
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-3 shadow-lg animate-bounce">
                <BadgeCheck className="h-6 w-6 text-white" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-3 shadow-lg animate-pulse">
                <PhoneCall className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground">
        <div className="flex animate-[bounce_2s_ease-in-out_infinite] flex-col items-center gap-2">
          <span className="text-xs font-medium">Scroll to explore</span>
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}
