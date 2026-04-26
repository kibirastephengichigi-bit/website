import { createMetadata } from "@/lib/site";

export const metadata = createMetadata("About", "Full professional bio and affiliations for Dr. Stephen Asatsa.", "/about");
export const revalidate = 3600;

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
