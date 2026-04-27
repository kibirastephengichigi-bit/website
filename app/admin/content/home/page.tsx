"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Save,
  Eye,
  RefreshCw,
  FileText,
  Users,
  BarChart3,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Edit3,
  Upload,
  Image,
  Settings,
  Globe
} from "lucide-react";

interface HomePageContent {
  hero: {
    eyebrow: string;
    headline: string;
    description: string;
    ctaText: string;
    ctaLink: string;
  };
  about: {
    title: string;
    content: string;
    achievements: Array<{
      number: string;
      label: string;
      description: string;
    }>;
  };
  services: {
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  statistics: Array<{
    number: string;
    label: string;
    description: string;
  }>;
  contact: {
    phone: string;
    email: string;
    address: string;
    hours: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export default function HomePageContentManagement() {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'hero' | 'about' | 'services' | 'statistics' | 'contact' | 'seo'>('hero');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadHomePageContent();
  }, []);

  const loadHomePageContent = async () => {
    try {
      setLoading(true);
      // Mock data - in real implementation, this would come from API
      const mockContent: HomePageContent = {
        hero: {
          eyebrow: "Dr. Stephen Asatsa Psychology Practice",
          headline: "Transforming Lives Through Professional Psychology Services",
          description: "Expert psychological care, research, and academic excellence dedicated to your mental well-being and personal growth.",
          ctaText: "Book Consultation",
          ctaLink: "/contact"
        },
        about: {
          title: "About Dr. Stephen Asatsa",
          content: "Dr. Stephen Asatsa is a licensed psychologist with over 15 years of experience in clinical psychology, research, and academic practice. Specializing in cognitive behavioral therapy, trauma-informed care, and psychological assessment.",
          achievements: [
            { number: "15+", label: "Years Experience", description: "Professional practice" },
            { number: "500+", label: "Clients Helped", description: "Successful outcomes" },
            { number: "50+", label: "Research Papers", description: "Academic contributions" }
          ]
        },
        services: {
          title: "Our Services",
          description: "Comprehensive psychological services tailored to your individual needs",
          items: [
            {
              title: "Individual Therapy",
              description: "Personalized one-on-one therapy sessions for adults and adolescents",
              icon: "user"
            },
            {
              title: "Group Therapy",
              description: "Therapeutic group sessions for shared healing and growth",
              icon: "users"
            },
            {
              title: "Psychological Assessment",
              description: "Comprehensive psychological evaluations and assessments",
              icon: "clipboard"
            }
          ]
        },
        statistics: [
          { number: "98%", label: "Success Rate", description: "Client satisfaction" },
          { number: "500+", label: "Sessions", description: "Monthly consultations" },
          { number: "24/7", label: "Support", description: "Emergency availability" }
        ],
        contact: {
          phone: "+254 712 345 678",
          email: process.env.ADMIN_EMAIL || "contact@localhost",
          address: "Nairobi, Kenya",
          hours: "Mon-Fri: 9AM-6PM, Sat: 9AM-1PM"
        },
        seo: {
          title: "Dr. Stephen Asatsa - Professional Psychology Services | Nairobi",
          description: "Expert psychological services including therapy, assessment, and counseling. Licensed psychologist with 15+ years experience.",
          keywords: ["psychology", "therapy", "counseling", "mental health", "dr stephen asatsa", "nairobi"]
        }
      };
      
      setContent(mockContent);
    } catch (error) {
      console.error('Error loading home page content:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    if (!content) return;
    
    try {
      setSaving(true);
      // In real implementation, this would save to API
      console.log('Saving home page content:', content);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Home page content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (section: keyof HomePageContent, field: string, value: any) => {
    if (!content) return;
    
    setContent(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  };

  const updateNestedContent = (section: keyof HomePageContent, index: number, field: string, value: any) => {
    if (!content) return;
    
    const sectionData = content[section];
    if (Array.isArray(sectionData)) {
      const newArray = [...sectionData];
      newArray[index] = { ...newArray[index], [field]: value };
      setContent(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [section]: newArray
        };
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="ml-2 text-red-500">Failed to load home page content</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Home Page Content</h1>
          <p className="text-slate-600">Edit and manage your website's home page content</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={previewMode ? "default" : "outline"}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? "Edit Mode" : "Preview Mode"}
          </Button>
          <Button 
            onClick={saveContent}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Section Navigation */}
      <Card className="p-4">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'hero', label: 'Hero Section', icon: Home },
            { id: 'about', label: 'About Section', icon: FileText },
            { id: 'services', label: 'Services', icon: Star },
            { id: 'statistics', label: 'Statistics', icon: BarChart3 },
            { id: 'contact', label: 'Contact Info', icon: Phone },
            { id: 'seo', label: 'SEO Settings', icon: Globe }
          ].map(section => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection(section.id as any)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Content Editor */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 capitalize">
            {activeSection} Section
          </h2>

          {activeSection === 'hero' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Eyebrow Text</label>
                <Input
                  value={content.hero.eyebrow}
                  onChange={(e) => updateContent('hero', 'eyebrow', e.target.value)}
                  placeholder="Eyebrow text above headline"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Headline</label>
                <Textarea
                  value={content.hero.headline}
                  onChange={(e) => updateContent('hero', 'headline', e.target.value)}
                  rows={3}
                  placeholder="Main headline"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <Textarea
                  value={content.hero.description}
                  onChange={(e) => updateContent('hero', 'description', e.target.value)}
                  rows={4}
                  placeholder="Hero section description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CTA Button Text</label>
                  <Input
                    value={content.hero.ctaText}
                    onChange={(e) => updateContent('hero', 'ctaText', e.target.value)}
                    placeholder="Button text"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CTA Button Link</label>
                  <Input
                    value={content.hero.ctaLink}
                    onChange={(e) => updateContent('hero', 'ctaLink', e.target.value)}
                    placeholder="/contact"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'about' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                <Input
                  value={content.about.title}
                  onChange={(e) => updateContent('about', 'title', e.target.value)}
                  placeholder="About section title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                <Textarea
                  value={content.about.content}
                  onChange={(e) => updateContent('about', 'content', e.target.value)}
                  rows={6}
                  placeholder="About section content"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Achievements</label>
                <div className="space-y-3">
                  {content.about.achievements.map((achievement, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2">
                      <Input
                        value={achievement.number}
                        onChange={(e) => updateNestedContent('about', index, 'number', e.target.value)}
                        placeholder="Number"
                      />
                      <Input
                        value={achievement.label}
                        onChange={(e) => updateNestedContent('about', index, 'label', e.target.value)}
                        placeholder="Label"
                      />
                      <Input
                        value={achievement.description}
                        onChange={(e) => updateNestedContent('about', index, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <Input
                  value={content.contact.phone}
                  onChange={(e) => updateContent('contact', 'phone', e.target.value)}
                  placeholder="+254 712 345 678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <Input
                  value={content.contact.email}
                  onChange={(e) => updateContent('contact', 'email', e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                <Input
                  value={content.contact.address}
                  onChange={(e) => updateContent('contact', 'address', e.target.value)}
                  placeholder="Your address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Business Hours</label>
                <Input
                  value={content.contact.hours}
                  onChange={(e) => updateContent('contact', 'hours', e.target.value)}
                  placeholder="Mon-Fri: 9AM-6PM"
                />
              </div>
            </div>
          )}

          {activeSection === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SEO Title</label>
                <Input
                  value={content.seo.title}
                  onChange={(e) => updateContent('seo', 'title', e.target.value)}
                  placeholder="SEO title (60 characters max)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">SEO Description</label>
                <Textarea
                  value={content.seo.description}
                  onChange={(e) => updateContent('seo', 'description', e.target.value)}
                  rows={3}
                  placeholder="SEO description (160 characters max)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Keywords (comma-separated)</label>
                <Input
                  value={content.seo.keywords.join(', ')}
                  onChange={(e) => updateContent('seo', 'keywords', e.target.value.split(',').map(k => k.trim()))}
                  placeholder="psychology, therapy, counseling"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Preview Panel */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Live Preview</h2>
          
          <div className="space-y-6">
            {/* Hero Preview */}
            <div className="border rounded-lg p-6 bg-gradient-to-br from-slate-50 to-slate-100">
              <div className="space-y-4">
                <div className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-600">
                  {content.hero.eyebrow}
                </div>
                
                <h1 className="text-2xl font-bold text-slate-900">
                  {content.hero.headline}
                </h1>
                
                <p className="text-slate-600">
                  {content.hero.description}
                </p>
                
                <Button className="bg-blue-600 hover:bg-blue-700">
                  {content.hero.ctaText}
                </Button>
              </div>
            </div>

            {/* About Preview */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                {content.about.title}
              </h3>
              <p className="text-slate-600 mb-4">
                {content.about.content}
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                {content.about.achievements.map((achievement, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xl font-bold text-blue-600">{achievement.number}</div>
                    <div className="text-sm font-medium text-slate-900">{achievement.label}</div>
                    <div className="text-xs text-slate-600">{achievement.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Preview */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span>{content.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-600" />
                  <span>{content.contact.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  <span>{content.contact.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <span>{content.contact.hours}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
