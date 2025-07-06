"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { ChevronLeft, Flag, Star, Share2, Copy, Mail, MessageCircle, Save, Clock, CheckCircle, X,Edit } from "lucide-react";
import { ReportDialog } from "./report-dialog";

interface ProfileHeaderProps {
  isOwnProfile?: boolean;
  onConnect?: () => void;
  onWithdrawConnection?: () => void;
  onAcceptConnection?: () => void;
  onDeclineConnection?: () => void;
  onReport?: () => void;
  onShare?: () => void;
  onPreviewProfile?: () => void;
  onEditProfile?: () => void;
  isPreviewMode?: boolean;
  connectLabel?: string;
  profileName?: string;
  profileType?: "athlete" | "coach" | "recruiter";
  reportedUserId?: string;
  // Connection state props
  connectionStatus?: "none" | "pending" | "connected";
  connectionDirection?: "incoming" | "outgoing" | null;
  isConnecting?: boolean;
  // Save functionality props
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
  onSaveChanges?: () => void;
  onDiscardChanges?: () => void;
}

export function ProfileHeader({ 
  isOwnProfile = false, 
  onConnect, 
  onWithdrawConnection,
  onAcceptConnection,
  onDeclineConnection,
  onReport,
  onShare,
  onPreviewProfile,
  onEditProfile,
  isPreviewMode = false,
  connectLabel = "Connect",
  profileName = "this profile",
  profileType = "coach",
  reportedUserId,
  connectionStatus = "none",
  connectionDirection,
  isConnecting = false,
  hasUnsavedChanges = false,
  isSaving = false,
  onSaveChanges,
  onDiscardChanges
}: ProfileHeaderProps) {
  const router = useRouter();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  const handleBackClick = () => {
    router.push('/dashboard');
  };

  const handleReportProfile = () => {
    setShowReportDialog(true);
    onReport?.();
  };

  const handleConnectionAction = () => {
    if (connectionStatus === "pending" && connectionDirection === "outgoing") {
      // Show withdrawal confirmation dialog only for outgoing requests
      setShowWithdrawDialog(true);
    } else if (connectionStatus === "none") {
      onConnect?.();
    }
  };

  const handleWithdrawConfirm = () => {
    setShowWithdrawDialog(false);
    onWithdrawConnection?.();
  };

  const getConnectionButton = () => {
    if (connectionStatus === "connected") {
      return (
        <Button 
          size="sm" 
          variant="outline"
          disabled
          className="text-green-600 border-green-600"
        >
          <Star className="w-4 h-4 mr-1" />
          Connected
        </Button>
      );
    }

    if (connectionStatus === "pending") {
      if (connectionDirection === "incoming") {
        // Show Accept/Decline buttons for incoming requests
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
              onClick={() => onAcceptConnection?.()}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Clock className="w-4 h-4 mr-1 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Accept Connection
                </>
              )}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onDeclineConnection?.()}
              disabled={isConnecting}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" />
              Decline
            </Button>
          </div>
        );
      }
      // Show withdraw button for outgoing requests
      return (
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleConnectionAction}
          disabled={isConnecting}
          className="text-orange-600 border-orange-600 hover:bg-orange-50"
        >
          {isConnecting ? (
            <>
              <Clock className="w-4 h-4 mr-1 animate-spin" />
              Withdrawing...
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 mr-1" />
              Connection Pending
            </>
          )}
        </Button>
      );
    }

    // Default connect button
    return (
      <Button 
        size="sm" 
        className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
        onClick={handleConnectionAction}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <Clock className="w-4 h-4 mr-1 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Star className="w-4 h-4 mr-1" />
            {connectLabel}
          </>
        )}
      </Button>
    );
  };

  const handleShareAction = (method: string) => {
    const profileUrl = window.location.href;
    
    switch (method) {
      case 'copy':
        navigator.clipboard.writeText(profileUrl);
        break;
      case 'email':
        const subject = `Check out this profile on UpDrafted`;
        const body = `I wanted to share this profile with you:\n\n${profileUrl}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        break;
      case 'chat':
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
              Back to Dashboard
            </Button>
            
            {/* Right side actions */}
            <div className="flex gap-2">
              {/* Preview/Edit Profile toggle for own profile without unsaved changes */}
              {isOwnProfile && !hasUnsavedChanges && (onPreviewProfile || onEditProfile) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={isPreviewMode ? onEditProfile : onPreviewProfile}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {isPreviewMode ? "Edit Profile" : "Preview Profile"}
                </Button>
              )}
              
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
                  
                  {onConnect && (
                    getConnectionButton()
                  )}
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
              
              {/* Preview/Edit Profile toggle for own profile without unsaved changes on mobile */}
              {isOwnProfile && !hasUnsavedChanges && (onPreviewProfile || onEditProfile) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={isPreviewMode ? onEditProfile : onPreviewProfile}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {isPreviewMode ? "Edit" : "Preview"}
                </Button>
              )}
              
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
            {!isOwnProfile && onConnect && (
              <div className="flex justify-center">
                {getConnectionButton()}
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
        reportedUserId={reportedUserId || ""}
      />

      {/* Withdrawal Confirmation Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Withdraw Connection Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw your connection request to {profileName}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="submit" onClick={handleWithdrawConfirm}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 