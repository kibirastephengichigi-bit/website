"use client";

import Link from "next/link";
import { Menu, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
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
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary px-3 py-2 text-xs font-bold uppercase tracking-[0.25em] text-primary-foreground">
            SA
          </div>
          <div>
            <p className="font-display text-2xl leading-none">Dr. Stephen Asatsa</p>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Psychology and Research
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2">
            {siteContent.contact.socialLinks.slice(0, 4).map((social) => {
              const Icon = social.label === "Facebook" ? Facebook : 
                          social.label === "Twitter" || social.label === "X" ? Twitter :
                          social.label === "Instagram" ? Instagram : 
                          social.label === "LinkedIn" ? Linkedin : null;
              if (!Icon) return null;
              return (
                <Button key={social.label} asChild size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <a href={social.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </a>
                </Button>
              );
            })}
          </div>
          <ThemeToggle />
          {session?.user ? (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href="/account">Account</Link>
              </Button>
              <Button size="sm" variant="ghost" onClick={() => void signOut({ callbackUrl: "/" })}>
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/signin">Sign in with Google</Link>
            </Button>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex rounded-full border border-border p-3 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open ? (
        <div className="border-t border-border/70 bg-background lg:hidden">
          <div className="container-shell flex flex-col gap-4 py-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-2">
              {siteContent.contact.socialLinks.slice(0, 4).map((social) => {
                const Icon = social.label === "Facebook" ? Facebook : 
                            social.label === "Twitter" || social.label === "X" ? Twitter :
                            social.label === "Instagram" ? Instagram : 
                            social.label === "LinkedIn" ? Linkedin : null;
                if (!Icon) return null;
                return (
                  <Button key={social.label} asChild size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <a href={social.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </a>
                  </Button>
                );
              })}
            </div>
            <ThemeToggle />
            {session?.user ? (
              <>
                <Button asChild size="sm" variant="outline">
                  <Link href="/account">Account</Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void signOut({ callbackUrl: "/" })}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button asChild size="sm">
                <Link href="/signin">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
