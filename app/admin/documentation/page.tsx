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
  FileText,
  ExternalLink,
  Info,
  Copy,
  Check,
  BookOpen
} from "lucide-react";
import { api } from "@/components/api/client";

interface DocumentationPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  updatedAt: string;
  published: boolean;
  order: number;
}

export default function DocumentationAdminPage() {
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

  const [docs, setDocs] = useState<DocumentationPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<DocumentationPage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadDocumentation();
  }, []);

  const loadDocumentation = async () => {
    try {
      // For now, we'll use localStorage to store documentation
      // In a real implementation, this would come from the backend API
      const storedDocs = localStorage.getItem('documentation');
      if (storedDocs) {
        setDocs(JSON.parse(storedDocs));
      } else {
        // Initialize with some default documentation
        const defaultDocs: DocumentationPage[] = [
          {
            id: '1',
            title: 'Getting Started',
            slug: 'getting-started',
            content: '# Getting Started\n\nWelcome to the documentation. This guide will help you get started with the platform.',
            category: 'General',
            updatedAt: new Date().toISOString(),
            published: true,
            order: 0
          },
          {
            id: '2',
            title: 'User Guide',
            slug: 'user-guide',
            content: '# User Guide\n\nThis section covers how to use the various features of the platform.',
            category: 'General',
            updatedAt: new Date().toISOString(),
            published: true,
            order: 1
          }
        ];
        setDocs(defaultDocs);
        localStorage.setItem('documentation', JSON.stringify(defaultDocs));
      }
    } catch (error) {
      console.error("Failed to load documentation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    try {
      let updatedDocs;
      if (selectedItem.id === 'new') {
        const newDoc = {
          ...selectedItem,
          id: Date.now().toString(),
          updatedAt: new Date().toISOString(),
          order: docs.length
        };
        updatedDocs = [...docs, newDoc];
      } else {
        updatedDocs = docs.map((doc) =>
          doc.id === selectedItem.id ? { ...selectedItem, updatedAt: new Date().toISOString() } : doc
        );
      }

      setDocs(updatedDocs);
      localStorage.setItem('documentation', JSON.stringify(updatedDocs));
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to save documentation:", error);
    }
  };

  const handleCreateNew = () => {
    const newDoc = {
      id: 'new' as any,
      title: '',
      slug: '',
      content: '',
      category: 'General',
      published: false,
      updatedAt: '',
      order: docs.length
    };
    setSelectedItem(newDoc);
  };

  const deleteDoc = async (id: string) => {
    if (!confirm('Are you sure you want to delete this documentation page?')) return;
    try {
      const updatedDocs = docs.filter((doc) => doc.id !== id);
      setDocs(updatedDocs);
      localStorage.setItem('documentation', JSON.stringify(updatedDocs));
    } catch (error) {
      console.error("Failed to delete documentation:", error);
    }
  };

  const togglePublished = async (item: DocumentationPage) => {
    try {
      const updatedDocs = docs.map((doc) =>
        doc.id === item.id ? { ...doc, published: !doc.published } : doc
      );
      setDocs(updatedDocs);
      localStorage.setItem('documentation', JSON.stringify(updatedDocs));
    } catch (error) {
      console.error("Failed to toggle published:", error);
    }
  };

  const duplicateDoc = async (item: DocumentationPage) => {
    try {
      const newDoc = {
        ...item,
        id: Date.now().toString(),
        title: item.title + " (Copy)",
        slug: item.slug + "-copy",
        published: false,
        updatedAt: new Date().toISOString(),
        order: docs.length
      };
      const updatedDocs = [...docs, newDoc];
      setDocs(updatedDocs);
      localStorage.setItem('documentation', JSON.stringify(updatedDocs));
    } catch (error) {
      console.error("Failed to duplicate documentation:", error);
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

  const filteredDocs = docs.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documentation</h1>
          <p className="text-slate-600">Edit and manage documentation pages</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Documentation Page
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Where this appears</h3>
            <p className="text-sm text-blue-700 mt-1">
              Documentation pages appear in the documentation section of the website. Each page supports Markdown formatting and can be organized by category.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="space-y-4">
        {filteredDocs.map((item) => (
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
                <p className="text-sm text-slate-600 line-clamp-2 mb-2">{item.content.substring(0, 150)}...</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    /docs/{item.slug}
                  </span>
                  <span>Last updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => copyId(item.id)} title="Copy ID">
                  {copiedId === item.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => duplicateDoc(item)} title="Duplicate">
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
                  onClick={() => deleteDoc(item.id)}
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
                {selectedItem.id === 'new' ? 'Add Documentation Page' : 'Edit Documentation Page'}
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Content (Markdown supported)</label>
                <Textarea
                  value={selectedItem.content}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, content: e.target.value} : null)}
                  rows={15}
                  className="w-full font-mono text-sm"
                  placeholder="# Title\n\nWrite your documentation content here using Markdown formatting..."
                />
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
