"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp,
  CheckCircle
} from "lucide-react";
import { ProfileCompletion, getProfileStrengthLabel } from '@/lib/profile-completion';

interface ProfileCompletionBannerProps {
  completion: ProfileCompletion;
  isOwnProfile: boolean;
}

export function ProfileCompletionBanner({ completion, isOwnProfile }: ProfileCompletionBannerProps) {
  const strengthInfo = getProfileStrengthLabel(completion.overall);

  if (!isOwnProfile) return null;

  // Don't show banner if profile is nearly complete
  if (completion.overall >= 90) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 dark:text-green-200">Profile Complete!</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your profile is comprehensive and ready to attract coaches.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-green-600">{completion.overall}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#01ae79]/20 bg-gradient-to-r from-[#01ae79]/5 to-[#01ae79]/10 dark:border-[#01ae79]/30 dark:from-[#01ae79]/10 dark:to-[#01ae79]/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#01ae79]/10 dark:bg-[#01ae79]/20 rounded-full">
            <TrendingUp className="w-5 h-5 text-[#01ae79]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Profile Strength</h3>
                <p className="text-sm text-muted-foreground">{strengthInfo.description}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[#01ae79]">{completion.overall}%</span>
              </div>
            </div>
            <Progress value={completion.overall} className="w-full h-2 mt-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 