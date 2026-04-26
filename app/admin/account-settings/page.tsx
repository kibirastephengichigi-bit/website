"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  Mail,
  Phone
} from "lucide-react";
import { api } from "@/components/api/client";

export default function AccountSettingsPage() {
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (!session) {
      router.push('/admin-signup');
      return;
    }
    try {
      const parsed = JSON.parse(session);
      const sessionAge = Date.now() - parsed.timestamp;
      if (sessionAge > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('userSession');
        localStorage.removeItem('authToken');
        router.push('/admin-signup');
        return;
      }
    } catch {
      localStorage.removeItem('userSession');
      localStorage.removeItem('authToken');
      router.push('/admin-signup');
      return;
    }
  }, [router]);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Username change state
  const [newUsername, setNewUsername] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setUser(parsed);
        setNewUsername(parsed.username || "");
      } catch {
        // Ignore parse error
      }
    }
    setLoading(false);
  }, []);

  const handleUsernameChange = async () => {
    setUsernameSuccess(false);
    setUsernameError("");

    if (!newUsername || newUsername.trim() === "") {
      setUsernameError("Username cannot be empty");
      return;
    }

    if (newUsername === user?.username) {
      setUsernameError("New username is the same as current username");
      return;
    }

    try {
      const response = await api.put("/api/admin/user/username", { username: newUsername });
      if (response.ok) {
        setUsernameSuccess(true);
        // Update session
        const session = localStorage.getItem('userSession');
        if (session) {
          const parsed = JSON.parse(session);
          parsed.username = newUsername;
          localStorage.setItem('userSession', JSON.stringify(parsed));
          setUser(parsed);
        }
      } else {
        const data = await response.json();
        setUsernameError(data.error || "Failed to update username");
      }
    } catch (error) {
      setUsernameError("Failed to update username");
    }
  };

  const handlePasswordChange = async () => {
    setPasswordSuccess(false);
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      const response = await api.put("/api/admin/user/password", {
        currentPassword,
        newPassword
      });
      if (response.ok) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        setPasswordError(data.error || "Failed to update password");
      }
    } catch (error) {
      setPasswordError("Failed to update password");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-slate-600">Manage your account credentials and security settings</p>
      </div>

      {/* Current User Info */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{user?.displayName || "Administrator"}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Badge variant="outline">{user?.role || "admin"}</Badge>
              <span>{user?.username || "admin"}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Change Username */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-900">Change Username</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Current Username</label>
            <Input value={user?.username || ""} disabled className="bg-slate-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">New Username</label>
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
            />
          </div>
          {usernameSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Username updated successfully</span>
            </div>
          )}
          {usernameError && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{usernameError}</span>
            </div>
          )}
          <Button onClick={handleUsernameChange} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Update Username
          </Button>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="h-5 w-5 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-900">Change Password</h2>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
            <Input
              type={showPasswords ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
            <Input
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 8 characters)"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
            <Input
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showPasswords"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showPasswords" className="text-sm text-slate-600">
              Show passwords
            </label>
          </div>
          {passwordSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Password updated successfully</span>
            </div>
          )}
          {passwordError && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{passwordError}</span>
            </div>
          )}
          <Button onClick={handlePasswordChange} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Update Password
          </Button>
        </div>
      </Card>

      {/* Security Info */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Security Tips</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Use a strong password with at least 8 characters</li>
              <li>• Include a mix of letters, numbers, and special characters</li>
              <li>• Don't reuse passwords from other accounts</li>
              <li>• Consider changing your password regularly</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
