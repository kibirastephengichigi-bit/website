"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Images,
  Video,
  File,
  Upload,
  Download,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Eye,
  Trash2,
  Edit3,
  FolderOpen,
  FileImage,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Share2,
  Copy,
  RefreshCw,
  MoreVertical,
  X,
  Check,
  BarChart3,
  FileText,
  Image,
  Folder,
  Tag,
  Users,
  Bell,
  Info,
  TrendingUp,
  Maximize2,
  Zap,
  Target
} from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploadedAt: string;
  url: string;
  thumbnail?: string;
  tags?: string[];
}

export default function MediaManagementPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load media from backend
  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const response = await fetch('/api/admin/media?limit=100');
      if (response.ok) {
        const data = await response.json();
        if (data.media) {
          setMedia(data.media.map((item: any) => ({
            id: item.id.toString(),
            filename: item.original_filename || item.filename,
            type: item.type as 'image' | 'video' | 'document',
            size: item.size || 0,
            uploadedAt: item.uploaded_at || new Date().toISOString(),
            url: item.url || '',
            thumbnail: item.thumbnail_url,
            tags: item.tags || []
          })));
        } else if (data.items) {
          setMedia(data.items.map((item: any) => ({
            id: item.id.toString(),
            filename: item.fileName || item.filename,
            type: item.type as 'image' | 'video' | 'document',
            size: item.size || 0,
            uploadedAt: item.uploadedAt || new Date().toISOString(),
            url: item.url || '',
            thumbnail: item.url,
            tags: []
          })));
        }
      }
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const data = await response.json();
        if (data.item) {
          setMedia(prev => [{
            id: data.item.id.toString(),
            filename: data.item.fileName || data.item.filename,
            type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
            size: data.item.size || file.size,
            uploadedAt: data.item.uploadedAt || new Date().toISOString(),
            url: data.item.url || '',
            thumbnail: data.item.url,
            tags: []
          }, ...prev]);
        }
        setShowUploadModal(false);
        loadMedia();
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        alert(`Upload failed: ${errorData.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || item.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this media file?')) {
      try {
        const response = await fetch(`/api/admin/media?id=${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setMedia(prev => prev.filter(item => item.id !== id));
          setSelectedItems(prev => prev.filter(item => item !== id));
        } else {
          alert('Failed to delete media file');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete media file');
      }
    }
  };

  const handlePreview = (item: MediaItem) => {
    setSelectedMedia(item);
    setShowPreview(true);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      image: FileImage,
      video: Video,
      document: File
    };
    return icons[type as keyof typeof icons] || File;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      image: 'bg-blue-100 text-blue-800',
      video: 'bg-green-100 text-green-800',
      document: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Media Library</h1>
            <p className="text-slate-600">Manage images, videos, and documents for your website</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowUploadModal(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Media
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">

      {/* Filters and Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search media files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2 pt-4 border-t border-slate-200 bg-blue-50 -mx-6 -mb-6 px-6 pb-6">
            <span className="text-sm font-medium text-slate-700">
              {selectedItems.length} items selected
            </span>
            <Button variant="outline" size="sm" onClick={() => setSelectedItems([])}>
              Clear Selection
            </Button>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={async () => {
                if (confirm(`Delete ${selectedItems.length} selected items?`)) {
                  for (const id of selectedItems) {
                    await handleDelete(id);
                  }
                  setSelectedItems([]);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        )}
      </Card>

      {/* Media Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
        {filteredMedia.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
            <div className="aspect-video bg-slate-100 relative overflow-hidden" onClick={() => handlePreview(item)}>
              {item.type === 'image' ? (
                <img
                  src={item.thumbnail || item.url}
                  alt={item.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : item.type === 'video' ? (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                  <Video className="w-12 h-12 text-slate-400" />
                </div>
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                  <FileText className="w-12 h-12 text-slate-400" />
                </div>
              )}

              {/* Selection checkbox */}
              <div className="absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelect(item.id)}
                  className="rounded border-slate-300 bg-white w-5 h-5 cursor-pointer"
                />
              </div>

              {/* Type indicator */}
              <div className="absolute top-2 right-2">
                <Badge className={getTypeColor(item.type)} variant="secondary">
                  {item.type}
                </Badge>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Eye className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Media Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-slate-900 truncate">{item.filename}</h4>
                  <div className="text-xs text-slate-500">
                    {new Date(item.uploadedAt).toLocaleDateString()} • {formatFileSize(item.size)}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => handleCopyUrl(item.url)} title="Copy URL">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePreview(item)} title="Preview">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(item.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <Card className="p-12 text-center">
          <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No media found</h3>
          <p className="text-slate-600 mb-6">
            {searchTerm ? 'No media files match your search criteria.' : 'No media files have been uploaded yet.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowUploadModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First File
            </Button>
          )}
        </Card>
      )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedMedia && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-slate-900">Media Preview</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-4">
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.filename}
                  className="w-full h-auto object-contain"
                />
              ) : selectedMedia.type === 'video' ? (
                <video
                  src={selectedMedia.url}
                  className="w-full h-auto object-contain"
                  controls
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <FileText className="w-12 h-12 text-slate-400" />
                  <div className="text-center text-sm text-slate-600 mt-2">
                    <div>{selectedMedia.filename}</div>
                    <div>{formatFileSize(selectedMedia.size)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Upload Media</h3>
                <p className="text-sm text-slate-600 mt-1">Upload images, videos, or documents to your media library</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6">
              {uploading ? (
                <div className="space-y-6 py-8">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <RefreshCw className="w-16 h-16 text-blue-600 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600">{uploadProgress}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-4">Uploading your file...</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div
                    className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 cursor-pointer group"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                      const file = e.dataTransfer.files[0];
                      if (file) handleUpload(file);
                    }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-10 h-10 text-blue-600" />
                    </div>
                    <p className="text-lg font-medium text-slate-900 mb-2">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-slate-600 mb-4">
                      or click to browse from your computer
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                      }}
                      accept="image/*,video/*,.pdf,.doc,.docx"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 cursor-pointer transition-all duration-300 font-medium"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Select File
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <Image className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-900">Images</p>
                      <p className="text-xs text-slate-500">JPG, PNG, GIF</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <Video className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-900">Videos</p>
                      <p className="text-xs text-slate-500">MP4, WebM</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-900">Documents</p>
                      <p className="text-xs text-slate-500">PDF, DOC, DOCX</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">File size limit</p>
                  <p className="text-xs text-amber-700 mt-1">Maximum file size is 10MB. For larger files, please compress them before uploading.</p>
                </div>
              </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
