export type NavLink = {
  href: string;
  label: string;
};

export type BlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  featuredImage?: string;
};
