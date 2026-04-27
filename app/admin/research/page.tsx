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
  Briefcase,
  FileText,
  Download,
  Globe,
  Award,
  Video,
  Users,
  Info,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { api } from "@/components/api/client";

interface ResearchProject {
  id: string;
  title: string;
  category: string;
  status: string;
  summary: string;
  funding?: string;
  details?: string[];
  link?: string;
  displayOrder: number;
  published: boolean;
}

interface Publication {
  id: string;
  title: string;
  type: string;
  year: string;
  summary: string;
  fileUrl?: string;
  displayOrder: number;
  published: boolean;
}

interface Grant {
  id: string;
  title: string;
  amount?: string;
  year?: string;
  displayOrder: number;
  published: boolean;
}

interface Talk {
  id: string;
  title: string;
  type: "conference" | "invited";
  year?: string;
  location?: string;
  displayOrder: number;
  published: boolean;
}

interface Award {
  id: string;
  title: string;
  year: string;
  organization?: string;
  href?: string;
  displayOrder: number;
  published: boolean;
}

interface MediaItem {
  id: string;
  title: string;
  kind: string;
  year?: string;
  description?: string;
  href: string;
  displayOrder: number;
  published: boolean;
}

interface Collaborator {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  summary: string;
  image?: string;
  href?: string;
  displayOrder: number;
  published: boolean;
}

const sections = [
  { id: "projects", label: "Research Projects", icon: Briefcase, color: "blue" },
  { id: "publications", label: "Publications", icon: FileText, color: "green" },
  { id: "grants", label: "Grants", icon: Download, color: "purple" },
  { id: "talks", label: "Talks", icon: Globe, color: "blue" },
  { id: "recognition", label: "Recognition", icon: Award, color: "green" },
  { id: "media", label: "Media", icon: Video, color: "purple" },
  { id: "collaboration", label: "Collaboration", icon: Users, color: "blue" },
];

const sectionDescriptions: Record<string, string> = {
  projects: "Manage research projects including category, status, funding, and detailed information.",
  publications: "Add and manage academic publications with type, year, summary, and file links.",
  grants: "Track funding and travel support grants with amounts and years.",
  talks: "Manage conference presentations and invited talks with locations and dates.",
  recognition: "List honors, awards, and achievements with organizations and reference links.",
  media: "Organize media appearances, interviews, and talk archives with descriptions.",
  collaboration: "Manage project collaborators with roles, affiliations, and profile links.",
};

export default function ResearchAdminPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("projects");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Data stores
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [talks, setTalks] = useState<Talk[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

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

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // Load from site-content for now (will be replaced with API calls)
      const { siteContent } = await import("@/lib/content/site-content");
      
      setProjects(siteContent.researchProjects.map((p: any, i: number) => ({
        id: `project-${i}`,
        ...p,
        displayOrder: i,
        published: true
      })));
      
      setPublications(siteContent.publications.map((p: any, i: number) => ({
        id: `pub-${i}`,
        ...p,
        displayOrder: i,
        published: true
      })));
      
      setGrants(siteContent.grants.map((g: any, i: number) => ({
        id: `grant-${i}`,
        title: g,
        displayOrder: i,
        published: true
      })));
      
      setTalks([
        ...siteContent.conferences.map((c: any, i: number) => ({
          id: `conf-${i}`,
          title: c,
          type: "conference" as const,
          displayOrder: i,
          published: true
        })),
        ...siteContent.invitedTalks.map((t: any, i: number) => ({
          id: `talk-${i}`,
          title: t,
          type: "invited" as const,
          displayOrder: i + 1000,
          published: true
        }))
      ]);
      
      setAwards(siteContent.awards.map((a: any, i: number) => ({
        id: `award-${i}`,
        ...a,
        displayOrder: i,
        published: true
      })));
      
      setMedia(siteContent.media.map((m: any, i: number) => ({
        id: `media-${i}`,
        ...m,
        displayOrder: i,
        published: true
      })));
      
      setCollaborators(siteContent.collaborators.map((c: any, i: number) => ({
        id: `collab-${i}`,
        ...c,
        displayOrder: i,
        published: true
      })));
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingItem) return;
    
    // Placeholder for API save
    console.log("Saving:", editingItem);
    setEditingItem(null);
    loadAllData();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    // Placeholder for API delete
    console.log("Deleting:", id);
    loadAllData();
  };

  const handleTogglePublished = (item: any) => {
    // Placeholder for API toggle
    console.log("Toggling published:", item.id);
    loadAllData();
  };

  const getCurrentData = () => {
    switch (activeSection) {
      case "projects": return projects;
      case "publications": return publications;
      case "grants": return grants;
      case "talks": return talks;
      case "recognition": return awards;
      case "media": return media;
      case "collaboration": return collaborators;
      default: return [];
    }
  };

  const filteredData = getCurrentData().filter((item: any) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderEditForm = () => {
    if (!editingItem) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {editingItem.id.startsWith('new-') ? 'Add New' : 'Edit'}
            </h2>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
              <Input
                value={editingItem.title || ''}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                placeholder="Enter title"
              />
            </div>

            {activeSection === "projects" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <Input
                    value={editingItem.category || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    placeholder="e.g., Psychology, Neuroscience"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <Input
                    value={editingItem.status || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                    placeholder="e.g., Ongoing, Completed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Funding</label>
                  <Input
                    value={editingItem.funding || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, funding: e.target.value })}
                    placeholder="e.g., NIH Grant #12345"
                  />
                </div>
              </>
            )}

            {activeSection === "publications" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <Input
                    value={editingItem.type || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                    placeholder="e.g., Journal Article, Conference Paper"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                  <Input
                    value={editingItem.year || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                    placeholder="e.g., 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">File URL</label>
                  <Input
                    value={editingItem.fileUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, fileUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            {activeSection === "grants" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
                  <Input
                    value={editingItem.amount || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, amount: e.target.value })}
                    placeholder="e.g., $50,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                  <Input
                    value={editingItem.year || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                    placeholder="e.g., 2024"
                  />
                </div>
              </>
            )}

            {activeSection === "talks" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <select
                    value={editingItem.type || 'conference'}
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  >
                    <option value="conference">Conference</option>
                    <option value="invited">Invited Talk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <Input
                    value={editingItem.location || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                    placeholder="e.g., Stanford University"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                  <Input
                    value={editingItem.year || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                    placeholder="e.g., 2024"
                  />
                </div>
              </>
            )}

            {activeSection === "recognition" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Year *</label>
                  <Input
                    value={editingItem.year || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                    placeholder="e.g., 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Organization</label>
                  <Input
                    value={editingItem.organization || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, organization: e.target.value })}
                    placeholder="e.g., American Psychological Association"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Reference Link</label>
                  <Input
                    value={editingItem.href || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, href: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            {activeSection === "media" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type/Kind</label>
                  <Input
                    value={editingItem.kind || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, kind: e.target.value })}
                    placeholder="e.g., Podcast, Interview, TV Appearance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                  <Input
                    value={editingItem.year || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                    placeholder="e.g., 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Link *</label>
                  <Input
                    value={editingItem.href || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, href: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            {activeSection === "collaboration" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                  <Input
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="Dr. Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <Input
                    value={editingItem.role || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                    placeholder="e.g., Co-Principal Investigator"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Affiliation</label>
                  <Input
                    value={editingItem.affiliation || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, affiliation: e.target.value })}
                    placeholder="e.g., MIT"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Profile Link</label>
                  <Input
                    value={editingItem.href || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, href: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {activeSection === "projects" ? "Summary" : activeSection === "publications" ? "Summary" : "Description"}
              </label>
              <Textarea
                value={editingItem.summary || editingItem.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value, description: e.target.value })}
                rows={4}
                placeholder="Enter description..."
              />
            </div>

            {activeSection === "projects" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Details (JSON array)</label>
                <Textarea
                  value={editingItem.details ? JSON.stringify(editingItem.details) : ''}
                  onChange={(e) => {
                    try {
                      setEditingItem({ ...editingItem, details: JSON.parse(e.target.value) });
                    } catch {
                      setEditingItem({ ...editingItem, details: e.target.value });
                    }
                  }}
                  rows={3}
                  placeholder='["Detail 1", "Detail 2"]'
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={editingItem.published || false}
                onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="published" className="text-sm font-medium text-slate-700">
                Published (visible on website)
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditingItem(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">Research Admin</h1>
          <p className="text-sm text-slate-600 mt-1">Manage research content</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {sections.find(s => s.id === activeSection)?.label}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {sectionDescriptions[activeSection]}
              </p>
            </div>
            <Button onClick={() => setEditingItem({ id: `new-${activeSection}`, published: true })}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </div>

          <Card className="bg-blue-50 border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 text-sm">Documentation</h3>
                <p className="text-xs text-blue-700 mt-1">
                  {activeSection === "projects" && "Add research projects with categories (Psychology, Neuroscience, etc.), status (Ongoing, Completed), funding sources, and detailed bullet points. Projects appear in the Research section with blue color coding."}
                  {activeSection === "publications" && "Add academic publications including journal articles, conference papers, and book chapters. Include type, year, summary, and optional file links. Publications display with green color coding."}
                  {activeSection === "grants" && "Track funding and travel support grants. Include grant amounts and award years for reference. Grants display with purple color coding."}
                  {activeSection === "talks" && "Manage conference presentations and invited talks. Specify type (Conference/Invited), location, and year. Talks display with blue color coding."}
                  {activeSection === "recognition" && "List honors, awards, and achievements. Include year, awarding organization, and optional reference links. Recognition displays with green color coding."}
                  {activeSection === "media" && "Organize media appearances, interviews, and talk archives. Include type, year, description, and link. Media displays with purple color coding."}
                  {activeSection === "collaboration" && "Manage project collaborators with names, roles, affiliations, and profile links. Collaborators display with blue color coding and profile images."}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {filteredData.length === 0 ? (
              <div className="text-center text-slate-500 py-12">
                <p>No items found</p>
                <p className="text-sm mt-2">Click "Add New" to create your first item</p>
              </div>
            ) : (
              filteredData.map((item: any) => (
                <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{item.title}</h3>
                        <Badge variant={item.published ? "default" : "secondary"}>
                          {item.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {item.summary || item.description || item.kind || item.type || item.role}
                      </p>
                      {item.year && (
                        <p className="text-xs text-slate-500 mt-1">Year: {item.year}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => handleTogglePublished(item)} className="h-8 w-8 p-0">
                        {item.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)} className="h-8 w-8 p-0">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {renderEditForm()}
    </div>
  );
}
