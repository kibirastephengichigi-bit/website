"use client";

import { BookmarkPlus, Loader2, LogIn } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { api } from "@/components/api/client";

type SaveType = "blog" | "research";

interface UserSession {
  email: string;
  name?: string;
  role: string;
  timestamp: number;
  token: string;
}

export function SaveItemButton({
  type,
  itemKey,
  title,
  href,
  image,
  isSignedIn,
}: {
  type: SaveType;
  itemKey: string;
  title: string;
  href: string;
  image?: string;
  isSignedIn?: boolean;
}) {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Check for user session in localStorage
    const session = localStorage.getItem("userSession");
    if (session) {
      try {
        const parsedSession = JSON.parse(session);
        // Check if session is not older than 24 hours
        const sessionAge = Date.now() - parsedSession.timestamp;
        if (sessionAge < 24 * 60 * 60 * 1000) {
          setUserSession(parsedSession);
        } else {
          // Session expired, remove it
          localStorage.removeItem("userSession");
          localStorage.removeItem("authToken");
        }
      } catch (error) {
        // Invalid session, remove it
        localStorage.removeItem("userSession");
        localStorage.removeItem("authToken");
      }
    }
  }, []);

  const canSave = isSignedIn ?? Boolean(userSession);

  async function handleSave() {
    if (!canSave) {
      window.location.href = `/admin-signup?callbackUrl=${encodeURIComponent(href)}`;
      return;
    }

    setLoading(true);
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("Authentication token not found");
      }

      const response = await (saved 
        ? api.delete(`/api/auth/saved-items?token=${authToken}`)
        : api.post(`/api/auth/saved-items?token=${authToken}`, { type, key: itemKey, title, href, image })
      );

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setSaved((current) => !current);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={saved ? "secondary" : "outline"}
      size="sm"
      onClick={() => void handleSave()}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : canSave ? (
        <>
          <BookmarkPlus className="mr-2 h-4 w-4" />
          {saved ? "Saved" : "Save"}
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Save with Google
        </>
      )}
    </Button>
  );
}
