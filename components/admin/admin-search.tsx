"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ExternalLink, FileText, Settings, Users, BarChart3, Globe, Images, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  category: string;
}

const searchItems: SearchResult[] = [
  // Dashboard
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Main admin dashboard with overview and stats",
    href: "/admin",
    icon: BarChart3,
    category: "Dashboard"
  },
  // Content Management
  {
    id: "home-page",
    title: "Home Page",
    description: "Edit home page content, hero section, and basic information",
    href: "/admin/content/home",
    icon: FileText,
    category: "Content"
  },
  {
    id: "content-overview",
    title: "Content Overview",
    description: "Manage all website content",
    href: "/admin/content",
    icon: FileText,
    category: "Content"
  },
  {
    id: "affiliations",
    title: "Professional Affiliations",
    description: "Manage professional affiliations and descriptions",
    href: "/admin/affiliations",
    icon: ShieldCheck,
    category: "Content"
  },
  {
    id: "research-interests",
    title: "Research Interests",
    description: "Manage research interests and focus areas",
    href: "/admin/research-interests",
    icon: FileText,
    category: "Content"
  },
  {
    id: "awards",
    title: "Awards & Honors",
    description: "Manage awards, honors, and recognition",
    href: "/admin/awards",
    icon: ShieldCheck,
    category: "Content"
  },
  {
    id: "external-profiles",
    title: "External Profiles",
    description: "Manage external profile links and social media",
    href: "/admin/external-profiles",
    icon: Globe,
    category: "Content"
  },
  // Media
  {
    id: "media",
    title: "Media Library",
    description: "Upload, organize, and manage images, videos, and documents",
    href: "/admin/media",
    icon: Images,
    category: "Media"
  },
  // Users
  {
    id: "users",
    title: "User Management",
    description: "Manage admin accounts, roles, and permissions",
    href: "/admin/users",
    icon: Users,
    category: "Users"
  },
  // Analytics
  {
    id: "analytics",
    title: "Analytics Dashboard",
    description: "Monitor website performance and traffic statistics",
    href: "/admin/analytics",
    icon: BarChart3,
    category: "Analytics"
  },
  // SEO
  {
    id: "seo",
    title: "SEO Tools",
    description: "Optimize website for search engines with meta tags and sitemaps",
    href: "/admin/seo",
    icon: Globe,
    category: "SEO"
  },
  // Settings
  {
    id: "settings",
    title: "Site Settings",
    description: "Configure website settings, appearance, and technical configurations",
    href: "/admin/settings",
    icon: Settings,
    category: "Settings"
  }
];

interface AdminSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSearch({ isOpen, onClose }: AdminSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim() === "") {
      setResults(searchItems);
      setSelectedIndex(0);
    } else {
      const filtered = searchItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setSelectedIndex(0);
    }
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        window.location.href = results[selectedIndex].href;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <Card className="relative w-full max-w-2xl bg-white shadow-2xl">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search admin pages... (Ctrl+K)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 text-base"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((result, index) => (
                <a
                  key={result.id}
                  href={result.href}
                  onClick={onClose}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg transition-colors
                    ${index === selectedIndex ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50'}
                  `}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <result.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-900">{result.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {result.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">{result.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono">esc</kbd>
                Close
              </span>
            </div>
            <span>{results.length} results</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
