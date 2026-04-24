"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Home,
  User,
  Briefcase,
  FileText,
  Image,
  Mail,
  Phone,
  MapPin,
  Clock,
  Star,
  BookOpen,
  ChevronRight,
  Search,
  Zap,
  Sparkles,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Send,
  ArrowRight,
  Rocket
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  description?: string;
  badge?: string;
  isNew?: boolean;
  isPopular?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    href: "/",
    description: "Welcome to Dr. Stephen Asatsa's practice"
  },
  {
    id: "about",
    label: "About",
    icon: User,
    href: "/about",
    description: "Learn about Dr. Asatsa's background and expertise"
  },
  {
    id: "services",
    label: "Services",
    icon: Briefcase,
    href: "/services",
    description: "Professional psychology services",
    isPopular: true
  },
  {
    id: "research",
    label: "Research",
    icon: FileText,
    href: "/research",
    description: "Academic research and publications",
    isNew: true
  },
  {
    id: "insights",
    label: "Insights",
    icon: BookOpen,
    href: "/blog",
    description: "Latest articles and insights"
  },
  {
    id: "gallery",
    label: "Gallery",
    icon: Image,
    href: "/gallery",
    description: "Photos and videos from our practice"
  },
  {
    id: "contact",
    label: "Contact",
    icon: Mail,
    href: "/contact",
    description: "Get in touch with Dr. Asatsa"
  }
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" }
];

interface SiteSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
}

export function SiteSidebar({ isOpen, onClose, currentPath = "/" }: SiteSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const filteredItems = sidebarItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubscribing(false);
    setEmail("");
    alert("Thank you for subscribing to our newsletter!");
  };

  const handleItemClick = (href: string) => {
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-white to-slate-50 shadow-2xl z-50 transition-all duration-500 transform
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          overflow-y-auto
        `}
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Menu</h2>
                <p className="text-sm text-white/80">Navigate with ease</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            <Input
              ref={searchInputRef}
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-10 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder-white/60 focus:bg-white/30 focus:border-white/50 rounded-lg"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/20 rounded"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-2 mb-6">
            {filteredItems.map((item, index) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => handleItemClick(item.href)}
                className={`
                  group block p-4 rounded-xl transition-all duration-300 relative overflow-hidden
                  ${currentPath === item.href
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'hover:bg-slate-100 hover:shadow-md hover:scale-[1.02]'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    relative transition-transform duration-300
                    ${currentPath === item.href ? 'scale-110' : 'group-hover:scale-105'}
                  `}>
                    <item.icon className={`w-6 h-6 ${currentPath === item.href ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'}`} />
                    
                    {currentPath === item.href && (
                      <div className="absolute inset-0 bg-white/20 rounded-full blur-md animate-pulse" />
                    )}
                    
                    {item.isNew && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    )}
                    {item.isPopular && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-sm ${currentPath === item.href ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'}`}>
                        {item.label}
                      </h3>
                      {item.badge && (
                        <Badge variant={currentPath === item.href ? "secondary" : "outline"} className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      {item.isNew && (
                        <Badge className="bg-green-100 text-green-800 text-xs animate-pulse">
                          NEW
                        </Badge>
                      )}
                      {item.isPopular && (
                        <Badge className="bg-orange-100 text-orange-800 text-xs animate-pulse">
                          <Star className="w-3 h-3 mr-1" />
                          POPULAR
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className={`text-xs mt-1 ${currentPath === item.href ? 'text-white/80' : 'text-slate-600 group-hover:text-slate-700'}`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  
                  <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${currentPath === item.href ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">No pages found</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200/50">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              Quick Contact
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4" />
                <span>+254 712 345 678</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4" />
                <span>contact@stephenasatsa.com</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>Nairobi, Kenya</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4" />
                <span>Mon-Fri: 9AM-6PM</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="px-6 pb-6">
          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Send className="w-4 h-4 text-green-600" />
              Newsletter
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Get latest insights and updates
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 border-green-200/50 focus:border-green-500 focus:ring-green-500/20"
                required
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-green-500/25 transition-all duration-300"
              >
                {isSubscribing ? (
                  <>
                    <Rocket className="w-4 h-4 mr-2 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Subscribe
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Follow Us</h3>
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              Social
            </Badge>
          </div>
          <div className="flex gap-2">
            {socialLinks.map((social, index) => (
              <Button
                key={social.label}
                variant="outline"
                size="sm"
                asChild
                className="hover:bg-slate-100 transition-all duration-200"
              >
                <a href={social.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                  <social.icon className="w-4 h-4" />
                  <span className="sr-only">{social.label}</span>
                </a>
              </Button>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 border-t border-slate-200/50">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>© 2024 Dr. Stephen Asatsa</span>
            <div className="flex items-center gap-2">
              <span>Nairobi, Kenya</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
