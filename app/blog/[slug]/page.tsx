import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { blogContentBySlug, blogPosts } from "@/lib/content/blog-data";
import { createMetadata } from "@/lib/site";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) {
    return createMetadata("Post not found");
  }

  return createMetadata(post.title, post.excerpt, `/blog/${slug}`);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <section className="section-space">
      <div className="container-shell max-w-4xl">
        <Card className="p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{post.category}</p>
          <h1 className="mt-4 font-display text-5xl">{post.title}</h1>
          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-muted-foreground">{post.publishedAt}</p>
          <div className="prose-copy mt-8">
            {blogContentBySlug[slug].map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
