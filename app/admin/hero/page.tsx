"use client";

import { useState, useEffect } from "react";
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
  Sparkles
} from "lucide-react";
import { api } from "@/components/api/client";

interface HeroContent {
  id: number;
  eyebrow: string;
  headline: string;
  description: string;
  badges: string;
  background_image_url: string;
  cta_text: string;
  cta_url: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export default function HeroAdminPage() {
  const [heroes, setHeroes] = useState<HeroContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HeroContent | null>(null);

  useEffect(() => {
    loadHeroes();
  }, []);

  const loadHeroes = async () => {
    try {
      const response = await api.get("/api/admin/hero");
      const data = await response.json();
      setHeroes(data.hero || []);
    } catch (error) {
      console.error("Failed to load hero content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    try {
      if (selectedItem.id === 0) {
        await api.post("/api/admin/hero", selectedItem);
      } else {
        await api.put("/api/admin/hero", selectedItem);
      }
      setSelectedItem(null);
      loadHeroes();
    } catch (error) {
      console.error("Failed to save hero content:", error);
    }
  };

  const handleCreateNew = () => {
    setSelectedItem({
      id: 0,
      eyebrow: "",
      headline: "",
      description: "",
      badges: JSON.stringify(["Licensed Psychologist", "Senior Lecturer", "Research Leader"]),
      background_image_url: "",
      cta_text: "Book a Session",
      cta_url: "/contact",
      published: true,
      created_at: "",
      updated_at: ""
    });
  };

  const deleteHero = async (id: number) => {
    try {
      await api.delete("/api/admin/hero", { body: JSON.stringify({ id }) });
      loadHeroes();
    } catch (error) {
      console.error("Failed to delete hero content:", error);
    }
  };

  const togglePublished = async (item: HeroContent) => {
    try {
      await api.put("/api/admin/hero", { ...item, published: !item.published });
      loadHeroes();
    } catch (error) {
      console.error("Failed to toggle published:", error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hero Section</h1>
          <p className="text-slate-600">Manage the main hero section content</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Hero Content
        </Button>
      </div>

      <div className="space-y-4">
        {heroes.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-600">{item.eyebrow}</p>
                  <Badge variant={item.published ? "default" : "secondary"}>
                    {item.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.headline}</h3>
                {item.description && <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>}
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => togglePublished(item)}>
                  {item.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { if (confirm('Are you sure?')) deleteHero(item.id); }}
                  className="text-red-600 hover:text-red-700"
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
                {selectedItem.id === 0 ? 'Add Hero Content' : 'Edit Hero Content'}
              </h2>
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Eyebrow (small text above headline)</label>
                <Input
                  value={selectedItem.eyebrow}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, eyebrow: e.target.value} : null)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Headline</label>
                <Input
                  value={selectedItem.headline}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, headline: e.target.value} : null)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <Textarea
                  value={selectedItem.description}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, description: e.target.value} : null)}
                  rows={4}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Badges (JSON array)</label>
                <Textarea
                  value={selectedItem.badges}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, badges: e.target.value} : null)}
                  rows={2}
                  className="w-full"
                  placeholder='["Badge 1", "Badge 2", "Badge 3"]'
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Background Image URL</label>
                <Input
                  value={selectedItem.background_image_url}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, background_image_url: e.target.value} : null)}
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CTA Text</label>
                  <Input
                    value={selectedItem.cta_text}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, cta_text: e.target.value} : null)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CTA URL</label>
                  <Input
                    value={selectedItem.cta_url}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, cta_url: e.target.value} : null)}
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
                  {selectedItem.id === 0 ? 'Create' : 'Save Changes'}
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
