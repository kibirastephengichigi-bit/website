import { SignInForm } from "@/components/forms/signin-form";
import { Card } from "@/components/ui/card";
import { createMetadata } from "@/lib/site";
import { Users, Mail, Lock } from "lucide-react";

export const metadata = createMetadata(
  "Get in touch",
  "Access your account - Users can login with Gmail, Admin uses credentials.",
  "/signin"
);

export default function SignInPage() {
  return (
    <section className="section-space">
      <div className="container-shell max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left side - Info */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Access Portal</p>
              <h1 className="mt-4 font-display text-4xl">Get in touch</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Sign in to access your account and manage content.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Mail className="h-5 w-5 text-accent mt-1" />
                </div>
                <div>
                  <h3 className="font-medium">User Access</h3>
                  <p className="text-sm text-muted-foreground">Sign in with your Gmail account</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Lock className="h-5 w-5 text-accent mt-1" />
                </div>
                <div>
                  <h3 className="font-medium">Admin Panel</h3>
                  <p className="text-sm text-muted-foreground">Secure credentials-based authentication</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Users className="h-5 w-5 text-accent mt-1" />
                </div>
                <div>
                  <h3 className="font-medium">Manage Content</h3>
                  <p className="text-sm text-muted-foreground">Blog, research, media, and more</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <Card className="p-8">
            <SignInForm />
          </Card>
        </div>
      </div>
    </section>
  );
}
