import { SectionHeading } from "@/components/layout/section-heading";
import { BlogFilters } from "@/components/sections/blog-filters";
import { auth } from "@/lib/auth";
import { createMetadata } from "@/lib/site";
import { blogPosts } from "@/lib/content/blog-data";
import { siteContent } from "@/lib/content/site-content";

export const metadata = createMetadata("Blog and Insights", "Mental health, decolonizing psychology, thanatology, and research insights.", "/blog");

export default async function BlogPage() {
  const session = await auth();

  return (
    <>
      <section
        className="relative overflow-hidden py-20 sm:py-24"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(20,27,38,0.76) 0%, rgba(20,27,38,0.45) 44%, rgba(20,27,38,0.18) 100%), url('/uploads/gallery/steve3.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container-shell relative z-10">
          <div className="max-w-3xl rounded-[32px] border border-white/15 bg-slate-950/25 p-8 backdrop-blur-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">Insights</p>
            <h1 className="mt-4 font-display text-5xl leading-tight text-white sm:text-6xl">
              A modern editorial hub for mental health, decolonizing psychology, thanatology, and research.
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/80">
              This structure is ready for Prisma-backed publishing from the admin dashboard, with categories carried
              directly into the UI.
            </p>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-shell space-y-10">
          <SectionHeading
            eyebrow="Insights"
            title="Browse articles, reflections, and research-driven commentary."
            description="Filter content by topic and explore a cleaner reading experience built for future admin publishing."
          />
          <BlogFilters posts={blogPosts} categories={siteContent.blogCategories} isSignedIn={Boolean(session?.user)} />
        </div>
      </section>
    </>
  );
}
