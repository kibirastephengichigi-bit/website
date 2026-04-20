import type { Metadata } from "next";

import { absoluteUrl } from "@/lib/utils";

export const siteConfig = {
  name: "Dr. Stephen Asatsa",
  shortName: "Stephen Asatsa",
  description:
    "Modern psychological services, research leadership, and academic mentorship for individuals, institutions, and organizations.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  email: "hello@stephenasatsa.com",
};

export function createMetadata(
  title: string,
  description = siteConfig.description,
  path = "/",
): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: siteConfig.name,
      images: [
        {
          url: absoluteUrl("/assets/people/hero.jpeg"),
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/assets/people/hero.jpeg")],
    },
  };
}
