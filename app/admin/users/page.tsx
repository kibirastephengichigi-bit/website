"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ShieldCheck,
  Key,
  Activity,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Mail,
  Phone,
  Globe,
  Lock,
  Settings,
  LogOut,
  User,
  RefreshCw,
  Eye,
  MoreVertical
} from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  permissions: string[];
  avatar?: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Mock data - in real implementation, this would come from database
  useEffect(() => {
    const mockUsers: AdminUser[] = [
      {
        id: '1',
        username: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@localhost',
        displayName: 'Stephen Asatsa',
        role: 'super_admin',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        lastLogin: '2024-01-24T14:30:00Z',
        permissions: ['all'],
        avatar: '/images/admin-avatar.jpg'
      },
      {
        id: '2',
        username: 'editor1',
        email: `editor@${process.env.DOMAIN_NAME || 'localhost'}`,
        displayName: 'Content Editor',
        role: 'editor',
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        lastLogin: '2024-01-24T09:15:00Z',
        permissions: ['content:edit', 'media:upload'],
        avatar: '/images/editor-avatar.jpg'
      },
      {
        id: '3',
        username: 'viewer1',
        email: `viewer@${process.env.DOMAIN_NAME || 'localhost'}`,
        displayName: 'Content Viewer',
        role: 'viewer',
        status: 'active',
        createdAt: '2024-01-20T15:30:00Z',
        lastLogin: '2024-01-23T16:45:00Z',
        permissions: ['content:view'],
        avatar: '/images/viewer-avatar.jpg'
      }
    ];
    
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSelect = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== id));
      setSelectedUsers(prev => prev.filter(userId => userId !== id));
    }
  };

  const handleRoleChange = (id: string, newRole: AdminUser['role']) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, role: newRole } : user
    ));
  };

  const handleStatusChange = (id: string, newStatus: AdminUser['status']) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, status: newStatus } : user
    ));
  };

  const getRoleColor = (role: string) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-800',
      admin: 'bg-orange-100 text-orange-800',
      editor: 'bg-blue-100 text-blue-800',
      viewer: 'bg-green-100 text-green-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600">Manage admin accounts, roles, and permissions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
            <span className="text-sm text-slate-600">
              {selectedUsers.length} users selected
            </span>
            <Button variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Email Selected
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:text-red-700"
              onClick={() => {
                if (confirm(`Delete ${selectedUsers.length} selected users?`)) {
                  setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
                  setSelectedUsers([]);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        )}
      </Card>

      {/* Users Grid */}
      <div className="grid gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{user.displayName}</h3>
                  <p className="text-sm text-slate-600">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getRoleColor(user.role)}>
                  {user.role.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge className={getStatusColor(user.status)}>
                  {user.status}
                </Badge>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleSelect(user.id)}
                  className="rounded border-slate-300"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created: {new Date(user.createdAt).toLocaleDateString()}
              </div>
              {user.lastLogin && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Last Login: {new Date(user.lastLogin).toLocaleDateString()}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {user.permissions.map((permission, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'editor' : 'admin')}
                className="text-blue-600 hover:text-blue-700"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')}
                className={user.status === 'active' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
              >
                {user.status === 'active' ? <Lock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDelete(user.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No users found</h3>
          <p className="text-slate-600">
            {searchTerm ? 'No users match your search criteria.' : 'No users have been created yet.'}
          </p>
        </Card>
      )}
    </div>
  );
}
