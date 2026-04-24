"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Download,
  RefreshCw,
  Settings,
  Play,
  Pause,
  BarChart3,
  FileText,
  Image,
  Video,
  Folder,
  Tag,
  Calendar,
  Clock,
  Zap,
  Target,
  Users,
  Bell,
  Check,
  AlertCircle,
  Info,
  TrendingUp,
  Plus,
  X,
  MoreVertical,
  Maximize2
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
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: string;
}

interface MediaStats {
  total: number;
  images: number;
  videos: number;
  documents: number;
  totalSize: string;
  lastUpload?: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([
    {
      id: '1',
      filename: 'hero-image.webp',
      type: 'image',
      size: 245678,
      uploadedAt: '2024-01-15T10:30:00Z',
      url: '/uploads/admin/hero-image.webp',
      thumbnail: '/uploads/admin/thumbnails/hero-image-thumb.webp',
      tags: ['hero', 'homepage'],
      dimensions: { width: 1920, height: 1080 }
    },
    {
      id: '2',
      filename: 'about-us.jpg',
      type: 'image',
      size: 156789,
      uploadedAt: '2024-01-10T15:30:00Z',
      url: '/uploads/admin/about-us.jpg',
      thumbnail: '/uploads/admin/thumbnails/about-us-thumb.jpg',
      tags: ['about', 'team'],
      dimensions: { width: 1200, height: 800 }
    },
    {
      id: '3',
      filename: 'services-intro.mp4',
      type: 'video',
      size: 5242880,
      uploadedAt: '2024-01-08T14:20:00Z',
      url: '/uploads/admin/services-intro.mp4',
      thumbnail: '/uploads/admin/thumbnails/services-intro-thumb.jpg',
      tags: ['services', 'intro'],
      duration: '2:30'
    },
    {
      id: '4',
      filename: 'company-brochure.pdf',
      type: 'document',
      size: 2048576,
      uploadedAt: '2024-01-05T09:15:00Z',
      url: '/uploads/admin/company-brochure.pdf',
      tags: ['company', 'brochure'],
      thumbnail: '/uploads/admin/thumbnails/company-brochure-thumb.jpg'
    }
  ]);

  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos' | 'documents' | 'upload'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'type'>('date');

  const stats: MediaStats = {
    total: media.length,
    images: media.filter(item => item.type === 'image').length,
    videos: media.filter(item => item.type === 'video').length,
    documents: media.filter(item => item.type === 'document').length,
    totalSize: media.reduce((total, item) => total + item.size, 0).toLocaleString(),
    lastUpload: media.length > 0 ? media[0].uploadedAt : 'Never'
  };

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !filterTag || item.tags?.includes(filterTag);
    const matchesType = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesTag && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < sizes.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${sizes[unitIndex]}`;
  };

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleSelectMedia = (item: MediaItem) => {
    setSelectedMedia(item);
  };

  const handleDeleteMedia = (id: string) => {
    setMedia(prev => prev.filter(item => item.id !== id));
    setSelectedMedia(null);
  };

  const handleBulkSelect = () => {
    setSelectedItems(media.map(item => item.id));
  };

  const handleBulkDelete = () => {
    setMedia(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  const handleUpload = async (files: FileList) => {
    const newItems: MediaItem[] = [];
    
    for (const file of files) {
      const mediaItem: MediaItem = {
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        filename: file.name,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'document',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: `/uploads/admin/${file.name}`,
        thumbnail: file.type.startsWith('image/') || file.type.startsWith('video/') ? 
          `/uploads/admin/thumbnails/${file.name.replace(/\.[^/.]+$/, '-thumb')}.${file.type.startsWith('image/') ? 'jpg' : 'jpg'}` : 
          undefined,
        tags: []
      };
      newItems.push(mediaItem);
    }
    
    setMedia(prev => [...prev, ...newItems]);
  };

  const handlePreview = (item: MediaItem) => {
    setShowPreview(true);
    setSelectedMedia(item);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Upload className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">Media Library</h1>
                <p className="text-sm text-slate-600">Manage your media files and assets</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-500">Last upload: {stats.lastUpload}</p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Sidebar */}
        <div className="lg:w-80 xl:w-96 space-y-6">
          {/* Upload Section */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Upload Media</h3>
            
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-sm text-slate-600 mb-4">Drag and drop files here or click to browse</p>
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.doc,.docx"
                onChange={handleUpload}
                className="hidden"
              />
            </div>
          </Card>

          {/* Media Stats */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Media Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">{stats.total}</div>
                <div className="text-sm text-slate-600">Total Files</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.images}</div>
                <div className="text-sm text-slate-600">Images</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.videos}</div>
                <div className="text-sm text-slate-600">Videos</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{stats.documents}</div>
                <div className="text-sm text-slate-600">Documents</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-slate-900">{stats.totalSize}</div>
                <div className="text-sm text-slate-600">Total Size</div>
              </div>
            </div>
          </Card>

          {/* Media Browser */}
          <Card className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search media files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10 border border-slate-200 rounded-lg"
                  />
                </div>
                
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as any)}
                  className="border border-slate-200 rounded-lg px-3 py-2"
                >
                  <option value="all">All Media</option>
                  <option value="images">Images</option>
                  <option value="videos">Videos</option>
                  <option value="documents">Documents</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-slate-200 rounded-lg px-3 py-2"
                >
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                  <option value="size">Size</option>
                  <option value="type">Type</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                  {viewMode === 'grid' ? 'List View' : 'Grid View'}
                </Button>
              </div>
            </div>

            {/* Filter Tags */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filter by tag..."
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterTag('')}
              >
                Clear Filter
              </Button>
            </div>

            {/* Media Grid */}
            <div className="flex-1">
              <div className="grid gap-4 p-4">
                {filteredMedia.map(item => (
                  <Card 
                    key={item.id} 
                    className={`relative group cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedMedia?.id === item.id ? 'ring-2 ring-emerald-500' : ''
                    }`}
                    onClick={() => handleSelectMedia(item)}
                  >
                    <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.filename}
                          className="w-full h-full object-cover"
                        />
                      ) : item.type === 'video' ? (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          controls
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <FileText className="w-12 h-12 text-slate-400" />
                          <div className="text-center text-sm text-slate-600 mt-2">
                            <div>{item.filename}</div>
                            <div>{formatFileSize(item.size)}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Media Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-75 transition-opacity duration-200">
                      <div className="flex items-center justify-center h-full">
                        <div className="text-white text-center">
                          <Eye className="w-8 h-8 mb-2" />
                          <p className="text-sm">Preview</p>
                        </div>
                      </div>
                    </div>

                    {/* Media Type Badge */}
                    <div className="absolute top-2 right-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.type === 'image' ? 'bg-blue-600 text-white' : 
                        item.type === 'video' ? 'bg-purple-600 text-white' : 
                        'bg-gray-600 text-white'
                      }`}>
                        {getMediaTypeIcon(item.type)}
                      </div>
                    </div>

                    {/* Selection Checkbox */}
                    {selectedItems.includes(item.id) && (
                      <div className="absolute top-2 left-2">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Media Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-slate-900">{item.filename}</h4>
                        <div className="text-xs text-slate-500">
                          {item.uploadedAt} • {formatFileSize(item.size)}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {item.tags?.map(tag => (
                          <Badge variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="text-xs text-slate-500">
                          {item.dimensions && `${item.dimensions.width}×${item.dimensions.height}`}
                          {item.duration && ` • ${item.duration}`}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(item)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMedia(item.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && selectedMedia && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Media Preview</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="max-h-[calc(90vh-8rem)] overflow-y-auto">
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
                  <div className="flex items-center justify-center h-full">
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
      </div>
    </div>
  );
}
