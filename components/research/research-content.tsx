"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SaveItemButton } from "@/components/user/save-item-button";
import { siteContent } from "@/lib/content/site-content";
import { BarChart3, FileText, Award, Users, Video, Download, Briefcase, Globe } from "lucide-react";

const researchHighlights = [
  { label: "Projects", value: siteContent.researchProjects.length, color: "blue", icon: Briefcase },
  { label: "Publications", value: siteContent.publications.length, color: "green", icon: FileText },
  { label: "Grants", value: siteContent.grants.length, color: "purple", icon: Download },
  { label: "Talks", value: siteContent.conferences.length + siteContent.invitedTalks.length, color: "blue", icon: Globe },
];

const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    gradient: "from-blue-500 to-blue-600",
    accent: "bg-blue-500",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
    gradient: "from-green-500 to-green-600",
    accent: "bg-green-500",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
    gradient: "from-purple-500 to-purple-600",
    accent: "bg-purple-500",
  },
};

const tabs = [
  { id: "all", label: "All", icon: BarChart3 },
  { id: "projects", label: "Projects", icon: Briefcase, color: "blue" },
  { id: "publications", label: "Publications", icon: FileText, color: "green" },
  { id: "grants", label: "Grants", icon: Download, color: "purple" },
  { id: "talks", label: "Talks", icon: Globe, color: "blue" },
  { id: "recognition", label: "Recognition", icon: Award, color: "green" },
  { id: "media", label: "Media", icon: Video, color: "purple" },
  { id: "collaboration", label: "Collaboration", icon: Users, color: "blue" },
];

export function ResearchContent() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <>
      {/* Stats Cards with Dynamic Colors */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {researchHighlights.map((item) => {
          const colors = colorClasses[item.color as keyof typeof colorClasses];
          const Icon = item.icon;
          return (
            <Card key={item.label} className={`flex items-end justify-between gap-4 p-5 ${colors.bg} ${colors.border} border-2 hover:shadow-lg transition-shadow`}>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${colors.text}`}>{item.label}</p>
                <p className="mt-3 font-display text-4xl text-slate-900">{item.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colors.accent} opacity-20`}>
                <Icon className={`h-6 w-6 ${colors.text}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const colors = tab.color ? colorClasses[tab.color as keyof typeof colorClasses] : null;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? `${colors?.bg || 'bg-slate-100'} ${colors?.text || 'text-slate-900'} font-semibold` 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {/* Projects Section */}
        {(activeTab === "all" || activeTab === "projects") && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-1 rounded-full bg-gradient-to-r ${colorClasses.blue.gradient}`} />
              <h2 className="text-2xl font-bold text-slate-900">Research Projects</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {siteContent.researchProjects.map((project) => (
                <Card key={project.title} className={`p-7 ${colorClasses.blue.bg} ${colorClasses.blue.border} border-2 hover:shadow-lg transition-shadow`}>
                  <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${colorClasses.blue.text}`}>
                    {project.category} • {project.status}
                  </p>
                  <h2 className="mt-3 font-display text-3xl leading-tight text-slate-900">{project.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{project.summary}</p>
                  {project.funding ? <p className="mt-3 text-sm font-medium text-slate-900">Funding: {project.funding}</p> : null}
                  {project.details ? (
                    <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                      {project.details.map((detail) => (
                        <li key={detail} className="flex gap-2">
                          <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${colorClasses.blue.accent}`} />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {project.link ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button asChild variant="ghost" className="px-0 text-blue-600 hover:text-blue-700">
                        <Link href={project.link}>Read more</Link>
                      </Button>
                      <SaveItemButton
                        type="research"
                        itemKey={project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                        title={project.title}
                        href={project.link}
                      />
                    </div>
                  ) : null}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Publications Section */}
        {(activeTab === "all" || activeTab === "publications") && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-1 rounded-full bg-gradient-to-r ${colorClasses.green.gradient}`} />
              <h2 className="text-2xl font-bold text-slate-900">Publications</h2>
            </div>
            <Card className={`p-7 ${colorClasses.green.bg} ${colorClasses.green.border} border-2`}>
              <div className="flex flex-col gap-4 border-b border-green-200 pb-6 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${colorClasses.green.text}`}>Publications</p>
                  <h3 className="font-display text-3xl text-slate-900">Selected outputs and academic resources</h3>
                  <p className="max-w-3xl text-sm leading-7 text-slate-600">
                    Publications now sit in a compact card grid so the section feels lighter while keeping the same information visible.
                  </p>
                </div>
                <Button asChild variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                  <Link href="https://scholar.google.com/citations?user=nBzSCvUAAAAJ&hl=en">See full publications</Link>
                </Button>
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {siteContent.publications.map((publication) => (
                  <div
                    key={publication.title}
                    className="rounded-[24px] border border-green-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-green-600">
                      <span>{publication.type}</span>
                      <span className="text-green-300">•</span>
                      <span>{publication.year}</span>
                    </div>
                    <h4 className="mt-3 text-lg font-semibold leading-snug text-slate-900">{publication.title}</h4>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{publication.summary}</p>
                    {publication.fileUrl ? (
                      <Button asChild variant="ghost" className="mt-3 px-0 text-green-600 hover:text-green-700">
                        <Link href={publication.fileUrl}>Open file</Link>
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Grants Section */}
        {(activeTab === "all" || activeTab === "grants") && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-1 rounded-full bg-gradient-to-r ${colorClasses.purple.gradient}`} />
              <h2 className="text-2xl font-bold text-slate-900">Grants</h2>
            </div>
            <Card className={`p-7 ${colorClasses.purple.bg} ${colorClasses.purple.border} border-2`}>
              <div className="space-y-2">
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${colorClasses.purple.text}`}>Grants</p>
                <h3 className="font-display text-3xl text-slate-900">Funding and travel support</h3>
              </div>
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {siteContent.grants.map((grant) => (
                  <li
                    key={grant}
                    className="rounded-[22px] border border-purple-200 bg-white px-4 py-3 text-sm leading-7 text-slate-600 hover:bg-purple-50 transition-colors"
                  >
                    {grant}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {/* Talks Section */}
        {(activeTab === "all" || activeTab === "talks") && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-1 rounded-full bg-gradient-to-r ${colorClasses.blue.gradient}`} />
              <h2 className="text-2xl font-bold text-slate-900">Conferences and Talks</h2>
            </div>
            <Card className={`p-7 ${colorClasses.blue.bg} ${colorClasses.blue.border} border-2`}>
              <div className="space-y-2">
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${colorClasses.blue.text}`}>Conferences and Talks</p>
                <h3 className="font-display text-3xl text-slate-900">Conference activity and invited speaking</h3>
              </div>
              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div className="rounded-[24px] border border-blue-200 bg-white p-5">
                  <h4 className="text-lg font-semibold text-slate-900">Conferences</h4>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                    {siteContent.conferences.map((conference) => (
                      <li key={conference} className="border-b border-blue-100 pb-3 last:border-0 last:pb-0">
                        {conference}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[24px] border border-blue-200 bg-white p-5">
                  <h4 className="text-lg font-semibold text-slate-900">Invited talks</h4>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                    {siteContent.invitedTalks.map((talk) => (
                      <li key={talk} className="border-b border-blue-100 pb-3 last:border-0 last:pb-0">
                        {talk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Recognition Section */}
        {(activeTab === "all" || activeTab === "recognition") && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-1 rounded-full bg-gradient-to-r ${colorClasses.green.gradient}`} />
              <h2 className="text-2xl font-bold text-slate-900">Recognition</h2>
            </div>
            <Card className={`p-7 ${colorClasses.green.bg} ${colorClasses.green.border} border-2`}>
              <div className="space-y-2">
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${colorClasses.green.text}`}>Recognition</p>
                <h3 className="font-display text-3xl text-slate-900">Honors and awards</h3>
              </div>
              <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
                {siteContent.awards.map((award) => (
                  <li
                    key={`${award.title}-${award.year}`}
                    className="rounded-[22px] border border-green-200 bg-white px-4 py-3 hover:bg-green-50 transition-colors"
                  >
                    <span className="font-medium text-slate-900">{award.year}</span> • {award.title}
                    {award.href ? (
                      <>
                        {" "}
                        <Link href={award.href} className="text-green-600 underline-offset-4 hover:underline">
                          Reference
                        </Link>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {/* Media Section */}
        {(activeTab === "all" || activeTab === "media") && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-1 rounded-full bg-gradient-to-r ${colorClasses.purple.gradient}`} />
              <h2 className="text-2xl font-bold text-slate-900">Media</h2>
            </div>
            <Card className={`p-7 ${colorClasses.purple.bg} ${colorClasses.purple.border} border-2`}>
              <div className="space-y-2">
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${colorClasses.purple.text}`}>Media</p>
                <h3 className="font-display text-3xl text-slate-900">Media and talk archive</h3>
              </div>
              <div className="mt-6 grid gap-4">
                {siteContent.media.map((item) => (
                  <div
                    key={item.href}
                    className="rounded-[22px] border border-purple-200 bg-white px-4 py-4 text-sm leading-7 text-slate-600 hover:bg-purple-50 transition-colors"
                  >
                    <Link href={item.href} className="font-medium text-slate-900 underline-offset-4 hover:underline">
                      {item.title}
                    </Link>
                    <p className="mt-1">
                      {item.kind}
                      {item.year ? ` • ${item.year}` : ""}
                    </p>
                    {item.description ? <p className="mt-1">{item.description}</p> : null}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Collaboration Section */}
        {(activeTab === "all" || activeTab === "collaboration") && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-1 rounded-full bg-gradient-to-r ${colorClasses.blue.gradient}`} />
              <h2 className="text-2xl font-bold text-slate-900">Collaboration</h2>
            </div>
            <Card className={`p-7 ${colorClasses.blue.bg} ${colorClasses.blue.border} border-2`}>
              <div className="space-y-2">
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${colorClasses.blue.text}`}>Collaboration</p>
                <h3 className="font-display text-3xl text-slate-900">Project collaborators</h3>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {siteContent.collaborators.map((person) => (
                  <div key={person.name} className="rounded-[24px] border border-blue-200 bg-white p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      {person.image ? (
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-blue-200 bg-blue-50">
                          <Image
                            src={person.image}
                            alt={person.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{person.name}</p>
                        <p className="text-sm text-slate-600">
                          {person.role} • {person.affiliation}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{person.summary}</p>
                    {person.href ? (
                      <Button asChild variant="ghost" className="mt-3 px-0 text-blue-600 hover:text-blue-700">
                        <Link href={person.href}>Open profile</Link>
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
