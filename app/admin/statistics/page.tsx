"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  TrendingUp,
  Award,
  Users,
  BookOpen,
  Target
} from "lucide-react";
import { api } from "@/components/api/client";

interface Statistic {
  id: number;
  label: string;
  value: number;
  suffix: string;
  icon: string;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const iconOptions = ["TrendingUp", "Award", "Users", "BookOpen", "Target"];

const iconMap: Record<string, any> = {
  TrendingUp,
  Award,
  Users,
  BookOpen,
  Target
};

export default function StatisticsAdminPage() {
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<Statistic | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await api.get("/api/admin/statistics");
      const data = await response.json();
      setStatistics(data.statistics || []);
    } catch (error) {
      console.error("Failed to load statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    try {
      if (selectedItem.id === 0) {
        await api.post("/api/admin/statistics", selectedItem);
      } else {
        await api.put("/api/admin/statistics", selectedItem);
      }
      setSelectedItem(null);
      loadStatistics();
    } catch (error) {
      console.error("Failed to save statistic:", error);
    }
  };

  const handleCreateNew = () => {
    setSelectedItem({
      id: 0,
      label: "",
      value: 0,
      suffix: "+",
      icon: "TrendingUp",
      display_order: statistics.length,
      published: true,
      created_at: "",
      updated_at: ""
    });
  };

  const deleteStatistic = async (id: number) => {
    try {
      await api.delete("/api/admin/statistics", { body: JSON.stringify({ id }) });
      loadStatistics();
    } catch (error) {
      console.error("Failed to delete statistic:", error);
    }
  };

  const togglePublished = async (item: Statistic) => {
    try {
      await api.put("/api/admin/statistics", { ...item, published: !item.published });
      loadStatistics();
    } catch (error) {
      console.error("Failed to toggle published:", error);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newStats = [...statistics];
    [newStats[index - 1], newStats[index]] = [newStats[index], newStats[index - 1]];
    newStats.forEach((item, i) => item.display_order = i);
    setStatistics(newStats);
    newStats.forEach(item => api.put("/api/admin/statistics", item));
  };

  const moveDown = (index: number) => {
    if (index === statistics.length - 1) return;
    const newStats = [...statistics];
    [newStats[index], newStats[index + 1]] = [newStats[index + 1], newStats[index]];
    newStats.forEach((item, i) => item.display_order = i);
    setStatistics(newStats);
    newStats.forEach(item => api.put("/api/admin/statistics", item));
  };

  const filteredStatistics = statistics.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Statistics</h1>
          <p className="text-slate-600">Manage impact metrics and statistics</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Statistic
        </Button>
      </div>

      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search statistics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="space-y-4">
        {filteredStatistics.map((item, index) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  {(() => {
                    const Icon = iconMap[item.icon] || TrendingUp;
                    return <Icon className="h-6 w-6" />;
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-slate-900">{item.label}</h3>
                    <Badge variant={item.published ? "default" : "secondary"}>
                      {item.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-accent">
                    {item.value}{item.suffix}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => moveUp(index)} disabled={index === 0}>
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => moveDown(index)} disabled={index === filteredStatistics.length - 1}>
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => togglePublished(item)}>
                  {item.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { if (confirm('Are you sure?')) deleteStatistic(item.id); }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedItem.id === 0 ? 'Add Statistic' : 'Edit Statistic'}
              </h2>
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Label</label>
                <Input
                  value={selectedItem.label}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, label: e.target.value} : null)}
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Value</label>
                  <Input
                    type="number"
                    value={selectedItem.value}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, value: parseInt(e.target.value)} : null)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Suffix</label>
                  <Input
                    value={selectedItem.suffix}
                    onChange={(e) => setSelectedItem(prev => prev ? {...prev, suffix: e.target.value} : null)}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
                <select
                  value={selectedItem.icon}
                  onChange={(e) => setSelectedItem(prev => prev ? {...prev, icon: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
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
                  {selectedItem.id === 0 ? 'Create' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
