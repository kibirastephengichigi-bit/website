import { AdminShell } from "@/components/admin/admin-shell";
import { Card } from "@/components/ui/card";
import { adminDashboardData } from "@/lib/content/admin-data";

export default function AdminPage() {
  return (
    <AdminShell
      title="Dashboard overview"
      description="A protected admin surface for content operations, publishing, testimonials, research, and media. Authentication is wired for NextAuth credentials and optional Google."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminDashboardData.metrics.map((metric) => (
          <Card key={metric.label} className="p-6">
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="mt-3 font-display text-5xl">{metric.value}</p>
          </Card>
        ))}
      </div>
      <Card className="p-7">
        <h2 className="font-display text-3xl">Admin capabilities included</h2>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
          <li>• Email and password authentication through NextAuth credentials</li>
          <li>• Optional Google sign-in for assistant users later</li>
          <li>• Blog publishing workflow with route handlers and Zod validation</li>
          <li>• Testimonials, research, publications, media, and page-content management areas</li>
        </ul>
      </Card>
    </AdminShell>
  );
}
