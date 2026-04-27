"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Phone, MapPin, Calendar, ShieldCheck, GraduationCap, Building2, Facebook, Twitter, Instagram, Linkedin, ExternalLink, ArrowUp, ChevronRight, Copy, Check } from "lucide-react";

import { siteContent } from "@/lib/content/site-content";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(text);
      setTimeout(() => setCopiedPhone(null), 2000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="container-shell relative z-10">
        <div className="grid gap-12 py-16 md:grid-cols-3 lg:gap-16">
          {/* About Section */}
          <div className="space-y-6 group">
            <div className="space-y-2">
              <h2 className="font-display text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:to-teal-200 transition-all duration-500">
                Dr. Stephen Asatsa
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full group-hover:w-32 transition-all duration-500" />
            </div>
            <p className="text-base leading-relaxed text-slate-300 max-w-sm group-hover:text-slate-200 transition-colors duration-300">
              Professional psychological services, research leadership, and mentorship rooted in rigor, compassion, and cultural relevance.
            </p>
          </div>

          {/* Contact Section */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg uppercase tracking-wider text-emerald-400 flex items-center gap-2 hover:text-emerald-300 transition-colors">
              <Mail className="w-5 h-5 hover:scale-110 transition-transform" />
              Reach Out
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group cursor-pointer hover:bg-slate-700/30 p-2 rounded-lg transition-all duration-300">
                <MapPin className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <p className="text-slate-300 group-hover:text-white transition-colors">
                  {siteContent.contact.addressLines.join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-3 group">
                <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="flex-1 flex items-center justify-between">
                  <Link 
                    href={`mailto:${siteConfig.email}`} 
                    className="text-slate-300 hover:text-emerald-400 transition-colors group-hover:underline"
                  >
                    {siteConfig.email}
                  </Link>
                  <button
                    onClick={() => copyToClipboard(siteConfig.email, 'email')}
                    className="p-1.5 rounded-md hover:bg-slate-700 transition-colors"
                    title="Copy email"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400 hover:text-white" />}
                  </button>
                </div>
              </div>
              {siteContent.contact.phones.map((phone) => (
                <div key={phone} className="flex items-center gap-3 group">
                  <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-slate-300 group-hover:text-white transition-colors">{phone}</span>
                    <button
                      onClick={() => copyToClipboard(phone, 'phone')}
                      className="p-1.5 rounded-md hover:bg-slate-700 transition-colors"
                      title="Copy phone number"
                    >
                      {copiedPhone === phone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400 hover:text-white" />}
                    </button>
                  </div>
                </div>
              ))}
              <Link 
                href={siteContent.contact.bookingUrl} 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-emerald-500/25 hover:scale-105 hover:-translate-y-0.5 group"
              >
                <Calendar className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Book a consultation
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Trust Signals & Social */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg uppercase tracking-wider text-emerald-400 flex items-center gap-2 hover:text-emerald-300 transition-colors">
              <ShieldCheck className="w-5 h-5 hover:scale-110 transition-transform" />
              Trust Signals
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-slate-300 group cursor-pointer hover:bg-slate-700/30 p-2 rounded-lg transition-all duration-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <p className="group-hover:text-white transition-colors">Licensed by Kenya Counselors and Psychologists Board</p>
              </div>
              <div className="flex items-start gap-3 text-slate-300 group cursor-pointer hover:bg-slate-700/30 p-2 rounded-lg transition-all duration-300">
                <GraduationCap className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <p className="group-hover:text-white transition-colors">Head of Department of Psychology, CUEA</p>
              </div>
              <div className="flex items-start gap-3 text-slate-300 group cursor-pointer hover:bg-slate-700/30 p-2 rounded-lg transition-all duration-300">
                <Building2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <p className="group-hover:text-white transition-colors">Co-founder, BeautifulMind Consultants</p>
              </div>
            </div>
            
            <div className="pt-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-4 hover:text-emerald-400 transition-colors">Connect</h4>
              <div className="flex gap-3">
                {siteContent.contact.socialLinks.map((item) => {
                  const iconMap: Record<string, any> = {
                    'Facebook': Facebook,
                    'Twitter': Twitter,
                    'X': Twitter,
                    'Instagram': Instagram,
                    'LinkedIn': Linkedin,
                  };
                  const Icon = iconMap[item.label] || ExternalLink;
                  return (
                    <Link 
                      key={item.label} 
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700/50 text-slate-300 hover:bg-emerald-500 hover:text-white transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/25"
                      aria-label={item.label}
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-700/50 py-6 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-center text-sm text-slate-400 hover:text-slate-300 transition-colors">
              © {new Date().getFullYear()} Dr. Stephen Asatsa. All rights reserved.
            </p>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-emerald-500 text-slate-300 hover:text-white rounded-lg transition-all duration-300 hover:scale-105 group"
              title="Scroll to top"
            >
              <span className="text-sm">Back to top</span>
              <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
