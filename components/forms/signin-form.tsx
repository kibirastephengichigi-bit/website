"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Chrome, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SignInForm() {
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/account";

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-5 p-8">
      <div className="space-y-2">
        <h2 className="font-display text-3xl">Sign in with Google</h2>
        <p className="text-sm leading-7 text-muted-foreground">
          We store your basic profile in the database, create a secure session cookie, and use your account for
          saved items, preferences, and future member features.
        </p>
      </div>

      <Button className="w-full" size="lg" onClick={() => void handleGoogleSignIn()} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirecting to Google...
          </>
        ) : (
          <>
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </>
        )}
      </Button>

      <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Your login session is handled with secure cookies. You can review and update your preferences on the account
        page after signing in.
      </div>
    </Card>
  );
}

