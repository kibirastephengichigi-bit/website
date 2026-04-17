"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Chrome, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SignInForm() {
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/account";
  const error = params.get("error");

  // Check if Google OAuth is configured
  const isGoogleConfigured = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID !== "your-google-client-id-here";

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (err) {
      console.error("Sign in error:", err);
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

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Authentication Error</span>
          </div>
          <p className="mt-1">
            {error === "Configuration" && "Google OAuth is not properly configured."}
            {error === "AccessDenied" && "Access was denied. Please try again."}
            {error === "Verification" && "Email verification failed."}
            {!["Configuration", "AccessDenied", "Verification"].includes(error) && "An error occurred during sign in."}
          </p>
        </div>
      )}

      {!isGoogleConfigured && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Google OAuth Not Configured</span>
          </div>
          <p className="mt-1">
            Google authentication is not set up yet. Please configure Google OAuth credentials in your environment variables.
          </p>
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={() => void handleGoogleSignIn()}
        disabled={loading || !isGoogleConfigured}
      >
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

