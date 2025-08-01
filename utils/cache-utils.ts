// PWA Cache Management Utilities

export interface CacheOperationResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

export class PWACacheManager {
  static readonly CACHE_NAMES = {
    API: 'updrafted-api-v1',
    STATIC: 'updrafted-static-v1',
    PAGES: 'updrafted-pages-v1'
  };

  /**
   * Check if caches are supported
   */
  private static isCacheSupported(): boolean {
    return typeof window !== 'undefined' && 'caches' in window;
  }

  /**
   * Clear specific cache when data becomes stale
   */
  static async clearAPICache(urlPattern?: string): Promise<CacheOperationResult> {
    if (!this.isCacheSupported()) {
      return { success: false, error: 'Cache API not supported' };
    }

    try {
      const cache = await caches.open(this.CACHE_NAMES.API);
      
      if (urlPattern) {
        // Clear specific URL pattern
        const requests = await cache.keys();
        const matchingRequests = requests.filter(request => 
          request.url.includes(urlPattern)
        );
        
        const deleteResults = await Promise.allSettled(
          matchingRequests.map(request => cache.delete(request))
        );
        
        const failures = deleteResults.filter(result => result.status === 'rejected');
        if (failures.length > 0) {
          console.warn(`Failed to delete ${failures.length} cache entries`);
        }
        
        return { 
          success: true, 
          data: { deleted: matchingRequests.length - failures.length, failed: failures.length } 
        };
      } else {
        // Clear all requests from API cache
        const requests = await cache.keys();
        const deleteResults = await Promise.allSettled(
          requests.map(request => cache.delete(request))
        );
        
        const failures = deleteResults.filter(result => result.status === 'rejected');
        if (failures.length > 0) {
          console.warn(`Failed to delete ${failures.length} cache entries`);
        }
        
        return { 
          success: true, 
          data: { deleted: requests.length - failures.length, failed: failures.length } 
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown cache error';
      console.error('Error clearing cache:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Force refresh specific data and update cache
   */
  static async refreshAndCache(url: string, options?: RequestInit): Promise<Response> {
    if (!this.isCacheSupported()) {
      // Fallback to regular fetch if cache not supported
      return fetch(url, options);
    }

    try {
      // Force network request (bypass cache)
      const response = await fetch(url, {
        ...options,
        cache: 'no-cache'
      });

      if (response.ok) {
        try {
          // Update cache with fresh data
          const cache = await caches.open(this.CACHE_NAMES.API);
          await cache.put(url, response.clone());
        } catch (cacheError) {
          // Log cache error but don't fail the request
          console.warn('Failed to update cache:', cacheError);
        }
      }

      return response;
    } catch (error) {
      console.error('Error refreshing cache:', error);
      
      // Try to serve from cache as fallback
      if (this.isCacheSupported()) {
        try {
          const cache = await caches.open(this.CACHE_NAMES.API);
          const cachedResponse = await cache.match(url);
          if (cachedResponse) {
            return cachedResponse;
          }
        } catch (cacheError) {
          console.warn('Failed to retrieve fallback from cache:', cacheError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Check if user is offline
   */
  static isOffline(): boolean {
    return typeof navigator !== 'undefined' && !navigator.onLine;
  }

  /**
   * Get cache size information
   */
  static async getCacheInfo(): Promise<CacheOperationResult> {
    if (!this.isCacheSupported()) {
      return { success: false, error: 'Cache API not supported' };
    }

    try {
      const cacheNames = await caches.keys();
      const cacheInfo = await Promise.allSettled(
        cacheNames.map(async name => {
          try {
            const cache = await caches.open(name);
            const requests = await cache.keys();
            return {
              name,
              entries: requests.length
            };
          } catch (error) {
            console.warn(`Failed to get info for cache ${name}:`, error);
            return {
              name,
              entries: 0,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );

      const results = cacheInfo.map(result => 
        result.status === 'fulfilled' ? result.value : null
      ).filter(Boolean);

      return { success: true, data: results };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error getting cache info:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Clear all caches (for debugging or user request)
   */
  static async clearAllCaches(): Promise<CacheOperationResult> {
    if (!this.isCacheSupported()) {
      return { success: false, error: 'Cache API not supported' };
    }

    try {
      const cacheNames = await caches.keys();
      const deleteResults = await Promise.allSettled(
        cacheNames.map(name => caches.delete(name))
      );
      
      const failures = deleteResults.filter(result => result.status === 'rejected');
      const successes = deleteResults.length - failures.length;
      
      if (failures.length > 0) {
        console.warn(`Failed to delete ${failures.length} caches`);
        return { 
          success: false, 
          error: `Partially failed: deleted ${successes}/${deleteResults.length} caches`,
          data: { deleted: successes, failed: failures.length }
        };
      }
      
      return { success: true, data: { deleted: successes, failed: 0 } };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error clearing all caches:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Preload critical resources into cache
   */
  static async preloadCriticalResources(urls: string[]): Promise<CacheOperationResult> {
    if (!this.isCacheSupported()) {
      return { success: false, error: 'Cache API not supported' };
    }

    try {
      const cache = await caches.open(this.CACHE_NAMES.STATIC);
      const preloadResults = await Promise.allSettled(
        urls.map(async url => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
              return { url, success: true };
            }
            return { url, success: false, error: `HTTP ${response.status}` };
          } catch (error) {
            return { 
              url, 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            };
          }
        })
      );

      const results = preloadResults.map(result => 
        result.status === 'fulfilled' ? result.value : null
      ).filter((r): r is NonNullable<typeof r> => r !== null);

      const failures = results.filter(r => !r.success);
      const successes = results.filter(r => r.success);

      return {
        success: failures.length === 0,
        data: { 
          preloaded: successes.length, 
          failed: failures.length,
          details: results 
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error preloading resources:', error);
      return { success: false, error: errorMessage };
    }
  }
} 