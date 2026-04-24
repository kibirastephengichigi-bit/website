"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, Eye, EyeOff, AlertCircle, Zap, ShieldCheck, Activity, User, RefreshCw, LogIn } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSignInPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState<string>("");

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackendStatus("Backend connected: " + data.status);
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
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
          otp: "" // Empty OTP since TOTP is not configured by default
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || `Server error: ${response.status}`);
        return;
      }

      const data = await response.json();

      // Store user session data (backend uses cookie-based auth)
      localStorage.setItem("userSession", JSON.stringify({
        username: data.user?.username || username,
        displayName: data.user?.displayName || "Website Administrator",
        role: data.user?.role || "admin",
        authenticated: data.authenticated,
        timestamp: Date.now()
      }));
      
      // Redirect to admin dashboard
      router.push("/admin");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="w-full max-w-4xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Hero Section */}
          <div className="text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-white/90 text-sm font-medium">Secure Admin Portal</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
              Admin
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Control</span>
            </h1>
            
            <p className="text-lg text-white/80 max-w-md">
              Manage your website with confidence. Enhanced security, real-time monitoring, and powerful content management tools.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-white/70">Secure Auth</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-white/70">Real-time</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-white/70">Fast</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="space-y-6">
            {/* Login Form Container */}
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 space-y-6">
              {/* Backend Status */}
              {backendStatus && (
                <div className={`p-4 rounded-2xl backdrop-blur-sm border ${
                  backendStatus.includes("Backend connected") 
                    ? "bg-green-500/20 border-green-400/30 text-green-100" 
                    : "bg-red-500/20 border-red-400/30 text-red-100"
                }`}>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{backendStatus}</span>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-30" />
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 space-y-6">
                  <div className="text-center">
                    <h1 className="font-display text-4xl font-bold text-white leading-tight">Admin Sign In</h1>
                    <p className="text-white/80">Enter your credentials to access the admin dashboard</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username Field */}
                    <div>
                      <label htmlFor="username" className="text-sm font-medium text-white/90 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Username
                      </label>
                      <Input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="flex w-full border px-4 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-white file:font-medium placeholder:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50 h-12 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40 focus:ring-white/20 rounded-xl pr-12"
                        placeholder="Enter admin username"
                        required
                      />
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="text-sm font-medium text-white/90 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="flex w-full border px-4 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-white file:font-medium placeholder:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50 h-12 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40 focus:ring-white/20 rounded-xl pr-12"
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                  >
                    <span className="flex items-center gap-2">
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          Sign In
                        </>
                      )}
                    </span>
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
);