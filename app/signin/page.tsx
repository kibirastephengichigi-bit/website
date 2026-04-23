import { redirect } from "next/navigation";

import { SignInForm } from "@/components/forms/signin-form";
import { createMetadata } from "@/lib/site";
import { auth } from "@/lib/auth";

export const metadata = createMetadata("Admin Sign in", "Admin sign-in to manage website content and settings.", "/signin");

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/account");
  }

  return (
    <section className="section-space">
      <div className="container-shell grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Admin access</p>
          <h1 className="font-display text-5xl">Admin sign-in to manage your website.</h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            This login provides secure access to the admin dashboard for managing content, media, and website settings.
          </p>
        </div>
        <SignInForm />
      </div>
    </section>
  );
}

