"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Type, Layout } from "lucide-react";

export function HeroPersonalizer() {
  const [theme, setTheme] = useState("professional");
  const [layout, setLayout] = useState("center");
  const [typography, setTypography] = useState("modern");

  const themes = [
    { id: "professional", label: "Professional", color: "bg-blue-500" },
    { id: "creative", label: "Creative", color: "bg-purple-500" },
    { id: "minimal", label: "Minimal", color: "bg-gray-500" },
  ];

  const layouts = [
    { id: "center", label: "Center" },
    { id: "left", label: "Left" },
    { id: "right", label: "Right" },
  ];

  const typographies = [
    { id: "modern", label: "Modern" },
    { id: "classic", label: "Classic" },
    { id: "bold", label: "Bold" },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 space-y-4 border border-white/20">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-4 w-4" />
        <span className="text-sm font-medium">Personalize Your Experience</span>
      </div>

      {/* Theme Selection */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Palette className="h-3 w-3" />
          <span className="text-xs font-medium">Theme</span>
        </div>
        <div className="flex gap-2">
          {themes.map((t) => (
            <Button
              key={t.id}
              variant={theme === t.id ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme(t.id)}
              className="text-xs"
            >
              <div className={`w-2 h-2 rounded-full ${t.color} mr-1`} />
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Layout Selection */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Layout className="h-3 w-3" />
          <span className="text-xs font-medium">Layout</span>
        </div>
        <div className="flex gap-2">
          {layouts.map((l) => (
            <Button
              key={l.id}
              variant={layout === l.id ? "default" : "outline"}
              size="sm"
              onClick={() => setLayout(l.id)}
              className="text-xs"
            >
              {l.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Typography Selection */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Type className="h-3 w-3" />
          <span className="text-xs font-medium">Typography</span>
        </div>
        <div className="flex gap-2">
          {typographies.map((t) => (
            <Button
              key={t.id}
              variant={typography === t.id ? "default" : "outline"}
              size="sm"
              onClick={() => setTypography(t.id)}
              className="text-xs"
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Current Selection Display */}
      <div className="pt-2 border-t border-white/20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Current:</span>
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-xs">
              {themes.find(t => t.id === theme)?.label}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {layouts.find(l => l.id === layout)?.label}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {typographies.find(t => t.id === typography)?.label}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
