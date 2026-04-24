"use client";

import { useState, useEffect } from "react";
import { Menu, Images, Settings } from "lucide-react";

import { AdminSidebar } from "./admin-sidebar";
import { AdminWorkbench } from "./admin-workbench";
import { AdminContentEditor } from "./admin-content-editor";
import { AdminSEOTools } from "./admin-seo-tools";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Import Panel type from admin-workbench to ensure consistency
type Panel = "overview" | "content" | "research" | "blog" | "media" | "seo" | "security" | 
  "testimonials" | "images" | "videos" | "documents" | "uploads" | 
  "admin-users" | "permissions" | "sessions" | "traffic" | "content-performance" | 
  "reports" | "meta-tags" | "sitemap" | "analytics-tracking" | "theme" | 
  "navigation" | "footer" | "backup" | "cache" | "logs" | "contact-forms" | 
  "newsletter" | "notifications";

interface AdminLayoutProps {
  user?: {
    username: string;
    displayName: string;
    role: string;
  };
}

export function AdminLayout({ user }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>("overview");

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePanelChange = (panel: string) => {
    setActivePanel(panel as Panel);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <span className="font-bold text-slate-900">Admin</span>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user.displayName}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop top bar */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <h1 className="font-bold text-slate-900">Admin Dashboard</h1>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user.displayName}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex pt-14 lg:pt-0">
        {/* Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          activePanel={activePanel}
          onPanelChange={handlePanelChange}
          user={user}
        />

        {/* Content area */}
        <div className="flex-1 lg:ml-64 xl:ml-72">
          <div className="p-4 lg:p-6">
            {/* Dynamic content based on active panel */}
            {activePanel === 'overview' && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-2">Dashboard Overview</h3>
                    <p className="text-sm text-slate-600">Welcome to admin dashboard. Select a section from the sidebar to begin managing your content.</p>
                  </Card>
                </div>
              </div>
            )}
            
            {activePanel === 'content' && (
              <div className="space-y-6">
                <AdminContentEditor 
                  initialContent={{
                    title: 'Welcome Content',
                    content: '<p>Start creating your content here...</p>',
                    status: 'draft',
                    lastModified: new Date().toISOString()
                  }}
                  onSave={(content) => {/* Save to backend */}}
                  onPreview={(content) => {/* Show preview */}}
                  realTimeSync={true}
                />
              </div>
            )}
            
            {activePanel === 'blog' && (
              <div className="space-y-6">
                <AdminContentEditor 
                  initialContent={{
                    title: 'New Blog Post',
                    content: '<p>Start writing your blog post here...</p>',
                    status: 'draft',
                    lastModified: new Date().toISOString()
                  }}
                  onSave={(content) => {/* Save to backend */}}
                  onPreview={(content) => {/* Show preview */}}
                  realTimeSync={true}
                />
              </div>
            )}
            
            {activePanel === 'research' && (
              <div className="space-y-6">
                <AdminContentEditor 
                  initialContent={{
                    title: 'Research Content',
                    content: '<p>Start creating your research content here...</p>',
                    status: 'draft',
                    lastModified: new Date().toISOString()
                  }}
                  onSave={(content) => {/* Save to backend */}}
                  onPreview={(content) => {/* Show preview */}}
                  realTimeSync={true}
                />
              </div>
            )}
            
            {activePanel === 'media' && (
              <div className="space-y-6">
                <div className="text-center p-8">
                  <Images className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Media Library</h3>
                  <p className="text-sm text-slate-600">Upload and manage your media files here.</p>
                </div>
              </div>
            )}
            
            {activePanel === 'seo' && (
              <div className="space-y-6">
                <AdminSEOTools 
                  onSave={(seoData) => {/* Save to backend */}}
                  onPreview={(seoData) => {/* Show preview */}}
                />
              </div>
            )}
            
            {activePanel === 'testimonials' && (
              <div className="space-y-6">
                <AdminContentEditor 
                  initialContent={{
                    title: 'Testimonial Content',
                    content: '<p>Start creating your testimonials here...</p>',
                    status: 'draft',
                    lastModified: new Date().toISOString()
                  }}
                  onSave={(content) => {/* Save to backend */}}
                  onPreview={(content) => {/* Show preview */}}
                  realTimeSync={true}
                />
              </div>
            )}
            
            {activePanel && ['overview', 'content', 'blog', 'research', 'media', 'seo', 'testimonials'].includes(activePanel) === false && (
              <div className="space-y-6">
                <div className="text-center p-8">
                  <Settings className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Coming Soon</h3>
                  <p className="text-sm text-slate-600">This feature is under development.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
