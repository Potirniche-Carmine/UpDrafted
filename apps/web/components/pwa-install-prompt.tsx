"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';
import { useUser } from '@/hooks/use-auth';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Detect browser type for tailored instructions
const getBrowserType = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) return 'chrome';
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
  if (userAgent.includes('firefox')) return 'firefox';
  if (userAgent.includes('edg')) return 'edge';
  return 'unknown';
};

// Check if app is installable (meets PWA criteria)
const checkInstallability = async (): Promise<boolean> => {
  try {
    // Check if we're in a secure context
    if (!window.isSecureContext) return false;

    // Check if service worker is available
    if (!('serviceWorker' in navigator)) return false;

    // Check if we have a manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) return false;

    // Try to fetch the manifest to ensure it's valid
    const manifestHref = (manifestLink as HTMLLinkElement).href;
    const response = await fetch(manifestHref);
    const manifest = await response.json();

    // Basic manifest validation
    return !!(manifest.name && manifest.icons && manifest.start_url);
  } catch (error) {
    console.warn('PWA installability check failed:', error);
    return false;
  }
};

export function PWAInstallPrompt() {
  const { isSignedIn } = useUser();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [browserType, setBrowserType] = useState<string>('unknown');

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const checkStandalone = () => {
      return window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    };

    // Check if device is mobile
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;
    };

    // Check if user has previously dismissed the prompt
    const checkDismissed = () => {
      const dismissedValue = localStorage.getItem('pwa-install-dismissed');
      if (!dismissedValue || dismissedValue === 'false') return false;

      if (dismissedValue === 'true') return true;

      const dismissTime = parseInt(dismissedValue);
      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000; // 3 days
      const now = Date.now();

      return (now - dismissTime) < threeDaysInMs;
    };

    // Track dashboard visits to avoid showing on first visit
    const checkShouldShowBasedOnVisits = () => {
      const visitCountStr = localStorage.getItem('pwa-dashboard-visits');
      const visitCount = visitCountStr ? parseInt(visitCountStr) : 0;

      // Increment visit count
      localStorage.setItem('pwa-dashboard-visits', String(visitCount + 1));

      // Show after 2nd visit (user has used the app at least once before)
      return visitCount >= 1;
    };

    const initializePrompt = async () => {
      const standalone = checkStandalone();
      const mobile = checkMobile();
      const dismissed = checkDismissed();
      const hasEnoughVisits = checkShouldShowBasedOnVisits();
      const installable = await checkInstallability();
      const browser = getBrowserType();

      setIsStandalone(standalone);
      setIsMobile(mobile);
      setIsInstallable(installable);
      setBrowserType(browser);

      // Enhanced conditions for showing prompt
      const shouldShow = isSignedIn &&
        mobile &&
        !standalone &&
        !dismissed &&
        hasEnoughVisits &&
        installable &&
        window.location.pathname === '/dashboard';

      // Show prompt if we have conditions met AND either have deferred prompt OR are on supported browser
      if (shouldShow && (deferredPrompt || ['chrome', 'edge', 'safari'].includes(browser))) {
        setShowPrompt(true);
      } else {
        setShowPrompt(false);
      }
    };

    initializePrompt();
  }, [isSignedIn, deferredPrompt, isMobile, isStandalone, isInstallable, browserType]);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Store the event globally for debugging
      (window as Window & { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt = promptEvent;
    };

    // Listen for app installation
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem('pwa-install-dismissed', 'true');
    };

    // Listen for when the app is launched from home screen
    const handleDisplayModeChange = () => {
      const isStandaloneNow = window.matchMedia('(display-mode: standalone)').matches;
      if (isStandaloneNow && showPrompt) {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', handleDisplayModeChange);
    };
  }, [showPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        // Trigger the native browser install prompt
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          // User installed the app
          localStorage.setItem('pwa-install-dismissed', 'true');
          setShowPrompt(false);
        } else {
          // User dismissed the install dialog
          localStorage.setItem('pwa-install-dismissed', Date.now().toString());
          setShowPrompt(false);
        }

        setDeferredPrompt(null);
      } catch (error) {
        console.error('Error during install prompt:', error);
        // Still hide the prompt if there's an error
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      }
    } else {
      // For browsers like Safari that don't support beforeinstallprompt
      // Try to trigger the native share sheet if possible
      if (browserType === 'safari') {
        // On iOS Safari, we can't programmatically trigger the install
        // But we can at least dismiss the prompt and let the user know
        // they can use the Share button
        const shouldShowTip = confirm(
          'To add UpDrafted to your home screen:\n\n' +
          '1. Tap the Share button (□↗) at the bottom\n' +
          '2. Scroll down and tap "Add to Home Screen"\n' +
          '3. Tap "Add" to confirm\n\n' +
          'Would you like to see this tip again later?'
        );

        if (!shouldShowTip) {
          localStorage.setItem('pwa-install-dismissed', 'true');
        } else {
          localStorage.setItem('pwa-install-dismissed', Date.now().toString());
        }
        setShowPrompt(false);
      } else {
        // For other browsers, just dismiss
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    const dismissTime = Date.now();
    localStorage.setItem('pwa-install-dismissed', dismissTime.toString());
  };

  // Debug information (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Debug logging removed for production
    }
  }, [isSignedIn, isMobile, isStandalone, isInstallable, browserType, deferredPrompt, showPrompt]);

  // Don't render if conditions aren't met
  if (!showPrompt || !isMobile || isStandalone || !isSignedIn || !isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-60 md:hidden">
      <Card className="bg-linear-to-r from-green-500 to-green-600 text-white shadow-lg border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="bg-white/20 p-2 rounded-full">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Add UpDrafted to Home Screen</h3>
                <p className="text-xs text-green-100 mt-1">
                  Get push notifications, offline access, and faster loading!
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleInstallClick}
                className="bg-white text-green-600 hover:bg-green-50 px-3 py-1 h-8 text-xs font-medium"
              >
                <Download className="h-3 w-3 mr-1" />
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-white hover:bg-white/20 p-1 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 