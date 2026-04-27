"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Users, Quote, Handshake } from "lucide-react";

interface Collaborator {
  id: number;
  name: string;
  title: string;
  role: string;
  testimonial: string;
  display_order: number;
  published: boolean;
}

export function CollaboratorsSection() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const fetchCollaborators = async () => {
    try {
      const response = await fetch("/api/collaborators");
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.collaborators || []);
      }
    } catch (error) {
      console.error("Failed to fetch collaborators:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  const publishedCollaborators = collaborators.filter(c => c.published);

  if (publishedCollaborators.length === 0) {
    return null;
  }

  return (
    <section className="section-space bg-gradient-to-b from-slate-50 to-white">
      <div className="container-shell space-y-12">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Handshake className="w-8 h-8 text-blue-600" />
            <h2 className="font-display text-4xl font-bold text-slate-900">
              Trusted by Collaborators
            </h2>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A calm, professional proof layer that supports the credibility of the practice and academic profile.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publishedCollaborators.map((collaborator) => (
            <Card
              key={collaborator.id}
              className="p-6 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg flex-shrink-0">
                    <Users className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-slate-900 leading-tight">
                      {collaborator.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">{collaborator.title}</p>
                    {collaborator.role && (
                      <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {collaborator.role}
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative pl-6 border-l-2 border-blue-200">
                  <Quote className="absolute -left-3 top-0 h-6 w-6 text-blue-400" />
                  <p className="text-slate-700 italic leading-relaxed">
                    &ldquo;{collaborator.testimonial}&rdquo;
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
