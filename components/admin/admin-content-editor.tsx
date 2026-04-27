"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Edit3,
  Bold,
  Italic,
  Underline,
  List,
  Grid,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Check,
  X,
  Plus,
  Minus,
  RotateCcw,
  FileText,
  Download,
  Upload,
  Clock,
  Calendar,
  Zap,
  Target,
  Minimize2,
  Maximize2
} from "lucide-react";

interface ContentEditorProps {
  initialContent?: {
    title: string;
    content: string;
    status: 'draft' | 'published' | 'scheduled';
    seoTitle?: string;
    seoDescription?: string;
    lastModified: string;
  };
  onSave?: (content: any) => void;
  onPreview?: (content: any) => void;
  realTimeSync?: boolean;
}

export function AdminContentEditor({ 
  initialContent, 
  onSave, 
  onPreview, 
  realTimeSync = true 
}: ContentEditorProps) {
  const [content, setContent] = useState(initialContent || {
    title: '',
    content: '',
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    lastModified: new Date().toISOString()
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState('1 min');
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Calculate word count and reading time
  useEffect(() => {
    const words = content.content.trim().split(/\s+/).length;
    setWordCount(words);
    const readingTime = Math.max(1, Math.ceil(words / 200)); // 200 words per minute
    setReadingTime(`${readingTime} min`);
  }, [content.content]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave) return;
    
    const interval = setInterval(() => {
      if (onSave) {
        onSave(content);
        setLastSaved(new Date());
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [content, autoSave, onSave]);

  const handleContentChange = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(content);
      setLastSaved(new Date());
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(content);
    }
  };

  const insertFormatting = (before: string, after: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = content.content;
      const newText = text.substring(0, start) + before + text.substring(start, end) + after;
      
      setContent(prev => ({ ...prev, content: newText }));
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, start + before.length);
      }, 0);
    }
  };

  const getSEOColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateSEOScore = () => {
    let score = 0;
    const title = content.seoTitle || content.title;
    const description = content.seoDescription || '';
    
    // Title scoring
    if (title.length >= 30 && title.length <= 60) score += 20;
    if (title.includes(content.title.substring(0, 3))) score += 15;
    
    // Description scoring
    if (description.length >= 120 && description.length <= 160) score += 20;
    if (description.includes(content.title.substring(0, 3))) score += 15;
    
    // Content scoring
    const contentWords = content.content.split(/\s+/).length;
    if (contentWords >= 300) score += 20;
    if (content.content.includes(title.substring(0, 3))) score += 15;
    
    return Math.min(100, score);
  };

  return (
    <div className="flex h-full bg-white">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Content Title"
              value={content.title}
              onChange={(e) => handleContentChange('title', e.target.value)}
              className="max-w-md"
            />
            <Badge variant={content.status === 'published' ? 'default' : 'secondary'}>
              {content.status}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isPreviewMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? <Edit3 className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minus className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <label className="flex items-center text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="mr-2"
                />
                Auto-save
              </label>
              {lastSaved && (
                <span className="text-xs text-slate-500">
                  Saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
            
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={!onSave}
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
          </div>
        </div>

        {realTimeSync && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600">Real-time sync active</span>
          </div>
        )}
      </div>

      {/* Editor and Preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Panel */}
        {!isPreviewMode && (
          <div className="flex flex-col h-full">
            {/* Formatting Toolbar */}
            <div className="border-b border-slate-200 p-2 bg-slate-50">
              <div className="flex items-center gap-1 flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('**', '**')}
                  title="Bold"
                >
                  <Bold className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('*', '*')}
                  title="Italic"
                >
                  <Italic className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('__', '__')}
                  title="Underline"
                >
                  <Underline className="w-3 h-3" />
                </Button>
                
                <div className="w-px h-6 bg-slate-300" />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('# ', '# ')}
                  title="Heading"
                >
                  <Heading1 className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('## ', '## ')}
                  title="Link"
                >
                  <Link className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('> ', '> ')}
                  title="Quote"
                >
                  <Quote className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('`', '`')}
                  title="Code"
                >
                  <Code className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Content Editor */}
            <div className="flex-1 p-4">
              <Textarea
                id="content-editor"
                value={content.content}
                onChange={(e) => handleContentChange('content', e.target.value)}
                placeholder="Start writing your content..."
                className="w-full h-full resize-none border-0 focus:ring-0"
                style={{ minHeight: '400px' }}
              />
            </div>

            {/* Editor Footer */}
            <div className="border-t border-slate-200 p-3 bg-slate-50">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center gap-4">
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span>{readingTime} read</span>
                  <span>•</span>
                  <span>Markdown supported</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreview}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Panel */}
        {isPreviewMode && (
          <div className="flex flex-col h-full bg-slate-50">
            {/* Preview Header */}
            <div className="border-b border-slate-200 p-4 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Preview</h3>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    SEO Score: {calculateSEOScore()}/100
                  </Badge>
                  
                  <select
                    value="desktop"
                    onChange={(e) => {}}
                    className="text-sm border border-slate-200 rounded px-2 py-1"
                  >
                    <option value="desktop">Desktop</option>
                    <option value="tablet">Tablet</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <div className="space-y-4">
                    {/* SEO Preview */}
                    <div className="border-b border-slate-200 pb-4 mb-4">
                      <h4 className="font-semibold text-slate-900 mb-2">SEO Meta Tags</h4>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Title:</span>
                          <p className="font-mono bg-slate-100 p-2 rounded text-xs">
                            {content.seoTitle || content.title}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-slate-600">Description:</span>
                          <p className="font-mono bg-slate-100 p-2 rounded text-xs">
                            {content.seoDescription || 'No description set'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="text-slate-600">SEO Score:</span>
                        <div className="flex items-center gap-2">
                          <div className={`text-2xl font-bold ${getSEOColor(calculateSEOScore())}`}>
                            {calculateSEOScore()}
                          </div>
                          <div className="text-xs text-slate-600">
                            <div>Good: 80-100</div>
                            <div>Okay: 60-79</div>
                            <div>Needs Work: 0-59</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div>
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: content.content }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
