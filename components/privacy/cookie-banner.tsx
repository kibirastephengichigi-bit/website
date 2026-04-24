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
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Check if consent already given
    const hasConsent = getCookie(CONSENT_COOKIE);
    
    if (!hasConsent) {
      // Delay rendering to save bandwidth and improve initial load
      const renderDelay = setTimeout(() => {
        setShouldRender(true);
        
        // Additional delay before showing for smooth entrance
        const showDelay = setTimeout(() => {
          setVisible(true);
        }, 100);
        
        return () => clearTimeout(showDelay);
      }, 3000); // Show after 3 seconds of page load
      
      return () => clearTimeout(renderDelay);
    }
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

  // Don't render anything if consent already given or if not ready to render yet
  if (!shouldRender) {
    return null;
  }

  return (
    <div 
      className={`
        fixed inset-x-0 bottom-6 z-50 px-4 sm:px-6 lg:px-8
        transition-all duration-700 ease-out
        ${visible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8 pointer-events-none'
        }
      `}
    >
      <div className={`
        mx-auto max-w-5xl rounded-[32px] border border-white/10 
        bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 
        p-6 text-white shadow-[0_25px_50px_-12px] backdrop-blur-xl 
        lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8
        transition-all duration-500 delay-100
        ${visible 
          ? 'scale-100 opacity-100' 
          : 'scale-95 opacity-0'
        }
      `}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`
              h-2 w-2 rounded-full bg-emerald-400
              transition-all duration-300
              ${visible ? 'animate-pulse' : 'opacity-0'}
            `} />
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
              Privacy & Cookies
            </p>
          </div>
          <p className="text-sm leading-7 text-white/90 font-medium">
            We use essential cookies for site functionality and optional analytics to improve your experience. 
            Read our{" "}
            <Link 
              href="/privacy-cookies" 
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 decoration-emerald-400/50 hover:decoration-emerald-300/80 transition-all duration-200"
            >
              privacy policy
            </Link>{" "}
            for details.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Button
            variant="ghost"
            className={`
              border border-white/20 bg-white/5 text-white/80 
              hover:bg-white/10 hover:text-white hover:border-white/30 
              backdrop-blur-sm transition-all duration-300 hover:scale-105
              ${visible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
              transition-delay-200
            `}
            onClick={() => accept("essential")}
          >
            <span className="relative">
              Essential only
              <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-blue-400" />
            </span>
          </Button>
          <Button 
            className={`
              bg-gradient-to-r from-emerald-500 to-teal-600 
              hover:from-emerald-600 hover:to-teal-700 text-white 
              border border-emerald-400/20 shadow-lg hover:shadow-emerald-500/25 
              transition-all duration-300 hover:scale-105
              ${visible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
              transition-delay-300
            `}
            onClick={() => accept("all")}
          >
            <span className="flex items-center gap-2">
              Accept all
              <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

