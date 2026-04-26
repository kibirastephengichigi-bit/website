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
  Users,
  Quote
} from "lucide-react";
import { api } from "@/components/api/client";

interface Collaborator {
  id: string;
  name: string;
  title: string;
  role: string;
  testimonial: string;
  displayOrder: number;
  published: boolean;
}

const roleOptions = ["Academic Collaborator", "Professional Colleague", "Research Mentee", "Early-Career Scholar", "Other"];

export default function CollaboratorsPage() {
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

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<Collaborator | null>(null);

  useEffect(() => {
    loadCollaborators();
  }, []);

  const loadCollaborators = async () => {
    try {
      const response = await api.get("/api/admin/collaborators");
      if (!response.ok) {
        console.error(`Failed to load collaborators: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error("Response body:", text);
        return;
      }
      const data = await response.json();
      setCollaborators(data.collaborators || []);
    } catch (error) {
      console.error("Failed to load collaborators:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    try {
      if (selectedItem.id === 'new') {
        await api.post("/api/admin/collaborators", selectedItem);
      } else {
        await api.put("/api/admin/collaborators", selectedItem);
      }
      setSelectedItem(null);
      loadCollaborators();
    } catch (error) {
      console.error("Failed to save collaborator:", error);
    }
  };

  const handleCreateNew = () => {
    setSelectedItem({
      id: 'new',
      name: '',
      title: '',
      role: 'Academic Collaborator',
      testimonial: '',
      displayOrder: 0,
      published: true
    });
  };

  const deleteCollaborator = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collaborator?')) return;
    try {
      await api.delete(`/api/admin/collaborators?id=${id}`);
      loadCollaborators();
    } catch (error) {
      console.error("Failed to delete collaborator:", error);
    }
  };

  const togglePublished = async (item: Collaborator) => {
    try {
      await api.put("/api/admin/collaborators", { ...item, published: !item.published });
      loadCollaborators();
    } catch (error) {
      console.error("Failed to toggle published status:", error);
    }
  };

  const moveUp = (index: number) => {
    const newCollaborators = [...collaborators];
    [newCollaborators[index], newCollaborators[index - 1]] = [newCollaborators[index - 1], newCollaborators[index]];
    setCollaborators(newCollaborators);
  };

  const moveDown = (index: number) => {
    const newCollaborators = [...collaborators];
    [newCollaborators[index], newCollaborators[index + 1]] = [newCollaborators[index + 1], newCollaborators[index]];
    setCollaborators(newCollaborators);
  };

  const filteredCollaborators = collaborators.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Collaborators</h1>
          <p className="text-slate-600">Manage collaborators, colleagues, and mentees testimonials</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Collaborator
        </Button>
      </div>

      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search collaborators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="space-y-4">
        {filteredCollaborators.map((item, index) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                  <Badge variant={item.published ? "default" : "secondary"}>
                    {item.published ? "Published" : "Draft"}
                  </Badge>
                  {item.role && <Badge variant="outline">{item.role}</Badge>}
                </div>
                <p className="text-sm text-slate-600 mb-1">{item.title}</p>
                <p className="text-xs text-slate-500 italic">&ldquo;{item.testimonial}&rdquo;</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => moveUp(index)} disabled={index === 0}>
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => moveDown(index)} disabled={index === filteredCollaborators.length - 1}>
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
                  onClick={() => { if (confirm('Are you sure?')) deleteCollaborator(item.id); }}
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
                {selectedItem.id === 'new' ? 'Add Collaborator' : 'Edit Collaborator'}
              </h2>
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <Input
                    value={selectedItem.name}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, name: e.target.value} : null)}
                    className="w-full"
                    placeholder="e.g., Prof. Luzelle Naudé"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                  <Input
                    value={selectedItem.title}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, title: e.target.value} : null)}
                    className="w-full"
                    placeholder="e.g., Prof. Luzelle Naudé"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <select
                    value={selectedItem.role}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, role: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roleOptions.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Testimonial</label>
                  <Textarea
                    value={selectedItem.testimonial}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, testimonial: e.target.value} : null)}
                    rows={4}
                    className="w-full"
                    placeholder="Enter the testimonial text..."
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

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Live Preview (Home Page)</h3>
                <Card className="p-6 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg flex-shrink-0">
                        <Users className="h-7 w-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-slate-900 leading-tight">
                          {selectedItem.name || 'Collaborator Name'}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">{selectedItem.title || 'Title'}</p>
                        {selectedItem.role && (
                          <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {selectedItem.role}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="relative pl-6 border-l-2 border-blue-200">
                      <Quote className="absolute -left-3 top-0 h-6 w-6 text-blue-400" />
                      <p className="text-slate-700 italic leading-relaxed">
                        &ldquo;{selectedItem.testimonial || 'Testimonial will appear here...'}&rdquo;
                      </p>
                    </div>
                  </div>
                </Card>
                <p className="text-xs text-slate-500">
                  This is how the collaborator testimonial will appear on the home page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
