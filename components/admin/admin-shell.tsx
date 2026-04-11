import Link from "next/link";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/research", label: "Research" },
  { href: "/admin/publications", label: "Publications" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/content", label: "Content" },
];

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-shell py-10">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-[28px] border border-border bg-white/80 p-5 shadow-soft">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <nav className="space-y-2">
            {adminLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-display text-5xl">{title}</h1>
            <p className="max-w-3xl text-muted-foreground">{description}</p>
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}
