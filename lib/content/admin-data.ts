import { blogPosts } from "@/lib/content/blog-data";
import { siteContent } from "@/lib/content/site-content";

export const adminDashboardData = {
  metrics: [
    { label: "Published Posts", value: blogPosts.length.toString() },
    { label: "Testimonials", value: siteContent.testimonials.length.toString() },
    { label: "Research Projects", value: siteContent.researchProjects.length.toString() },
    { label: "Media Assets", value: siteContent.gallery.length.toString() },
  ],
};
