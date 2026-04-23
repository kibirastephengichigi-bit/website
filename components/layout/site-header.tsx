"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { siteContent } from "@/lib/content/site-content";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/research", label: "Research" },
  { href: "/scholars-workbench", label: "Scholars Workbench" },
  { href: "/blog", label: "Insights" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { data: session, status } = useSession();
  const isSignedIn = Boolean(session?.user);

  function handleSignOut() {
    void signOut({ callbackUrl: "/" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm">
            <Image src="/assets/branding/logo.png" alt="Stephen Asatsa logo" width={48} height={48} className="h-10 w-10 object-contain" />
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
            <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0" title="Scholars Workbench">
              <a href="https://github.com/Cyberverse-cent0/Schoolars-work-bench.git" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                <Github className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <ThemeToggle />
          {isSignedIn ? (
            <>
              <Button asChild size="sm">
                <a href={siteContent.contact.bookingUrl} target="_blank" rel="noopener noreferrer">Book Now</a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/account">Account</Link>
              </Button>
              <Button size="sm" variant="ghost" type="button" onClick={handleSignOut} disabled={status === "loading"}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm">
                <a href={siteContent.contact.bookingUrl} target="_blank" rel="noopener noreferrer">Book Now</a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/signin">Sign in with Google</Link>
              </Button>
            </>
          )}
        </nav>

        <details className="group lg:hidden">
          <summary className="inline-flex list-none rounded-full border border-border p-3 marker:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation</span>
          </summary>
          <div className="absolute right-4 top-[calc(100%+0.75rem)] w-[min(22rem,calc(100vw-2rem))] rounded-[28px] border border-border/80 bg-background p-5 shadow-2xl">
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-medium">
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
                <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0" title="Scholars Workbench">
                  <a href="https://github.com/Cyberverse-cent0/Schoolars-work-bench.git" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <ThemeToggle />
              {isSignedIn ? (
                <>
                  <Button asChild size="sm">
                    <a href={siteContent.contact.bookingUrl} target="_blank" rel="noopener noreferrer">Book Now</a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/account">Account</Link>
                  </Button>
                  <Button size="sm" variant="ghost" type="button" onClick={handleSignOut} disabled={status === "loading"}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="sm">
                    <a href={siteContent.contact.bookingUrl} target="_blank" rel="noopener noreferrer">Book Now</a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/signin">Sign in</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
