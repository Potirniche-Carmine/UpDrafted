"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, Trophy, Building } from "lucide-react";

interface CoachLevelBannerProps {
  division: string;
  conference?: string;
  organizationName: string;
  sportCoaching: string;
}

export function CoachLevelBanner({ 
  division, 
  conference,
  organizationName, 
  sportCoaching 
}: CoachLevelBannerProps) {
  
  const getBannerConfig = (division: string) => {
    // Check if division is high school
    if (division === 'High School') {
      return {
        icon: GraduationCap,
        label: 'High School Coach',
        showDivisionBadge: false,
        isCentered: false,
        bgColor: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
        borderColor: 'border-blue-200 dark:border-blue-800',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-900 dark:text-blue-100',
        badgeVariant: 'default' as const
      };
    }
    
    // Check if division is club sports
    if (division === 'Club Sports') {
      return {
        icon: Users,
        label: 'Club Coach',
        showDivisionBadge: false,
        isCentered: false,
        bgColor: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
        borderColor: 'border-green-200 dark:border-green-800',
        iconColor: 'text-green-600',
        textColor: 'text-green-900 dark:text-green-100',
        badgeVariant: 'secondary' as const
      };
    }
    
    // Check for community college and junior college (JUCO) divisions
    if (division === 'Community College' || division === 'Junior College' || division?.includes('NJCAA')) {
      return {
        icon: Building,
        label: division === 'Junior College' ? 'Junior College Coach' : 'Community College Coach',
        showDivisionBadge: true,
        isCentered: true,
        bgColor: 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30',
        borderColor: 'border-orange-200 dark:border-orange-800',
        iconColor: 'text-orange-600',
        textColor: 'text-orange-900 dark:text-orange-100',
        badgeVariant: 'outline' as const
      };
    }
    
    // Check for college/university divisions (NCAA, NAIA)
    if (division?.includes('NCAA') || division === 'NAIA') {
      return {
        icon: Trophy,
        label: 'College Coach',
        showDivisionBadge: true,
        isCentered: false,
        bgColor: 'from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30',
        borderColor: 'border-purple-200 dark:border-purple-800',
        iconColor: 'text-purple-600',
        textColor: 'text-purple-900 dark:text-purple-100',
        badgeVariant: 'default' as const
      };
    }
    
    // Default fallback
    return {
      icon: Users,
      label: 'Coach',
      showDivisionBadge: true,
      isCentered: false,
      bgColor: 'from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30',
      borderColor: 'border-gray-200 dark:border-gray-800',
      iconColor: 'text-gray-600',
      textColor: 'text-gray-900 dark:text-gray-100',
      badgeVariant: 'outline' as const
    };
  };

  const config = getBannerConfig(division);
  const Icon = config.icon;

  if (config.isCentered) {
    // Centered layout for community/junior college
    return (
      <Card className={`bg-gradient-to-r ${config.bgColor} border ${config.borderColor}`}>
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className={`w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border ${config.borderColor}`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="space-y-1">
              <h3 className={`font-semibold ${config.textColor}`}>
                {config.label}
              </h3>
              <div className="flex items-center justify-center gap-2">
                <Badge variant={config.badgeVariant} className="text-xs font-medium">
                  {division}
                </Badge>
                {conference && (
                  <Badge variant="outline" className="text-xs bg-white/50">
                    {conference}
                  </Badge>
                )}
              </div>
              <p className={`text-sm ${config.textColor} opacity-80`}>
                {sportCoaching} • {organizationName}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Standard layout for other coach types
  return (
    <Card className={`bg-gradient-to-r ${config.bgColor} border ${config.borderColor}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border ${config.borderColor}`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold ${config.textColor}`}>
                  {config.label}
                </h3>
                {config.showDivisionBadge && (
                  <Badge variant={config.badgeVariant} className="text-xs">
                    {division}
                  </Badge>
                )}
                {conference && (
                  <Badge variant="outline" className="text-xs bg-white/50">
                    {conference}
                  </Badge>
                )}
              </div>
              <p className={`text-sm ${config.textColor} opacity-80`}>
                {sportCoaching} • {organizationName}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 