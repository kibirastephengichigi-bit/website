import { AdminShell } from "@/components/admin/admin-shell";
import { ResourceList } from "@/components/admin/resource-list";
import { siteContent } from "@/lib/content/site-content";

export default function AdminTestimonialsPage() {
  return (
    <AdminShell title="Manage testimonials" description="Add, edit, and feature testimonials with photos and quotes.">
      <ResourceList title="Testimonials" items={siteContent.testimonials} />
    </AdminShell>
  );
}
