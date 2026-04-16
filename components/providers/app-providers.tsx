"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

import { ThemeProvider } from "@/components/providers/theme-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  );
}
