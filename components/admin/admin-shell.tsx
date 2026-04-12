import Link from "next/link";
import { signOut } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/research", label: "Research" },
  { href: "/admin/publications", label: "Publications" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/content", label: "Content" },
];

export async function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-shell flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Menu className="h-5 w-5 lg:hidden" />
            <h2 className="font-display text-lg">Admin Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            {session?.user && (
              <>
                <div className="text-right">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.role}</p>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <Button variant="ghost" size="sm" type="submit" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container-shell py-10">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-[28px] border border-border bg-white/50 dark:bg-white/5 p-5 shadow-soft h-fit sticky top-20">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Admin Menu</p>
            <nav className="space-y-2">
              {adminLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent/10 hover:text-accent active:bg-accent/20"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h1 className="font-display text-5xl">{title}</h1>
              <p className="max-w-3xl text-muted-foreground">{description}</p>
            </div>
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
