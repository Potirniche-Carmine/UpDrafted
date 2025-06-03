"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Clock, AlertTriangle, Mail } from "lucide-react";
import { RecruiterProfileData } from "./recruiter-profile-types";

interface RecruiterVerificationSectionProps {
  profileData: RecruiterProfileData;
  isOwnProfile: boolean;
  onShowVerificationDialog: () => void;
  hasPendingVerification?: boolean;
  pendingSubmittedAt?: string;
  hasRejectedVerification?: boolean;
  rejectionReason?: string;
  rejectedAt?: string;
}

export function RecruiterVerificationSection({
  profileData,
  isOwnProfile,
  onShowVerificationDialog,
  hasPendingVerification = false,
  pendingSubmittedAt,
  hasRejectedVerification = false,
  rejectionReason,
  rejectedAt
}: RecruiterVerificationSectionProps) {

  // If user is verified, don't show the verification section at all
  if (profileData.isVerified) {
    return null;
  }

  // Check if user should see manual verification option
  // Hide it if they are already verified or have a pending request
  const shouldShowManualVerification = !profileData.isVerified && !hasPendingVerification && !hasRejectedVerification;

  // Show pending verification status
  const shouldShowPendingVerification = hasPendingVerification;

  // Show rejection status
  const shouldShowRejectedVerification = hasRejectedVerification;

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
          {/* Manual Verification Section - Only show if not already verified, pending, or rejected */}
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

          {/* Rejected Verification Section */}
          {shouldShowRejectedVerification && (
            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-medium text-red-900 dark:text-red-100 mb-2">Verification Not Approved</h3>
                <p className="text-sm text-red-700 dark:text-red-200 mb-3">
                  Your verification request was not approved. Please review the feedback below and resubmit with the required information.
                </p>
                
                {/* Rejection Details */}
                <div className="bg-red-100 dark:bg-red-900/50 rounded-lg p-3 border border-red-200 dark:border-red-700 mb-4 text-left">
                  {rejectedAt && (
                    <p className="text-xs text-red-800 dark:text-red-200 mb-2">
                      <strong>Reviewed:</strong> {new Date(rejectedAt).toLocaleDateString()}
                    </p>
                  )}
                  {rejectionReason && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">Reason for Rejection:</p>
                      <p className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 p-2 rounded border">
                        {rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {isOwnProfile && (
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button 
                      onClick={onShowVerificationDialog}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Reapply for Verification
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.open('mailto:support@updrafted.com?subject=Verification%20Question', '_blank')}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                )}
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