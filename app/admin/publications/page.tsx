import { AdminShell } from "@/components/admin/admin-shell";
import { ResourceList } from "@/components/admin/resource-list";
import { siteContent } from "@/lib/content/site-content";

export default function AdminPublicationsPage() {
  return (
    <AdminShell title="Manage publications" description="Upload PDFs, update details, and control how research outputs appear on the public site.">
      <ResourceList title="Publications" items={siteContent.publications} />
    </AdminShell>
  );
}
