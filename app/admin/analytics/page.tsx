"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  Target,
  FileText,
  Settings,
  Clock,
  Filter,
  Grid,
  List,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  MoreVertical,
  Zap,
  Activity,
  Globe,
  Star,
  Heart,
  MessageSquare,
  Check,
  AlertCircle,
  Info,
  X
} from "lucide-react";

interface AnalyticsData {
  totalVisitors: number;
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: string;
  topPages: Array<{
    path: string;
    views: number;
    percentage: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  contentPerformance: Array<{
    title: string;
    views: number;
    engagement: number;
    bounceRate: number;
  }>;
  userActivity: Array<{
    user: string;
    action: string;
    timestamp: string;
    page: string;
  }>;
}

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('7days');
  const [activeSection, setActiveSection] = useState<'overview' | 'traffic' | 'content' | 'users' | 'reports'>('overview');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedModal, setSelectedModal] = useState<string | null>(null);

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalVisitors: 15420,
    pageViews: 45680,
    uniqueVisitors: 12350,
    bounceRate: 32.5,
    avgSessionDuration: '3m 45s',
    topPages: [
      { path: '/homepage', views: 8920, percentage: 19.5 },
      { path: '/about', views: 5430, percentage: 11.9 },
      { path: '/services', views: 4210, percentage: 9.2 },
      { path: '/blog', views: 3890, percentage: 8.5 },
      { path: '/contact', views: 2100, percentage: 4.6 }
    ],
    trafficSources: [
      { source: 'Organic Search', visitors: 8920, percentage: 57.8 },
      { source: 'Direct Traffic', visitors: 3420, percentage: 22.2 },
      { source: 'Social Media', visitors: 2100, percentage: 13.6 },
      { source: 'Referral', visitors: 980, percentage: 6.4 }
    ],
    contentPerformance: [
      { title: 'Homepage Hero', views: 8920, engagement: 78.5, bounceRate: 25.3 },
      { title: 'About Page', views: 5430, engagement: 82.1, bounceRate: 18.7 },
      { title: 'Services Page', views: 4210, engagement: 76.3, bounceRate: 22.1 },
      { title: 'Blog Posts', views: 3890, engagement: 85.2, bounceRate: 15.8 }
    ],
    userActivity: [
      { user: 'admin', action: 'Page View', timestamp: '2024-01-15T10:30:00Z', page: '/admin/analytics' },
      { user: 'admin', action: 'Export Report', timestamp: '2024-01-15T09:15:00Z', page: '/admin/analytics' },
      { user: 'user1', action: 'Login', timestamp: '2024-01-15T08:45:00Z', page: '/login' },
      { user: 'user2', action: 'Page View', timestamp: '2024-01-15T07:20:00Z', page: '/homepage' }
    ]
  });

  const generateDataForRange = (range: string): AnalyticsData => {
    const multipliers: Record<string, number> = {
      '24hours': 0.1,
      '7days': 1,
      '30days': 4,
      '90days': 12,
      '1year': 52
    };
    const mult = multipliers[range] || 1;

    return {
      totalVisitors: Math.round(15420 * mult),
      pageViews: Math.round(45680 * mult),
      uniqueVisitors: Math.round(12350 * mult),
      bounceRate: 30 + Math.random() * 10,
      avgSessionDuration: `${Math.floor(2 + Math.random() * 3)}m ${Math.floor(Math.random() * 60)}s`,
      topPages: [
        { path: '/homepage', views: Math.round(8920 * mult), percentage: 19.5 },
        { path: '/about', views: Math.round(5430 * mult), percentage: 11.9 },
        { path: '/services', views: Math.round(4210 * mult), percentage: 9.2 },
        { path: '/blog', views: Math.round(3890 * mult), percentage: 8.5 },
        { path: '/contact', views: Math.round(2100 * mult), percentage: 4.6 }
      ],
      trafficSources: [
        { source: 'Organic Search', visitors: Math.round(8920 * mult), percentage: 57.8 },
        { source: 'Direct Traffic', visitors: Math.round(3420 * mult), percentage: 22.2 },
        { source: 'Social Media', visitors: Math.round(2100 * mult), percentage: 13.6 },
        { source: 'Referral', visitors: Math.round(980 * mult), percentage: 6.4 }
      ],
      contentPerformance: [
        { title: 'Homepage Hero', views: Math.round(8920 * mult), engagement: 75 + Math.random() * 10, bounceRate: 20 + Math.random() * 10 },
        { title: 'About Page', views: Math.round(5430 * mult), engagement: 78 + Math.random() * 8, bounceRate: 15 + Math.random() * 8 },
        { title: 'Services Page', views: Math.round(4210 * mult), engagement: 72 + Math.random() * 10, bounceRate: 18 + Math.random() * 10 },
        { title: 'Blog Posts', views: Math.round(3890 * mult), engagement: 80 + Math.random() * 10, bounceRate: 12 + Math.random() * 8 }
      ],
      userActivity: [
        { user: 'admin', action: 'Page View', timestamp: new Date().toISOString(), page: '/admin/analytics' },
        { user: 'admin', action: 'Export Report', timestamp: new Date(Date.now() - 3600000).toISOString(), page: '/admin/analytics' },
        { user: 'user1', action: 'Login', timestamp: new Date(Date.now() - 7200000).toISOString(), page: '/login' },
        { user: 'user2', action: 'Page View', timestamp: new Date(Date.now() - 10800000).toISOString(), page: '/homepage' }
      ]
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAnalyticsData(generateDataForRange(dateRange));
    setRefreshing(false);
  };

  const handleDateRangeChange = async (range: string) => {
    setDateRange(range);
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setAnalyticsData(generateDataForRange(range));
    setLoading(false);
  };

  const handleButtonClick = (modalType: string) => {
    setSelectedModal(modalType);
  };

  const closeModal = () => {
    setSelectedModal(null);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-600" />;
      default: return <ArrowUpRight className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
                <p className="text-sm text-slate-600">Monitor website performance and user engagement</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                disabled={loading}
                className="border border-slate-200 rounded-lg px-3 py-2 disabled:opacity-50"
              >
                <option value="24hours">Last 24 Hours</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-200">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeSection === 'overview' 
              ? 'border-b-2 border-emerald-500 text-emerald-600' 
              : 'border-b-2 border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Overview
        </button>
        
        <button
          onClick={() => setActiveSection('traffic')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeSection === 'traffic' 
              ? 'border-b-2 border-emerald-500 text-emerald-600' 
              : 'border-b-2 border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Traffic
        </button>
        
        <button
          onClick={() => setActiveSection('content')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeSection === 'content' 
              ? 'border-b-2 border-emerald-500 text-emerald-600' 
              : 'border-b-2 border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Content
        </button>
        
        <button
          onClick={() => setActiveSection('users')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeSection === 'users' 
              ? 'border-b-2 border-emerald-500 text-emerald-600' 
              : 'border-b-2 border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          Users
        </button>
        
        <button
          onClick={() => setActiveSection('reports')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeSection === 'reports' 
              ? 'border-b-2 border-emerald-500 text-emerald-600' 
              : 'border-b-2 border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Download className="w-4 h-4 mr-2" />
          Reports
        </button>
      </div>

      {/* Content Sections */}
      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        )}

        {/* Overview Section */}
        {!loading && activeSection === 'overview' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Key Metrics */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Key Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">{formatNumber(analyticsData.totalVisitors)}</div>
                  <div className="text-sm text-slate-600">Total Visitors</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{formatNumber(analyticsData.pageViews)}</div>
                  <div className="text-sm text-slate-600">Page Views</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{formatNumber(analyticsData.uniqueVisitors)}</div>
                  <div className="text-sm text-slate-600">Unique Visitors</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{analyticsData.bounceRate}%</div>
                  <div className="text-sm text-slate-600">Bounce Rate</div>
                </div>
              </div>
            </Card>

            {/* Top Pages */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Top Pages</h3>
              <div className="space-y-3">
                {analyticsData.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-900">{page.path}</span>
                        <Badge variant="outline" className="text-xs">
                          {formatPercentage(page.percentage)}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600">{formatNumber(page.views)} views</div>
                    </div>
                    
                    <div className="text-sm text-slate-600">
                      {index === 0 && <ArrowUp className="w-3 h-3 text-green-600 mr-1" />}
                      Trending
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Traffic Sources */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Traffic Sources</h3>
              <div className="space-y-3">
                {analyticsData.trafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-900">{source.source}</span>
                        <Badge variant="outline" className="text-xs">
                          {formatPercentage(source.percentage)}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600">{formatNumber(source.visitors)} visitors</div>
                    </div>
                    
                    <div className="text-sm text-slate-600">
                      {index === 0 && <ArrowUp className="w-3 h-3 text-green-600 mr-1" />}
                      {index < 3 ? 'Top 3' : `${index + 1} of ${analyticsData.trafficSources.length}`}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Traffic Section */}
        {!loading && activeSection === 'traffic' && (
          <div className="text-center">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
              <div>
                <h3 className="font-semibold text-slate-900">Traffic Analysis</h3>
                <p className="text-sm text-slate-600">Detailed traffic analytics and visitor patterns</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Visitor Trends</h3>
                  <p className="text-sm text-slate-600">Analyze visitor behavior over time</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleButtonClick('visitor-trends')}
                >
                  View Trends
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">User Demographics</h3>
                  <p className="text-sm text-slate-600">Visitor demographics and location data</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleButtonClick('demographics')}
                >
                  View Demographics
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Session Analytics</h3>
                  <p className="text-sm text-slate-600">Session duration and frequency analysis</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleButtonClick('sessions')}
                >
                  View Sessions
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* Content Section */}
        {!loading && activeSection === 'content' && (
          <div className="text-center">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
              <div>
                <h3 className="font-semibold text-slate-900">Content Performance</h3>
                <p className="text-sm text-slate-600">Analyze content engagement and popularity</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Star className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Top Performing Content</h3>
                  <p className="text-sm text-slate-600">Most viewed and engaged content</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleButtonClick('top-content')}
                >
                  View Top Content
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Heart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Content Engagement</h3>
                  <p className="text-sm text-slate-600">User interaction and time spent</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleButtonClick('engagement')}
                >
                  View Engagement
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Content Analysis</h3>
                  <p className="text-sm text-slate-600">Performance metrics and optimization suggestions</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleButtonClick('content-analysis')}
                >
                  View Analysis
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* Users Section */}
        {!loading && activeSection === 'users' && (
          <div className="text-center">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
              <div>
                <h3 className="font-semibold text-slate-900">User Activity</h3>
                <p className="text-sm text-slate-600">Monitor user actions and system access</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Active Sessions</h3>
                  <p className="text-sm text-slate-600">Currently logged in users and activity</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleButtonClick('active-sessions')}
                >
                  View Sessions
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">User Analytics</h3>
                  <p className="text-sm text-slate-600">User behavior and engagement metrics</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleButtonClick('user-analytics')}
                >
                  View User Analytics
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Check className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Access Logs</h3>
                  <p className="text-sm text-slate-600">Login attempts and security events</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleButtonClick('access-logs')}
                >
                  View Access Logs
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* Reports Section */}
        {!loading && activeSection === 'reports' && (
          <div className="text-center">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
              <div>
                <h3 className="font-semibold text-slate-900">Analytics Reports</h3>
                <p className="text-sm text-slate-600">Generate and export detailed reports</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Download className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Traffic Report</h3>
                  <p className="text-sm text-slate-600">Detailed visitor and traffic analysis</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleButtonClick('traffic-report')}
                >
                  Generate Traffic Report
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Content Report</h3>
                  <p className="text-sm text-slate-600">Content performance and engagement metrics</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleButtonClick('content-report')}
                >
                  Generate Content Report
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Custom Report</h3>
                  <p className="text-sm text-slate-600">Custom analytics and metrics</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleButtonClick('custom-report')}
                >
                  Create Custom Report
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Scheduled Reports</h3>
                  <p className="text-sm text-slate-600">Automated report generation and delivery</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleButtonClick('scheduled-reports')}
                >
                  Schedule Reports
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Modal */}
      {selectedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedModal.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-600">
                    This feature is currently under development. The analytics data is simulated for demonstration purposes.
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    In a production environment, this would connect to a real analytics service like Google Analytics, Plausible, or a custom tracking system.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={closeModal} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
