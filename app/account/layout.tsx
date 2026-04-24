import type { Metadata } from "next";

import "@/app/globals.css";

import { SiteHeader } from "@/components/layout/site-header";
import { AppProviders } from "@/components/providers/app-providers";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `Account | ${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: "Manage your account settings and preferences",
};

export default function AccountLayout({
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
            {/* No footer for admin pages */}
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
