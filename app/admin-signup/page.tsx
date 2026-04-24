"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminSignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState<string>("");

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await fetch("http://localhost:8000/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackendStatus("Backend connected: " + data.message);
      } else {
        setBackendStatus("Backend responded with error: " + response.status);
      }
    } catch (error) {
      setBackendStatus("Backend connection failed: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  // Test connection on component mount
  useEffect(() => {
    testBackendConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Call Python backend API
      const response = await fetch("http://localhost:8000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || `Server error: ${response.status}`);
        return;
      }

      const data = await response.json();

      // Store JWT token and admin session
      localStorage.setItem("authToken", data.access_token);
      localStorage.setItem("userSession", JSON.stringify({
        email: data.user?.email || email,
        name: data.user?.name || "Administrator",
        role: data.user?.role || "admin",
        timestamp: Date.now(),
        token: data.access_token
      }));
      
      // Redirect to account page or admin dashboard
      router.push("/account");
    } catch (error) {
      console.error("Login error:", error);
      
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setError("Cannot connect to the backend server. Please ensure the Python backend is running on http://localhost:8000");
      } else if (error instanceof TypeError && error.message.includes("NetworkError")) {
        setError("Network error. Please check your connection and ensure the backend server is running.");
      } else {
        setError(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Backend Status */}
        {backendStatus && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            backendStatus.includes("Backend connected") 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{backendStatus}</span>
            </div>
          </div>
        )}

        {/* Logo and Title Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Admin Sign In</h1>
          <p className="text-muted-foreground">Access the admin dashboard</p>
        </div>

        {/* Sign In Form */}
        <Card className="p-8 shadow-xl border-border/50 bg-white/90 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-11 pr-10 border-border/70 focus:border-primary/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Sign In to Admin
                  </>
                )}
              </span>
            </Button>
          </form>
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
