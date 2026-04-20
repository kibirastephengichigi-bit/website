import { AdminWorkbench } from "@/components/admin/admin-workbench";
import { createMetadata } from "@/lib/site";

export const metadata = createMetadata(
  "Admin Control Room",
  "Secure admin workspace for editing site content, managing blog posts, and uploading media with the Python backend.",
  "/admin",
);

export default function AdminPage() {
  return <AdminWorkbench />;
}

