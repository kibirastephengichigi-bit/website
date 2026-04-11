import { SignInForm } from "@/components/forms/signin-form";
import { Card } from "@/components/ui/card";
import { createMetadata } from "@/lib/site";

export const metadata = createMetadata("Sign In", "Admin access for Dr. Stephen Asatsa website management.", "/signin");

export default function SignInPage() {
  return (
    <section className="section-space">
      <div className="container-shell max-w-2xl">
        <Card className="p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Admin Access</p>
          <h1 className="mt-4 font-display text-5xl">Sign in to manage the site.</h1>
          <p className="mt-4 text-muted-foreground">
            Use credentials authentication now, with Google sign-in available once env credentials are configured.
          </p>
          <div className="mt-8">
            <SignInForm />
          </div>
        </Card>
      </div>
    </section>
  );
}
