"use client";

import React, { useState, useMemo, useEffect, Suspense, useRef } from 'react';
import { Users, Search, MessageSquare, Shield, CheckCircle, X, Clock, MoreHorizontal, MapPin, User, UserCheck, Users2, Send } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { AuthWrapper } from '../../../components/auth-wrapper';
import { sanitizeText } from '@/utils/sanitization';

interface Connection {
  id: number;
  status: 'connected' | 'interested' | 'viewed';
  initiatedBy: 'athlete' | 'coach' | 'recruiter';
  createdAt: string;
  notes: string | null;
  isInitiator: boolean;
  otherUser: {
    userId: string;
    fullName: string;
    profileImage: string | null;
    organizationName: string;
    title?: string;
    sport?: string;
    city: string;
    state: string;
    division?: string;
    graduationYear?: number;
    educationLevel?: string;
    isVerified: boolean;
    role: 'athlete' | 'coach' | 'recruiter';
  };
}

interface PendingRequest {
  id: number;
  status: 'pending';
  initiatedBy: 'athlete' | 'coach' | 'recruiter';
  createdAt: string;
  notes: string | null;
  isInitiator: boolean;
  otherUser: {
    userId: string;
    fullName: string;
    profileImage: string | null;
    organizationName: string;
    title?: string;
    sport?: string;
    city: string;
    state: string;
    division?: string;
    graduationYear?: number;
    educationLevel?: string;
    isVerified: boolean;
    role: 'athlete' | 'coach' | 'recruiter';
  };
}

interface UserCardProps {
  connection: Connection;
  onRemove: (connectionId: number, targetUserId: string) => void;
  isRemoving?: boolean;
}

interface PendingRequestCardProps {
  request: PendingRequest;
  onAccept: (requestId: number) => void;
  onDecline: (requestId: number) => void;
}

interface SentRequestCardProps {
  request: PendingRequest;
  onWithdraw: (requestId: number, targetUserId: string) => void;
  isWithdrawing?: boolean;
}

interface FilterButtonsProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

// Helper function to get role badge with descriptive text and improved styling
const getRoleBadge = (role: string, division?: string, educationLevel?: string) => {
  let roleText = '';
  let roleColor = '';

  if (role === 'athlete') {
    if (educationLevel === 'high_school') {
      roleText = 'HS Athlete';
      roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
    } else if (educationLevel === 'undergraduate') {
      roleText = 'College Athlete';
      roleColor = 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-700';
    } else if (educationLevel === 'associate') {
      roleText = 'JC Athlete';
      roleColor = 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-700';
    } else if (educationLevel === 'graduate') {
      roleText = 'Grad Athlete';
      roleColor = 'bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-700';
    } else {
      roleText = 'Athlete';
      roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
    }
  } else if (role === 'coach') {
    if (division === 'High School') {
      roleText = 'HS Coach';
      roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
    } else if (division === 'Club Sports') {
      roleText = 'Club Coach';
      roleColor = 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-700';
    } else if (division === 'Community College' || division === 'Junior College' || division?.includes('NJCAA')) {
      roleText = 'JC Coach';
      roleColor = 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-700';
    } else if (division?.includes('NCAA') || division === 'NAIA') {
      roleText = 'College Coach';
      roleColor = 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-700';
    } else {
      roleText = 'Coach';
      roleColor = 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-700';
    }
  } else if (role === 'recruiter') {
    if (division === 'High School') {
      roleText = 'HS Recruiter';
      roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
    } else if (division === 'Club Sports') {
      roleText = 'Club Recruiter';
      roleColor = 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-700';
    } else if (division === 'Community College' || division === 'Junior College' || division?.includes('NJCAA')) {
      roleText = 'JC Recruiter';
      roleColor = 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-700';
    } else if (division?.includes('NCAA') || division === 'NAIA') {
      roleText = 'College Recruiter';
      roleColor = 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-700';
    } else {
      roleText = 'Recruiter';
      roleColor = 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-700';
    }
  }

  return <Badge variant="outline" className={`text-xs font-medium px-2 py-0.5 border ${roleColor} whitespace-nowrap`}>{roleText}</Badge>;
};

const UserCard: React.FC<UserCardProps> = ({ connection, onRemove, isRemoving = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { otherUser } = connection;

  const handleRemove = () => {
    onRemove(connection.id, otherUser.userId);
    setShowMenu(false);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Handle send message action instead of navigation
    console.log('Send message to:', otherUser.fullName);
  };

  // Format date as "June 3rd, 2025"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    };
    const formatted = date.toLocaleDateString('en-US', options);
    
    // Add ordinal suffix to day
    const day = date.getDate();
    const suffix = day % 10 === 1 && day !== 11 ? 'st' : 
                   day % 10 === 2 && day !== 12 ? 'nd' : 
                   day % 10 === 3 && day !== 13 ? 'rd' : 'th';
    
    return formatted.replace(/(\d+)/, `$1${suffix}`);
  };

  // Process profile image URL to ensure it works with R2/CloudFlare
  const getProfileImageUrl = (profileImage: string | null) => {
    if (!profileImage) {
      return null;
    }
    
    // If it's already a full URL, return as is
    if (profileImage.startsWith('http')) {
      return profileImage;
    }
    
    // Construct the full R2 URL using environment variable or fallback to known R2 domain
    const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-19c0754937db426497ca014f0e2a297c.r2.dev';
    return `${baseUrl}/${profileImage}`;
  };

  return (
    <div className="relative">
      <Card className="group transition-all duration-200 hover:shadow-xl hover:shadow-[#01ae79]/15 border border-border/60 hover:border-[#01ae79]/40 dark:hover:border-[#01ae79]/50 overflow-hidden">
        <CardContent className="p-3 sm:p-4 md:p-5">
          {/* Header Section with Date */}
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="flex items-start gap-2 md:gap-3 lg:gap-4 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <Avatar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ring-2 ring-[#01ae79]/20 group-hover:ring-[#01ae79]/50 transition-all duration-200">
                  <AvatarImage 
                    src={getProfileImageUrl(otherUser.profileImage) || undefined} 
                    alt={otherUser.fullName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xs sm:text-sm font-semibold bg-gradient-to-br from-[#01ae79]/10 to-[#01ae79]/20 text-[#01ae79]">
                    {otherUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {otherUser.isVerified && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                    <Shield className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <h3 className="font-semibold text-sm md:text-base text-foreground leading-tight truncate">{otherUser.fullName}</h3>
                
                <div className="flex items-center gap-2 flex-wrap pt-1.5">
                  {getRoleBadge(otherUser.role, otherUser.division, otherUser.educationLevel)}
                </div>

                <p className="text-xs md:text-sm font-medium text-[#01ae79] truncate">
                  {otherUser.role === 'athlete' ? otherUser.sport : otherUser.title}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 md:gap-2 flex-shrink-0">
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                {formatDate(connection.createdAt)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMenuClick}
                className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal size={12} className="sm:hidden" />
                <MoreHorizontal size={14} className="hidden sm:block" />
              </Button>
            </div>

            {showMenu && (
              <div className="absolute right-3 sm:right-5 top-14 sm:top-16 w-36 sm:w-40 bg-background rounded-lg shadow-lg border border-border py-1 z-20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 px-3 py-2 h-auto text-xs"
                >
                  <X size={12} className="mr-2" />
                  {isRemoving ? 'Removing...' : 'Remove Connection'}
                </Button>
                <Link href={`/profile/${otherUser.userId}`} className="block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start hover:bg-muted/50 px-3 py-2 h-auto text-xs"
                  >
                    <User size={12} className="mr-2" />
                    View Profile
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Status Section */}
          <div className="mb-3 md:mb-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#01ae79]/10 text-[#01ae79] rounded-full border border-[#01ae79]/20">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#01ae79] rounded-full"></div>
              <span className="text-[10px] sm:text-xs font-medium">Connected</span>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs md:text-sm text-muted-foreground">
              <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="truncate">{otherUser.city}, {otherUser.state}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground truncate font-medium">{otherUser.organizationName}</p>
          </div>

          {/* Message Button */}
          <div className="pt-3 md:pt-4 border-t border-border/50">
            <Button
              onClick={handleCardClick}
              className="w-full h-8 sm:h-9 md:h-10 bg-[#01ae79] hover:bg-[#01ae79]/90 text-white text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
            >
              <MessageSquare size={14} className="mr-1.5 sm:mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PendingRequestCard: React.FC<PendingRequestCardProps> = ({ request, onAccept, onDecline }) => {
  const { otherUser } = request;
  const sanitizedNotes = request.notes ? sanitizeText(request.notes) : null;

  // Format date as "June 3rd, 2025"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    };
    const formatted = date.toLocaleDateString('en-US', options);
    
    // Add ordinal suffix to day
    const day = date.getDate();
    const suffix = day % 10 === 1 && day !== 11 ? 'st' : 
                   day % 10 === 2 && day !== 12 ? 'nd' : 
                   day % 10 === 3 && day !== 13 ? 'rd' : 'th';
    
    return formatted.replace(/(\d+)/, `$1${suffix}`);
  };

  // Process profile image URL to ensure it works with R2/CloudFlare
  const getProfileImageUrl = (profileImage: string | null) => {
    if (!profileImage) {
      return null;
    }
    
    // If it's already a full URL, return as is
    if (profileImage.startsWith('http')) {
      return profileImage;
    }
    
    // Construct the full R2 URL using environment variable or fallback to known R2 domain
    const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-19c0754937db426497ca014f0e2a297c.r2.dev';
    return `${baseUrl}/${profileImage}`;
  };

  return (
    <div className="relative">
      <Card className="group transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/15 border border-amber-200/60 hover:border-amber-400 dark:border-amber-700/60 dark:hover:border-amber-500 overflow-hidden">
        <CardContent className="p-3 sm:p-4 md:p-5">
          {/* Header Section with Date */}
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="flex items-start gap-2 md:gap-3 lg:gap-4 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <Avatar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ring-2 ring-amber-200 group-hover:ring-amber-400 dark:ring-amber-700 dark:group-hover:ring-amber-500 transition-all duration-200">
                  <AvatarImage 
                    src={getProfileImageUrl(otherUser.profileImage) || undefined} 
                    alt={otherUser.fullName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xs sm:text-sm font-semibold bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 dark:from-amber-800 dark:to-amber-700 dark:text-amber-200">
                    {otherUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {otherUser.isVerified && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                    <Shield className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm md:text-base text-foreground leading-tight truncate pr-2">{otherUser.fullName}</h3>
                  <Link href={`/profile/${otherUser.userId}`} onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <User size={12} className="sm:hidden" />
                      <User size={14} className="hidden sm:block" />
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {getRoleBadge(otherUser.role, otherUser.division, otherUser.educationLevel)}
                </div>

                <p className="text-xs md:text-sm font-medium text-amber-600 dark:text-amber-400 truncate">
                  {otherUser.role === 'athlete' ? otherUser.sport : otherUser.title}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                {formatDate(request.createdAt)}
              </span>
            </div>
          </div>

          {/* Status Section */}
          <div className="mb-3 md:mb-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-700">
              <Clock size={10} className="sm:hidden" />
              <Clock size={12} className="hidden sm:block" />
              <span className="text-[10px] sm:text-xs font-medium">Pending Request</span>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs md:text-sm text-muted-foreground">
              <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="truncate">{otherUser.city}, {otherUser.state}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground truncate font-medium">{otherUser.organizationName}</p>
          </div>

          {/* Notes Section */}
          {sanitizedNotes && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 sm:p-3 mb-3 md:mb-4 border border-amber-200/60 dark:border-amber-700/60">
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 font-medium">Message:</p>
              <p className="text-[10px] sm:text-xs text-foreground break-words line-clamp-2">{sanitizedNotes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3 pt-3 md:pt-4 border-t border-border/50">
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAccept(request.id);
              }}
              className="flex-1 h-8 sm:h-9 bg-[#01ae79] hover:bg-[#01ae79]/90 text-white text-xs sm:text-sm font-medium"
            >
              <CheckCircle size={12} className="mr-1 sm:mr-2" />
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDecline(request.id);
              }}
              className="flex-1 h-8 sm:h-9 text-xs sm:text-sm font-medium hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
            >
              <X size={12} className="mr-1 sm:mr-2" />
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SentRequestCard: React.FC<SentRequestCardProps> = ({ request, onWithdraw, isWithdrawing = false }) => {
  const { otherUser } = request;

  const handleWithdraw = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWithdraw(request.id, otherUser.userId);
  };

  // Format date as "June 3rd, 2025"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    };
    const formatted = date.toLocaleDateString('en-US', options);
    
    // Add ordinal suffix to day
    const day = date.getDate();
    const suffix = day % 10 === 1 && day !== 11 ? 'st' : 
                   day % 10 === 2 && day !== 12 ? 'nd' : 
                   day % 10 === 3 && day !== 13 ? 'rd' : 'th';
    
    return formatted.replace(/(\d+)/, `$1${suffix}`);
  };

  // Process profile image URL to ensure it works with R2/CloudFlare
  const getProfileImageUrl = (profileImage: string | null) => {
    if (!profileImage) {
      return null;
    }
    
    // If it's already a full URL, return as is
    if (profileImage.startsWith('http')) {
      return profileImage;
    }
    
    // Construct the full R2 URL using environment variable or fallback to known R2 domain
    const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-19c0754937db426497ca014f0e2a297c.r2.dev';
    return `${baseUrl}/${profileImage}`;
  };

  return (
    <div className="relative">
      <Card className="group transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/15 border border-blue-200/60 hover:border-blue-400 dark:border-blue-700/60 dark:hover:border-blue-500 overflow-hidden">
        <CardContent className="p-3 sm:p-4 md:p-5">
          {/* Header Section with Date */}
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="flex items-start gap-2 md:gap-3 lg:gap-4 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <Avatar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ring-2 ring-blue-200 group-hover:ring-blue-400 dark:ring-blue-700 dark:group-hover:ring-blue-500 transition-all duration-200">
                  <AvatarImage 
                    src={getProfileImageUrl(otherUser.profileImage) || undefined} 
                    alt={otherUser.fullName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xs sm:text-sm font-semibold bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 dark:from-blue-800 dark:to-blue-700 dark:text-blue-200">
                    {otherUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {otherUser.isVerified && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                    <Shield className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm md:text-base text-foreground leading-tight truncate pr-2">{otherUser.fullName}</h3>
                  <Link href={`/profile/${otherUser.userId}`} onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <User size={12} className="sm:hidden" />
                      <User size={14} className="hidden sm:block" />
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {getRoleBadge(otherUser.role, otherUser.division, otherUser.educationLevel)}
                </div>

                <p className="text-xs md:text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                  {otherUser.role === 'athlete' ? otherUser.sport : otherUser.title}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                {formatDate(request.createdAt)}
              </span>
            </div>
          </div>

          {/* Status Section */}
          <div className="mb-3 md:mb-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-700">
              <Send size={10} className="sm:hidden" />
              <Send size={12} className="hidden sm:block" />
              <span className="text-[10px] sm:text-xs font-medium">Request Sent</span>
            </div>
          </div>

          {/* Info Section - Fixed margin to match other cards */}
          <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs md:text-sm text-muted-foreground">
              <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="truncate">{otherUser.city}, {otherUser.state}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground truncate font-medium">{otherUser.organizationName}</p>
          </div>

          {/* Action Button */}
          <div className="pt-3 md:pt-4 border-t border-border/50">
            <Button
              size="sm"
              variant="outline"
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="w-full h-8 sm:h-9 text-xs sm:text-sm font-medium hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
            >
              {isWithdrawing ? (
                <>
                  <Clock size={12} className="mr-1 sm:mr-2 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                <>
                  <X size={12} className="mr-1 sm:mr-2" />
                  Withdraw Request
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const FilterButtons: React.FC<FilterButtonsProps> = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'All', icon: Users },
    { id: 'athletes', label: 'Athletes', icon: User },
    { id: 'coaches', label: 'Coaches', icon: UserCheck },
    { id: 'recruiters', label: 'Recruiters', icon: Users2 }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => {
        const Icon = filter.icon;
        return (
          <Button
            key={filter.id}
            variant={currentFilter === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.id)}
            className={`h-9 ${currentFilter === filter.id ? 'bg-[#01ae79] hover:bg-[#01ae79]/90 text-white' : ''}`}
          >
            <Icon size={16} className="mr-2" />
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
};

function App() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingConnection, setRemovingConnection] = useState<number | null>(null);
  const loadingRef = useRef(false); // Track if API call is in progress

  const activeTab = searchParams?.get('tab') || 'connections';

  // Load connections data
  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    // Prevent duplicate API calls due to React Strict Mode
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      // Get auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();

      const response = await fetch('/api/connections', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load connections');
      }

      const data = await response.json();
      if (data.success) {
        // All connections from API are established connections
        // Pending requests would be handled by a separate endpoint if needed
        setConnections(data.connections);
        setPendingRequests(data.pendingRequests);
        setSentRequests(data.sentRequests);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleRemoveConnection = async (connectionId: number, targetUserId: string) => {
    if (!confirm('Are you sure you want to remove this connection? This action cannot be undone.')) {
      return;
    }

    setRemovingConnection(connectionId);
    try {
      // Get auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();

      const response = await fetch('/api/connections', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove connection');
      }

      const result = await response.json();
      if (result.success) {
        // Remove from local state
        setConnections(prev => prev.filter(c => c.id !== connectionId));
      } else {
        throw new Error(result.error || 'Failed to remove connection');
      }
    } catch (error) {
      console.error('Error removing connection:', error);
      alert('Failed to remove connection. Please try again.');
    } finally {
      setRemovingConnection(null);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    // Find the request to get the fromUserId
    const request = pendingRequests.find(r => r.id === requestId);
    if (!request) {
      console.error('Request not found');
      return;
    }

    try {
      // Get auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();

      const response = await fetch('/api/connections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fromUserId: request.otherUser.userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept connection request');
      }

      const result = await response.json();
      if (result.success) {
        // Remove from pending requests and add to connections
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));

        // Create a connected connection object
        const newConnection: Connection = {
          id: result.connection.id,
          status: 'connected',
          initiatedBy: request.initiatedBy,
          createdAt: request.createdAt,
          notes: request.notes,
          isInitiator: false, // This user didn't initiate, they accepted
          otherUser: request.otherUser
        };

        setConnections(prev => [...prev, newConnection]);

        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = 'Connection request accepted successfully!';
        document.body.appendChild(notification);
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to accept connection request');
      }
    } catch (error) {
      console.error('Error accepting connection request:', error);
      alert('Failed to accept connection request. Please try again.');
    }
  };

  const handleDeclineRequest = async (requestId: number) => {
    // Find the request to get the fromUserId
    const request = pendingRequests.find(r => r.id === requestId);
    if (!request) {
      console.error('Request not found');
      return;
    }

    try {
      // Get auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();

      const response = await fetch('/api/connections', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: request.otherUser.userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to decline connection request');
      }

      const result = await response.json();
      if (result.success) {
        // Remove from pending requests
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));

        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = 'Connection request declined.';
        document.body.appendChild(notification);
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to decline connection request');
      }
    } catch (error) {
      console.error('Error declining connection request:', error);
      alert('Failed to decline connection request. Please try again.');
    }
  };

  const handleWithdrawRequest = async (requestId: number, targetUserId: string) => {
    setRemovingConnection(requestId);
    try {
      // Get auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();

      const response = await fetch('/api/connections', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId }),
      });

      if (!response.ok) {
        throw new Error('Failed to withdraw connection request');
      }

      const result = await response.json();
      if (result.success) {
        // Remove from local state
        setSentRequests(prev => prev.filter(r => r.id !== requestId));
        // Use a more user-friendly notification instead of alert
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = 'Connection request withdrawn successfully!';
        document.body.appendChild(notification);
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to withdraw connection request');
      }
    } catch (error) {
      console.error('Error withdrawing connection request:', error);
      alert('Failed to withdraw connection request. Please try again.');
    } finally {
      setRemovingConnection(null);
    }
  };

  const filteredConnections = useMemo(() => {
    let filtered = connections;

    if (filter !== 'all') {
      filtered = filtered.filter(connection => {
        if (filter === 'athletes') return connection.otherUser.role === 'athlete';
        if (filter === 'coaches') return connection.otherUser.role === 'coach';
        if (filter === 'recruiters') return connection.otherUser.role === 'recruiter';
        return true;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(connection =>
        connection.otherUser.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        connection.otherUser.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (connection.otherUser.sport && connection.otherUser.sport.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [connections, filter, searchTerm]);

  const filteredPendingRequests = useMemo(() => {
    let filtered = pendingRequests;

    if (filter !== 'all') {
      filtered = filtered.filter(request => {
        if (filter === 'athletes') return request.otherUser.role === 'athlete';
        if (filter === 'coaches') return request.otherUser.role === 'coach';
        if (filter === 'recruiters') return request.otherUser.role === 'recruiter';
        return true;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.otherUser.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.otherUser.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.otherUser.sport && request.otherUser.sport.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [pendingRequests, filter, searchTerm]);

  const filteredSentRequests = useMemo(() => {
    let filtered = sentRequests;

    if (filter !== 'all') {
      filtered = filtered.filter(request => {
        if (filter === 'athletes') return request.otherUser.role === 'athlete';
        if (filter === 'coaches') return request.otherUser.role === 'coach';
        if (filter === 'recruiters') return request.otherUser.role === 'recruiter';
        return true;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.otherUser.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.otherUser.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.otherUser.sport && request.otherUser.sport.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [sentRequests, filter, searchTerm]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01ae79] mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading connections...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Connections</h1>
          <p className="text-muted-foreground">Manage your network of athletes, coaches, and recruiters</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search connections..."
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#01ae79]/20 focus:border-[#01ae79]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue={activeTab} className="space-y-6">
          <div className='relative'>
            <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-muted/30 p-1 text-muted-foreground w-full max-w-2xl mx-auto backdrop-blur-sm border border-border/50">
              <TabsTrigger
                value="connections"
                className="group relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:bg-muted/50 data-[state=active]:hover:bg-background min-w-0 flex-1"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Users size={16} className="transition-colors group-data-[state=active]:text-[#01ae79]" />
                    {connections.length > 0 && (
                      <div className="absolute -top-2 -right-2 flex items-center justify-center min-w-[16px] h-4 bg-[#01ae79] text-white text-[10px] font-semibold rounded-full px-1 border border-background shadow-sm">
                        {connections.length > 99 ? '99+' : connections.length}
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:inline transition-colors group-data-[state=active]:text-[#01ae79] group-data-[state=active]:font-semibold">
                    Connections
                  </span>
                  <span className="sm:hidden transition-colors group-data-[state=active]:text-[#01ae79] group-data-[state=active]:font-semibold text-xs">
                    Connected
                  </span>
                </div>
                {/* Active indicator line */}
                <div className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-[#01ae79] transition-all duration-300 group-data-[state=active]:w-8 group-data-[state=active]:-translate-x-1/2 rounded-full"></div>
              </TabsTrigger>

              <TabsTrigger
                value="requests"
                className="group relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:bg-muted/50 data-[state=active]:hover:bg-background min-w-0 flex-1"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Clock size={16} className="transition-colors group-data-[state=active]:text-[#01ae79]" />
                    {pendingRequests.length > 0 && (
                      <div className="absolute -top-2 -right-2 flex items-center justify-center min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1 border border-background shadow-sm animate-pulse">
                        {pendingRequests.length > 99 ? '99+' : pendingRequests.length}
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:inline transition-colors group-data-[state=active]:text-[#01ae79] group-data-[state=active]:font-semibold">
                    Requests
                  </span>
                  <span className="sm:hidden transition-colors group-data-[state=active]:text-[#01ae79] group-data-[state=active]:font-semibold text-xs">
                    Requests
                  </span>
                </div>
                {/* Active indicator line */}
                <div className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-[#01ae79] transition-all duration-300 group-data-[state=active]:w-8 group-data-[state=active]:-translate-x-1/2 rounded-full"></div>
              </TabsTrigger>

              <TabsTrigger
                value="sent-requests"
                className="group relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:bg-muted/50 data-[state=active]:hover:bg-background min-w-0 flex-1"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Send size={16} className="transition-colors group-data-[state=active]:text-[#01ae79]" />
                    {sentRequests.length > 0 && (
                      <div className="absolute -top-2 -right-2 flex items-center justify-center min-w-[16px] h-4 bg-blue-500 text-white text-[10px] font-semibold rounded-full px-1 border border-background shadow-sm">
                        {sentRequests.length > 99 ? '99+' : sentRequests.length}
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:inline transition-colors group-data-[state=active]:text-[#01ae79] group-data-[state=active]:font-semibold">
                    Sent Requests
                  </span>
                  <span className="sm:hidden transition-colors group-data-[state=active]:text-[#01ae79] group-data-[state=active]:font-semibold text-xs">
                    Sent
                  </span>
                </div>
                {/* Active indicator line */}
                <div className="absolute bottom-0 left-1/2 h-0.5 w-0 bg-[#01ae79] transition-all duration-300 group-data-[state=active]:w-8 group-data-[state=active]:-translate-x-1/2 rounded-full"></div>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="connections" className="mt-6 min-h-[400px]">
            <FilterButtons currentFilter={filter} onFilterChange={setFilter} />

            {filteredConnections.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-muted to-muted/60 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Users className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchTerm ? 'No connections found' : 'No connections yet'}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchTerm
                    ? 'Try adjusting your search terms or filters'
                    : 'Start building your network by connecting with athletes, coaches, and recruiters'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredConnections.map(connection => (
                  <UserCard
                    key={connection.id}
                    connection={connection}
                    onRemove={handleRemoveConnection}
                    isRemoving={removingConnection === connection.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-6 min-h-[400px]">
            <FilterButtons currentFilter={filter} onFilterChange={setFilter} />

            {filteredPendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Clock className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchTerm || filter !== 'all' ? 'No pending requests found' : 'No pending requests'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || filter !== 'all'
                    ? 'Try adjusting your search terms or filters'
                    : 'You\'ll see connection requests from other users here'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPendingRequests.map(request => (
                  <PendingRequestCard
                    key={request.id}
                    request={request}
                    onAccept={handleAcceptRequest}
                    onDecline={handleDeclineRequest}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent-requests" className="mt-6 min-h-[424px]">
            <FilterButtons currentFilter={filter} onFilterChange={setFilter} />

            {filteredSentRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Send className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchTerm || filter !== 'all' ? 'No sent requests found' : 'No sent requests'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || filter !== 'all'
                    ? 'Try adjusting your search terms or filters'
                    : 'You\'ll see sent requests here'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSentRequests.map(request => (
                  <SentRequestCard
                    key={request.id}
                    request={request}
                    onWithdraw={handleWithdrawRequest}
                    isWithdrawing={removingConnection === request.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
  return (
    <AuthWrapper>
      <Suspense fallback={
        <div className="container py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01ae79] mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      }>
        <App />
      </Suspense>
    </AuthWrapper>
  );
}
