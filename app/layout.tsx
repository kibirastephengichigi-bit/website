import type { Metadata } from "next";

import "@/app/globals.css";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AppProviders } from "@/components/providers/app-providers";
import { CookieBanner } from "@/components/privacy/cookie-banner";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Psychology and Research`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            <div className="absolute inset-0 -z-10 bg-grid [background-size:20px_20px] opacity-[0.35]" />
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <CookieBanner />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
