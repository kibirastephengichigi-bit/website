"use client";

import { useState } from "react";
import { Shield, Loader2, AlertTriangle, User, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleAdminSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        router.push("/admin");
      } else {
        const data = await response.json();
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-5 p-8">
      <div className="space-y-2">
        <h2 className="font-display text-3xl">Admin Sign in</h2>
        <p className="text-sm leading-7 text-muted-foreground">
          Enter your admin credentials to access the dashboard and manage website content.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Authentication Error</span>
          </div>
          <p className="mt-1">{error}</p>
        </div>
      )}

      <form onSubmit={handleAdminSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Sign in as Admin
            </>
          )}
        </Button>
      </form>

      <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Your admin session is handled with secure cookies. You can manage content, media, and website settings from the dashboard.
      </div>
    </Card>
  );
}

