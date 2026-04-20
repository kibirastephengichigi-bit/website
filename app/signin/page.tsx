import { redirect } from "next/navigation";

import { SignInForm } from "@/components/forms/signin-form";
import { createMetadata } from "@/lib/site";
import { auth } from "@/lib/auth";

export const metadata = createMetadata("Sign in", "Sign in with Google to save favorites and manage your profile.", "/signin");

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/account");
  }

  return (
    <section className="section-space">
      <div className="container-shell grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Member access</p>
          <h1 className="font-display text-5xl">Sign in with Google and keep your preferences in sync.</h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            This login stores the Google account on the database, creates a secure session cookie, and unlocks saved
            items, profile settings, and future member-only tools.
          </p>
        </div>
        <SignInForm />
      </div>
    </section>
  );
}

