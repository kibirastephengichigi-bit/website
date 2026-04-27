"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PreferencesPanel({
  initialPreferences,
}: {
  initialPreferences: {
    newsletterSubscribed: boolean;
    productUpdates: boolean;
    analyticsConsent: boolean;
    marketingConsent: boolean;
    cookieConsentLevel: string;
    theme: string;
    locale: string;
  };
}) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
    } finally {
      setSaving(false);
    }
  }

  function toggle(key: keyof typeof preferences) {
    setPreferences((current) => ({
      ...current,
      [key]: typeof current[key] === "boolean" ? !current[key] : current[key],
    }));
  }

  return (
    <Card className="space-y-5 p-6">
      <div className="space-y-1">
        <h3 className="font-display text-3xl">Preferences</h3>
        <p className="text-sm text-muted-foreground">Control newsletters, notifications, and privacy choices.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {[
          ["newsletterSubscribed", "Newsletter subscription"],
          ["productUpdates", "Product and update emails"],
          ["analyticsConsent", "Analytics consent"],
          ["marketingConsent", "Marketing consent"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
              preferences[key as keyof typeof preferences] ? "border-accent bg-accent/10" : "border-border bg-background"
            }`}
            onClick={() => toggle(key as keyof typeof preferences)}
          >
            <div className="font-medium">{label}</div>
            <div className="text-xs text-muted-foreground">
              {preferences[key as keyof typeof preferences] ? "Enabled" : "Disabled"}
            </div>
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium">Theme</span>
          <select
            className="h-11 w-full rounded-2xl border border-border bg-background px-4"
            value={preferences.theme}
            onChange={(event) => setPreferences((current) => ({ ...current, theme: event.target.value }))}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Language</span>
          <select
            className="h-11 w-full rounded-2xl border border-border bg-background px-4"
            value={preferences.locale}
            onChange={(event) => setPreferences((current) => ({ ...current, locale: event.target.value }))}
          >
            <option value="en">English</option>
          </select>
        </label>
      </div>
      <Button onClick={() => void save()} disabled={saving}>
        {saving ? "Saving..." : "Save preferences"}
      </Button>
    </Card>
  );
}

