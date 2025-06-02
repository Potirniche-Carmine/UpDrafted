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
  onEditMaxPreps: () => void;
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

  // If user is verified but has no MaxPreps URL, they were manually verified
  // In this case, don't show the verification section at all
  if (profileData.isVerified && !profileData.maxPrepsUrl) {
    return null;
  }

  // Check if user should see manual verification option
  // Hide it if they already have MaxPreps URL, are already verified, or have a pending request
  const shouldShowManualVerification = !profileData.maxPrepsUrl && !profileData.isVerified && !hasPendingVerification;

  // Show pending verification status
  const shouldShowPendingVerification = hasPendingVerification;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Athlete Verification
          </CardTitle>
          {isOwnProfile && (
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
          {/* MaxPreps Section */}
          {profileData.maxPrepsUrl ? (
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
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">High School Athletes</h3>
                <p className="text-sm text-blue-700 dark:text-blue-200 mb-4">
                  MaxPreps is the official source for high school sports stats and verification. 
                  Link your MaxPreps profile to showcase official stats and get verified instantly.
                </p>
                {isOwnProfile && (
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
          )}

          {/* Manual Verification Section - Only show if not already verified and no MaxPreps */}
          {shouldShowManualVerification && (
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">Club & College Athletes</h3>
                <p className="text-sm text-green-700 dark:text-green-200 mb-4">
                  Playing club sports, intramurals, or college teams? Get manually verified with 
                  team rosters, photos, or other documentation.
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
                <li>• <strong>MaxPreps:</strong> High school athletes with official stats</li>
                <li>• <strong>Manual:</strong> Club sports, intramurals, college teams, or athletes without MaxPreps</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 