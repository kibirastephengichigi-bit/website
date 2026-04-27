// Cache Manager for client-side caching and synchronization

export interface CacheStatus {
  enabled: boolean;
  lastSyncTime: number | null;
  cacheSize: number;
  bandwidthSaved: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private bandwidthSaved: number = 0;
  private lastSyncTime: number | null = null;

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async initialize(): Promise<void> {
    const cachingEnabled = localStorage.getItem('adminCachingEnabled') === 'true';

    console.log('[CacheManager] Initializing. Caching enabled:', cachingEnabled);

    if (!cachingEnabled) {
      console.log('[CacheManager] Caching is disabled, skipping initialization');
      return;
    }

    if ('serviceWorker' in navigator) {
      try {
        // Check if service worker is already registered
        const existingRegistration = await navigator.serviceWorker.getRegistration();
        if (existingRegistration) {
          console.log('[CacheManager] Service worker already registered, unregistering...');
          await existingRegistration.unregister();
        }

        console.log('[CacheManager] Registering service worker...');
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('[CacheManager] Service worker registered successfully');

        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        console.log('[CacheManager] Service worker is ready and active');

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('[CacheManager] Received message from service worker:', event.data);
          if (event.data.type === 'CACHE_UPDATED') {
            console.log('[CacheManager] Cache updated:', event.data.url);
          }
        });
      } catch (error) {
        console.error('[CacheManager] Service worker registration failed:', error);
        throw error;
      }
    } else {
      console.warn('[CacheManager] Service workers are not supported in this browser');
    }
  }

  async getStatus(): Promise<CacheStatus> {
    const enabled = localStorage.getItem('adminCachingEnabled') === 'true';
    const cacheSize = await this.getCacheSize();

    return {
      enabled,
      lastSyncTime: this.lastSyncTime,
      cacheSize,
      bandwidthSaved: this.bandwidthSaved,
    };
  }

  async clearCache(): Promise<void> {
    if (this.swRegistration) {
      this.swRegistration.active?.postMessage({ type: 'CLEAR_CACHE' });
    }

    // Also clear caches directly
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    this.bandwidthSaved = 0;
    this.lastSyncTime = null;
  }

  async invalidateCache(url: string): Promise<void> {
    if (this.swRegistration) {
      this.swRegistration.active?.postMessage({ type: 'INVALIDATE_CACHE', url });
    }
  }

  async syncNow(): Promise<void> {
    console.log('[CacheManager] Starting sync...');
    if (this.swRegistration) {
      this.swRegistration.active?.postMessage({ type: 'SYNC_NOW' });
    }
    this.lastSyncTime = Date.now();
    console.log('[CacheManager] Sync initiated, lastSyncTime updated');
  }

  async getCacheSize(): Promise<number> {
    if (!('caches' in window)) {
      console.log('[CacheManager] Cache API not available');
      return 0;
    }

    const cacheNames = await caches.keys();
    console.log('[CacheManager] Found cache names:', cacheNames);
    let totalSize = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      console.log(`[CacheManager] Cache ${cacheName} has ${keys.length} entries`);

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    console.log('[CacheManager] Total cache size:', totalSize, 'bytes');
    return totalSize;
  }

  async disableCaching(): Promise<void> {
    localStorage.setItem('adminCachingEnabled', 'false');

    if (this.swRegistration) {
      await this.swRegistration.unregister();
      this.swRegistration = null;
    }

    await this.clearCache();
  }

  async enableCaching(): Promise<void> {
    localStorage.setItem('adminCachingEnabled', 'true');
    await this.initialize();
  }

  trackBandwidthSaved(bytes: number): void {
    this.bandwidthSaved += bytes;
  }
}

export const cacheManager = CacheManager.getInstance();
