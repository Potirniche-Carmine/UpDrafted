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
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      
      return (now - dismissTime) < sevenDaysInMs;
    };
    
    const initializePrompt = async () => {
      const standalone = checkStandalone();
      const mobile = checkMobile();
      const dismissed = checkDismissed();
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

  const getInstallInstructions = () => {
    switch (browserType) {
      case 'chrome':
      case 'edge':
        return {
          title: 'Install UpDrafted App',
          instructions: [
            'Tap the menu (⋮) in your browser',
            'Select "Add to Home screen" or "Install app"',
            'Tap "Add" or "Install" to confirm'
          ]
        };
      case 'safari':
        return {
          title: 'Add UpDrafted to Home Screen',
          instructions: [
            'Tap the Share button (□↗) at the bottom',
            'Scroll and tap "Add to Home Screen"',
            'Tap "Add" to confirm'
          ]
        };
      case 'firefox':
        return {
          title: 'Install UpDrafted',
          instructions: [
            'Tap the menu (☰) in your browser',
            'Look for "Install" or "Add to Home screen"',
            'Follow the prompts to install'
          ]
        };
      default:
        return {
          title: 'Install UpDrafted',
          instructions: [
            'Look for an "Install" or "Add to Home screen" option in your browser menu',
            'This may be in the address bar or main menu',
            'Follow your browser\'s prompts to install'
          ]
        };
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          localStorage.setItem('pwa-install-dismissed', 'true');
        } else {
          localStorage.setItem('pwa-install-dismissed', Date.now().toString());
        }
        
        setDeferredPrompt(null);
        setShowPrompt(false);
      } catch (error) {
        console.error('Error during install prompt:', error);
        // Fallback to manual instructions
        showManualInstructions();
      }
    } else {
      // Show manual instructions when no deferred prompt is available
      showManualInstructions();
    }
  };

  const showManualInstructions = () => {
    const { title, instructions } = getInstallInstructions();
    const instructionText = instructions.map((step, index) => `${index + 1}. ${step}`).join('\n');
    
    alert(`${title}\n\n${instructionText}\n\nAfter installation, you'll get:\n• Push notifications\n• Offline access\n• Faster loading\n• Native app experience`);
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