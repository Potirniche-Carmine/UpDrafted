"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronLeft, Flag, Star } from "lucide-react";

interface ProfileHeaderProps {
  isOwnProfile?: boolean;
  onConnect?: () => void;
  onReport?: () => void;
  connectLabel?: string;
}

export function ProfileHeader({ 
  isOwnProfile = false, 
  onConnect, 
  onReport,
  connectLabel = "Connect" 
}: ProfileHeaderProps) {
  const router = useRouter();

  const handleBackClick = () => {
    router.push('/search');
  };

  const handleReportProfile = () => {
    console.log('Report profile clicked');
    onReport?.();
  };

  return (
    <div className="border-b">
      <div className="container flex items-center justify-between py-4">
        <Button variant="ghost" size="sm" onClick={handleBackClick}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Search
        </Button>
        {!isOwnProfile && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReportProfile}>
              <Flag className="w-4 h-4 mr-1" />
              Report
            </Button>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={onConnect}
            >
              <Star className="w-4 h-4 mr-1" />
              {connectLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 