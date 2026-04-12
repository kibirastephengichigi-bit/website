import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminDashboardData } from "@/lib/content/admin-data";
import { TrendingUp, FileText, Users, Image, BookOpen, Award, Edit2, Plus } from "lucide-react";

const quickActions = [
  {
    icon: FileText,
    label: "New Blog Post",
    href: "/admin/blog",
    color: "text-blue-500",
  },
  {
    icon: BookOpen,
    label: "Add Research",
    href: "/admin/research",
    color: "text-purple-500",
  },
  {
    icon: Award,
    label: "New Publication",
    href: "/admin/publications",
    color: "text-green-500",
  },
  {
    icon: Image,
    label: "Upload Media",
    href: "/admin/media",
    color: "text-pink-500",
  },
  {
    icon: Users,
    label: "Testimonials",
    href: "/admin/testimonials",
    color: "text-orange-500",
  },
  {
    icon: Edit2,
    label: "Site Content",
    href: "/admin/content",
    color: "text-teal-500",
  },
];

export default function AdminPage() {
  return (
    <AdminShell
      title="Dashboard"
      description="Welcome to your admin dashboard. Manage all content, media, and site settings from here."
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminDashboardData.metrics.map((metric) => (
          <Card key={metric.label} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <p className="mt-3 font-display text-4xl">{metric.value}</p>
              </div>
              <div className="rounded-lg bg-accent/10 p-3">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Updated daily</p>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl">Quick Actions</h2>
            <p className="text-sm text-muted-foreground mt-1">Fast access to common admin tasks</p>
          </div>
          <Plus className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <button className="group w-full text-left p-4 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-all">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${action.color}`} />
                    <span className="font-medium group-hover:text-accent transition-colors">{action.label}</span>
                  </div>
                </button>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Features Overview */}
      <Card className="p-8 bg-gradient-to-br from-accent/5 via-background to-background">
        <h2 className="font-display text-2xl">Admin Features</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Blog Management
            </h3>
            <p className="text-sm text-muted-foreground">Create, edit, and publish blog posts with rich text editing, categories, and featured images.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-500" />
              Research & Publications
            </h3>
            <p className="text-sm text-muted-foreground">Manage research projects with summaries and publications with abstracts and file uploads.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              Testimonials
            </h3>
            <p className="text-sm text-muted-foreground">Add client testimonials with images and feature them on your site.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Image className="h-4 w-4 text-pink-500" />
              Media Library
            </h3>
            <p className="text-sm text-muted-foreground">Upload and manage images, videos, and other media assets with metadata.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-teal-500" />
              Content Editor
            </h3>
            <p className="text-sm text-muted-foreground">Edit global site content, pages, and marketing copy in one place.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Award className="h-4 w-4 text-green-500" />
              Authentication
            </h3>
            <p className="text-sm text-muted-foreground">Secure admin access with credentials or Google OAuth for authorized users.</p>
          </div>
        </div>
      </Card>
    </AdminShell>
  );
}
