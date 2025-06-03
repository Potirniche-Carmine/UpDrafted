"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Clock } from "lucide-react";
import { RecruiterProfileData } from "./recruiter-profile-types";

interface RecruiterVerificationSectionProps {
  profileData: RecruiterProfileData;
  isOwnProfile: boolean;
  onShowVerificationDialog: () => void;
  hasPendingVerification?: boolean;
  pendingSubmittedAt?: string;
}

export function RecruiterVerificationSection({
  profileData,
  isOwnProfile,
  onShowVerificationDialog,
  hasPendingVerification = false,
  pendingSubmittedAt
}: RecruiterVerificationSectionProps) {

  // If user is verified, don't show the verification section at all
  if (profileData.isVerified) {
    return null;
  }

  // Check if user should see manual verification option
  // Hide it if they are already verified or have a pending request
  const shouldShowManualVerification = !profileData.isVerified && !hasPendingVerification;

  // Show pending verification status
  const shouldShowPendingVerification = hasPendingVerification;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Recruiter Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Manual Verification Section - Only show if not already verified */}
          {shouldShowManualVerification && (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Verify Your Recruiting Status</h3>
                <p className="text-sm text-blue-700 dark:text-blue-200 mb-4">
                  Get verified to build trust with athletes and families. Upload documentation 
                  such as staff directory listings, team rosters, or recruiting certifications.
                </p>
                {isOwnProfile && (
                  <Button 
                    onClick={onShowVerificationDialog}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Apply for Recruiter Verification
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Pending Verification Section */}
          {shouldShowPendingVerification && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Verification Pending</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-200 mb-3">
                  Your verification request is being reviewed by our team. This usually takes 1-3 business days.
                </p>
                <div className="bg-yellow-100 dark:bg-yellow-900/50 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Submitted:</strong> {pendingSubmittedAt ? new Date(pendingSubmittedAt).toLocaleDateString() : 'Recently'}
                  </p>
                  <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
                    You&apos;ll see a verified badge on your profile once approved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Help Section - Only show if manual verification is shown */}
          {shouldShowManualVerification && (
            <div className="bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">
                Verification Documents You Can Upload:
              </h4>
              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                <li>• <strong>Staff Directory:</strong> Official school/organization staff listing</li>
                <li>• <strong>Team Roster:</strong> Official team roster with your name as recruiter</li>
                <li>• <strong>Recruiting License:</strong> Valid recruiting certification or license</li>
                <li>• <strong>Program Website:</strong> Link to official program page listing you as recruiter</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 