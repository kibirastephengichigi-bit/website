import { AdminShell } from "@/components/admin/admin-shell";
import { ResourceList } from "@/components/admin/resource-list";
import { siteContent } from "@/lib/content/site-content";

export default function AdminResearchPage() {
  return (
    <AdminShell title="Manage research projects" description="Maintain research project summaries, categories, status, and publication visibility.">
      <ResourceList title="Research projects" items={siteContent.researchProjects} />
    </AdminShell>
  );
}
