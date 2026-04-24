"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { siteContent } from "@/lib/content/site-content";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/research", label: "Research" },
  { href: "/blog", label: "Insights" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { data: session, status } = useSession({
    required: false,
    onUnauthenticated() {
      return;
    },
  });
  const isSignedIn = Boolean(session?.user);

  function handleSignOut() {
    void signOut({ callbackUrl: "/" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="container-shell flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md group-hover:shadow-lg transition-shadow">
            <svg
              width="32"
              height="32"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
            >
              <circle cx="20" cy="20" r="18" fill="white" fillOpacity="0.15"/>
              <path d="M20 8C14.5 8 10 12.5 10 18C10 21.5 12 24.5 15 26C15 27 15 28 16 29H24C25 28 25 27 25 26C28 24.5 30 21.5 30 18C30 12.5 25.5 8 20 8Z" fill="white" fillOpacity="0.9"/>
              <text x="20" y="24" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="serif">SA</text>
            </svg>
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              Dr. Stephen Asatsa
            </p>
            <p className="text-xs text-muted-foreground">Psychology & Research</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Scholar Forge Button */}
          <Button 
            asChild 
            size="sm" 
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <a href="http://localhost:4500" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
              <span className="text-sm">🎓</span>
              <span className="hidden sm:inline">Scholar Forge</span>
            </a>
          </Button>

          {/* Book Now Button */}
          <Button 
            asChild 
            size="sm"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <a href={siteContent.contact.bookingUrl} target="_blank" rel="noopener noreferrer">
              Book Now
            </a>
          </Button>

          {/* Admin Sign Up (only when not signed in) */}
          {!isSignedIn && (
            <Button 
              asChild 
              size="sm" 
              variant="outline"
              className="border-purple-500/30 text-purple-700 hover:bg-purple-50"
            >
              <Link href="/admin-signup">Admin</Link>
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <details className="group lg:hidden">
            <summary className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 hover:bg-muted cursor-pointer marker:none">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </summary>
            <div className="absolute right-2 top-[calc(100%+0.5rem)] w-64 rounded-lg border border-border/50 bg-background p-4 shadow-lg">
              <div className="flex flex-col gap-3">
                {links.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-border/50 pt-3 flex flex-col gap-2">
                  <Button 
                    asChild 
                    size="sm" 
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
                  >
                    <a href="http://localhost:4500" target="_blank" rel="noopener noreferrer">
                      🎓 Scholar Forge
                    </a>
                  </Button>
                  <Button 
                    asChild 
                    size="sm"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
                  >
                    <a href={siteContent.contact.bookingUrl} target="_blank" rel="noopener noreferrer">
                      Book Now
                    </a>
                  </Button>
                  {!isSignedIn && (
                    <Button 
                      asChild 
                      size="sm" 
                      variant="outline"
                      className="w-full border-purple-500/30 text-purple-700"
                    >
                      <Link href="/admin-signup">Admin Sign Up</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
