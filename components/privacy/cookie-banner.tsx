"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CONSENT_COOKIE = "site_cookie_consent";
const PREFERENCES_COOKIE = "site_cookie_preferences";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!getCookie(CONSENT_COOKIE));
  }, []);

  function accept(choice: "essential" | "all") {
    const preferences =
      choice === "all"
        ? { essential: true, analytics: true, marketing: true, preferences: true }
        : { essential: true, analytics: false, marketing: false, preferences: true };

    setCookie(CONSENT_COOKIE, choice, 60 * 60 * 24 * 365);
    setCookie(PREFERENCES_COOKIE, JSON.stringify(preferences), 60 * 60 * 24 * 365);
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4 sm:px-6 lg:px-8">
      <Card className="mx-auto grid max-w-5xl gap-4 border-border/70 bg-slate-950 p-5 text-white shadow-2xl lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">Cookies and privacy</p>
          <p className="text-sm leading-7 text-white/80">
            We use essential cookies for sign-in and site functionality, plus optional analytics and preference cookies
            if you choose to allow them. See our{" "}
            <Link href="/privacy-cookies" className="underline underline-offset-4">
              privacy and cookies page
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
            onClick={() => accept("essential")}
          >
            Essential only
          </Button>
          <Button onClick={() => accept("all")}>Accept all</Button>
        </div>
      </Card>
    </div>
  );
}

