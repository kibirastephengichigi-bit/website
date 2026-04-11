import { AdminShell } from "@/components/admin/admin-shell";
import { Card } from "@/components/ui/card";
import { siteContent } from "@/lib/content/site-content";

export default function AdminContentPage() {
  return (
    <AdminShell title="Update site content" description="A simple area for editing shared site copy like the Who We Are section and homepage messaging.">
      <Card className="p-7">
        <h2 className="font-display text-3xl">Who We Are content</h2>
        <div className="prose-copy mt-4">
          {siteContent.aboutFull.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Card>
    </AdminShell>
  );
}
