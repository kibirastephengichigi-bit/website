"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Cropper, { Area, Point } from 'react-easy-crop';
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
  Quote,
  Upload,
  Camera,
  Crop
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
  image_url?: string;
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Collaborator>>({});
  const [hoveredCollaborator, setHoveredCollaborator] = useState<Collaborator | null>(null);

  // Cropping state
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    loadCollaborators();
  }, []);

  const loadCollaborators = async () => {
    try {
      const response = await api.get("/api/collaborators");
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
        await api.post("/api/collaborators", selectedItem);
      } else {
        await api.put("/api/collaborators", selectedItem);
      }
      setSelectedItem(null);
      loadCollaborators();
    } catch (error) {
      console.error("Failed to save collaborator:", error);
    }
  };

  const handleInlineEdit = (item: Collaborator) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleInlineSave = async (id: string) => {
    try {
      await api.put("/api/collaborators", { ...editForm, id });
      setEditingId(null);
      setEditForm({});
      loadCollaborators();
    } catch (error) {
      console.error("Failed to save collaborator:", error);
    }
  };

  const handleInlineCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleCreateNew = () => {
    setSelectedItem({
      id: 'new',
      name: '',
      title: '',
      role: 'Academic Collaborator',
      testimonial: '',
      displayOrder: 0,
      published: true,
      image_url: ''
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedItem) return;

    const file = e.target.files[0];

    // Validate file size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_SIZE) {
      alert('File size exceeds 10MB limit. Please choose a smaller file.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Create object URL for preview and cropping
    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
    setShowCropModal(true);
  };

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const createCroppedImage = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
    const image = new Image();
    image.src = imageSrc;

    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(new Blob());
          return;
        }

        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(new Blob());
          }
        }, 'image/jpeg', 0.9);
      };
    });
  };

  const handleCropAndUpload = async () => {
    if (!croppedAreaPixels || !imageToCrop || !selectedItem) return;

    setUploadingImage(true);

    try {
      const croppedBlob = await createCroppedImage(imageToCrop, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'cropped-avatar.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', croppedFile);
      formData.append('type', 'collaborator-avatar');

      const response = await api.upload('/api/admin/media', formData);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error:', errorText);
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setSelectedItem(prev => prev ? {...prev, image_url: data.url || data.media?.url} : null);
      setShowCropModal(false);
      setImageToCrop('');
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCancelCrop = () => {
    setShowCropModal(false);
    setImageToCrop('');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const deleteCollaborator = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collaborator?')) return;
    try {
      const response = await api.delete(`/api/collaborators?id=${id}`);
      if (response.ok) {
        loadCollaborators();
      } else {
        const error = await response.json();
        console.error("Failed to delete collaborator:", error);
        alert(`Failed to delete: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Failed to delete collaborator:", error);
      alert('Failed to delete collaborator. Please try again.');
    }
  };

  const togglePublished = async (item: Collaborator) => {
    try {
      await api.put("/api/collaborators", { ...item, published: !item.published });
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

  // Use hovered collaborator for preview, or first collaborator if none hovered
  const previewCollaborator = hoveredCollaborator || filteredCollaborators[0] || null;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Left Panel - Collaborator List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Collaborators</h1>
              <p className="text-slate-600">Manage collaborators, colleagues, and mentees testimonials</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Collaborator
            </Button>
          </div>

          <Card className="p-4">
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
        </div>

        {/* Collaborator List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {filteredCollaborators.map((item, index) => (
              <Card
                key={item.id}
                className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  hoveredCollaborator?.id === item.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-slate-50'
                }`}
                onMouseEnter={() => setHoveredCollaborator(item)}
                onClick={() => setHoveredCollaborator(item)}
              >
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <Input
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                      <Input
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                      <select
                        value={editForm.role || 'Academic Collaborator'}
                        onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        {roleOptions.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Testimonial</label>
                      <Textarea
                        value={editForm.testimonial || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, testimonial: e.target.value }))}
                        rows={2}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.published || false}
                        onChange={(e) => setEditForm(prev => ({ ...prev, published: e.target.checked }))}
                        className="rounded"
                      />
                      <label className="text-sm font-medium text-slate-700">Published</label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleInlineSave(item.id)} className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={handleInlineCancel} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-14 w-14 rounded-full object-cover shadow-lg flex-shrink-0 border-2 border-white"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg flex-shrink-0">
                          <Users className="h-7 w-7" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{item.name}</h3>
                          <Badge variant={item.published ? "default" : "secondary"} className="text-xs">
                            {item.published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{item.title}</p>
                        {item.role && (
                          <Badge variant="outline" className="text-xs mt-1">{item.role}</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); moveUp(index); }} disabled={index === 0} className="h-8 w-8 p-0">
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); moveDown(index); }} disabled={index === filteredCollaborators.length - 1} className="h-8 w-8 p-0">
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); togglePublished(item); }} className="h-8 w-8 p-0">
                        {item.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleInlineEdit(item); }} className="h-8 w-8 p-0">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); if (confirm('Are you sure?')) deleteCollaborator(item.id); }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Live Preview</h2>
          <p className="text-sm text-slate-600 mt-1">How it appears on the homepage</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {previewCollaborator ? (
            <div className="space-y-6">
              {/* Collaborator Card Preview */}
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      {previewCollaborator.image_url ? (
                        <img
                          src={previewCollaborator.image_url}
                          alt={previewCollaborator.name || 'Collaborator'}
                          className="h-16 w-16 rounded-full object-cover shadow-lg flex-shrink-0 border-2 border-white"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg flex-shrink-0">
                          <Users className="h-8 w-8" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl text-slate-900 leading-tight">
                          {previewCollaborator.name || 'Collaborator Name'}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">{previewCollaborator.title || 'Title'}</p>
                        {previewCollaborator.role && (
                          <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {previewCollaborator.role}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="relative pl-6 border-l-2 border-blue-200">
                      <Quote className="absolute -left-3 top-0 h-6 w-6 text-blue-400" />
                      <p className="text-slate-700 italic leading-relaxed">
                        &ldquo;{previewCollaborator.testimonial || 'Testimonial will appear here...'}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Context Info */}
              <Card className="bg-blue-50 border-blue-200 p-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm">Homepage Context</h3>
                    <p className="text-xs text-blue-700 mt-1">
                      This testimonial appears in the "Trusted by Collaborators" section on the homepage.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedItem(previewCollaborator)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Full Details
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => togglePublished(previewCollaborator)}
                >
                  {previewCollaborator.published ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Publish
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12">
              <p>No collaborators to preview</p>
              <p className="text-sm mt-2">Add a collaborator to see the preview</p>
            </div>
          )}
        </div>
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {selectedItem.image_url ? (
                        <img
                          src={selectedItem.image_url}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                          <Users className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        id="profilePicture"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="profilePicture"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-50 cursor-pointer ${
                          uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingImage ? (
                          <>
                            <Upload className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4" />
                            Change Photo
                          </>
                        )}
                      </label>
                      <p className="text-xs text-slate-500 mt-1">Max size: 10MB. Image will be cropped to square.</p>
                    </div>
                  </div>
                </div>

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
                      {selectedItem.profilePicture ? (
                        <img
                          src={selectedItem.profilePicture}
                          alt={selectedItem.name || 'Collaborator'}
                          className="h-14 w-14 rounded-full object-cover shadow-lg flex-shrink-0 border-2 border-white"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg flex-shrink-0">
                          <Users className="h-7 w-7" />
                        </div>
                      )}
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

      {/* Image Cropping Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Crop Profile Picture</h2>
              <Button variant="outline" onClick={handleCancelCrop} disabled={uploadingImage}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="relative h-96 bg-slate-100 rounded-lg overflow-hidden">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  cropShape="round"
                  showGrid={false}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCropAndUpload}
                  disabled={!croppedAreaPixels || uploadingImage}
                  className="flex-1"
                >
                  {uploadingImage ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Crop className="w-4 h-4 mr-2" />
                      Crop & Upload
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelCrop}
                  disabled={uploadingImage}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-slate-500 text-center">
                Drag to reposition, use slider to zoom. The image will be cropped to a square for the profile picture.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
