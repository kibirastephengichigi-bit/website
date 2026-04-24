"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  Images,
  ShieldCheck,
  Settings,
  Users,
  BarChart3,
  Palette,
  Database,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  Edit3,
  Upload,
  Clock,
  History,
  Search,
  Bell,
  User,
  Mail,
  Phone,
  Globe,
  Lock,
  Key,
  Activity,
  TrendingUp,
  Download,
  RefreshCw,
  Eye,
  HelpCircle,
  FileImage,
  Video,
  Music,
  File,
  Folder,
  Tag,
  Calendar,
  MessageSquare,
  Star,
  Heart,
  Bookmark,
  Share2,
  Copy,
  Trash2,
  Plus,
  Minus,
  Filter,
  Grid,
  List,
  MoreVertical,
  Check,
  AlertCircle,
  Info,
  Zap,
  Target,
  Award,
  BookOpen,
  GraduationCap,
  Briefcase,
  Handshake,
  Megaphone
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SidebarItem = {
  id: string;
  label: string;
  icon: any;
  href?: string;
  badge?: string | number;
  children?: SidebarItem[];
  description?: string;
};

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
    description: "Main admin dashboard"
  },
  {
    id: "content",
    label: "Content Management",
    icon: Edit3,
    children: [
      {
        id: "content-overview",
        label: "Content Overview",
        icon: Sparkles,
        href: "/admin/content",
        description: "Manage all website content"
      },
      {
        id: "site-content",
        label: "Site Content",
        icon: FileText,
        href: "/admin/content",
        description: "Hero, services, quotes, contact"
      },
      {
        id: "blog",
        label: "Blog Manager",
        icon: FileText,
        href: "/admin/content",
        description: "Create, edit, and organize publishable articles."
      },
      {
        id: "research",
        label: "Research Data",
        icon: FileText,
        href: "/admin/content",
        description: "Projects, publications, testimonials, and advanced collections."
      },
      {
        id: "testimonials",
        label: "Testimonials",
        icon: FileText,
        href: "/admin/content",
        description: "Client testimonials and related profiles."
      }
    ]
  },
  {
    id: "media",
    label: "Media Library",
    icon: Images,
    children: [
      {
        id: "media-overview",
        label: "Media Overview",
        icon: Images,
        href: "/admin/media",
        description: "Manage all media files"
      },
      {
        id: "images",
        label: "Images",
        icon: FileImage,
        href: "/admin/media",
        description: "Photo gallery"
      },
      {
        id: "videos",
        label: "Videos",
        icon: Video,
        href: "/admin/media",
        description: "Video content"
      },
      {
        id: "documents",
        label: "Documents",
        icon: File,
        href: "/admin/media",
        description: "PDFs and files"
      },
      {
        id: "uploads",
        label: "Upload Manager",
        icon: Upload,
        href: "/admin/media",
        description: "Upload new media"
      }
    ]
  },
  {
    id: "seo",
    label: "SEO Tools",
    icon: Globe,
    children: [
      {
        id: "seo-overview",
        label: "SEO Overview",
        icon: Target,
        href: "/admin/seo",
        description: "Comprehensive SEO management"
      },
      {
        id: "meta-tags",
        label: "Meta Tags",
        icon: Tag,
        href: "/admin/seo",
        description: "SEO metadata"
      },
      {
        id: "sitemap",
        label: "Sitemap",
        icon: Grid,
        href: "/admin/seo",
        description: "Site structure"
      },
      {
        id: "analytics-tracking",
        label: "Analytics Tracking",
        icon: BarChart3,
        href: "/admin/seo",
        description: "Tracking codes"
      }
    ]
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
    children: [
      {
        id: "admin-users",
        label: "Admin Users",
        icon: ShieldCheck,
        href: "/admin/users",
        description: "Manage admin accounts"
      },
      {
        id: "permissions",
        label: "Permissions",
        icon: Key,
        href: "/admin/users",
        description: "Role-based access"
      },
      {
        id: "sessions",
        label: "Active Sessions",
        icon: Activity,
        href: "/admin/users",
        description: "Monitor sessions"
      }
    ]
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    children: [
      {
        id: "traffic",
        label: "Traffic Stats",
        icon: TrendingUp,
        href: "/admin/analytics",
        description: "Visitor analytics"
      },
      {
        id: "content-performance",
        label: "Content Performance",
        icon: Star,
        href: "/admin/analytics",
        description: "Popular content"
      },
      {
        id: "reports",
        label: "Reports",
        icon: Download,
        href: "/admin/analytics",
        description: "Export reports"
      }
    ]
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    children: [
      {
        id: "theme",
        label: "Theme Customization",
        icon: Palette,
        href: "#theme",
        description: "Colors and fonts"
      },
      {
        id: "navigation",
        label: "Navigation",
        icon: Menu,
        href: "#navigation",
        description: "Menu structure"
      },
      {
        id: "footer",
        label: "Footer",
        icon: Grid,
        href: "#footer",
        description: "Footer content"
      }
    ]
  },
  {
    id: "technical",
    label: "Technical",
    icon: Settings,
    children: [
      {
        id: "security",
        label: "Security",
        icon: ShieldCheck,
        href: "#security",
        description: "Security settings"
      },
      {
        id: "backup",
        label: "Backup & Restore",
        icon: Database,
        href: "#backup",
        description: "Data backup"
      },
      {
        id: "cache",
        label: "Cache Management",
        icon: RefreshCw,
        href: "#cache",
        description: "Clear cache"
      },
      {
        id: "logs",
        label: "System Logs",
        icon: History,
        href: "#logs",
        description: "Error logs"
      }
    ]
  },
  {
    id: "communication",
    label: "Communication",
    icon: Mail,
    children: [
      {
        id: "contact-forms",
        label: "Contact Forms",
        icon: MessageSquare,
        href: "#contact-forms",
        description: "Form submissions"
      },
      {
        id: "newsletter",
        label: "Newsletter",
        icon: Mail,
        href: "#newsletter",
        description: "Email subscribers"
      },
      {
        id: "notifications",
        label: "Notifications",
        icon: Bell,
        href: "#notifications",
        description: "System notifications"
      }
    ]
  }
];

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activePanel: string;
  onPanelChange: (panel: string) => void;
  user?: {
    username: string;
    displayName: string;
    role: string;
  };
}

export function AdminSidebar({ isOpen, onToggle, activePanel, onPanelChange, user }: AdminSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['content', 'media']));

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.children) {
      toggleExpanded(item.id);
    } else if (item.href) {
      // Extract panel ID from href (remove #)
      const panelId = item.href.replace('#', '');
      onPanelChange(panelId);
    }
  };

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const isActive = item.id === activePanel || (item.href && item.href.includes(activePanel));
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="w-full">
        <button
          onClick={() => handleItemClick(item)}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
            ${isActive 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }
          `}
          style={{ paddingLeft: `${level * 12 + 12}px` }}
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1 text-left font-medium text-sm">{item.label}</span>
          
          <div className="flex items-center gap-2">
            {item.badge && (
              <Badge variant={isActive ? "secondary" : "outline"} className="text-xs">
                {item.badge}
              </Badge>
            )}
            
            {hasChildren && (
              <div className="transition-transform duration-200">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            )}
          </div>
        </button>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64 xl:w-72 flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Admin Panel</h2>
                <p className="text-xs text-slate-500">Control Center</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {sidebarItems.map(item => renderSidebarItem(item))}
          </div>
        </div>
        
        {/* User Profile */}
        {user && (
          <div className="p-4 border-t border-slate-200">
            <Card className="p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{user.displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{user.role}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="w-3 h-3 mr-1" />
                  Settings
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <LogOut className="w-3 h-3 mr-1" />
                  Logout
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
