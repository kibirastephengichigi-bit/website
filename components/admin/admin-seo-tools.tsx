"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Globe,
  Tag,
  Search,
  Download,
  Upload,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Copy,
  Check,
  AlertCircle,
  Info,
  TrendingUp,
  BarChart3,
  FileText,
  Settings,
  Zap,
  Link as LinkIcon,
  ExternalLink,
  Image,
  Hash,
  ShieldCheck,
  X
} from "lucide-react";

interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  robotsTxt?: string;
  sitemapUrl?: string;
  structuredData?: any;
  twitterTitle?: string;
  twitterDescription?: string;
}

interface SEOToolsProps {
  currentSEO?: SEOData;
  onSave?: (seo: SEOData) => void;
  onPreview?: (seo: SEOData) => void;
}

export function AdminSEOTools({ currentSEO, onSave, onPreview }: SEOToolsProps) {
  const [seoData, setSEOData] = useState<SEOData>(currentSEO || {
    title: '',
    description: '',
    keywords: [],
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    canonicalUrl: '',
    robotsTxt: '',
    sitemapUrl: '',
    structuredData: {}
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'social' | 'technical' | 'preview'>('basic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [seoScore, setSEOScore] = useState(0);

  const calculateSEOScore = () => {
    let score = 0;
    
    // Title optimization
    if (seoData.title.length >= 30 && seoData.title.length <= 60) score += 20;
    if (seoData.title.length > 0) score += 10;
    
    // Description optimization
    if (seoData.description.length >= 120 && seoData.description.length <= 160) score += 20;
    if (seoData.description.length > 0) score += 10;
    
    // Keywords
    if (seoData.keywords.length >= 3) score += 15;
    
    // Open Graph
    if (seoData.ogTitle) score += 10;
    if (seoData.ogDescription) score += 10;
    if (seoData.ogImage) score += 5;
    
    setSEOScore(score);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(seoData);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(seoData);
    }
  };

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !seoData.keywords.includes(keyword.trim())) {
      setSEOData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword.trim()]
      }));
    }
  };

  const removeKeyword = (index: number) => {
    setSEOData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">SEO Tools</h2>
            <p className="text-slate-600">Optimize your website for search engines</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{seoScore}</div>
              <div className="text-xs text-slate-500">SEO Score</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={calculateSEOScore}
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Calculate
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-slate-100 p-1 rounded-lg">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'basic'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('basic')}
          >
            <Target className="w-4 h-4 mr-2 inline" />
            Basic SEO
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'social'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('social')}
          >
            <Globe className="w-4 h-4 mr-2 inline" />
            Social Media
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'technical'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('technical')}
          >
            <Settings className="w-4 h-4 mr-2 inline" />
            Technical
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('preview')}
          >
            <Eye className="w-4 h-4 mr-2 inline" />
            Preview
          </button>
        </div>

        {/* Tab Content */}
        <Card className="p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Page Title</label>
                  <Input
                    value={seoData.title}
                    onChange={(e) => setSEOData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter page title (30-60 characters)"
                    className="w-full"
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    {seoData.title.length}/60 characters
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Meta Description</label>
                  <Textarea
                    value={seoData.description}
                    onChange={(e) => setSEOData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter meta description (120-160 characters)"
                    rows={3}
                    className="w-full"
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    {seoData.description.length}/160 characters
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Keywords</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {seoData.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {keyword}
                        <button
                          onClick={() => removeKeyword(index)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add keyword and press Enter"
                    className="w-full"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addKeyword((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">OG Title</label>
                  <Input
                    value={seoData.ogTitle}
                    onChange={(e) => setSEOData(prev => ({ ...prev, ogTitle: e.target.value }))}
                    placeholder="Open Graph title"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">OG Description</label>
                  <Textarea
                    value={seoData.ogDescription}
                    onChange={(e) => setSEOData(prev => ({ ...prev, ogDescription: e.target.value }))}
                    placeholder="Open Graph description"
                    rows={2}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Twitter Title</label>
                  <Input
                    value={seoData.twitterTitle}
                    onChange={(e) => setSEOData(prev => ({ ...prev, twitterTitle: e.target.value }))}
                    placeholder="Twitter card title"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Twitter Description</label>
                  <Textarea
                    value={seoData.twitterDescription}
                    onChange={(e) => setSEOData(prev => ({ ...prev, twitterDescription: e.target.value }))}
                    placeholder="Twitter card description"
                    rows={2}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Canonical URL</label>
                  <Input
                    value={seoData.canonicalUrl}
                    onChange={(e) => setSEOData(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                    placeholder="https://example.com/page"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sitemap URL</label>
                  <Input
                    value={seoData.sitemapUrl}
                    onChange={(e) => setSEOData(prev => ({ ...prev, sitemapUrl: e.target.value }))}
                    placeholder="https://example.com/sitemap.xml"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-900 mb-3">SEO Preview</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-medium text-slate-900 mb-2">Google Search Result</h4>
                  <div className="space-y-2 text-sm">
                    <div className="text-blue-600 font-medium">{seoData.title || 'Your Page Title'}</div>
                    <div className="text-green-700 text-xs">{seoData.canonicalUrl || 'https://example.com/page'}</div>
                    <div className="text-slate-600">{seoData.description || 'Your meta description will appear here...'}</div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium text-slate-900 mb-2">Social Media Preview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="font-medium">{seoData.ogTitle || seoData.title || 'Your Page Title'}</div>
                    <div className="text-slate-600">{seoData.ogDescription || seoData.description || 'Your description will appear here...'}</div>
                    <div className="text-slate-500 text-xs">example.com</div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </Card>

        <div className="flex items-center gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handlePreview}
          >
            <Eye className="w-3 h-3 mr-1" />
            Preview SEO
          </Button>
          
          <Button
            variant="default"
            onClick={handleSave}
          >
            <Save className="w-3 h-3 mr-1" />
            Save SEO Settings
          </Button>
        </div>
      </Card>
    </div>
  );
}
