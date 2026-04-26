"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  PenTool,
  ExternalLink,
  Info,
  Calendar,
  Tag,
  Copy,
  Check
} from "lucide-react";
import { api } from "@/components/api/client";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  published: boolean;
  content?: string;
  author?: string;
  readTime?: number;
}

export default function BlogAdminPage() {
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (!session) {
      router.push('/admin-signup');
      return;
    }
    try {
      const parsed = JSON.parse(session);
      const sessionAge = Date.now() - parsed.timestamp;
      if (sessionAge > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('userSession');
        localStorage.removeItem('authToken');
        router.push('/admin-signup');
        return;
      }
    } catch {
      localStorage.removeItem('userSession');
      localStorage.removeItem('authToken');
      router.push('/admin-signup');
      return;
    }
  }, [router]);

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<BlogPost | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      const response = await api.get("/api/admin/blog");
      if (!response.ok) {
        console.error(`Failed to load blog posts: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error("Response body:", text);
        return;
      }
      const data = await response.json();
      if (data.content && data.content.blogPosts) {
        setBlogPosts(data.content.blogPosts);
      }
    } catch (error) {
      console.error("Failed to load blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    try {
      const response = await api.get("/api/admin/blog");
      const data = await response.json();
      const currentData = data.content || { blogPosts: [], blogContentBySlug: {} };

      let updatedPosts;
      if (selectedItem.id === 'new') {
        const newPost = {
          ...selectedItem,
          id: Date.now().toString(),
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        updatedPosts = [...currentData.blogPosts, newPost];
      } else {
        updatedPosts = currentData.blogPosts.map((post: BlogPost) =>
          post.id === selectedItem.id ? { ...selectedItem, updatedAt: new Date().toISOString() } : post
        );
      }

      const payload = {
        blogPosts: updatedPosts,
        blogContentBySlug: currentData.blogContentBySlug
      };

      await api.put("/api/admin/blog", payload);
      setSelectedItem(null);
      loadBlogPosts();
    } catch (error) {
      console.error("Failed to save blog post:", error);
    }
  };

  const handleCreateNew = () => {
    const newPost = {
      id: 'new' as any,
      title: '',
      slug: '',
      excerpt: '',
      category: 'General',
      published: false,
      publishedAt: '',
      updatedAt: '',
      content: '',
      author: '',
      readTime: 5
    };
    setSelectedItem(newPost);
  };

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const response = await api.get("/api/admin/blog");
      const data = await response.json();
      const currentData = data.content || { blogPosts: [], blogContentBySlug: {} };

      const updatedPosts = currentData.blogPosts.filter((post: BlogPost) => post.id !== id);
      const payload = {
        blogPosts: updatedPosts,
        blogContentBySlug: currentData.blogContentBySlug
      };

      await api.put("/api/admin/blog", payload);
      loadBlogPosts();
    } catch (error) {
      console.error("Failed to delete blog post:", error);
    }
  };

  const togglePublished = async (item: BlogPost) => {
    try {
      const response = await api.get("/api/admin/blog");
      const data = await response.json();
      const currentData = data.content || { blogPosts: [], blogContentBySlug: {} };

      const updatedPosts = currentData.blogPosts.map((post: BlogPost) =>
        post.id === item.id ? { ...post, published: !post.published } : post
      );

      const payload = {
        blogPosts: updatedPosts,
        blogContentBySlug: currentData.blogContentBySlug
      };

      await api.put("/api/admin/blog", payload);
      loadBlogPosts();
    } catch (error) {
      console.error("Failed to toggle published:", error);
    }
  };

  const duplicatePost = async (item: BlogPost) => {
    try {
      const response = await api.get("/api/admin/blog");
      const data = await response.json();
      const currentData = data.content || { blogPosts: [], blogContentBySlug: {} };

      const newPost = {
        ...item,
        id: Date.now().toString(),
        title: item.title + " (Copy)",
        slug: item.slug + "-copy",
        published: false,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedPosts = [...currentData.blogPosts, newPost];
      const payload = {
        blogPosts: updatedPosts,
        blogContentBySlug: currentData.blogContentBySlug
      };

      await api.put("/api/admin/blog", payload);
      loadBlogPosts();
    } catch (error) {
      console.error("Failed to duplicate blog post:", error);
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const filteredPosts = blogPosts.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Blog Posts</h1>
          <p className="text-slate-600">Create, edit, and manage blog posts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open('/blog', '_blank')}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Preview Blog
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add Blog Post
          </Button>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Where this appears</h3>
            <p className="text-sm text-blue-700 mt-1">
              Blog posts appear on the blog page at /blog, displaying articles with categories, excerpts, and full content. Published posts are visible to all visitors.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search blog posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="space-y-4">
        {filteredPosts.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <Badge variant={item.published ? "default" : "secondary"}>
                    {item.published ? "Published" : "Draft"}
                  </Badge>
                  <Badge variant="outline">{item.category}</Badge>
                  <span className="text-xs text-slate-400">ID: {item.id}</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 mb-2">{item.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {item.slug}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => copyId(item.id)} title="Copy ID">
                  {copiedId === item.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => duplicatePost(item)} title="Duplicate">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => togglePublished(item)} title={item.published ? "Unpublish" : "Publish"}>
                  {item.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)} title="Edit">
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deletePost(item.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedItem.id === 'new' ? 'Add Blog Post' : 'Edit Blog Post'}
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
                  onChange={(e) => {
                    const title = e.target.value;
                    setSelectedItem(prev => prev ? {
                      ...prev,
                      title,
                      slug: prev.id === 'new' ? generateSlug(title) : prev.slug
                    } : null);
                  }}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Slug (URL)</label>
                <Input
                  value={selectedItem.slug}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, slug: e.target.value} : null)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <Input
                  value={selectedItem.category}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, category: e.target.value} : null)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Excerpt</label>
                <Textarea
                  value={selectedItem.excerpt}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, excerpt: e.target.value} : null)}
                  rows={3}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                <Textarea
                  value={selectedItem.content || ''}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, content: e.target.value} : null)}
                  rows={10}
                  className="w-full"
                  placeholder="Write your blog post content here..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Author</label>
                  <Input
                    value={selectedItem.author || ''}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, author: e.target.value} : null)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Read Time (minutes)</label>
                  <Input
                    type="number"
                    value={selectedItem.readTime || 5}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, readTime: parseInt(e.target.value)} : null)}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={selectedItem.published}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, published: e.target.checked} : null)}
                  className="rounded"
                />
                <label htmlFor="published" className="text-sm font-medium text-slate-700">
                  Published (visible on website)
                </label>
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
