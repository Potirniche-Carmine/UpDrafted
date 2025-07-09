"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const { isSignedIn } = useUser();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

    // Check if user has previously dismissed the prompt (and if it's been long enough)
    const checkDismissed = () => {
      const dismissedValue = localStorage.getItem('pwa-install-dismissed');
      if (!dismissedValue || dismissedValue === 'false') return false;
      
      // If it's just 'true' (old format), consider it permanently dismissed
      if (dismissedValue === 'true') return true;
      
      // If it's a timestamp, check if 7 days have passed
      const dismissTime = parseInt(dismissedValue);
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      
      return (now - dismissTime) < sevenDaysInMs;
    };
    
    const isDismissed = checkDismissed();

    setIsStandalone(checkStandalone());
    setIsMobile(checkMobile());

    // Only show prompt if: signed in, mobile, not standalone, not dismissed, and on dashboard
    const shouldShow = isSignedIn && 
                      checkMobile() && 
                      !checkStandalone() && 
                      !isDismissed &&
                      window.location.pathname === '/dashboard';



    // Show prompt when all conditions are met AND we have the deferred prompt
    // OR in development, show if all other conditions are met (for testing)
    if (shouldShow && (deferredPrompt || process.env.NODE_ENV === 'development')) {
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [isSignedIn, deferredPrompt]); // This will re-run when deferredPrompt changes

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installation
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem('pwa-install-dismissed', 'true'); // Permanent dismissal on successful install
    };

    // Check if event was already fired
    const windowWithPrompt = window as unknown as { deferredPrompt?: BeforeInstallPromptEvent };
    if (windowWithPrompt.deferredPrompt) {
      setDeferredPrompt(windowWithPrompt.deferredPrompt);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback for when there's no deferred prompt (development/unsupported browsers)
      alert('To install UpDrafted:\n\n• Chrome/Edge: Click the install icon in the address bar\n• Safari: Tap Share → Add to Home Screen\n• Firefox: Look for "Install" in the menu');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        localStorage.setItem('pwa-install-dismissed', 'true');
      } else {
        localStorage.setItem('pwa-install-dismissed', 'true');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during install prompt:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Set dismiss timestamp - will show again after 7 days
    const dismissTime = Date.now();
    localStorage.setItem('pwa-install-dismissed', dismissTime.toString());
  };



  // Don't render if conditions aren't met
  if (!showPrompt || !isMobile || isStandalone || !isSignedIn) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg border-0">
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