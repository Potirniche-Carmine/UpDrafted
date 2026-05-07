"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getProfileImageUrl } from "@/lib/profile-images";
import { formatSportName } from "@/lib/sports-data";
import { 
  User, 
  Users, 
  Target, 
  MapPin, 
  Shield, 
  GraduationCap, 
  Send, 
  Clock, 
  Building2 
} from "lucide-react";

// Types
interface DiscoverUser {
  id: string;
  fullName: string;
  organizationName: string;
  profileImage: string | null;
  city: string;
  state: string;
  country?: string;
  isVerified: boolean;
  role: 'athlete' | 'coach' | 'recruiter';
  sport: string;
  title?: string;
  division?: string;
  educationLevel?: string;
  hasPendingRequest: boolean;
  hasIncomingRequest: boolean;
  graduationYear?: number;
  height?: string;
  weight?: string;
  positions?: string[];
  recruitingNeeds?: {
    studentClassifications: string[];
    positions: string[];
    scholarshipsAvailable: number | null;
  } | null;
}

interface UserCardProps {
  user: DiscoverUser;
  onViewProfile: (userId: string) => void;
  generateProfileUrl: (user: DiscoverUser) => string;
}

const formatEducationLevel = (educationLevel?: string) => {
  if (educationLevel === 'high_school') return 'High School';
  if (educationLevel === 'associate') return 'Associate';
  if (educationLevel === 'undergraduate') return 'Undergraduate';
  if (educationLevel === 'graduate') return 'Graduate';
  return educationLevel;
};

const formatDivision = (division?: string) => {
  if (division === 'high_school') return 'High School';
  return division;
};

const getRoleBadge = (user: DiscoverUser) => {
  let roleText = '';
  let roleColor = '';

  if (user.role === 'athlete') {
    if (user.educationLevel === 'high_school') {
      roleText = 'HS Athlete';
      roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
    } else if (user.educationLevel === 'associate') {
      roleText = 'JC Athlete';
      roleColor = 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-700';
    } else if (user.educationLevel === 'undergraduate' || user.educationLevel === 'graduate') {
      roleText = 'College Athlete';
      roleColor = 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-700';
    } else {
      roleText = 'Athlete';
      roleColor = 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-700';
    }
  } else if (user.role === 'coach') {
    if (user.division === 'High School') {
      roleText = 'HS Coach';
      roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
    } else if (user.division === 'Club Sports') {
      roleText = 'Club Coach';
      roleColor = 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-700';
    } else if (user.division === 'Community College' || user.division === 'Junior College' || user.division?.includes('NJCAA')) {
      roleText = 'JC Coach';
      roleColor = 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-700';
    } else if (user.division?.includes('NCAA') || user.division === 'NAIA') {
      roleText = 'College Coach';
      roleColor = 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-700';
    } else {
      roleText = 'Coach';
      roleColor = 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-700';
    }
  } else if (user.role === 'recruiter') {
    if (user.division === 'High School') {
      roleText = 'HS Recruiter';
      roleColor = 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700';
    } else if (user.division === 'Club Sports') {
      roleText = 'Club Recruiter';
      roleColor = 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-700';
    } else if (user.division === 'Community College' || user.division === 'Junior College' || user.division?.includes('NJCAA')) {
      roleText = 'JC Recruiter';
      roleColor = 'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-700';
    } else if (user.division?.includes('NCAA') || user.division === 'NAIA') {
      roleText = 'College Recruiter';
      roleColor = 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-700';
    } else {
      roleText = 'Recruiter';
      roleColor = 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-700';
    }
  }

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium px-1.5 py-0.5 border whitespace-nowrap sm:px-2", roleColor)}
    >
      {roleText}
    </Badge>
  );
};

export const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onViewProfile, 
  generateProfileUrl 
}) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border border-border shadow-md bg-card hover:bg-card/90 hover:border-[#01ae79]/50 h-full flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex-1 space-y-3">
          {/* Header with Avatar, Name, and Badge */}
          <div className="flex items-start gap-3">
            {/* Avatar - Clickable */}
            <a
              href={generateProfileUrl(user)}
              className="relative flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity block"
              onClick={(e) => {
                e.preventDefault();
                onViewProfile(user.id);
              }}
            >
              <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-[#01ae79]/30 border-2 border-border">
                <AvatarImage
                  src={getProfileImageUrl(user.profileImage) || undefined}
                  alt={user.fullName || 'User'}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-[#01ae79] to-emerald-600 text-white font-semibold text-sm sm:text-base">
                  {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'UN'}
                </AvatarFallback>
              </Avatar>
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-[#01ae79] rounded-full p-1 border-2 border-background">
                  <Shield className="h-3 w-3 text-white" />
                </div>
              )}
              {!user.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1 border-2 border-background">
                  <Shield className="h-3 w-3 text-white opacity-95" />
                </div>
              )}
            </a>

            {/* Name, Organization and Badge */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <a
                    href={generateProfileUrl(user)}
                    className="font-semibold text-base text-card-foreground leading-tight break-words line-clamp-2 cursor-pointer hover:text-[#01ae79] transition-colors block"
                    onClick={(e) => {
                      e.preventDefault();
                      onViewProfile(user.id);
                    }}
                  >
                    {user.fullName || 'Unknown User'}
                  </a>
                  {user.organizationName && (
                    <p className="text-sm text-muted-foreground font-medium leading-tight break-words line-clamp-2">
                      {user.organizationName}
                    </p>
                  )}
                  {/* Title/Position for coaches/recruiters */}
                  {user.title && (user.role === 'coach' || user.role === 'recruiter') && (
                    <div className="flex items-center text-muted-foreground">
                      <span className="font-medium text-sm">{user.title}</span>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 ml-2">
                  {getRoleBadge(user)}
                </div>
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-sm">
            {/* Sport */}
            {user.sport && (  
              <div className="flex items-center text-muted-foreground col-span-full">
                <Building2 className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">{formatSportName(user.sport)}</span>
              </div>
            )}

            {/* Location with Country */}
            {(user.city || user.state || user.country) && (
              <div className="flex items-center text-muted-foreground col-span-full">
                <MapPin className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">
                  {[user.city, user.state, user.country !== 'United States' ? user.country : null]
                    .filter(Boolean)
                    .join(', ')
                  }
                </span>
              </div>
            )}

            {/* Division/Education Level */}
            {(user.division || user.educationLevel) && (
              <div className="flex items-center text-muted-foreground">
                <GraduationCap className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">{formatDivision(user.division) || formatEducationLevel(user.educationLevel)}</span>
              </div>
            )}

            {/* Scholarships Available for Coaches and Recruiters */}
            {(user.role === 'coach' || user.role === 'recruiter') && typeof user.recruitingNeeds?.scholarshipsAvailable === 'number' && (
              <div className="flex items-center text-muted-foreground">
                <Target className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">Scholarships: {user.recruitingNeeds.scholarshipsAvailable}</span>
              </div>
            )}

            {/* Athlete-specific: Height & Weight */}
            {user.role === 'athlete' && (user.height || user.weight) && (
              <div className="flex items-center text-muted-foreground">
                <User className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">
                  {[
                    user.height,
                    user.weight ? `${user.weight} lbs` : null
                  ].filter(Boolean).join(' / ')}
                </span>
              </div>
            )}

            {/* Graduation Year */}
            {user.role === 'athlete' && user.graduationYear && (
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">Class of {user.graduationYear}</span>
              </div>
            )}

            {/* Positions for athletes */}
            {user.role === 'athlete' && user.positions && user.positions.length > 0 && (
              <div className="flex items-center text-muted-foreground col-span-full">
                <Target className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">{user.positions.join(', ')}</span>
              </div>
            )}

            {/* Student Classifications for Coaches and Recruiters */}
            {(user.role === 'coach' || user.role === 'recruiter') && user.recruitingNeeds && user.recruitingNeeds.studentClassifications && user.recruitingNeeds.studentClassifications.length > 0 && (
              <div className="flex items-center text-muted-foreground col-span-full">
                <Users className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">Looking for: {user.recruitingNeeds.studentClassifications.map(classification => {
                  switch (classification) {
                    case 'high_school': return 'High School';
                    case 'university_transfers': return 'University Transfers';
                    case 'juco_students': return 'JUCO Students';
                    case 'graduate_transfers': return 'Graduate Transfers';
                    case 'international_students': return 'International Students';
                    default: return classification;
                  }
                }).join(', ')}</span>
              </div>
            )}

            {/* Positions Needed for Coaches and Recruiters */}
            {(user.role === 'coach' || user.role === 'recruiter') && user.recruitingNeeds && user.recruitingNeeds.positions && user.recruitingNeeds.positions.length > 0 && (
              <div className="flex items-center text-muted-foreground col-span-full">
                <Target className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">Positions in need: {user.recruitingNeeds.positions.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button - Always at bottom with consistent positioning */}
        <div className="pt-2 mt-auto">
          {user.hasPendingRequest ? (
            <div className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-0 shadow-sm transition-all duration-200 font-medium py-2 text-sm rounded-md flex items-center justify-center">
              <Clock className="h-4 w-4 mr-2" />
              Request Sent
            </div>
          ) : user.hasIncomingRequest ? (
            <a
              href={generateProfileUrl(user)}
              className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/30 dark:hover:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium py-2 text-sm rounded-md flex items-center justify-center no-underline"
              onClick={(e) => {
                e.preventDefault();
                onViewProfile(user.id);
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Connection Request Received - View Profile</span>
              <span className="sm:hidden">Request Received</span>
            </a>
          ) : (
            <a
              href={generateProfileUrl(user)}
              className="w-full bg-[#01ae79] hover:bg-[#01ae79]/90 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 font-medium py-2 text-sm rounded-md flex items-center justify-center no-underline"
              onClick={(e) => {
                e.preventDefault();
                onViewProfile(user.id);
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              View Profile
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
