"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Server, 
  Activity, 
  Database, 
  Clock, 
  Users, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  HardDrive,
  Cpu,
  Globe
} from "lucide-react";
import { api } from "@/components/api/client";

interface ServerStats {
  start_time: string;
  total_requests: number;
  auth_attempts: number;
  successful_logins: number;
  failed_logins: number;
  active_sessions: number;
  last_request_time: string | null;
  endpoints_accessed: Record<string, number>;
  errors: any[];
  uptime_seconds: number;
}

interface SystemInfo {
  platform: string;
  python_version: string;
  working_directory: string;
  process_id: number;
  thread_count: number;
  disk_total: number;
  disk_free: number;
  disk_usage_percent: number;
}

interface DatabaseInfo {
  db_path: string;
  db_size: number;
}

interface DebugData {
  server_stats: ServerStats;
  system_info: SystemInfo;
  database_info: DatabaseInfo;
}

export default function DebugDashboard() {
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchDebugData = async () => {
    try {
      const response = await api.get('/api/debug/stats');
      if (!response.ok) throw new Error("Failed to fetch debug data");
      
      const data = await response.json();
      setDebugData(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await api.get('/api/debug/logs');
      if (!response.ok) throw new Error("Failed to fetch logs");
      
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  useEffect(() => {
    fetchDebugData();
    fetchLogs();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchDebugData();
      fetchLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "error": return "bg-red-100 text-red-800 border-red-200";
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "info": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading debug dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Server className="h-8 w-8" />
                Debug Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor backend services and system performance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={error ? "destructive" : "default"}>
                {error ? "Error" : "Connected"}
              </Badge>
              <Button onClick={fetchDebugData} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </Card>
        )}

        {debugData && (
          <>
            {/* Server Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {debugData.server_stats.total_requests}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Auth Attempts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {debugData.server_stats.auth_attempts}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-green-600">
                        ✓ {debugData.server_stats.successful_logins}
                      </span>
                      <span className="text-xs text-red-600">
                        ✗ {debugData.server_stats.failed_logins}
                      </span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {debugData.server_stats.active_sessions}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Uptime</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatUptime(debugData.server_stats.uptime_seconds)}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </Card>
            </div>

            {/* System Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  System Information
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Platform</span>
                    <span className="text-sm font-medium">{debugData.system_info.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Python Version</span>
                    <span className="text-sm font-medium">{debugData.system_info.python_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Process ID</span>
                    <span className="text-sm font-medium">{debugData.system_info.process_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Thread Count</span>
                    <span className="text-sm font-medium">{debugData.system_info.thread_count}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Storage Information
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Database Size</span>
                    <span className="text-sm font-medium">
                      {formatBytes(debugData.database_info.db_size)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Disk</span>
                    <span className="text-sm font-medium">
                      {formatBytes(debugData.system_info.disk_total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Free Disk</span>
                    <span className="text-sm font-medium">
                      {formatBytes(debugData.system_info.disk_free)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Disk Usage</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${debugData.system_info.disk_usage_percent}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {debugData.system_info.disk_usage_percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Endpoint Access */}
            <Card className="p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Endpoint Access Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(debugData.server_stats.endpoints_accessed).map(([endpoint, count]) => (
                  <div key={endpoint} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-mono text-gray-700">{endpoint}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Logs */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Debug Logs
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No logs available</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Badge className={getLevelColor(log.level)} variant="outline">
                        {log.level}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{log.message}</p>
                        <div className="flex gap-4 mt-1 text-xs text-gray-500">
                          <span>{log.endpoint || 'N/A'}</span>
                          <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
