import type { BlogPostSummary } from "@/types";

import blogData from "./blog-data.json";

type BlogData = {
  blogPosts: BlogPostSummary[];
  blogContentBySlug: Record<string, string[]>;
};

const typedBlogData = blogData as BlogData;

export const blogPosts = typedBlogData.blogPosts;
export const blogContentBySlug = typedBlogData.blogContentBySlug;
