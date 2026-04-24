"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText,
  Plus,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Upload,
  Download,
  RefreshCw,
  Search,
  Filter,
  Grid,
  List,
  Settings,
  Bell,
  AlertCircle,
  Check,
  Info,
  TrendingUp,
  BarChart3,
  Users,
  Clock,
  Calendar,
  Zap,
  Target
} from "lucide-react";

interface ContentStats {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  lastModified: string;
}

export default function AdminContentPage() {
  const [stats] = useState<ContentStats>({
    total: 12,
    published: 8,
    draft: 3,
    scheduled: 1,
    lastModified: '2024-01-15T10:30:00Z'
  });

  const [activeSection, setActiveSection] = useState<'overview' | 'pages' | 'posts' | 'media' | 'seo'>('overview');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">Content Management</h1>
                <p className="text-sm text-slate-600">Manage all your website content in one place</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{stats.total}</div>
                <div className="text-sm text-slate-600">Total Content</div>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.published}</div>
                <div className="text-sm text-slate-600">Published</div>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
                <div className="text-sm text-slate-600">Draft</div>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
                <div className="text-sm text-slate-600">Scheduled</div>
              </Card>
            </div>

            {/* Section Navigation */}
            <div className="flex gap-2">
              <Button
                variant={activeSection === 'overview' ? 'default' : 'outline'}
                onClick={() => setActiveSection('overview')}
              >
                <BarChart3 className="w-4 h-3 mr-1" />
                Overview
              </Button>
              
              <Button
                variant={activeSection === 'pages' ? 'default' : 'outline'}
                onClick={() => setActiveSection('pages')}
              >
                <FileText className="w-4 h-3 mr-1" />
                Pages
              </Button>
              
              <Button
                variant={activeSection === 'posts' ? 'default' : 'outline'}
                onClick={() => setActiveSection('posts')}
              >
                <Edit3 className="w-4 h-3 mr-1" />
                Posts
              </Button>
              
              <Button
                variant={activeSection === 'media' ? 'default' : 'outline'}
                onClick={() => setActiveSection('media')}
              >
                <Upload className="w-4 h-3 mr-1" />
                Media
              </Button>
              
              <Button
                variant={activeSection === 'seo' ? 'default' : 'outline'}
                onClick={() => setActiveSection('seo')}
              >
                <Target className="w-4 h-3 mr-1" />
                SEO
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="p-6">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Content Overview</h3>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-slate-700 mb-2">Recent Activity</h4>
                    <div className="text-sm text-slate-600">
                      <p>Last modified: {stats.lastModified}</p>
                      <p>Most active content: Homepage Hero</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-slate-700 mb-2">Content Performance</h4>
                    <div className="text-sm text-slate-600">
                      <p>Average SEO score: <span className="text-green-600 font-semibold">78/100</span></p>
                      <p>Top performing: Services page</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Clock className="w-4 h-3 mr-1" />
                  View All Content
                </Button>
                
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                >
                  <Plus className="w-4 h-3 mr-1" />
                  Create New Content
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="grid gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-3" />
                  Bulk Upload
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-3" />
                  Sync All Content
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-3" />
                  Export Content
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Pages Section */}
        {activeSection === 'pages' && (
          <div className="text-center">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
              <div>
                <h3 className="font-semibold text-slate-900">Pages Management</h3>
                <p className="text-sm text-slate-600">Create and manage individual pages</p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Homepage</h3>
                  <p className="text-sm text-slate-600">Manage homepage content</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Manage Homepage
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">About</h3>
                  <p className="text-sm text-slate-600">Manage about page content</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Manage About
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Services</h3>
                  <p className="text-sm text-slate-600">Manage services content</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Manage Services
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Contact</h3>
                  <p className="text-sm text-slate-600">Manage contact page content</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Manage Contact
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* Posts Section */}
        {activeSection === 'posts' && (
          <div className="text-center">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
              <div>
                <h3 className="font-semibold text-slate-900">Blog Management</h3>
                <p className="text-sm text-slate-600">Create and manage blog posts</p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Edit3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Blog Posts</h3>
                  <p className="text-sm text-slate-600">Manage blog articles and posts</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Manage Blog Posts
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Categories</h3>
                  <p className="text-sm text-slate-600">Manage blog categories</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Manage Categories
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Comments</h3>
                  <p className="text-sm text-slate-600">Manage blog comments</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Manage Comments
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* Media Section */}
        {activeSection === 'media' && (
          <div className="text-center">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
              <div>
                <h3 className="font-semibold text-slate-900">Media Library</h3>
                <p className="text-sm text-slate-600">Manage media files and assets</p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Images</h3>
                  <p className="text-sm text-slate-600">Manage image gallery</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Manage Images
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Videos</h3>
                  <p className="text-sm text-slate-600">Manage video content</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Manage Videos
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Documents</h3>
                  <p className="text-sm text-slate-600">Manage document library</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Manage Documents
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Settings className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Upload Queue</h3>
                  <p className="text-sm text-slate-600">Manage upload queue</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Manage Upload Queue
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* SEO Section */}
        {activeSection === 'seo' && (
          <div className="text-center">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
              <div>
                <h3 className="font-semibold text-slate-900">SEO Management</h3>
                <p className="text-sm text-slate-600">Optimize search engine performance</p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Meta Tags</h3>
                  <p className="text-sm text-slate-600">Manage meta descriptions</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Manage Meta Tags
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Keywords</h3>
                  <p className="text-sm text-slate-600">Manage SEO keywords</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Manage Keywords
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Globe className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Sitemap</h3>
                  <p className="text-sm text-slate-600">Generate sitemaps</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Generate Sitemap
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Robots.txt</h3>
                  <p className="text-sm text-slate-600">Manage robots file</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Manage Robots.txt
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Analytics</h3>
                  <p className="text-sm text-slate-600">View SEO analytics</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  View Analytics
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* Last Modified */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Last content update: {stats.lastModified}</p>
        </div>
      </div>
    </div>
  );
}
