"use client";

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi, Clock, RefreshCw } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/use-offline-status';

interface OfflineIndicatorProps {
  showCachedData?: boolean;
  lastUpdated?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function OfflineIndicator({ 
  showCachedData = false, 
  lastUpdated = null, 
  onRetry,
  className = "" 
}: OfflineIndicatorProps) {
  const { isOffline, isOnline } = useOfflineStatus();

  if (!isOffline && !showCachedData) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {isOffline && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <div className="flex items-center justify-between">
                             <span>You&apos;re offline. Showing cached content.</span>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="ml-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                  aria-label="Retry loading"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {showCachedData && isOnline && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Showing cached data</span>
          {lastUpdated && (
            <Badge variant="secondary" className="text-xs">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </Badge>
          )}
        </div>
      )}

      {isOnline && !showCachedData && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <Wifi className="h-3 w-3" />
          <span>Connected</span>
        </div>
      )}
    </div>
  );
} 