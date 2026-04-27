"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit3,
  Eye,
  Trash2,
  Calendar,
  Tag,
  FolderOpen,
  Save,
  Upload,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  MessageSquare,
  Share2,
  X,
  Home
} from "lucide-react";
import { api } from "@/components/api/client";

interface ContentItem {
  id: string;
  title: string;
  content: string;
  type: 'page' | 'blog' | 'research' | 'testimonial' | 'service';
  status: 'draft' | 'published' | 'scheduled';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  author: string;
  category?: string;
}

export default function ContentManagementPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  // Load content from database
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/content');
      if (response.ok) {
        const data = await response.json();
        const transformedContent = data.content.map((item: any) => ({
          id: item.id.toString(),
          title: item.title,
          content: item.content,
          type: item.type,
          status: item.status,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          publishedAt: item.published_at,
          tags: item.tags || [],
          seoTitle: item.seo_title,
          seoDescription: item.seo_description,
          author: item.author_name || 'Unknown',
          category: item.category
        }));
        setContent(transformedContent);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      // Fallback to mock data if API fails
      const mockContent: ContentItem[] = [
        {
          id: '1',
          title: 'About Dr. Stephen Asatsa',
          content: 'Professional psychology services and research...',
          type: 'page',
          status: 'published',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z',
          publishedAt: '2024-01-15T10:00:00Z',
          tags: ['about', 'professional', 'psychology'],
          seoTitle: 'Dr. Stephen Asatsa - Professional Psychology Services',
          seoDescription: 'Learn about Dr. Stephen Asatsa\'s professional psychology services, research, and academic contributions.',
          author: 'Admin',
          category: 'About'
        }
      ];
      setContent(mockContent);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async (item: ContentItem) => {
    try {
      const payload = {
        title: item.title,
        content: item.content,
        type: item.type,
        status: item.status,
        category: item.category,
        tags: item.tags,
        seo_title: item.seoTitle,
        seo_description: item.seoDescription,
        metadata: {}
      };

      const response = await api.put(`/api/content?id=${item.id}`, payload);

      if (response.ok) {
        await loadContent(); // Reload content
        setSelectedItem(null);
      } else {
        console.error('Error saving content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const createContent = async (item: Partial<ContentItem>) => {
    try {
      const payload = {
        title: item.title,
        content: item.content,
        type: item.type || 'page',
        status: item.status || 'draft',
        category: item.category,
        tags: item.tags,
        seo_title: item.seoTitle,
        seo_description: item.seoDescription,
        metadata: {}
      };

      const response = await api.post('/api/content', payload);

      if (response.ok) {
        await loadContent(); // Reload content
        setSelectedItem(null);
      } else {
        console.error('Error creating content');
      }
    } catch (error) {
      console.error('Error creating content:', error);
    }
  };

  const deleteContent = async (id: string) => {
    try {
      const response = await api.delete(`/api/content?id=${id}`);

      if (response.ok) {
        setContent(prev => prev.filter(item => item.id !== id));
      } else {
        console.error('Error deleting content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleEdit = (item: ContentItem) => {
    setSelectedItem(item);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      deleteContent(id);
    }
  };

  const handleSave = () => {
    if (selectedItem) {
      if (selectedItem.id === 'new') {
        createContent(selectedItem);
      } else {
        saveContent(selectedItem);
      }
    }
  };

  const handleCreateNew = () => {
    setSelectedItem({
      id: 'new',
      title: '',
      content: '',
      type: 'page',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      author: 'Admin',
    });
  };

  const getTypeColor = (type: string) => {
    const colors = {
      page: 'bg-blue-100 text-blue-800',
      blog: 'bg-green-100 text-green-800',
      research: 'bg-purple-100 text-purple-800',
      testimonial: 'bg-yellow-100 text-yellow-800',
      service: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      scheduled: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Content Management</h1>
          <p className="text-slate-600">Manage all website content including pages, blog posts, research, and testimonials</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/admin/content/home'}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Edit Home Page
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Content
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="page">Pages</option>
              <option value="blog">Blog Posts</option>
              <option value="research">Research</option>
              <option value="testimonial">Testimonials</option>
              <option value="service">Services</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Content Grid */}
      <div className="grid gap-6">
        {filteredContent.map((item) => (
          <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Badge className={getTypeColor(item.type)}>
                  {item.type}
                </Badge>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Updated: {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {item.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="text-sm text-slate-600">
                {item.content.length > 150 ? `${item.content.substring(0, 150)}...` : item.content}
              </div>
              
              {item.seoTitle && (
                <div className="mt-3 p-3 bg-slate-50 rounded text-xs">
                  <div className="font-medium text-slate-700">SEO Title: {item.seoTitle}</div>
                  {item.seoDescription && (
                    <div className="text-slate-600">SEO Description: {item.seoDescription}</div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <Card className="p-12 text-center">
          <FolderOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No content found</h3>
          <p className="text-slate-600">
            {searchTerm ? 'No content matches your search criteria.' : 'No content has been created yet.'}
          </p>
        </Card>
      )}

      {/* Edit/Create Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedItem.id === 'new' ? 'Create Content' : 'Edit Content'}
              </h2>
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                <Input
                  value={selectedItem.title}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, title: e.target.value} : null)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                <Textarea
                  value={selectedItem.content}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, content: e.target.value} : null)}
                  rows={10}
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <select
                    value={selectedItem.type}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, type: e.target.value as any} : null)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="page">Page</option>
                    <option value="blog">Blog Post</option>
                    <option value="research">Research</option>
                    <option value="testimonial">Testimonial</option>
                    <option value="service">Service</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={selectedItem.status}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, status: e.target.value as any} : null)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tags (comma-separated)</label>
                <Input
                  value={selectedItem.tags.join(', ')}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, tags: e.target.value.split(',').map(tag => tag.trim())} : null)}
                  placeholder="psychology, research, clinical"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SEO Title</label>
                <Input
                  value={selectedItem.seoTitle || ''}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, seoTitle: e.target.value} : null)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SEO Description</label>
                <Textarea
                  value={selectedItem.seoDescription || ''}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, seoDescription: e.target.value} : null)}
                  rows={3}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  {selectedItem.id === 'new' ? 'Create' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
