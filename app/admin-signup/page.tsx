"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, Eye, EyeOff, AlertCircle, Zap, ShieldCheck, Activity, User, RefreshCw, LogIn, CheckCircle, XCircle, Database, X, HardDrive } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/components/api/client";

export default function AdminSignInPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showCachingModal, setShowCachingModal] = useState(false);
  const [startingBackend, setStartingBackend] = useState(false);

  // Check backend status
  useEffect(() => {
    const checkBackend = async () => {
      setBackendStatus('checking');
      try {
        // Use the API client which handles the proxy correctly
        const response = await api.get('/api/health');
        if (response.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch {
        setBackendStatus('offline');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const startBackend = async () => {
    setStartingBackend(true);
    setError("");
    try {
      // Retry health check a few times to see if backend comes online
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const healthResponse = await api.get('/api/health');
        if (healthResponse.ok) {
          setBackendStatus('online');
          setStartingBackend(false);
          return;
        }
      }
      setError("Backend server is not responding. Please start it manually.");
    } catch (error) {
      console.error("Failed to reach backend:", error);
      setError("Cannot connect to backend. Please ensure the Python backend is running.");
    } finally {
      setStartingBackend(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If backend is offline, try to start it first
    if (backendStatus === 'offline') {
      await startBackend();
      if (backendStatus === 'offline') {
        setError("Backend server is not available. Please try starting it manually.");
        return;
      }
    }
    
    setLoading(true);
    setError("");

    try {
      // Call Python backend API via Next.js proxy
      const response = await api.post('/api/admin/auth/login', {
        username: username,
        password: password,
        otp: "" // Empty OTP since TOTP is not configured by default
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

      // Check if user has already made a caching choice
      const cachingChoice = localStorage.getItem('adminCachingEnabled');
      if (cachingChoice === null) {
        // User hasn't made a choice yet, show the modal
        setShowCachingModal(true);
      } else {
        // User has already made a choice, redirect to admin dashboard
        router.push("/admin");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setError("Cannot connect to the backend server. Please ensure the Python backend is running.");
      } else if (error instanceof TypeError && error.message.includes("NetworkError")) {
        setError("Network error. Please check your connection and ensure the backend server is running.");
      } else {
        setError(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    setLoading(false);
  };

  const handleCachingChoice = async (enabled: boolean) => {
    localStorage.setItem('adminCachingEnabled', enabled.toString());
    setShowCachingModal(false);

    if (enabled) {
      // Register service worker
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js');
          console.log('Service worker registered');
        } catch (error) {
          console.error('Service worker registration failed:', error);
        }
      }
    }

    // Redirect to admin dashboard
    router.push("/admin");
  };

  const handleSkipCaching = () => {
    localStorage.setItem('adminCachingEnabled', 'false');
    setShowCachingModal(false);
    router.push("/admin");
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
            {/* Backend Status Indicator */}
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              {backendStatus === 'checking' && (
                <>
                  <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <span className="text-sm text-white/90">Checking backend connection...</span>
                </>
              )}
              {backendStatus === 'online' && (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white/90">Backend Connected</span>
                </>
              )}
              {backendStatus === 'offline' && (
                <>
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-white/90">Backend Offline</span>
                  <Button
                    onClick={startBackend}
                    disabled={startingBackend}
                    size="sm"
                    className="ml-2 bg-green-500 hover:bg-green-600 text-white"
                  >
                    {startingBackend ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3 mr-1" />
                        Start Backend
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* Login Form Container */}
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 space-y-6">
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

                    {/* Error Message */}
                    {error && (
                      <div className="rounded-xl border border-red-400/30 bg-red-500/10 backdrop-blur-sm p-4">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <span className="text-sm text-red-100">{error}</span>
                        </div>
                      </div>
                    )}

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

                  {/* Back to Site */}
                  <div className="text-center pt-4 border-t border-white/10">
                    <Link 
                      href="/" 
                      className="text-sm text-white/70 hover:text-white/90 transition-colors inline-flex items-center gap-2"
                    >
                      ← Back to main site
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Caching Preference Modal */}
      {showCachingModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Enable Caching?</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSkipCaching}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-slate-600">
                We can cache admin pages and API responses locally to:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3 text-slate-700">
                  <HardDrive className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Reduce bandwidth usage and load faster</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Enable offline access to cached content</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <ShieldCheck className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Auto-sync changes when detected</span>
                </li>
              </ul>
              <p className="text-sm text-slate-500">
                You can disable caching anytime from the admin settings. Your choice is saved in your browser.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleCachingChoice(true)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Enable Caching
              </Button>
              <Button
                variant="outline"
                onClick={handleSkipCaching}
                className="flex-1"
              >
                Skip for Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}