"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Shield, User, Heart, Bookmark, Key, Eye, EyeOff, AlertCircle, CheckCircle, Camera, Upload, Trash2, Edit, Plus, X } from "lucide-react";
import { api } from "@/components/api/client";

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

interface GalleryPhoto {
  id: string;
  title: string;
  description: string;
  image_url: string;
  thumbnail_url: string;
  upload_date: string;
  file_size: number;
  dimensions: {
    width: number;
    height: number;
  };
  category?: string;
  tags?: string[];
  uploaded_by?: string;
  filename?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Credentials management state
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [credentialsData, setCredentialsData] = useState({
    current_password: "",
    email: "",
    password: "",
    confirm_password: ""
  });
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [credentialsError, setCredentialsError] = useState("");
  const [credentialsSuccess, setCredentialsSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentCredentials, setCurrentCredentials] = useState<any>(null);

  // Gallery management state
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [showGalleryUpload, setShowGalleryUpload] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState("");
  const [gallerySuccess, setGallerySuccess] = useState("");
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    category: "",
    tags: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const userSession = localStorage.getItem("userSession");
      
      if (!userSession) {
        router.push("/admin-signup?callbackUrl=/account");
        setLoading(false);
        return;
      }

      try {
        // Verify session with Python backend (cookie-based auth)
        const response = await api.get('/api/auth/me');

        if (response.ok) {
          const userData = await response.json();
          if (userData.authenticated) {
            setUser(userData.user);
          } else {
            // Session invalid, remove stored session
            localStorage.removeItem("userSession");
            router.push("/admin-signup?callbackUrl=/account");
          }
        } else {
          // Session invalid, remove stored session
          localStorage.removeItem("userSession");
          router.push("/admin-signup?callbackUrl=/account");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // On error, try to check session age as fallback
        try {
          const session = JSON.parse(userSession);
          const sessionAge = Date.now() - session.timestamp;
          if (sessionAge < 24 * 60 * 60 * 1000) { // 24 hours
            setUser(session);
          } else {
            localStorage.removeItem("userSession");
            router.push("/admin-signup?callbackUrl=/account");
          }
        } catch (sessionError) {
          localStorage.removeItem("userSession");
          router.push("/admin-signup?callbackUrl=/account");
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      // Call Python backend logout endpoint (cookie-based)
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    // Clear local storage
    localStorage.removeItem("userSession");
    router.push("/admin-signup");
  };

  // Helper function for authenticated requests
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include" // Include cookies for session auth
    });
  };

  // Credentials management functions
  const fetchCurrentCredentials = async () => {
    try {
      const response = await api.get('/api/admin/credentials');
      if (response.ok) {
        const data = await response.json();
        setCurrentCredentials(data);
        setCredentialsData(prev => ({
          ...prev,
          email: data.email
        }));
      }
    } catch (error) {
      console.error("Error fetching credentials:", error);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsError("");
    setCredentialsSuccess("");
    setCredentialsLoading(true);

    // Validation
    if (!credentialsData.current_password) {
      setCredentialsError("Current password is required");
      setCredentialsLoading(false);
      return;
    }

    if (credentialsData.email && !credentialsData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setCredentialsError("Invalid email format");
      setCredentialsLoading(false);
      return;
    }

    if (credentialsData.password) {
      if (credentialsData.password.length < 8) {
        setCredentialsError("Password must be at least 8 characters");
        setCredentialsLoading(false);
        return;
      }
      if (!/[A-Z]/.test(credentialsData.password)) {
        setCredentialsError("Password must contain at least one uppercase letter");
        setCredentialsLoading(false);
        return;
      }
      if (!/[a-z]/.test(credentialsData.password)) {
        setCredentialsError("Password must contain at least one lowercase letter");
        setCredentialsLoading(false);
        return;
      }
      if (!/\d/.test(credentialsData.password)) {
        setCredentialsError("Password must contain at least one number");
        setCredentialsLoading(false);
        return;
      }
      if (credentialsData.password !== credentialsData.confirm_password) {
        setCredentialsError("Passwords do not match");
        setCredentialsLoading(false);
        return;
      }
    }

    try {
      const response = await api.put('/api/admin/credentials/validate', {
        current_password: credentialsData.current_password,
        email: credentialsData.email || undefined,
        password: credentialsData.password || undefined
      });

      const data = await response.json();

      if (response.ok) {
        setCredentialsSuccess("Credentials updated successfully!");
        setCredentialsData({
          current_password: "",
          email: data.email,
          password: "",
          confirm_password: ""
        });
        setShowCredentialsForm(false);
        await fetchCurrentCredentials();
        
        // Update user session if email changed
        if (credentialsData.email && user) {
          const updatedUser = { ...user, email: data.email };
          setUser(updatedUser);
          localStorage.setItem("userSession", JSON.stringify({
            ...JSON.parse(localStorage.getItem("userSession") || "{}"),
            email: data.email
          }));
        }
      } else {
        setCredentialsError(data.detail || "Failed to update credentials");
      }
    } catch (error) {
      console.error("Credentials update error:", error);
      setCredentialsError("Unable to connect to server. Please try again.");
    }

    setCredentialsLoading(false);
  };

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentialsData({
      ...credentialsData,
      [e.target.name]: e.target.value
    });
  };

  // Load current credentials when admin user is loaded
  useEffect(() => {
    if (user && user.role === "admin") {
      fetchCurrentCredentials();
      fetchGalleryPhotos();
    }
  }, [user]);

  // Gallery management functions
  const fetchGalleryPhotos = async () => {
    try {
      const response = await api.get('/api/admin/gallery/photos');
      if (response.ok) {
        const data = await response.json();
        setGalleryPhotos(data.photos || []);
      }
    } catch (error) {
      console.error("Error fetching gallery photos:", error);
    }
  };

  const handleGalleryUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setGalleryError("");
    setGallerySuccess("");
    setGalleryLoading(true);

    if (!selectedFile) {
      setGalleryError("Please select a photo to upload");
      setGalleryLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadData.title || 'Untitled Photo');
      formData.append('description', uploadData.description);
      formData.append('category', uploadData.category);
      formData.append('tags', uploadData.tags);

      const response = await api.upload('/api/admin/gallery/photos', formData);

      const data = await response.json();

      if (response.ok) {
        setGallerySuccess("Photo uploaded successfully!");
        setUploadData({ title: "", description: "", category: "", tags: "" });
        setSelectedFile(null);
        setShowGalleryUpload(false);
        await fetchGalleryPhotos();
      } else {
        setGalleryError(data.detail || "Failed to upload photo");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setGalleryError("Unable to connect to server. Please try again.");
    }

    setGalleryLoading(false);
  };

  const handlePhotoUpdate = async (photoId: string, updateData: Partial<GalleryPhoto>) => {
    try {
      const response = await api.put(`/api/admin/gallery/photos/${photoId}`, updateData);

      if (response.ok) {
        setGallerySuccess("Photo updated successfully!");
        setEditingPhoto(null);
        await fetchGalleryPhotos();
      } else {
        const data = await response.json();
        setGalleryError(data.detail || "Failed to update photo");
      }
    } catch (error) {
      console.error("Update error:", error);
      setGalleryError("Unable to connect to server. Please try again.");
    }
  };

  const handlePhotoDelete = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      const response = await api.delete(`/api/admin/gallery/photos/${photoId}`);

      if (response.ok) {
        setGallerySuccess("Photo deleted successfully!");
        await fetchGalleryPhotos();
      } else {
        const data = await response.json();
        setGalleryError(data.detail || "Failed to delete photo");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setGalleryError("Unable to connect to server. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
          <>
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

            {/* Gallery Management */}
            <Card className="space-y-4 p-6">
              <div className="space-y-1">
                <h2 className="font-display text-3xl flex items-center gap-2">
                  <Camera className="w-8 h-8 text-blue-600" />
                  Gallery Management
                </h2>
                <p className="text-sm text-muted-foreground">Upload and manage gallery photos</p>
              </div>

              {/* Gallery Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowGalleryUpload(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Upload Photo
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => fetchGalleryPhotos()}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Refresh
                </Button>
              </div>

              {/* Gallery Upload Form */}
              {showGalleryUpload && (
                <Card className="p-6 border-border/50">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Upload New Photo</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowGalleryUpload(false);
                          setUploadData({ title: "", description: "", category: "", tags: "" });
                          setSelectedFile(null);
                          setGalleryError("");
                          setGallerySuccess("");
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <form onSubmit={handleGalleryUpload} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Photo File</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="w-full p-2 border border-border/70 rounded-md"
                          required
                        />
                        {selectedFile && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                          </p>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium mb-2">Title</label>
                          <input
                            type="text"
                            value={uploadData.title}
                            onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                            placeholder="Photo title"
                            className="w-full p-2 border border-border/70 rounded-md"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Category</label>
                          <input
                            type="text"
                            value={uploadData.category}
                            onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                            placeholder="e.g., Events, Conferences"
                            className="w-full p-2 border border-border/70 rounded-md"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                          value={uploadData.description}
                          onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                          placeholder="Photo description"
                          rows={3}
                          className="w-full p-2 border border-border/70 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                        <input
                          type="text"
                          value={uploadData.tags}
                          onChange={(e) => setUploadData({...uploadData, tags: e.target.value})}
                          placeholder="e.g., conference, keynote, 2024"
                          className="w-full p-2 border border-border/70 rounded-md"
                        />
                      </div>

                      {/* Error/Success Messages */}
                      {galleryError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            <span>{galleryError}</span>
                          </div>
                        </div>
                      )}

                      {gallerySuccess && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>{gallerySuccess}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={galleryLoading}
                          className="flex items-center gap-2"
                        >
                          {galleryLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Upload Photo
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowGalleryUpload(false);
                            setUploadData({ title: "", description: "", category: "", tags: "" });
                            setSelectedFile(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
              )}

              {/* Gallery Photos List */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Gallery Photos ({galleryPhotos.length})</h3>
                
                {galleryPhotos.length === 0 ? (
                  <Card className="p-8 text-center border-border/50">
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">No Photos Yet</h4>
                    <p className="text-muted-foreground text-sm">
                      Upload your first photo to get started with the gallery.
                    </p>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {galleryPhotos.map((photo) => (
                      <Card key={photo.id} className="overflow-hidden border-border/50">
                        <div className="aspect-square relative">
                          <img
                            src={photo.thumbnail_url}
                            alt={photo.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold mb-1">{photo.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {photo.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                            <span>{formatDate(photo.upload_date)}</span>
                            <span>{formatFileSize(photo.file_size)}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingPhoto(photo)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePhotoDelete(photo.id)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Credentials Management */}
            <Card className="space-y-4 p-6">
              <div className="space-y-1">
                <h2 className="font-display text-3xl flex items-center gap-2">
                  <Key className="w-8 h-8 text-blue-600" />
                  Credentials Management
                </h2>
                <p className="text-sm text-muted-foreground">Update admin login credentials</p>
              </div>

              {!showCredentialsForm ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="space-y-3 p-5 border border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Key className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Current Email</h3>
                          <p className="text-sm text-muted-foreground">{currentCredentials?.email || "Loading..."}</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="space-y-3 p-5 border border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Shield className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Password Status</h3>
                          <p className="text-sm text-muted-foreground">
                            {currentCredentials?.has_password ? `Set (${currentCredentials?.password_length} chars)` : "Not set"}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowCredentialsForm(true)}
                      className="flex items-center gap-2"
                    >
                      <Key className="w-4 h-4" />
                      Update Credentials
                    </Button>
                  </div>

                  {currentCredentials?.history && currentCredentials.history.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">Recent Changes</h3>
                      <div className="space-y-1">
                        {currentCredentials.history.map((change: any, index: number) => (
                          <div key={index} className="text-xs text-muted-foreground">
                            {new Date(change.timestamp).toLocaleDateString()}: {change.old_email} → {change.new_email}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="current_password"
                          value={credentialsData.current_password}
                          onChange={handleCredentialsChange}
                          placeholder="Enter current password"
                          className="w-full h-11 px-3 pr-10 border border-border/70 rounded-md focus:border-primary/50 focus:outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        New Email (Optional)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={credentialsData.email}
                        onChange={handleCredentialsChange}
                        placeholder="Enter new email"
                        className="w-full h-11 px-3 border border-border/70 rounded-md focus:border-primary/50 focus:outline-none"
                      />
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        New Password (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="password"
                          value={credentialsData.password}
                          onChange={handleCredentialsChange}
                          placeholder="Enter new password"
                          className="w-full h-11 px-3 pr-10 border border-border/70 rounded-md focus:border-primary/50 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        8+ characters with uppercase, lowercase, and numbers
                      </p>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirm_password"
                          value={credentialsData.confirm_password}
                          onChange={handleCredentialsChange}
                          placeholder="Confirm new password"
                          className="w-full h-11 px-3 pr-10 border border-border/70 rounded-md focus:border-primary/50 focus:outline-none"
                          disabled={!credentialsData.password}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {credentialsError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{credentialsError}</span>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {credentialsSuccess && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>{credentialsSuccess}</span>
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={credentialsLoading}
                      className="flex items-center gap-2"
                    >
                      {credentialsLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4" />
                          Update Credentials
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCredentialsForm(false);
                        setCredentialsError("");
                        setCredentialsSuccess("");
                        setCredentialsData({
                          current_password: "",
                          email: currentCredentials?.email || "",
                          password: "",
                          confirm_password: ""
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </>
        )}
      </div>
    </section>
  );
}

