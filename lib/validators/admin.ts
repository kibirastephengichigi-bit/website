import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().min(10),
  content: z.string().min(20),
  category: z.string().min(2),
  featuredImage: z.string().optional(),
  published: z.boolean().default(false),
});

export const testimonialSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  quote: z.string().min(10),
  image: z.string().optional(),
});

export const researchSchema = z.object({
  title: z.string().min(3),
  category: z.string().min(3),
  summary: z.string().min(20),
  status: z.string().min(2),
});

export const publicationSchema = z.object({
  title: z.string().min(3),
  category: z.string().min(2),
  year: z.coerce.number().int(),
  abstract: z.string().min(10),
  fileUrl: z.string().optional(),
});
