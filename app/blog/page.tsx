import { SectionHeading } from "@/components/layout/section-heading";
import { BlogFilters } from "@/components/sections/blog-filters";
import { createMetadata } from "@/lib/site";
import { blogPosts } from "@/lib/content/blog-data";
import { siteContent } from "@/lib/content/site-content";

export const metadata = createMetadata("Blog and Insights", "Mental health, decolonizing psychology, thanatology, and research insights.", "/blog");

export default function BlogPage() {
  return (
    <section className="section-space">
      <div className="container-shell space-y-10">
        <SectionHeading
          eyebrow="Insights"
          title="A modern editorial hub for mental health, decolonizing psychology, thanatology, and research."
          description="This structure is ready for Prisma-backed publishing from the admin dashboard, with categories carried directly into the UI."
        />
        <BlogFilters posts={blogPosts} categories={siteContent.blogCategories} />
      </div>
    </section>
  );
}
