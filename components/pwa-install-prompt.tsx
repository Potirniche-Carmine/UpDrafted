"use client";

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { useUser } from '@/hooks/use-auth';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const VISITS_KEY = 'pwa-dashboard-visits';
const TEMP_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

const isMobileDevice = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
  window.innerWidth <= 768;

const isStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.matchMedia('(display-mode: fullscreen)').matches ||
  window.matchMedia('(display-mode: minimal-ui)').matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIOSSafari = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);

  return isIOS && isSafari;
};

const wasDismissedRecently = () => {
  const dismissedValue = localStorage.getItem(DISMISS_KEY);

  if (!dismissedValue || dismissedValue === 'false') {
    return false;
  }

  if (dismissedValue === 'true') {
    return true;
  }

  const dismissTime = Number.parseInt(dismissedValue, 10);

  if (Number.isNaN(dismissTime)) {
    return false;
  }

  return Date.now() - dismissTime < TEMP_DISMISS_MS;
};

const hasEnoughVisits = () => {
  const visitCount = Number.parseInt(localStorage.getItem(VISITS_KEY) ?? '0', 10) || 0;
  localStorage.setItem(VISITS_KEY, String(visitCount + 1));

  return visitCount >= 1;
};

type PromptVariant = 'native' | 'ios-manual';

export function PWAInstallPrompt() {
  const { isSignedIn } = useUser();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [eligibleToShow, setEligibleToShow] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    const standalone = isStandaloneMode();
    const mobile = isMobileDevice();
    const dismissed = wasDismissedRecently();
    const enoughVisits = hasEnoughVisits();

    setIsStandalone(standalone);
    setIsMobile(mobile);
    setShowIOSInstructions(isIOSSafari());
    setEligibleToShow(
      isSignedIn &&
      mobile &&
      !standalone &&
      !dismissed &&
      enoughVisits &&
      window.location.pathname === '/dashboard'
    );
  }, [isSignedIn]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setEligibleToShow(false);
      localStorage.setItem(DISMISS_KEY, 'true');
    };

    const handleDisplayModeChange = () => {
      const standalone = isStandaloneMode();
      setIsStandalone(standalone);

      if (standalone) {
        setEligibleToShow(false);
        localStorage.setItem(DISMISS_KEY, 'true');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const promptVariant = useMemo<PromptVariant | null>(() => {
    if (!eligibleToShow || !isMobile || isStandalone || !isSignedIn) {
      return null;
    }

    if (deferredPrompt) {
      return 'native';
    }

    if (showIOSInstructions) {
      return 'ios-manual';
    }

    return null;
  }, [deferredPrompt, eligibleToShow, isMobile, isSignedIn, isStandalone, showIOSInstructions]);

  const dismissPrompt = (permanent = false) => {
    setEligibleToShow(false);
    localStorage.setItem(DISMISS_KEY, permanent ? 'true' : Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      dismissPrompt(outcome === 'accepted');
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during install prompt:', error);
      dismissPrompt();
    }
  };

  if (!promptVariant) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-60 md:hidden">
      <Card className="border-border/60 bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-[#01ae79]/10 p-2 text-[#01ae79]">
              {promptVariant === 'native' ? (
                <Download className="h-4 w-4" />
              ) : (
                <Share className="h-4 w-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground">
                {promptVariant === 'native' ? 'Install UpDrafted' : 'Add UpDrafted to Home Screen'}
              </h3>

              {promptVariant === 'native' ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Install with your browser&apos;s native prompt for quicker access.
                </p>
              ) : (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  On iPhone, Safari has to handle this manually. Tap <span className="font-medium text-foreground">Share</span>, then <span className="font-medium text-foreground">Add to Home Screen</span>.
                </p>
              )}
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => dismissPrompt()}
              className="h-8 w-8 shrink-0 text-muted-foreground"
              aria-label="Dismiss install prompt"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {promptVariant === 'native' ? (
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="bg-[#01ae79] text-white hover:bg-[#019a6b]"
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Install
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}