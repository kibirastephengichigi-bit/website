import { AdminShell } from "@/components/admin/admin-shell";
import { ResourceList } from "@/components/admin/resource-list";

const mediaItems = [
  { title: "Hero portrait", url: "/assets/people/hero.jpeg", type: "image" },
  { title: "Gallery image", url: "/assets/gallery/asatsa-7.jpeg", type: "image" },
  { title: "Stephen CV 2025", url: "/Stephen_Asatsa-CV-2025.pdf", type: "pdf" },
];

export default function AdminMediaPage() {
  return (
    <AdminShell title="Media library" description="A central library for uploaded images, featured media, and downloadable files.">
      <ResourceList title="Media assets" items={mediaItems} />
    </AdminShell>
  );
}
