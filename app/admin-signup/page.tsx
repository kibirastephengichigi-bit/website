import { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Mail, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createMetadata } from "@/lib/site";

export const metadata = createMetadata("Admin Sign In", "Sign in to manage Stephen Asatsa website.", "/admin-signup");

export default function AdminSignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Admin Sign In</h1>
          <p className="text-muted-foreground">Sign in to manage the website</p>
        </div>

        {/* Sign In Form */}
        <Card className="p-8 shadow-xl border-border/50 bg-white/90 backdrop-blur-sm">
          <form className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                className="h-11 border-border/70 focus:border-primary/50"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-11 pr-10 border-border/70 focus:border-primary/50"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Admin Code Field */}
            <div className="space-y-2">
              <label htmlFor="adminCode" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admin Access Code
              </label>
              <Input
                id="adminCode"
                type="password"
                placeholder="Enter admin access code"
                className="h-11 border-border/70 focus:border-primary/50"
                required
              />
              <p className="text-xs text-muted-foreground">
                Contact the site administrator for the access code
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Sign In to Admin
              </span>
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 rounded-xl bg-blue-50/80 border border-blue-200/50">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">Security Notice</h3>
                <p className="text-xs text-blue-700 leading-relaxed">
                  This admin account provides full access to website management features. 
                  Only sign in if you are authorized to manage the site content.
                </p>
              </div>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Forgot your password?{" "}
              <Link 
                href="/admin-reset" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Reset here
              </Link>
            </p>
          </div>
        </Card>

        {/* Back to Site */}
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
          >
            ← Back to main site
          </Link>
        </div>
      </div>
    </div>
  );
}
