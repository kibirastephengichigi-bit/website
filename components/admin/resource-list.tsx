"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Plus } from "lucide-react";
import { useState } from "react";

export function ResourceList({
  title,
  items,
  onEdit,
  onDelete,
  onAdd,
  addLabel = "Add New",
}: {
  title: string;
  items: Array<Record<string, string | number | boolean | undefined>>;
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  addLabel?: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl">{title}</h2>
          {onAdd && (
            <Button 
              onClick={onAdd}
              className="gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              {addLabel}
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">No items yet</p>
            {onAdd && (
              <Button 
                onClick={onAdd}
                variant="outline"
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Create first {title.toLowerCase()}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border divide-y divide-border">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-4 hover:bg-muted/50 transition-colors group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium">
                      {String(item.title || item.name || item.label || item.slug || `Item ${index + 1}`)}
                    </p>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {Object.entries(item)
                        .filter(([key, value]) => key !== "title" && key !== "name" && key !== "label" && key !== "slug" && value)
                        .slice(0, 2)
                        .map(([key, value]) => (
                          <span key={key} className="mr-4">
                            <span className="font-medium capitalize">{key}:</span> {String(value)}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div 
                    className={`flex gap-2 transition-opacity ${
                      hoveredIndex === index ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(item)}
                        className="gap-1"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(item.id as string)}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
