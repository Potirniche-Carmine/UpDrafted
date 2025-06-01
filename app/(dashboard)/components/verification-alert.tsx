"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

interface VerificationAlertProps {
  isVerified: boolean;
  effectiveRole: string;
  onGetVerified: () => void;
  onViewProfile: () => void;
  profileNavigating: boolean;
}

export function VerificationAlert({
  isVerified,
  effectiveRole,
  onGetVerified,
  onViewProfile,
  profileNavigating
}: VerificationAlertProps) {
  if (isVerified) return null;

  const getVerificationMessage = (role: string) => {
    switch (role) {
      case 'athlete':
        return {
          message: 'Get verified to build trust with coaches and recruiters! Choose from instant MaxPreps verification or manual verification for club/intramural sports.',
          buttons: [
            {
              text: 'Add MaxPreps Profile',
              action: onViewProfile,
              loading: profileNavigating,
              variant: 'primary' as const
            },
            {
              text: 'Manual Verification',
              action: onGetVerified,
              loading: false,
              variant: 'secondary' as const
            }
          ]
        };
      case 'coach':
        return {
          message: 'Get verified to build trust with athletes and recruiters and unlock premium features.',
          buttons: [
            {
              text: 'Get Verified',
              action: onGetVerified,
              loading: false,
              variant: 'primary' as const
            }
          ]
        };
      case 'recruiter':
        return {
          message: 'Get verified to build trust with coaches and athletes and unlock premium features.',
          buttons: [
            {
              text: 'Get Verified',
              action: onGetVerified,
              loading: false,
              variant: 'primary' as const
            }
          ]
        };
      default:
        return {
          message: 'Get verified to build trust with other users and unlock premium features.',
          buttons: [
            {
              text: 'Get Verified',
              action: onGetVerified,
              loading: false,
              variant: 'primary' as const
            }
          ]
        };
    }
  };

  const verificationInfo = getVerificationMessage(effectiveRole || 'athlete');

  return (
    <Alert className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
      <ShieldX className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-700 dark:text-orange-200">
        <div className="flex flex-col gap-3">
          <span>{verificationInfo.message}</span>
          <div className="flex flex-col sm:flex-row gap-2">
            {verificationInfo.buttons.map((button, index) => (
              <Button 
                key={index}
                variant={button.variant === 'primary' ? "default" : "outline"}
                size="sm" 
                className={button.variant === 'primary' 
                  ? "bg-orange-600 hover:bg-orange-700 text-white" 
                  : "border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-200 dark:hover:bg-orange-900"
                }
                onClick={button.action}
                disabled={button.loading}
              >
                {button.loading ? 'Loading...' : button.text}
              </Button>
            ))}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
} 