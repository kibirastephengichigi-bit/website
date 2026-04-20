"use client";

import { BookmarkPlus, Loader2, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type SaveType = "blog" | "research";

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
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const canSave = isSignedIn ?? Boolean(session?.user);

  async function handleSave() {
    if (!canSave) {
      window.location.href = `/signin?callbackUrl=${encodeURIComponent(href)}`;
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/user/saved-items", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, key: itemKey, title, href, image }),
      });

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
      disabled={loading || status === "loading"}
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
