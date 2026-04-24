import { AdminLayout } from "@/components/admin/admin-layout";
import { createMetadata } from "@/lib/site";

export const metadata = createMetadata(
  "Admin Dashboard",
  "Main admin dashboard with individual pages for content, media, SEO, analytics, and settings.",
  "/admin",
);

export default function AdminPage() {
  return (
    <AdminLayout 
      user={{
        username: "admin",
        displayName: "Website Administrator", 
        role: "super_admin"
      }}
    />
  );
}
