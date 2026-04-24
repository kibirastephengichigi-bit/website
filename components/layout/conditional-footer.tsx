"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./site-footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on admin pages
  if (pathname === "/admin-signup" || pathname.startsWith("/admin")) {
    return null;
  }
  
  return <SiteFooter />;
}
