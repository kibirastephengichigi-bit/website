import { AdminShell } from "@/components/admin/admin-shell";
import { ResourceList } from "@/components/admin/resource-list";
import { blogPosts } from "@/lib/content/blog-data";

export default function AdminBlogPage() {
  return (
    <AdminShell title="Manage blog posts" description="Create, edit, publish, and organize insight articles by category.">
      <ResourceList title="Posts" items={blogPosts} />
    </AdminShell>
  );
}
