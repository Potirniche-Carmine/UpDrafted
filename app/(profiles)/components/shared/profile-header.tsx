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
import { ChevronLeft, Flag, Star, Share2, Copy, Mail, MessageCircle, Save } from "lucide-react";
import { ReportDialog } from "./report-dialog";

interface ProfileHeaderProps {
  isOwnProfile?: boolean;
  onConnect?: () => void;
  onReport?: () => void;
  onShare?: () => void;
  connectLabel?: string;
  profileName?: string;
  profileType?: "athlete" | "coach" | "recruiter";
  // Save functionality props
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
  onSaveChanges?: () => void;
  onDiscardChanges?: () => void;
}

export function ProfileHeader({ 
  isOwnProfile = false, 
  onConnect, 
  onReport,
  onShare,
  connectLabel = "Connect",
  profileName = "this profile",
  profileType = "coach",
  hasUnsavedChanges = false,
  isSaving = false,
  onSaveChanges,
  onDiscardChanges
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
            
            {/* Right side actions */}
            <div className="flex gap-2">
              {/* Save buttons for own profile */}
              {isOwnProfile && hasUnsavedChanges && (
                <>
                  <Button 
                    onClick={onSaveChanges}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    {isSaving ? (
                      <>
                        <Save className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onDiscardChanges}
                    disabled={isSaving}
                    size="sm"
                  >
                    Discard Changes
                  </Button>
                </>
              )}
              
              {/* Actions for viewing other profiles */}
              {!isOwnProfile && (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="sm:hidden space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={handleBackClick}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Search
              </Button>
              
              {/* Save buttons for own profile on mobile */}
              {isOwnProfile && hasUnsavedChanges && (
                <div className="flex gap-2">
                  <Button 
                    onClick={onSaveChanges}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    {isSaving ? (
                      <>
                        <Save className="w-4 h-4 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onDiscardChanges}
                    disabled={isSaving}
                    size="sm"
                  >
                    Discard
                  </Button>
                </div>
              )}
              
              {/* Actions for viewing other profiles on mobile */}
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