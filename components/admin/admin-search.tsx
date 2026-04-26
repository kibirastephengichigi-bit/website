"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ExternalLink, FileText, Settings, Users, BarChart3, Globe, Images, ShieldCheck, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  category: string;
  keywords?: string[];
}

const searchItems: SearchResult[] = [
  // Dashboard
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Main admin dashboard with overview and stats",
    href: "/admin",
    icon: BarChart3,
    category: "Dashboard",
    keywords: ["home", "overview", "stats", "main"]
  },
  // Content Management
  {
    id: "home-page",
    title: "Home Page",
    description: "Edit home page content, hero section, and basic information",
    href: "/admin/content/home",
    icon: FileText,
    category: "Content",
    keywords: ["landing", "front", "hero", "welcome"]
  },
  {
    id: "content-overview",
    title: "Content Overview",
    description: "Manage all website content",
    href: "/admin/content",
    icon: FileText,
    category: "Content",
    keywords: ["pages", "text", "articles", "posts"]
  },
  {
    id: "affiliations",
    title: "Professional Affiliations",
    description: "Manage professional affiliations and descriptions",
    href: "/admin/affiliations",
    icon: ShieldCheck,
    category: "Content",
    keywords: ["memberships", "organizations", "associations"]
  },
  {
    id: "research-interests",
    title: "Research Interests",
    description: "Manage research interests and focus areas",
    href: "/admin/research-interests",
    icon: FileText,
    category: "Content",
    keywords: ["topics", "areas", "focus", "expertise"]
  },
  {
    id: "awards",
    title: "Awards & Honors",
    description: "Manage awards, honors, and recognition",
    href: "/admin/awards",
    icon: ShieldCheck,
    category: "Content",
    keywords: ["honors", "recognition", "achievements", "prizes"]
  },
  {
    id: "external-profiles",
    title: "External Profiles",
    description: "Manage external profile links and social media",
    href: "/admin/external-profiles",
    icon: Globe,
    category: "Content",
    keywords: ["social", "links", "profiles", "networks"]
  },
  // Media
  {
    id: "media",
    title: "Media Library",
    description: "Upload, organize, and manage images, videos, and documents",
    href: "/admin/media",
    icon: Images,
    category: "Media",
    keywords: ["files", "upload", "images", "videos", "documents", "photos"]
  },
  // Users
  {
    id: "users",
    title: "User Management",
    description: "Manage admin accounts, roles, and permissions",
    href: "/admin/users",
    icon: Users,
    category: "Users",
    keywords: ["accounts", "admin", "permissions", "roles", "access"]
  },
  // Analytics
  {
    id: "analytics",
    title: "Analytics Dashboard",
    description: "Monitor website performance and traffic statistics",
    href: "/admin/analytics",
    icon: BarChart3,
    category: "Analytics",
    keywords: ["stats", "traffic", "performance", "metrics", "data"]
  },
  // SEO
  {
    id: "seo",
    title: "SEO Tools",
    description: "Optimize website for search engines with meta tags and sitemaps",
    href: "/admin/seo",
    icon: Globe,
    category: "SEO",
    keywords: ["search", "optimization", "meta", "sitemap", "google"]
  },
  // Settings
  {
    id: "settings",
    title: "Site Settings",
    description: "Configure website settings, appearance, and technical configurations",
    href: "/admin/settings",
    icon: Settings,
    category: "Settings",
    keywords: ["config", "configuration", "preferences", "options"]
  }
];

interface AdminSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

// Fuzzy matching function
const fuzzyMatch = (text: string, query: string): boolean => {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Exact match
  if (lowerText.includes(lowerQuery)) return true;
  
  // Fuzzy match - check if all characters in query appear in order in text
  let queryIndex = 0;
  for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === lowerQuery.length;
};

// Calculate relevance score
const calculateRelevance = (item: SearchResult, query: string): number => {
  const lowerQuery = query.toLowerCase();
  let score = 0;
  
  // Exact title match
  if (item.title.toLowerCase() === lowerQuery) score += 100;
  // Title starts with query
  else if (item.title.toLowerCase().startsWith(lowerQuery)) score += 80;
  // Title contains query
  else if (item.title.toLowerCase().includes(lowerQuery)) score += 60;
  
  // Description match
  if (item.description.toLowerCase().includes(lowerQuery)) score += 40;
  
  // Category match
  if (item.category.toLowerCase().includes(lowerQuery)) score += 30;
  
  // Keywords match
  if (item.keywords) {
    const keywordMatch = item.keywords.some(k => k.toLowerCase().includes(lowerQuery));
    if (keywordMatch) score += 50;
  }
  
  // Fuzzy match bonus
  if (fuzzyMatch(item.title, query)) score += 20;
  
  return score;
};

export function AdminSearch({ isOpen, onClose }: AdminSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('admin-search-history');
    if (stored) {
      setSearchHistory(JSON.parse(stored));
    }
  }, []);

  // Save search to history
  const saveToHistory = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    const updated = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem('admin-search-history', JSON.stringify(updated));
  };

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
      const scored = searchItems
        .map(item => ({
          item,
          score: calculateRelevance(item, query)
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => item);
      
      setResults(scored);
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
        saveToHistory(query);
        window.location.href = results[selectedIndex].href;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, query]);

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    inputRef.current?.focus();
  };

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
          {/* Search History */}
          {query.trim() === "" && searchHistory.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>Recent Searches</span>
              </div>
              <div className="flex flex-wrap gap-2 px-3">
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(item)}
                    className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try different keywords or check spelling</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((result, index) => (
                <a
                  key={result.id}
                  href={result.href}
                  onClick={() => {
                    saveToHistory(query);
                    onClose();
                  }}
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
                      <Badge variant="outline" className="text-xs">
                        {result.category}
                      </Badge>
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
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              <span>{results.length} results</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
