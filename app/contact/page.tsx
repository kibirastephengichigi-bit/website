import Link from "next/link";

import { ContactForm } from "@/components/forms/contact-form";
import { SectionHeading } from "@/components/layout/section-heading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/site";
import { siteContent } from "@/lib/content/site-content";

export const metadata = createMetadata("Contact", "Contact Dr. Stephen Asatsa for consultations, collaboration, or media inquiries.", "/contact");
export const revalidate = 3600;

export default function ContactPage() {
  return (
    <section className="section-space">
      <div className="container-shell space-y-10">
        <SectionHeading
          eyebrow="Contact"
          title="Get in touch for therapy, consulting, research, or speaking."
          description="The contact details below come directly from the current site, now presented in a cleaner responsive contact experience."
        />
        <div className="space-y-8">
          {/* Contact Details Section - Top */}
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 md:p-12">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-blue-200/30 to-purple-200/30 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-200/30 to-pink-200/30 blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Get in Touch
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Reach out for consultations, research collaboration, or speaking engagements
                </p>
              </div>
              
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Address</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {siteContent.contact.addressLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Phone</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {siteContent.contact.phones.map((phone) => (
                      <p key={phone}>{phone}</p>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">WhatsApp</h3>
                  <Link href={siteContent.contact.whatsapp} className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                    Start WhatsApp chat
                  </Link>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 mt-8">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Social
                  </h3>
                  <div className="space-y-2">
                    {siteContent.contact.socialLinks.map((item) => (
                      <Link key={item.label} href={item.href} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Academic Profiles
                  </h3>
                  <div className="space-y-2">
                    {siteContent.externalProfiles.map((item) => (
                      <Link key={item.label} href={item.href} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Map Section */}
          <Card className="overflow-hidden p-3 shadow-xl">
            <iframe
              src={siteContent.contact.mapEmbed}
              title="Map"
              className="h-[400px] w-full rounded-[22px] border-0"
              loading="lazy"
            />
          </Card>
          
          {/* Contact Form Section - Bottom */}
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-50 to-gray-100 p-8 md:p-12">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 h-40 w-40 rounded-full bg-gradient-to-br from-blue-100/20 to-purple-100/20 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-gradient-to-tl from-indigo-100/20 to-pink-100/20 blur-2xl"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-700 to-gray-900 bg-clip-text text-transparent mb-4">
                  Send a Message
                </h2>
                <p className="text-lg text-muted-foreground">
                  We'll respond as quickly as possible to your inquiry
                </p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-xl">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <Card className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Booking</p>
            <h2 className="font-display text-4xl sm:text-5xl">Get in touch with Dr. Stephen.</h2>
            <p className="max-w-3xl text-muted-foreground">
              The original site includes a Calendly booking flow. Version 2 keeps that path front and center while adding a cleaner consultation journey.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href={siteContent.contact.bookingUrl}>Open Booking</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Contact</Link>
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
