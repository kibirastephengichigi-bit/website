"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { BlogPostSummary } from "@/types";

export function BlogFilters({
  posts,
  categories,
}: {
  posts: BlogPostSummary[];
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const matchesQuery =
        !query ||
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase());

      const matchesCategory =
        activeCategory === "All" || post.category === activeCategory;

      return matchesQuery && matchesCategory;
    });
  }, [posts, query, activeCategory]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[28px] border border-border bg-white/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search blog posts"
          className="h-11 w-full rounded-2xl border border-border px-4 text-sm outline-none focus:ring-2 focus:ring-ring sm:max-w-sm"
        />
        <div className="flex flex-wrap gap-3">
          {["All", ...categories].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-white text-muted-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {filtered.map((post) => (
          <Card key={post.slug} className="p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{post.category}</p>
            <h2 className="mt-3 font-display text-3xl">{post.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">{post.publishedAt}</p>
            <Link href={`/blog/${post.slug}`} className="mt-4 inline-block text-sm font-semibold text-primary">
              Read article
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
