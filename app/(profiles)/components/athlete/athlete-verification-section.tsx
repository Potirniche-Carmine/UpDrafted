"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Shield, ExternalLink, Clock, GraduationCap, X } from "lucide-react";
import { AthleteProfileData } from "./athlete-profile-types";

interface VerificationSectionProps {
  profileData: AthleteProfileData; // Original database data for verification logic
  displayData?: AthleteProfileData; // Current data including unsaved changes for display
  isOwnProfile: boolean;
  onEditHudl?: () => void;
  onShowVerificationDialog: () => void;
  hasPendingVerification?: boolean;
  pendingSubmittedAt?: string;
  hasRejectedVerification?: boolean;
  rejectionReason?: string;
  rejectedAt?: string;
  // Transfer Portal Verification Status
  hasPendingTransferPortalVerification?: boolean;
  transferPortalPendingSubmittedAt?: string;
  hasRejectedTransferPortalVerification?: boolean;
  transferPortalRejectionReason?: string;
  transferPortalRejectedAt?: string;
}

export function VerificationSection({
  profileData,
  displayData,
  isOwnProfile,
  onEditHudl,
  onShowVerificationDialog,
  hasPendingVerification = false,
  pendingSubmittedAt,
  hasRejectedVerification = false,
  rejectionReason,
  rejectedAt,
  hasPendingTransferPortalVerification = false,
  transferPortalPendingSubmittedAt,
  hasRejectedTransferPortalVerification = false,
  transferPortalRejectionReason,
  transferPortalRejectedAt
}: VerificationSectionProps) {

  // Use displayData for UI display, profileData for verification logic
  const currentData = displayData || profileData;

  // Check if transfer portal verification is required for this athlete
  // Use ORIGINAL database data (profileData) to determine verification requirements
  // This prevents showing verification requirements for unsaved changes
  const requiresTransferPortalVerification = 
    (profileData.educationLevel === 'undergraduate' || profileData.educationLevel === 'graduate') &&
    profileData.division &&
    ['division_1', 'division_2', 'division_3'].includes(profileData.division);

  // Check if this is a high school athlete (only they should see Hudl)
  const isHighSchoolAthlete = currentData.educationLevel === 'high_school';

  // Get the verification status for display
  const getVerificationStatus = () => {
    if (requiresTransferPortalVerification) {
      // For university students, combine verification statuses
      // isTransferPortalVerified means they went through the verification process (regardless of portal status)
      const isTransferPortalVerified = !!currentData.transferPortalVerifiedAt;
      const isFullyVerified = currentData.isVerified && isTransferPortalVerified;
      const hasTransferPortalStatus = currentData.isOnTransferPortal !== undefined;
      
      return {
        type: 'university',
        isVerified: isFullyVerified,
        isTransferPortalVerified: isTransferPortalVerified,
        isOnTransferPortal: currentData.isOnTransferPortal || false,
        hasTransferPortalStatus,
        needsVerification: !isFullyVerified || hasPendingVerification || hasPendingTransferPortalVerification
      };
    } else {
      // For high school athletes
      return {
        type: 'high_school',
        isVerified: currentData.isVerified || false,
        hasHudl: !!currentData.hudlUrl,
        needsVerification: !currentData.isVerified || hasPendingVerification
      };
    }
  };

  const status = getVerificationStatus();

  // Transfer Portal Verification Logic (following coach/recruiter pattern)
  const shouldShowTransferPortalManual = requiresTransferPortalVerification && !status.isTransferPortalVerified && !hasPendingTransferPortalVerification && !hasRejectedTransferPortalVerification;
  const shouldShowTransferPortalPending = hasPendingTransferPortalVerification;
  const shouldShowTransferPortalRejected = hasRejectedTransferPortalVerification;
  const shouldShowTransferPortalVerified = requiresTransferPortalVerification && status.isTransferPortalVerified;

  // General Verification Logic (following coach/recruiter pattern)  
  const shouldShowGeneralManual = !requiresTransferPortalVerification && !currentData.isVerified && !hasPendingVerification && !hasRejectedVerification && !(isHighSchoolAthlete && currentData.hudlUrl);
  const shouldShowGeneralPending = hasPendingVerification;
  const shouldShowGeneralRejected = hasRejectedVerification;

  // Determine if we should show the verification section (not including Hudl display)
  const shouldShowVerificationSection = shouldShowTransferPortalManual || shouldShowTransferPortalPending || shouldShowTransferPortalRejected || shouldShowTransferPortalVerified || shouldShowGeneralManual || shouldShowGeneralPending || shouldShowGeneralRejected;

  // If no verification sections needed, don't render
  if (!shouldShowVerificationSection) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Verification Status</CardTitle>
              <p className="text-sm text-muted-foreground">Athletic credentials and portal status</p>
            </div>
          </div>
        </div>
        
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* University Transfer Portal Section - Only show when verified */}
        {shouldShowTransferPortalVerified && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 rounded-xl p-6 border transition-all">
            <div className="text-center space-y-4">
              <div className="bg-emerald-100 dark:bg-emerald-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <GraduationCap className="w-8 h-8 text-emerald-600" />
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 text-emerald-900 dark:text-emerald-100">
                  Transfer Portal Status Confirmed
                </h3>
                
                <p className="text-sm mb-4 text-emerald-700 dark:text-emerald-200">
                  Your NCAA Transfer Portal status has been confirmed. {
                    status.isOnTransferPortal 
                      ? 'You are currently in the transfer portal and can connect with coaches.' 
                      : 'You are not currently in the transfer portal.'
                  }
                </p>

                {currentData.transferPortalVerifiedAt && (
                  <div className="inline-block px-3 py-2 rounded-lg text-xs font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200">
                    Verified: {new Date(currentData.transferPortalVerifiedAt!).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pending Transfer Portal Verification Section */}
        {shouldShowTransferPortalPending && (
          <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3 sm:p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-base sm:text-lg text-yellow-900 dark:text-yellow-100">Transfer Portal Verification Pending</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-200 px-2 sm:px-4">
                  Your transfer portal verification request is being reviewed by our team. This usually takes 48-72 hours.
                </p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/50 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700 space-y-1">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>Submitted:</strong> {transferPortalPendingSubmittedAt ? new Date(transferPortalPendingSubmittedAt).toLocaleDateString() : 'Recently'}
                </p>
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  You&apos;ll see a verified badge on your profile once approved.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rejected Transfer Portal Verification Section */}
        {shouldShowTransferPortalRejected && (
          <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 sm:p-4 border border-red-200 dark:border-red-800">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto">
                <X className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-base sm:text-lg text-red-900 dark:text-red-100">Transfer Portal Verification Not Approved</h3>
                <p className="text-sm text-red-700 dark:text-red-200 px-2 sm:px-4">
                  Your transfer portal verification request was not approved. Please review the feedback below and resubmit with the required information.
                </p>
              </div>
              
              {/* Rejection Details */}
              <div className="bg-red-100 dark:bg-red-900/50 rounded-lg p-3 border border-red-200 dark:border-red-700 text-left space-y-2">
                {transferPortalRejectedAt && (
                  <p className="text-xs text-red-800 dark:text-red-200">
                    <strong>Reviewed:</strong> {new Date(transferPortalRejectedAt).toLocaleDateString()}
                  </p>
                )}
                {transferPortalRejectionReason && (
                  <div>
                    <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">Reason for Rejection:</p>
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 p-2 sm:p-3 rounded border leading-relaxed">
                      {transferPortalRejectionReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {isOwnProfile && (
                <div className="pt-2">
                  <Button 
                    onClick={onShowVerificationDialog}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base py-2.5 sm:py-2 px-4 sm:px-6"
                  >
                    <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                    Reapply for Verification
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transfer Portal Verification Required Section - Only show if no pending/rejected and not verified */}
        {shouldShowTransferPortalManual && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 sm:p-4">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-base sm:text-lg text-blue-900 dark:text-blue-100">Transfer Portal Verification Required</h3>
                <p className="text-sm text-blue-700 dark:text-blue-200 px-2 sm:px-4">
                  As a {currentData.division === 'division_1' ? 'D1' : currentData.division === 'division_2' ? 'D2' : 'D3'} athlete, 
                  you must verify your NCAA Transfer Portal status before coaches and recruiters can connect with you.
                </p>
              </div>
              {isOwnProfile && (
                <div className="pt-2">
                  <Button 
                    onClick={onShowVerificationDialog}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base py-2.5 sm:py-2 px-4 sm:px-6"
                  >
                    <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                    Verify Portal Status
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Verification Section */}
        {shouldShowGeneralManual && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                  {isHighSchoolAthlete ? "Club & College Athletes" : "Athlete Verification"}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 px-2 sm:px-4">
                  {isHighSchoolAthlete 
                    ? "Playing club sports, intramurals, or college teams? Get verified with team rosters, photos, or other documentation."
                    : "Get verified as a legitimate athlete with team rosters, photos, or other documentation."
                  }
                </p>
              </div>
              {isOwnProfile && (
                <div className="pt-2">
                  <Button 
                    onClick={onShowVerificationDialog}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base py-2.5 sm:py-2 px-4 sm:px-6"
                  >
                    <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                    Apply for Verification
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* High School Hudl Prompt */}
        {isHighSchoolAthlete && !currentData.hudlUrl && shouldShowGeneralManual && (
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto">
                <ExternalLink className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-100">High School Athletes</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 px-2 sm:px-4">
                  Hudl is the premier platform for showcasing game film and highlight reels. 
                  Link your Hudl profile to display your athletic performance videos.
                </p>
              </div>
              {isOwnProfile && onEditHudl && (
                <div className="pt-2">
                  <Button 
                    variant="outline"
                    className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 text-sm sm:text-base py-2.5 sm:py-2 px-4 sm:px-6"
                    onClick={onEditHudl}
                  >
                    <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                    Add Hudl URL
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pending Verification Section */}
        {shouldShowGeneralPending && (
          <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-xl p-4 sm:p-6 border border-yellow-200 dark:border-yellow-800">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-base sm:text-lg text-yellow-900 dark:text-yellow-100">General Verification Pending</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-200 px-2 sm:px-4">
                  Your general verification request is being reviewed by our team. This usually takes 1-3 business days.
                </p>
                <div className="inline-block px-3 py-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg text-xs font-medium text-yellow-800 dark:text-yellow-200">
                  Submitted: {pendingSubmittedAt ? new Date(pendingSubmittedAt).toLocaleDateString() : 'Recently'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejected General Verification Section */}
        {shouldShowGeneralRejected && (
          <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 sm:p-6 border border-red-200 dark:border-red-800">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto">
                <X className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-base sm:text-lg text-red-900 dark:text-red-100">General Verification Rejected</h3>
                <p className="text-sm text-red-700 dark:text-red-200 px-2 sm:px-4">
                  Your general verification request was rejected. Please review the feedback and submit a new request with the required documentation.
                </p>
                {rejectionReason && (
                  <div className="bg-red-100 dark:bg-red-900/50 rounded-lg p-3 text-left">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">Rejection Reason:</p>
                    <p className="text-xs sm:text-sm text-red-800 dark:text-red-200 leading-relaxed">{rejectionReason}</p>
                  </div>
                )}
                <div className="space-y-3">
                  <div className="inline-block px-3 py-2 bg-red-100 dark:bg-red-900/50 rounded-lg text-xs font-medium text-red-800 dark:text-red-200">
                    Rejected: {rejectedAt ? new Date(rejectedAt).toLocaleDateString() : 'Recently'}
                  </div>
                  {isOwnProfile && (
                    <div>
                      <Button 
                        onClick={onShowVerificationDialog}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base py-2.5 sm:py-2 px-4 sm:px-6"
                      >
                        <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                        Reapply for Verification
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section - Only show if manual verification is shown */}
        {shouldShowGeneralManual && (
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2 text-sm">
              Which verification is right for me?
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              {isHighSchoolAthlete && (
                <li>• <strong>Hudl:</strong> High school athletes with game film and highlight videos</li>
              )}
              <li>• <strong>Manual:</strong> {isHighSchoolAthlete 
                ? "Club sports, intramurals, college teams, or athletes without Hudl"
                : "Club sports, intramurals, or general athletic participation verification"
              }</li>
              {requiresTransferPortalVerification && (
                <li>• <strong>Transfer Portal:</strong> Required for undergraduate/graduate athletes to connect with coaches</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 