"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Shield, User, Heart, Bookmark } from "lucide-react";

interface User {
  email: string;
  name?: string;
  role: string;
  status?: string;
  created_at?: string;
  preferences?: {
    newsletter?: boolean;
    notifications?: boolean;
    theme?: string;
  };
  saved_items?: Array<{
    id: string;
    type: string;
    title: string;
    href: string;
    image?: string;
    saved_at: string;
  }>;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const authToken = localStorage.getItem("authToken");
      const userSession = localStorage.getItem("userSession");
      
      if (!authToken || !userSession) {
        router.push("/signin?callbackUrl=/account");
        setLoading(false);
        return;
      }

      try {
        // Verify token with Python backend
        const response = await fetch(`http://localhost:8000/api/auth/me?token=${authToken}`, {
          headers: {
            "Content-Type": "application/json",
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Token invalid, remove session
          localStorage.removeItem("authToken");
          localStorage.removeItem("userSession");
          router.push("/signin?callbackUrl=/account");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // On error, try to check session age as fallback
        try {
          const session = JSON.parse(userSession);
          const sessionAge = Date.now() - session.timestamp;
          if (sessionAge < 24 * 60 * 60 * 1000) { // 24 hours
            setUser(JSON.parse(session));
          } else {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userSession");
            router.push("/signin?callbackUrl=/account");
          }
        } catch (sessionError) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userSession");
          router.push("/signin?callbackUrl=/account");
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    const authToken = localStorage.getItem("authToken");
    
    // Call Python backend logout endpoint
    if (authToken) {
      try {
        await fetch(`http://localhost:8000/api/auth/logout?token=${authToken}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          }
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    
    // Clear local storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userSession");
    router.push("/signin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect automatically
  }

  const isAdmin = user.role === "admin";

  return (
    <section className="section-space">
      <div className="container-shell space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            {isAdmin ? "Admin Dashboard" : "My Account"}
          </p>
          <h1 className="font-display text-5xl">
            {isAdmin ? "Admin Account" : "Your Account"}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
            {isAdmin 
              ? "Manage your website settings and content from this admin dashboard."
              : "Manage your profile, preferences, and saved items."
            }
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="space-y-4 p-6">
            <div className="space-y-1">
              <h2 className="font-display text-3xl flex items-center gap-2">
                {isAdmin ? (
                  <Shield className="w-8 h-8 text-blue-600" />
                ) : (
                  <User className="w-8 h-8 text-blue-600" />
                )}
                {isAdmin ? "Admin User" : "User Profile"}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.name && (
                <p className="text-lg font-medium text-foreground">{user.name}</p>
              )}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Role: {isAdmin ? "Administrator" : "User"}</p>
              <p>Status: {user.status || "Active"}</p>
              {user.created_at && (
                <p>Account created: {new Date(user.created_at).toLocaleDateString()}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
              <Button asChild variant="outline">
                <Link href="/">
                  <Settings className="w-4 h-4 mr-2" />
                  View Website
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <div className="space-y-1">
              <h2 className="font-display text-3xl">Quick Actions</h2>
              <p className="text-sm text-muted-foreground">
                {isAdmin ? "Administrative tasks" : "Common actions"}
              </p>
            </div>
            <div className="grid gap-3">
              <Button asChild className="justify-start">
                <Link href="/">
                  <Settings className="w-4 h-4 mr-2" />
                  View Website
                </Link>
              </Button>
              {isAdmin ? (
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/admin-signup">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Settings
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/signup">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* User-specific features */}
        {!isAdmin && (
          <Card className="space-y-4 p-6">
            <div className="space-y-1">
              <h2 className="font-display text-3xl">Your Preferences</h2>
              <p className="text-sm text-muted-foreground">Manage your account settings</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="space-y-3 p-5 border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Preferences</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Newsletter: {user.preferences?.newsletter ? "Subscribed" : "Not subscribed"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Notifications: {user.preferences?.notifications ? "Enabled" : "Disabled"}
                </p>
              </Card>
              
              <Card className="space-y-3 p-5 border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Bookmark className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold">Saved Items</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {user.saved_items?.length || 0} items saved
                </p>
              </Card>
            </div>
          </Card>
        )}

        {/* Admin-specific features */}
        {isAdmin && (
          <Card className="space-y-4 p-6">
            <div className="space-y-1">
              <h2 className="font-display text-3xl">Admin Features</h2>
              <p className="text-sm text-muted-foreground">Available administrative tools and features</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="space-y-3 p-5 border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">User Management</h3>
                </div>
                <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
              </Card>
              
              <Card className="space-y-3 p-5 border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold">Content Management</h3>
                </div>
                <p className="text-sm text-muted-foreground">Edit and manage website content</p>
              </Card>
              
              <Card className="space-y-3 p-5 border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Analytics</h3>
                </div>
                <p className="text-sm text-muted-foreground">View website analytics and reports</p>
              </Card>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}

