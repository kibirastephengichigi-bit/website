"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FileText,
  Images,
  Users,
  BarChart3,
  Settings,
  Globe,
  ShieldCheck,
  Database,
  Zap,
  TrendingUp,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  BookOpen,
  Target,
  Award,
  Rocket,
  Lightbulb,
  RefreshCw,
  Eye,
  Edit3,
  Plus,
  Clock,
  Upload
} from "lucide-react";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'available' | 'coming-soon' | 'new';
  path: string;
  lastUpdated?: string;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  action?: string;
  completed?: boolean;
}

interface SystemStats {
  totalContent: number;
  totalMedia: number;
  totalUsers: number;
  lastUpdate: string;
}

export default function AdminDashboard() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [tutorialSteps, setTutorialSteps] = useState<TutorialStep[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    loadDashboardData();
    // Set up interval for checking updates
    const interval = setInterval(loadDashboardData, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load system stats
      const statsResponse = await fetch('http://localhost:8000/api/content');
      let totalContent = 0;
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        totalContent = data.content?.length || 0;
      }

      // Load media stats
      const mediaResponse = await fetch('http://localhost:8000/api/media');
      let totalMedia = 0;
      if (mediaResponse.ok) {
        const data = await mediaResponse.json();
        totalMedia = data.media?.length || 0;
      }

      setSystemStats({
        totalContent,
        totalMedia,
        totalUsers: 1, // Mock data for now
        lastUpdate: new Date().toISOString()
      });

      // Load features with dynamic updates
      const updatedFeatures: Feature[] = [
        {
          id: 'content',
          title: 'Content Management',
          description: 'Create, edit, and manage all website content including pages, blog posts, research, and testimonials.',
          icon: FileText,
          status: 'available',
          path: '/admin/content',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'media',
          title: 'Media Library',
          description: 'Upload, organize, and manage images, videos, and documents for your website.',
          icon: Images,
          status: 'available',
          path: '/admin/media',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'users',
          title: 'User Management',
          description: 'Manage admin accounts, roles, permissions, and monitor user activity.',
          icon: Users,
          status: 'available',
          path: '/admin/users',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'analytics',
          title: 'Analytics Dashboard',
          description: 'Monitor website performance, traffic statistics, and content engagement metrics.',
          icon: BarChart3,
          status: 'available',
          path: '/admin/analytics',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'seo',
          title: 'SEO Tools',
          description: 'Optimize your website for search engines with meta tags, sitemaps, and analytics.',
          icon: Globe,
          status: 'available',
          path: '/admin/seo',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'settings',
          title: 'Site Settings',
          description: 'Configure website settings, appearance, and technical configurations.',
          icon: Settings,
          status: 'available',
          path: '/admin/settings',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'security',
          title: 'Security Center',
          description: 'Advanced security settings, backup management, and system monitoring.',
          icon: ShieldCheck,
          status: 'coming-soon',
          path: '/admin/security'
        },
        {
          id: 'api',
          title: 'API Management',
          description: 'Manage API keys, webhooks, and third-party integrations.',
          icon: Database,
          status: 'coming-soon',
          path: '/admin/api'
        }
      ];

      setFeatures(updatedFeatures);

      // Load tutorial steps
      setTutorialSteps([
        {
          id: 'welcome',
          title: 'Welcome to Admin Dashboard',
          description: 'This is your central hub for managing the Stephen Asatsa website. Let\'s walk through what you can do.',
          icon: Rocket,
          completed: true
        },
        {
          id: 'content',
          title: 'Manage Your Content',
          description: 'Start by creating and editing content. Go to Content Management to add pages, blog posts, and research articles.',
          icon: FileText,
          action: 'Go to Content Management',
          completed: false
        },
        {
          id: 'media',
          title: 'Upload Media Files',
          description: 'Add images, videos, and documents to enhance your content. The Media Library helps organize all your files.',
          icon: Images,
          action: 'Open Media Library',
          completed: false
        },
        {
          id: 'seo',
          title: 'Optimize for Search',
          description: 'Use SEO Tools to improve your website\'s visibility on search engines and attract more visitors.',
          icon: Globe,
          action: 'Access SEO Tools',
          completed: false
        },
        {
          id: 'analytics',
          title: 'Track Performance',
          description: 'Monitor your website\'s performance with detailed analytics and insights.',
          icon: BarChart3,
          action: 'View Analytics',
          completed: false
        },
        {
          id: 'users',
          title: 'Manage Team Access',
          description: 'Add team members and manage their permissions to collaborate effectively.',
          icon: Users,
          action: 'Manage Users',
          completed: false
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const handleAction = (action: string, path: string) => {
    if (action.includes('Go to') || action.includes('Open') || action.includes('Access') || action.includes('View') || action.includes('Manage')) {
      window.location.href = path;
    }
  };

  const completeStep = (stepId: string) => {
    setTutorialSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case 'coming-soon':
        return <Badge className="bg-yellow-100 text-yellow-800">Coming Soon</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600">Welcome back! Here\'s what\'s happening with your website.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            System Healthy
          </Badge>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Stats */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Content</p>
                <p className="text-2xl font-bold text-slate-900">{systemStats.totalContent}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Media Files</p>
                <p className="text-2xl font-bold text-slate-900">{systemStats.totalMedia}</p>
              </div>
              <Images className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Users</p>
                <p className="text-2xl font-bold text-slate-900">{systemStats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Last Update</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(systemStats.lastUpdate).toLocaleTimeString()}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Tutorial Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Getting Started Tutorial</h2>
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            {tutorialSteps.filter(step => step.completed).length}/{tutorialSteps.length} Completed
          </Badge>
        </div>

        <div className="space-y-4">
          {tutorialSteps.map((step, index) => (
            <div 
              key={step.id} 
              className={`flex items-start gap-4 p-4 rounded-lg border ${
                index === currentStep ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                step.completed ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
              }`}>
                <step.icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-sm text-slate-600 mb-2">{step.description}</p>
                
                {step.action && !step.completed && (
                  <Button 
                    size="sm" 
                    onClick={() => {
                      completeStep(step.id);
                      const feature = features.find(f => f.id === step.id);
                      handleAction(step.action || '', feature?.path || '/admin');
                    }}
                  >
                    {step.action}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
                
                {step.completed && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.id} className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                feature.status === 'available' ? 'bg-blue-100 text-blue-800' : 
                feature.status === 'new' ? 'bg-green-100 text-green-800' : 
                'bg-gray-100 text-gray-600'
              }`}>
                <feature.icon className="w-6 h-6" />
              </div>
              {getStatusBadge(feature.status)}
            </div>
            
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-slate-600 mb-4">{feature.description}</p>
            
            {feature.lastUpdated && (
              <div className="text-xs text-slate-500 mb-4">
                <Clock className="w-3 h-3 inline mr-1" />
                Updated {new Date(feature.lastUpdated).toLocaleString()}
              </div>
            )}
            
            <div className="flex gap-2">
              {feature.status === 'available' ? (
                <Button 
                  size="sm" 
                  onClick={() => window.location.href = feature.path}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Open
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled className="flex-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Coming Soon
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Updates */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-bold text-slate-900">Recent Updates</h2>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800">
            <Lightbulb className="w-3 h-3 mr-1" />
            Live Updates
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Database Integration Complete</p>
              <p className="text-xs text-slate-600">All content and media now stored in database with full CRUD operations</p>
            </div>
            <span className="text-xs text-slate-500">Just now</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">New Admin Pages Added</p>
              <p className="text-xs text-slate-600">Individual pages for content, media, users, analytics, and SEO</p>
            </div>
            <span className="text-xs text-slate-500">2 hours ago</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Enhanced Security Features</p>
              <p className="text-xs text-slate-600">User authentication and session management implemented</p>
            </div>
            <span className="text-xs text-slate-500">5 hours ago</span>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/admin/content'}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Content
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/admin/media'}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Media
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/admin/analytics'}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            View Stats
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/admin/settings'}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </Card>
    </div>
  );
}
