// PWA Cache Management Utilities

export class PWACacheManager {
  static readonly CACHE_NAMES = {
    API: 'updrafted-api-v1',
    STATIC: 'updrafted-static-v1',
    PAGES: 'updrafted-pages-v1'
  };

  /**
   * Clear specific cache when data becomes stale
   */
  static async clearAPICache(urlPattern?: string) {
    if (!('caches' in window)) return;

    try {
      const cache = await caches.open(this.CACHE_NAMES.API);
      
      if (urlPattern) {
        // Clear specific URL pattern
        const requests = await cache.keys();
        const matchingRequests = requests.filter(request => 
          request.url.includes(urlPattern)
        );
        
        await Promise.all(
          matchingRequests.map(request => cache.delete(request))
        );
      } else {
        // Clear all API cache
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter(name => name.includes('api') || name.includes('https-calls'))
            .map(name => caches.delete(name))
        );
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Force refresh specific data and update cache
   */
  static async refreshAndCache(url: string, options?: RequestInit) {
    if (!('caches' in window)) {
      return fetch(url, options);
    }

    try {
      // Force network request (bypass cache)
      const response = await fetch(url, {
        ...options,
        cache: 'no-cache'
      });

      if (response.ok) {
        // Update cache with fresh data
        const cache = await caches.open(this.CACHE_NAMES.API);
        await cache.put(url, response.clone());
      }

      return response;
    } catch (error) {
      console.error('Error refreshing cache:', error);
      throw error;
    }
  }

  /**
   * Check if user is offline
   */
  static isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Get cache size information
   */
  static async getCacheInfo() {
    if (!('caches' in window)) return null;

    try {
      const cacheNames = await caches.keys();
      const cacheInfo = await Promise.all(
        cacheNames.map(async name => {
          const cache = await caches.open(name);
          const requests = await cache.keys();
          return {
            name,
            entries: requests.length
          };
        })
      );

      return cacheInfo;
    } catch (error) {
      console.error('Error getting cache info:', error);
      return null;
    }
  }

  /**
   * Clear all caches (for debugging or user request)
   */
  static async clearAllCaches() {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      console.log('All caches cleared');
    } catch (error) {
      console.error('Error clearing all caches:', error);
    }
  }
} 