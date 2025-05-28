"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { ChevronLeft, Flag, Star, Share2, Copy, Mail, MessageCircle } from "lucide-react";

interface ProfileHeaderProps {
  isOwnProfile?: boolean;
  onConnect?: () => void;
  onReport?: () => void;
  onShare?: () => void;
  connectLabel?: string;
}

export function ProfileHeader({ 
  isOwnProfile = false, 
  onConnect, 
  onReport,
  onShare,
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
            
            {/* Share Button - Available to everyone */}
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