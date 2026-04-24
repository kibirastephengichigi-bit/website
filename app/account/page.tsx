import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PreferencesPanel } from "@/components/user/preferences-panel";
import { createMetadata } from "@/lib/site";

export const metadata = createMetadata("My Account", "Manage your profile, preferences, and saved items.", "/account");

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user || !db) {
    redirect("/admin-signup?callbackUrl=/account");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { preferences: true, savedItems: true },
  });

  if (!user) {
    redirect("/admin-signup?callbackUrl=/account");
  }

  const preferences =
    user.preferences || {
      newsletterSubscribed: false,
      productUpdates: false,
      analyticsConsent: false,
      marketingConsent: false,
      cookieConsentLevel: "essential",
      theme: "light",
      locale: "en",
    };

  return (
    <section className="section-space">
      <div className="container-shell space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Account</p>
          <h1 className="font-display text-5xl">Your account</h1>
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
            This page keeps your Google profile, saved items, and preferences in one place.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="space-y-4 p-6">
            <div className="space-y-1">
              <h2 className="font-display text-3xl">{user.name || "Google user"}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Signed in as {session.user.role}</p>
              <p>Account created: {user.createdAt.toLocaleDateString()}</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/privacy-cookies">Review cookies</Link>
            </Button>
          </Card>

          <PreferencesPanel initialPreferences={preferences} />
        </div>

        <Card className="space-y-4 p-6">
          <div className="space-y-1">
            <h2 className="font-display text-3xl">Saved items</h2>
            <p className="text-sm text-muted-foreground">Items you save from blog and research pages will appear here.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {user.savedItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">You have not saved anything yet.</p>
            ) : (
              user.savedItems.map((item) => (
                <Card key={item.id} className="space-y-3 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{item.type}</p>
                  <h3 className="font-semibold">{item.title}</h3>
                  <Button asChild variant="ghost" className="px-0">
                    <Link href={item.href}>Open item</Link>
                  </Button>
                </Card>
              ))
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}

