// Centralized API Client for Frontend
// Handles dynamic base URL detection for development and production (cloudflared tunnel)
// Includes CSRF token management and session refresh
// Includes cache invalidation for data changes

import { cacheManager } from '@/components/cache/cache-manager';

export class ApiClient {
  private static baseUrl: string;
  private static csrfToken: string | null = null;
  private static refreshTimer: NodeJS.Timeout | null = null;
  private static sessionExpiry: Date | null = null;

  static getBaseUrl(): string {
    if (this.baseUrl) {
      return this.baseUrl;
    }

    // In development, use empty string to use Next.js rewrites
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      this.baseUrl = '';
      return this.baseUrl;
    }

    // Use environment variable if set (for production)
    if (process.env.NEXT_PUBLIC_API_URL) {
      this.baseUrl = process.env.NEXT_PUBLIC_API_URL;
      return this.baseUrl;
    }

    // In browser for production, use current origin (works with cloudflared tunnel)
    if (typeof window !== 'undefined') {
      this.baseUrl = window.location.origin;
      return this.baseUrl;
    }

    // Server-side fallback - use environment variable or localhost
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return this.baseUrl;
  }

  static setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  static setCsrfToken(token: string) {
    this.csrfToken = token;
  }

  static getCsrfToken(): string | null {
    return this.csrfToken;
  }

  static async fetchCsrfToken(): Promise<void> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/api/csrf-token`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.csrf_token;
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  }

  static async refreshSession(): Promise<void> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/api/session/refresh`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        this.sessionExpiry = new Date(data.expires_at);
        this.startSessionRefreshTimer();
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  }

  static startSessionRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    // Refresh session every 15 minutes
    this.refreshTimer = setInterval(() => {
      this.refreshSession();
    }, 15 * 60 * 1000);
  }

  static stopSessionRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  static getSessionExpiry(): Date | null {
    return this.sessionExpiry;
  }

  static async fetch(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.getBaseUrl()}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add CSRF token for state-changing requests
    if (this.csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET')) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }

    const defaultOptions: RequestInit = {
      headers,
      credentials: 'include', // Include cookies for session auth
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      // Handle 401 Unauthorized - session expired
      if (response.status === 401) {
        this.stopSessionRefreshTimer();
        this.csrfToken = null;
        this.sessionExpiry = null;
        
        // Redirect to login if in browser
        if (typeof window !== 'undefined') {
          window.location.href = '/admin-signup';
        }
      }
      
      return response;
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  static async get(endpoint: string): Promise<Response> {
    return this.fetch(endpoint, { method: 'GET' });
  }

  static async post(endpoint: string, data?: any): Promise<Response> {
    const response = await this.fetch(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });

    // Invalidate cache on successful POST (data creation)
    if (response.ok) {
      await this.invalidateRelatedCache(endpoint);
    }

    return response;
  }

  static async put(endpoint: string, data?: any): Promise<Response> {
    const response = await this.fetch(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });

    // Invalidate cache on successful PUT (data update)
    if (response.ok) {
      await this.invalidateRelatedCache(endpoint);
    }

    return response;
  }

  static async delete(endpoint: string): Promise<Response> {
    const response = await this.fetch(endpoint, { method: 'DELETE' });

    // Invalidate cache on successful DELETE (data deletion)
    if (response.ok) {
      await this.invalidateRelatedCache(endpoint);
    }

    return response;
  }

  private static async invalidateRelatedCache(endpoint: string): Promise<void> {
    // Invalidate the specific endpoint cache
    await cacheManager.invalidateCache(endpoint);

    // Also invalidate related list endpoints
    if (endpoint.includes('/collaborators')) {
      await cacheManager.invalidateCache('/api/admin/collaborators');
    }
    if (endpoint.includes('/services')) {
      await cacheManager.invalidateCache('/api/admin/services');
    }
    if (endpoint.includes('/media')) {
      await cacheManager.invalidateCache('/api/admin/media');
    }
    if (endpoint.includes('/external-profiles')) {
      await cacheManager.invalidateCache('/api/admin/external-profiles');
    }
    if (endpoint.includes('/seo')) {
      await cacheManager.invalidateCache('/api/admin/seo');
    }
    if (endpoint.includes('/hero')) {
      await cacheManager.invalidateCache('/api/admin/hero');
    }
    if (endpoint.includes('/statistics')) {
      await cacheManager.invalidateCache('/api/admin/statistics');
    }
  }

  static async upload(endpoint: string, formData: FormData): Promise<Response> {
    const url = `${this.getBaseUrl()}${endpoint}`;
    
    const headers: HeadersInit = {};
    
    // Add CSRF token for uploads
    if (this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers,
      });
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.stopSessionRefreshTimer();
        this.csrfToken = null;
        this.sessionExpiry = null;
        
        if (typeof window !== 'undefined') {
          window.location.href = '/admin-signup';
        }
      }
      
      return response;
    } catch (error) {
      console.error(`API upload failed: ${url}`, error);
      throw error;
    }
  }
}

// Convenience functions
export const api = {
  get: (endpoint: string) => ApiClient.get(endpoint),
  post: (endpoint: string, data?: any) => ApiClient.post(endpoint, data),
  put: (endpoint: string, data?: any) => ApiClient.put(endpoint, data),
  delete: (endpoint: string) => ApiClient.delete(endpoint),
  upload: (endpoint: string, formData: FormData) => ApiClient.upload(endpoint),
  getBaseUrl: () => ApiClient.getBaseUrl(),
  setBaseUrl: (url: string) => ApiClient.setBaseUrl(url),
  getCsrfToken: () => ApiClient.getCsrfToken(),
  setCsrfToken: (token: string) => ApiClient.setCsrfToken(token),
  fetchCsrfToken: () => ApiClient.fetchCsrfToken(),
  refreshSession: () => ApiClient.refreshSession(),
  startSessionRefreshTimer: () => ApiClient.startSessionRefreshTimer(),
  stopSessionRefreshTimer: () => ApiClient.stopSessionRefreshTimer(),
  getSessionExpiry: () => ApiClient.getSessionExpiry(),
};
