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
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Globe,
  ExternalLink,
  Github,
  Youtube,
  Info
} from "lucide-react";
import { api } from "@/components/api/client";

interface ExternalProfile {
  id: string;
  label: string;
  description: string;
  url: string;
  platform: string;
  icon: string;
  color: string;
  metrics: string;
  displayOrder: number;
  published: boolean;
}

const iconOptions = ["Linkedin", "Twitter", "Facebook", "Instagram", "Globe", "ExternalLink", "Github", "Youtube"];
const colorOptions = ["emerald", "blue", "green", "purple", "orange", "red", "pink", "cyan", "yellow"];

const iconMap: Record<string, any> = {
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Globe,
  ExternalLink,
  Github,
  Youtube
};

export default function SocialLinksPage() {
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

  const [profiles, setProfiles] = useState<ExternalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<ExternalProfile | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const getColorClasses = (color: string) => {
  const colors: Record<string, any> = {
    emerald: {
      bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
      border: "border-emerald-200/50",
      iconBg: "bg-emerald-500",
      iconColor: "text-emerald-600",
      text: "text-emerald-900",
      subtext: "text-emerald-700",
      hover: "hover:shadow-emerald-500/25"
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-emerald-50",
      border: "border-green-200/50",
      iconBg: "bg-green-500",
      iconColor: "text-green-600",
      text: "text-green-900",
      subtext: "text-green-700",
      hover: "hover:shadow-green-500/25"
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
      border: "border-blue-200/50",
      iconBg: "bg-blue-500",
      iconColor: "text-blue-600",
      text: "text-blue-900",
      subtext: "text-blue-700",
      hover: "hover:shadow-blue-500/25"
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-pink-50",
      border: "border-purple-200/50",
      iconBg: "bg-purple-500",
      iconColor: "text-purple-600",
      text: "text-purple-900",
      subtext: "text-purple-700",
      hover: "hover:shadow-purple-500/25"
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-red-50",
      border: "border-orange-200/50",
      iconBg: "bg-orange-500",
      iconColor: "text-orange-600",
      text: "text-orange-900",
      subtext: "text-orange-700",
      hover: "hover:shadow-orange-500/25"
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-pink-50",
      border: "border-red-200/50",
      iconBg: "bg-red-500",
      iconColor: "text-red-600",
      text: "text-red-900",
      subtext: "text-red-700",
      hover: "hover:shadow-red-500/25"
    },
    pink: {
      bg: "bg-gradient-to-br from-pink-50 to-rose-50",
      border: "border-pink-200/50",
      iconBg: "bg-pink-500",
      iconColor: "text-pink-600",
      text: "text-pink-900",
      subtext: "text-pink-700",
      hover: "hover:shadow-pink-500/25"
    },
    cyan: {
      bg: "bg-gradient-to-br from-cyan-50 to-sky-50",
      border: "border-cyan-200/50",
      iconBg: "bg-cyan-500",
      iconColor: "text-cyan-600",
      text: "text-cyan-900",
      subtext: "text-cyan-700",
      hover: "hover:shadow-cyan-500/25"
    },
    yellow: {
      bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
      border: "border-yellow-200/50",
      iconBg: "bg-yellow-500",
      iconColor: "text-yellow-600",
      text: "text-yellow-900",
      subtext: "text-yellow-700",
      hover: "hover:shadow-yellow-500/25"
    }
  };
  return colors[color] || colors.emerald;
};

  const loadProfiles = async () => {
    try {
      const response = await api.get("/api/admin/external-profiles");
      if (!response.ok) {
        console.error(`Failed to load external profiles: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error("Response body:", text);
        setProfiles([]);
        return;
      }
      const data = await response.json();
      setProfiles(data.external_profiles || []);
      console.log("Loaded profiles:", data.external_profiles);
    } catch (error) {
      console.error("Failed to load external profiles:", error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    try {
      if (selectedItem.id === 'new') {
        await api.post("/api/admin/external-profiles", selectedItem);
      } else {
        await api.put("/api/admin/external-profiles", selectedItem);
      }
      setSelectedItem(null);
      loadProfiles();
    } catch (error) {
      console.error("Failed to save external profile:", error);
    }
  };

  const handleCreateNew = () => {
    setSelectedItem({
      id: 'new',
      label: '',
      description: '',
      url: '',
      platform: '',
      icon: 'Globe',
      color: 'emerald',
      metrics: '',
      displayOrder: 0,
      published: true
    });
  };

  const deleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    try {
      await api.delete(`/api/admin/external-profiles?id=${id}`);
      loadProfiles();
    } catch (error) {
      console.error("Failed to delete profile:", error);
    }
  };

  const togglePublished = async (item: ExternalProfile) => {
    try {
      await api.put("/api/admin/external-profiles", { ...item, published: !item.published });
      loadProfiles();
    } catch (error) {
      console.error("Failed to toggle published status:", error);
    }
  };

  const moveUp = (index: number) => {
    const newProfiles = [...profiles];
    [newProfiles[index], newProfiles[index - 1]] = [newProfiles[index - 1], newProfiles[index]];
    setProfiles(newProfiles);
  };

  const moveDown = (index: number) => {
    const newProfiles = [...profiles];
    [newProfiles[index], newProfiles[index + 1]] = [newProfiles[index + 1], newProfiles[index]];
    setProfiles(newProfiles);
  };

  const filteredProfiles = profiles.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.platform?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Social Links</h1>
          <p className="text-slate-600">Manage social media accounts and external links</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Link
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Where this appears</h3>
            <p className="text-sm text-blue-700 mt-1">
              Social links appear on the about page, displaying your social media accounts and external platform profiles with icons and metrics.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search social links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="space-y-4">
        {filteredProfiles.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <p className="text-lg font-medium">No social links found</p>
            <p className="text-sm mt-2">Click "Add Link" to add your first social media account or external link</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCreateNew}>
                <Linkedin className="w-4 h-4 mr-2" />
                Add LinkedIn
              </Button>
              <Button variant="outline" size="sm" onClick={handleCreateNew}>
                <Twitter className="w-4 h-4 mr-2" />
                Add Twitter
              </Button>
              <Button variant="outline" size="sm" onClick={handleCreateNew}>
                <Github className="w-4 h-4 mr-2" />
                Add GitHub
              </Button>
            </div>
          </div>
        ) : (
          filteredProfiles.map((item, index) => (
            <Card key={item.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${getColorClasses(item.color).iconBg} text-white shadow-lg`}>
                    {(() => {
                      const Icon = iconMap[item.icon] || Globe;
                      return <Icon className="h-6 w-6" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{item.label}</h3>
                      <Badge variant={item.published ? "default" : "secondary"}>
                        {item.published ? "Published" : "Draft"}
                      </Badge>
                      {item.platform && <Badge variant="outline">{item.platform}</Badge>}
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{item.description}</p>
                    <p className="text-xs text-slate-500">{item.url}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => moveUp(index)} disabled={index === 0}>
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => moveDown(index)} disabled={index === filteredProfiles.length - 1}>
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => togglePublished(item)}>
                    {item.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { if (confirm('Are you sure?')) deleteProfile(item.id); }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedItem.id === 'new' ? 'Add External Profile' : 'Edit External Profile'}
              </h2>
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Profile Label</label>
                  <Input
                    value={selectedItem.label}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, label: e.target.value} : null)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
                  <Input
                    value={selectedItem.platform}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, platform: e.target.value} : null)}
                    className="w-full"
                    placeholder="e.g., LinkedIn, Google Scholar"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">URL</label>
                  <Input
                    value={selectedItem.url}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, url: e.target.value} : null)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <Textarea
                    value={selectedItem.description}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, description: e.target.value} : null)}
                    rows={3}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Metrics (optional - JSON)</label>
                  <Input
                    value={selectedItem.metrics}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, metrics: e.target.value} : null)}
                    className="w-full"
                    placeholder='{"followers": 1000}'
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
                    <select
                      value={selectedItem.icon}
                      onChange={(e) => setSelectedItem(prev => prev ? {...prev, icon: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Color Theme</label>
                    <select
                      value={selectedItem.color}
                      onChange={(e) => setSelectedItem(prev => prev ? {...prev, color: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {colorOptions.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
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

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Live Preview</h3>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  {(() => {
                    const colors = getColorClasses(selectedItem.color);
                    const Icon = iconMap[selectedItem.icon] || Globe;
                    return (
                      <Card className={`border ${colors.border} ${colors.bg} p-6 transition-all duration-300`}>
                        <div className="flex items-start gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.iconBg} text-white shadow-lg`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-bold text-lg ${colors.text}`}>
                                {selectedItem.label || 'Profile Label'}
                              </h3>
                              {selectedItem.platform && (
                                <Badge variant="outline" className="text-xs">{selectedItem.platform}</Badge>
                              )}
                            </div>
                            <p className={`text-sm ${colors.subtext} mt-2`}>
                              {selectedItem.description || 'Profile description will appear here'}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })()}
                </div>
                <p className="text-xs text-slate-500">
                  This is how the external profile will appear on the about page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
