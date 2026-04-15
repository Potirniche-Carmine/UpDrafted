// Global navigation state - simple and reliable
class NavigationStateManager {
  private static instance: NavigationStateManager;
  private navigationSource: 'direct' | 'internal' | 'refresh' = 'direct';
  private lastSetTime: number = 0;
  
  static getInstance(): NavigationStateManager {
    if (!NavigationStateManager.instance) {
      NavigationStateManager.instance = new NavigationStateManager();
    }
    return NavigationStateManager.instance;
  }
  
  setNavigationSource(source: 'direct' | 'internal' | 'refresh') {
    this.navigationSource = source;
    this.lastSetTime = Date.now();
  }
  
  getNavigationSource(): 'direct' | 'internal' | 'refresh' {
    const source = this.navigationSource;
    const timeSinceSet = Date.now() - this.lastSetTime;
    
    // Only reset to 'direct' after a reasonable delay to allow for React lifecycle
    // and only if it's not a refresh
    if (source !== 'refresh' && timeSinceSet > 2000) { // 2 seconds
      this.navigationSource = 'direct';
      return source; // Return the original source for this read
    }
    
    return source;
  }
  
  // Force reset (for cleanup)
  reset() {
    this.navigationSource = 'direct';
    this.lastSetTime = 0;
  }
}

// Export the singleton instance for use in navigation hook
export const navigationStateManager = NavigationStateManager.getInstance();

// Detect if this is a page refresh at module load time
// But don't override if we recently set it to 'internal'
if (typeof window !== 'undefined') {
  // Small delay to allow any internal navigation to be set first
  setTimeout(() => {
    const navigationType = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationType && navigationType.type === 'reload') {
      navigationStateManager.setNavigationSource('refresh');
    }
  }, 100);
} 