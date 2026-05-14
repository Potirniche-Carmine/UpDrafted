"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Shield, ExternalLink, Clock, X, Lock } from "lucide-react";
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
  transferPortalStatus?: {
    isD1D2Athlete: boolean;
    hasApprovedTransferPortalVerification: boolean;
    isCommunicationLocked: boolean;
    currentRequestStatus: 'pending' | 'approved' | 'rejected' | null;
  };
  onShowTransferPortalDialog?: () => void;
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
  transferPortalStatus,
  onShowTransferPortalDialog
}: VerificationSectionProps) {

  // Use displayData for UI display, profileData for verification logic
  const currentData = displayData || profileData;

  // Check if this is a high school athlete (only they should see Hudl)
  const isHighSchoolAthlete = currentData.educationLevel === 'high_school';

  // General Verification Logic (following coach/recruiter pattern)  
  const shouldShowGeneralManual = !currentData.isVerified && !hasPendingVerification && !hasRejectedVerification;
  const shouldShowGeneralPending = hasPendingVerification;
  const shouldShowGeneralRejected = hasRejectedVerification;
  const shouldShowTransferPortal = !!transferPortalStatus?.isD1D2Athlete && !transferPortalStatus.hasApprovedTransferPortalVerification;

  // Determine if we should show the verification section (not including Hudl display)
  const shouldShowVerificationSection = shouldShowGeneralManual || shouldShowGeneralPending || shouldShowGeneralRejected || shouldShowTransferPortal;

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
              <p className="text-sm text-muted-foreground">Athletic credentials</p>
            </div>
          </div>
        </div>
        
      </CardHeader>
      
      <CardContent className="space-y-6">
        {shouldShowTransferPortal && (
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 sm:p-6 border border-amber-200 dark:border-amber-800">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-base sm:text-lg text-amber-900 dark:text-amber-100">
                  Transfer Portal Verification Required
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-200 px-2 sm:px-4">
                  NCAA Division I and II athletes cannot use connections, messages, notifications, or activity until transfer portal verification is approved.
                </p>
                {transferPortalStatus.currentRequestStatus === 'pending' && (
                  <div className="inline-block px-3 py-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-xs font-medium text-amber-800 dark:text-amber-200">
                    Transfer portal request pending review
                  </div>
                )}
                {transferPortalStatus.currentRequestStatus === 'rejected' && (
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Your prior transfer portal request was not approved. Upload a current screenshot or PDF of the confirmation email to reapply.
                  </p>
                )}
              </div>
              {isOwnProfile && transferPortalStatus.currentRequestStatus !== 'pending' && onShowTransferPortalDialog && (
                <div className="pt-2">
                  <Button
                    onClick={onShowTransferPortalDialog}
                    className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white text-sm sm:text-base py-2.5 sm:py-2 px-4 sm:px-6"
                  >
                    <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                    Submit Transfer Portal Verification
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
                  Athlete Verification
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 px-2 sm:px-4">
                  {isHighSchoolAthlete
                    ? 'Submit your Hudl profile, MaxPreps profile, or both for manual review. You can also include supporting documentation if needed.'
                    : 'Submit your roster, team page, club documentation, or other supporting evidence for manual review.'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 px-2 sm:px-4">
                  Reviews usually take 1-2 hours, but can take up to 48 hours.
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
                  Your athlete verification request is being reviewed by our team. It usually takes 1-2 hours, but can take up to 48 hours.
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
              What should I submit?
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              {isHighSchoolAthlete ? (
                <>
                  <li>• <strong>Hudl:</strong> Add your Hudl profile link if you have one.</li>
                  <li>• <strong>MaxPreps:</strong> Add your MaxPreps athlete profile if it exists.</li>
                  <li>• <strong>Manual review:</strong> High school athletes should submit one of those links, plus any extra supporting evidence.</li>
                </>
              ) : (
                <>
                  <li>• <strong>Roster or team page:</strong> Official roster, staff page, or team website.</li>
                  <li>• <strong>Supporting proof:</strong> Club registration, stats sheets, photos, or coach letters.</li>
                  <li>• <strong>Optional links:</strong> Add Hudl or MaxPreps too if you have them, but they are not required.</li>
                </>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
