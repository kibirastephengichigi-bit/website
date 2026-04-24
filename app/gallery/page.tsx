"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Calendar, Eye, Camera, Grid, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GalleryPhoto {
  id: string;
  title: string;
  description: string;
  image_url: string;
  thumbnail_url: string;
  upload_date: string;
  file_size: number;
  dimensions: {
    width: number;
    height: number;
  };
  category?: string;
  tags?: string[];
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    fetchGalleryPhotos();
  }, []);

  const fetchGalleryPhotos = async () => {
    try {
      const response = await fetch("http://localhost:6354/api/gallery/photos");
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
      } else {
        setError("Failed to load gallery photos");
      }
    } catch (error) {
      console.error("Error fetching gallery photos:", error);
      setError("Unable to connect to server");
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="section-space">
      <div className="container-shell space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Gallery</p>
          <h1 className="font-display text-5xl">Photo Gallery</h1>
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
            Explore moments captured through my lens. A collection of professional photography 
            showcasing conferences, research activities, and special events.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4 mr-2" />
              Grid View
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4 mr-2" />
              List View
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {photos.length} photos
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="flex items-center gap-2 text-red-700">
              <ImageIcon className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {photos.length === 0 && !error && (
          <Card className="p-12 text-center">
            <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Photos Yet</h3>
            <p className="text-muted-foreground">
              The gallery is currently empty. Check back soon for new photos!
            </p>
          </Card>
        )}

        {/* Grid View */}
        {viewMode === "grid" && photos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <Card 
                key={photo.id} 
                className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={photo.thumbnail_url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                        {photo.title}
                      </h3>
                      <p className="text-white/80 text-xs line-clamp-2">
                        {photo.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(photo.upload_date)}</span>
                    <span>{formatFileSize(photo.file_size)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && photos.length > 0 && (
          <div className="space-y-4">
            {photos.map((photo) => (
              <Card 
                key={photo.id} 
                className="p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={photo.thumbnail_url}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1">{photo.title}</h3>
                    <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                      {photo.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(photo.upload_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {photo.dimensions.width} × {photo.dimensions.height}
                      </span>
                      <span>{formatFileSize(photo.file_size)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Photo Modal */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div 
              className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={selectedPhoto.image_url}
                  alt={selectedPhoto.title}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{selectedPhoto.title}</h2>
                <p className="text-muted-foreground mb-4">{selectedPhoto.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedPhoto.upload_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    {selectedPhoto.dimensions.width} × {selectedPhoto.dimensions.height}
                  </span>
                  <span>{formatFileSize(selectedPhoto.file_size)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
