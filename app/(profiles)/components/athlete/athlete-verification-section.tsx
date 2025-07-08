"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus, Shield, ExternalLink, Clock, CheckCircle2, AlertCircle, GraduationCap } from "lucide-react";
import Link from "next/link";
import { AthleteProfileData } from "./athlete-profile-types";

interface VerificationSectionProps {
  profileData: AthleteProfileData; // Original database data for verification logic
  displayData?: AthleteProfileData; // Current data including unsaved changes for display
  isOwnProfile: boolean;
  onEditMaxPreps?: () => void;
  onShowVerificationDialog: () => void;
  hasPendingVerification?: boolean;
  pendingSubmittedAt?: string;
}

export function VerificationSection({
  profileData,
  displayData,
  isOwnProfile,
  onEditMaxPreps,
  onShowVerificationDialog,
  hasPendingVerification = false,
  pendingSubmittedAt
}: VerificationSectionProps) {

  // Use displayData for UI display, profileData for verification logic
  const currentData = displayData || profileData;

  // Check if transfer portal verification is required for this athlete
  // Use ORIGINAL database data (profileData) to determine verification requirements
  // This prevents showing verification requirements for unsaved changes
  const requiresTransferPortalVerification = 
    (profileData.educationLevel === 'undergraduate' || profileData.educationLevel === 'graduate') &&
    profileData.competitionLevel &&
    ['division_1', 'division_2', 'division_3'].includes(profileData.competitionLevel);

  // Check if this is a high school athlete (only they should see MaxPreps)
  const isHighSchoolAthlete = currentData.educationLevel === 'high_school';

  // Get the verification status for display
  const getVerificationStatus = () => {
    if (requiresTransferPortalVerification) {
      // For university students, combine verification statuses
      const isTransferPortalVerified = currentData.isOnTransferPortal === true;
      const isFullyVerified = currentData.isVerified && isTransferPortalVerified;
      const hasTransferPortalStatus = currentData.isOnTransferPortal !== undefined;
      
      return {
        type: 'university',
        isVerified: isFullyVerified,
        isTransferPortalVerified: isTransferPortalVerified,
        isOnTransferPortal: currentData.isOnTransferPortal || false,
        hasTransferPortalStatus,
        needsVerification: !isFullyVerified || hasPendingVerification
      };
    } else {
      // For high school athletes
      return {
        type: 'high_school',
        isVerified: currentData.isVerified || false,
        hasMaxPreps: !!currentData.maxPrepsUrl,
        needsVerification: !currentData.isVerified || hasPendingVerification
      };
    }
  };

  const status = getVerificationStatus();

  // Show different verification badges based on athlete type and status
  const renderVerificationBadges = () => {
    if (status.type === 'university') {
      const badges = [];
      
      // General verification badge
      if (status.isVerified) {
        badges.push(
          <Badge key="verified" className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified Athlete
          </Badge>
        );
      }
      
      // Transfer portal status badge
      if (status.isTransferPortalVerified) {
        // Show "Not in Transfer Portal" for D1/D2/D3 athletes when verified but not in portal
        if (!status.isOnTransferPortal && 
            ['division_1', 'division_2', 'division_3'].includes(currentData.competitionLevel || '')) {
          badges.push(
            <Badge key="portal-not-active" className="bg-gray-600 hover:bg-gray-700 text-white border-0">
              <GraduationCap className="w-3 h-3 mr-1" />
              Not in Transfer Portal
            </Badge>
          );
        }
        // Don't show "In Transfer Portal" badge per user request
      } else {
        // Show "Portal Status Required" for D1/D2/D3 athletes
        if (['division_1', 'division_2', 'division_3'].includes(currentData.competitionLevel || '')) {
          badges.push(
            <Badge key="portal-unverified" className="bg-amber-600 hover:bg-amber-700 text-white border-0">
              <AlertCircle className="w-3 h-3 mr-1" />
              Portal Status Required
            </Badge>
          );
        }
      }
      
      return badges;
    } else {
      // High school badges
      if (status.isVerified) {
        return [
          <Badge key="verified" className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified Athlete
          </Badge>
        ];
      }
    }
    
    return [];
  };

  // If verified and no special requirements, don't show section
  if (status.type === 'high_school' && status.isVerified && !status.hasMaxPreps && !hasPendingVerification) {
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
          {status.type === 'high_school' && isOwnProfile && onEditMaxPreps && !currentData.isVerified && (
            <Button size="sm" variant="ghost" onClick={onEditMaxPreps}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
        
        {/* Display badges */}
        {renderVerificationBadges().length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {renderVerificationBadges()}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* High School MaxPreps Section */}
        {isHighSchoolAthlete && currentData.maxPrepsUrl && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">MaxPreps Profile</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Official high school stats, game logs, and team roster verification
                </p>
                {currentData.isVerified && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Profile verified and secured
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <Link href={currentData.maxPrepsUrl!} target="_blank">
                  <Button className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Stats
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* University Transfer Portal Section */}
        {requiresTransferPortalVerification && (
          <div className={`rounded-xl p-6 border transition-all ${
            status.isTransferPortalVerified 
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' 
              : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
          }`}>
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                status.isTransferPortalVerified 
                  ? 'bg-emerald-100 dark:bg-emerald-900' 
                  : 'bg-amber-100 dark:bg-amber-900'
              }`}>
                <GraduationCap className={`w-8 h-8 ${
                  status.isTransferPortalVerified 
                    ? 'text-emerald-600' 
                    : 'text-amber-600'
                }`} />
              </div>
              
              <div>
                <h3 className={`font-semibold mb-2 ${
                  status.isTransferPortalVerified 
                    ? 'text-emerald-900 dark:text-emerald-100' 
                    : 'text-amber-900 dark:text-amber-100'
                }`}>
                  {status.isTransferPortalVerified ? 'Transfer Portal Status Confirmed' : 'Transfer Portal Verification Required'}
                </h3>
                
                <p className={`text-sm mb-4 ${
                  status.isTransferPortalVerified 
                    ? 'text-emerald-700 dark:text-emerald-200' 
                    : 'text-amber-700 dark:text-amber-200'
                }`}>
                  {status.isTransferPortalVerified 
                    ? `Your NCAA Transfer Portal status has been confirmed. ${
                        status.isOnTransferPortal 
                          ? 'You are currently in the transfer portal and can connect with coaches.' 
                          : 'You are not currently in the transfer portal.'
                      }`
                    : `As a ${currentData.competitionLevel === 'division_1' ? 'D1' : currentData.competitionLevel === 'division_2' ? 'D2' : currentData.educationLevel} athlete, you must confirm your NCAA Transfer Portal status before coaches and recruiters can connect with you.`
                  }
                </p>

                {!status.isTransferPortalVerified && isOwnProfile && (
                  <Button 
                    onClick={onShowVerificationDialog}
                    className="bg-amber-600 hover:bg-amber-700 text-white mb-4"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Confirm Portal Status
                  </Button>
                )}

                {status.isTransferPortalVerified && currentData.transferPortalVerifiedAt && (
                  <div className={`inline-block px-3 py-2 rounded-lg text-xs font-medium ${
                    status.isTransferPortalVerified 
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200' 
                      : 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200'
                  }`}>
                    Verified: {new Date(currentData.transferPortalVerifiedAt!).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Manual Verification Section */}
        {((isHighSchoolAthlete && !currentData.maxPrepsUrl && !currentData.isVerified && !hasPendingVerification) ||
          (!requiresTransferPortalVerification && !currentData.isVerified && !hasPendingVerification)) && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {isHighSchoolAthlete ? "Club & College Athletes" : "Athlete Verification"}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {isHighSchoolAthlete 
                    ? "Playing club sports, intramurals, or college teams? Get verified with team rosters, photos, or other documentation."
                    : "Get verified as a legitimate athlete with team rosters, photos, or other documentation."
                  }
                </p>
                {isOwnProfile && (
                  <Button 
                    onClick={onShowVerificationDialog}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Apply for Verification
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* High School MaxPreps Prompt */}
        {isHighSchoolAthlete && !currentData.maxPrepsUrl && !currentData.isVerified && !hasPendingVerification && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <ExternalLink className="w-8 h-8 text-blue-600" />
              </div>
              
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">High School Athletes</h3>
                <p className="text-sm text-blue-700 dark:text-blue-200 mb-4">
                  MaxPreps is the official source for high school sports stats and verification. 
                  Link your MaxPreps profile to showcase official stats and get verified instantly.
                </p>
                {isOwnProfile && onEditMaxPreps && (
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
          </div>
        )}

        {/* Pending Verification Section */}
        {hasPendingVerification && (
          <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Verification Pending</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-200 mb-4">
                  Your verification request is being reviewed by our team. This usually takes 1-3 business days.
                </p>
                <div className="inline-block px-3 py-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg text-xs font-medium text-yellow-800 dark:text-yellow-200">
                  Submitted: {pendingSubmittedAt ? new Date(pendingSubmittedAt).toLocaleDateString() : 'Recently'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        {((isHighSchoolAthlete && !currentData.maxPrepsUrl && !currentData.isVerified && !hasPendingVerification) ||
          (!requiresTransferPortalVerification && !currentData.isVerified && !hasPendingVerification)) && (
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2 text-sm">
              Which verification is right for me?
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              {isHighSchoolAthlete && (
                <li>• <strong>MaxPreps:</strong> High school athletes with official stats</li>
              )}
              <li>• <strong>Manual:</strong> {isHighSchoolAthlete 
                ? "Club sports, intramurals, college teams, or athletes without MaxPreps"
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