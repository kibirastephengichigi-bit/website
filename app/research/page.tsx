import Link from "next/link";
import Image from "next/image";

import { SectionHeading } from "@/components/layout/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SaveItemButton } from "@/components/user/save-item-button";
import { siteContent } from "@/lib/content/site-content";
import { createMetadata } from "@/lib/site";
import { EnhancedCaseStudies } from "@/components/sections/enhanced-case-studies";
import { ResearchContent } from "@/components/research/research-content";

export const metadata = createMetadata(
  "Research and Publications",
  "Filterable research, publications, grants, and talks.",
  "/research",
);
export const revalidate = 3600;

export default function ResearchPage() {
  return (
    <>
      <section className="section-space">
        <div className="container-shell space-y-12">
          <SectionHeading
            eyebrow="Research"
            title="Projects, publications, grants, conferences, and invited talks."
            description="Explore my academic contributions through an organized, color-coded interface for easy navigation."
          />
          <ResearchContent />
        </div>
      </section>

      <EnhancedCaseStudies />
    </>
  );
}
