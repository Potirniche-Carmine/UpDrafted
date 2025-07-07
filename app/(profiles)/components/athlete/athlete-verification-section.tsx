"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus, Shield, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";
import { AthleteProfileData } from "./athlete-profile-types";

interface VerificationSectionProps {
  profileData: AthleteProfileData;
  isOwnProfile: boolean;
  onEditMaxPreps?: () => void;
  onShowVerificationDialog: () => void;
  hasPendingVerification?: boolean;
  pendingSubmittedAt?: string;
}

export function VerificationSection({
  profileData,
  isOwnProfile,
  onEditMaxPreps,
  onShowVerificationDialog,
  hasPendingVerification = false,
  pendingSubmittedAt
}: VerificationSectionProps) {

  // Check if transfer portal verification is required for this athlete
  const requiresTransferPortalVerification = 
    profileData.educationLevel === 'undergraduate' || profileData.educationLevel === 'graduate';

  // Check if this is a high school athlete (only they should see MaxPreps)
  const isHighSchoolAthlete = profileData.educationLevel === 'high_school';

  // If user is verified but has no MaxPreps URL, they were manually verified
  // For undergraduate/graduate athletes, still show the section if they need transfer portal verification
  // For college athletes (non-high school), hide if verified and no transfer portal verification needed
  if (profileData.isVerified && !profileData.maxPrepsUrl && !requiresTransferPortalVerification) {
    return null;
  }

  // Check if user should see manual verification option
  // For high school athletes: Hide if they have MaxPreps URL, are verified, or have pending request
  // For college athletes: Hide if they are verified or have pending request (MaxPreps not relevant)
  const shouldShowManualVerification = isHighSchoolAthlete 
    ? (!profileData.maxPrepsUrl && !profileData.isVerified && !hasPendingVerification)
    : (!profileData.isVerified && !hasPendingVerification && !requiresTransferPortalVerification);

  // Show pending verification status
  const shouldShowPendingVerification = hasPendingVerification;

  // Determine if MaxPreps editing should be allowed
  const canEditMaxPreps = isOwnProfile && onEditMaxPreps && !profileData.isVerified;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Athlete Verification
          </CardTitle>
          {canEditMaxPreps && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={onEditMaxPreps}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* MaxPreps Section - Only show for high school athletes */}
          {isHighSchoolAthlete && profileData.maxPrepsUrl ? (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">MaxPreps Profile</p>
                    {profileData.isVerified && (
                      <Badge className="bg-green-600 text-white text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Official high school stats, game logs, and team roster verification
                    {profileData.isVerified && (
                      <span className="block text-green-600 dark:text-green-400 font-medium mt-1">
                        ✓ Profile verified and locked for security
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <Link href={profileData.maxPrepsUrl} target="_blank" className="block">
                    <Button className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white w-full sm:w-auto">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      <span className="whitespace-nowrap">View Official Stats</span>
                    </Button>
                  </Link>
                </div>
              </div>
              {!profileData.isVerified && (
                <div className="mt-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                  <p className="text-sm text-orange-700 dark:text-orange-200">
                    <strong>Note:</strong> MaxPreps is the official source for high school sports verification. 
                    Your profile name must match your MaxPreps athlete page to receive verified status.
                  </p>
                </div>
              )}
              {profileData.isVerified && (
                <div className="mt-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-sm text-green-700 dark:text-green-200">
                    <strong>Verified:</strong> Your MaxPreps profile has been verified and is locked for security. 
                    This prevents impersonation and maintains the integrity of your athletic credentials.
                  </p>
                </div>
              )}
            </div>
          ) : isHighSchoolAthlete ? (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">High School Athletes</h3>
                <p className="text-sm text-blue-700 dark:text-blue-200 mb-4 px-2">
                  MaxPreps is the official source for high school sports stats and verification. 
                  Link your MaxPreps profile to showcase official stats and get verified instantly.
                </p>
                {canEditMaxPreps && (
                  <Button 
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-900"
                    onClick={onEditMaxPreps}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add MaxPreps URL
                  </Button>
                )}
              </div>
            </div>
          ) : null}

          {/* Transfer Portal Verification Section - Only show for undergraduate/graduate athletes */}
          {requiresTransferPortalVerification && (
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  profileData.isTransferPortalVerified 
                    ? 'bg-green-100 dark:bg-green-900' 
                    : 'bg-purple-100 dark:bg-purple-900'
                }`}>
                  <Shield className={`w-8 h-8 ${
                    profileData.isTransferPortalVerified 
                      ? 'text-green-600' 
                      : 'text-purple-600'
                  }`} />
                </div>
                
                {profileData.isTransferPortalVerified ? (
                  <>
                    <div className="mb-2">
                      <h3 className="font-medium text-green-900 dark:text-green-100 text-center mb-2">
                        Transfer Portal Status Confirmed
                      </h3>
                      <div className="flex justify-center">
                        <Badge className="bg-blue-600 text-white text-xs sm:text-sm">
                          <Shield className="w-3 h-3 mr-1" />
                          Portal Verified
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-200 mb-3 px-2">
                      Your NCAA Transfer Portal status has been confirmed. You can now connect and message with coaches and recruiters.
                    </p>
                    <div className="bg-green-100 dark:bg-green-900/50 rounded-lg p-3 border border-green-200 dark:border-green-700">
                      <p className="text-xs text-green-800 dark:text-green-200">
                        <strong>Transfer Portal Confirmed:</strong> {profileData.transferPortalVerifiedAt 
                          ? new Date(profileData.transferPortalVerifiedAt).toLocaleDateString()
                          : 'Recently'
                        }
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-2">
                      <h3 className="font-medium text-purple-900 dark:text-purple-100 text-center mb-2">
                        Transfer Portal Confirmation Required
                      </h3>
                      <div className="flex justify-center">
                        <Badge className="bg-red-600 text-white text-xs sm:text-sm">Required</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-200 mb-4 px-2">
                      As an {profileData.educationLevel} athlete, you must confirm your NCAA Transfer Portal status 
                      before coaches and recruiters can connect with you or send messages.
                    </p>
                    
                    {isOwnProfile && (
                      <Button 
                        onClick={onShowVerificationDialog}
                        className="bg-purple-600 hover:bg-purple-700 text-white mb-3"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Confirm Transfer Portal Status
                      </Button>
                    )}
                    
                    <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                      <p className="text-xs text-orange-700 dark:text-orange-200">
                        <strong>Required:</strong> You must submit proof of your NCAA Transfer Portal entry, 
                        including a screenshot of your portal confirmation email.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Manual Verification Section - Only show if not already verified and no MaxPreps */}
          {shouldShowManualVerification && (
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  {isHighSchoolAthlete ? "Club & College Athletes" : "Athlete Verification"}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-200 mb-4 px-2">
                  {isHighSchoolAthlete 
                    ? "Playing club sports, intramurals, or college teams? Get manually verified with team rosters, photos, or other documentation."
                    : "Get verified as a legitimate athlete with team rosters, photos, or other documentation."
                  }
                </p>
                {isOwnProfile && (
                  <Button 
                    onClick={onShowVerificationDialog}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Apply for Manual Verification
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
                Which verification is right for me?
              </h4>
              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                {isHighSchoolAthlete && (
                  <li>• <strong>MaxPreps:</strong> High school athletes with official stats</li>
                )}
                <li>• <strong>Manual:</strong> {isHighSchoolAthlete 
                  ? "Club sports, intramurals, college teams, or athletes without MaxPreps"
                  : "Club sports, intramurals, or general athletic participation verification"
                }</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 