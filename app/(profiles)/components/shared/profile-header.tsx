"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { ChevronLeft, Flag, Star, Share2, Copy, Mail, MessageCircle } from "lucide-react";
import { ReportDialog } from "./report-dialog";

interface ProfileHeaderProps {
  isOwnProfile?: boolean;
  onConnect?: () => void;
  onReport?: () => void;
  onShare?: () => void;
  connectLabel?: string;
  profileName?: string;
  profileType?: "athlete" | "coach" | "recruiter";
}

export function ProfileHeader({ 
  isOwnProfile = false, 
  onConnect, 
  onReport,
  onShare,
  connectLabel = "Connect",
  profileName = "this profile",
  profileType = "coach"
}: ProfileHeaderProps) {
  const router = useRouter();
  const [showReportDialog, setShowReportDialog] = useState(false);

  const handleBackClick = () => {
    router.push('/search');
  };

  const handleReportProfile = () => {
    setShowReportDialog(true);
    onReport?.();
  };

  const handleShareAction = (method: string) => {
    const profileUrl = window.location.href;
    
    switch (method) {
      case 'copy':
        navigator.clipboard.writeText(profileUrl);
        console.log('Link copied to clipboard');
        break;
      case 'email':
        const subject = `Check out this profile on UpDrafted`;
        const body = `I wanted to share this profile with you:\n\n${profileUrl}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        break;
      case 'chat':
        console.log('Share via chat');
        onShare?.();
        break;
      default:
        onShare?.();
    }
  };

  return (
    <>
      <div className="border-b">
        <div className="container py-4">
          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
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
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleShareAction('copy')}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareAction('email')}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send via Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareAction('chat')}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send over Chat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  size="sm" 
                  className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
                  onClick={onConnect}
                >
                  <Star className="w-4 h-4 mr-1" />
                  {connectLabel}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Layout */}
          <div className="sm:hidden space-y-4">
            <div className="flex items-center justify-between">
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
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleShareAction('copy')}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShareAction('email')}>
                        <Mail className="w-4 h-4 mr-2" />
                        Send via Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShareAction('chat')}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Send over Chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            {!isOwnProfile && (
              <div className="flex justify-center">
                <Button 
                  size="sm" 
                  className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white w-full"
                  onClick={onConnect}
                >
                  <Star className="w-4 h-4 mr-1" />
                  {connectLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        profileName={profileName}
        profileType={profileType}
      />
    </>
  );
} 