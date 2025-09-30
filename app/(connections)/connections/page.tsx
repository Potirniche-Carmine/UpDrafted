"use client";

import React, { useState, useMemo, useEffect, Suspense, useCallback, useRef } from 'react';
import { Users, Search, MessageSquare, Shield, CheckCircle, X, Clock, MapPin, User, UserCheck, Users2, Send, Building2, Target, Filter, ChevronDown, Lock, Crown } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useRouter, useSearchParams } from 'next/navigation';

import Link from 'next/link';
import { AuthWrapper } from '../../../components/auth-wrapper';
import { sanitizeText } from '@/utils/sanitization';
import { useUser } from "@clerk/nextjs";
import { DIVISIONS, US_STATES, COUNTRIES, getPositionsForSport } from '@/lib/sports-data';
import { CONFERENCES_BY_DIVISION } from '@/lib/conference-data';
import { useFeatureAccess } from '@/components/providers/subscription-provider';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { generateProfileUrl } from "@/lib/utils";
import { SportFilter } from '@/components/ui/sport-filter';


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
    height?: string;
    weight?: string;
    positions?: string[];
    recruitingNeeds?: {
      studentClassifications: string[];
      positions: string[];
      scholarshipsAvailable: number | null;
    } | null;
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
    height?: string;
    weight?: string;
    positions?: string[];
    recruitingNeeds?: {
      studentClassifications: string[];
      positions: string[];
      scholarshipsAvailable: number | null;
    } | null;
  };
}

interface UserCardProps {
  connection: Connection;
  onRemoveConnection: (connectionId: number, targetUserId: string) => void;
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

// Filter option interface  
interface FilterOption {
  value: string;
  label: string;
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

// Helper functions from discover page
const getGraduationYearOptions = (): FilterOption[] => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i <= 6; i++) {
    years.push({
      value: (currentYear + i).toString(),
      label: `Class of ${currentYear + i}`
    });
  }
  return years;
};

const getConferencesForDivisions = (selectedDivisions: FilterOption[]): FilterOption[] => {
  // Don't show conferences for High School division
  const eligibleDivisions = selectedDivisions.filter(div => div.value !== 'High School');
  
  // If no eligible divisions are selected, return empty array (don't show all conferences)
  if (eligibleDivisions.length === 0) {
    return [];
  }
  
  const conferences = new Set<string>();
  eligibleDivisions.forEach(division => {
    const divisionConfs = CONFERENCES_BY_DIVISION[division.value] || [];
    divisionConfs.forEach(conf => conferences.add(conf));
  });
  
  return Array.from(conferences)
    .map(conf => ({ value: conf, label: conf }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

const getPositionsForSports = (selectedSports: FilterOption[]): FilterOption[] => {
  if (selectedSports.length === 0) return [];
  
  const positions = new Set<string>();
  selectedSports.forEach(sport => {
    const sportPositions = getPositionsForSport(sport.value);
    sportPositions.forEach(pos => positions.add(pos));
  });
  
  return Array.from(positions)
    .map(pos => ({ value: pos, label: pos }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

const getOrderedDivisions = () => {
  const highSchoolFirst = ['High School', ...DIVISIONS.filter(d => d !== 'High School')];
  return highSchoolFirst;
};

// Multi-select filter component
interface MultiSelectFilterProps {
  options: FilterOption[];
  selected: FilterOption[];
  onSelectionChange: (selected: FilterOption[]) => void;
  placeholder: string;
  searchPlaceholder?: string;
  className?: string;
}

function MultiSelectFilter({
  options,
  selected,
  onSelectionChange,
  placeholder,
  searchPlaceholder = "Search...",
  className
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(options);
    }
  };

  const handleToggleOption = (option: FilterOption) => {
    const isSelected = selected.some(s => s.value === option.value);
    if (isSelected) {
      onSelectionChange(selected.filter(s => s.value !== option.value));
    } else {
      onSelectionChange([...selected, option]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between text-left font-normal", className)}
        >
          <span className="truncate">
            {selected.length === 0
              ? placeholder
              : selected.length === 1
                ? selected[0].label
                : `${selected.length} selected`
            }
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] sm:w-[var(--radix-popover-trigger-width)] max-w-[90vw] p-0" align="center" side="bottom" sideOffset={4}>
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={handleSelectAll}
                className="cursor-pointer"
              >
                <Checkbox
                  checked={selected.length === options.length}
                  className="mr-2"
                />
                <span className="font-medium">
                  {selected.length === options.length ? 'Deselect All' : 'Select All'}
                </span>
              </CommandItem>

              {filteredOptions.map((option) => {
                const isSelected = selected.some(s => s.value === option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleToggleOption(option)}
                    className="cursor-pointer"
                  >
                    <Checkbox
                      checked={isSelected}
                      className="mr-2"
                    />
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Height/Weight Range Filter Component (for admin users only)
interface HeightWeightFilterProps {
  minHeight: number;
  minWeight: number;
  onHeightChange: (height: number) => void;
  onWeightChange: (weight: number) => void;
  className?: string;
  isPremium?: boolean;
  onUpgradeClick?: () => void;
}

// Helper functions for height/weight conversion
const inchesToFeetString = (totalInches: number): string => {
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return inches > 0 ? `${feet}'${inches}"` : `${feet}'`;
};

function HeightWeightFilter({
  minHeight,
  minWeight,
  onHeightChange,
  onWeightChange,
  className,
  isPremium = false,
  onUpgradeClick
}: HeightWeightFilterProps) {
  const isLocked = !isPremium;
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">
            Minimum Height: {inchesToFeetString(minHeight)}
          </Label>
          {isLocked && (
            <div 
              className="flex items-center gap-1 text-xs text-amber-600 cursor-pointer hover:text-amber-700 transition-colors" 
              onClick={onUpgradeClick}
            >
              <Crown className="h-3 w-3" />
              <span>Premium</span>
            </div>
          )}
        </div>
        <div className={cn("relative", isLocked && "pointer-events-none opacity-50")}>
          <Slider
            value={[minHeight]}
            onValueChange={(value: number[]) => onHeightChange(value[0])}
            min={48} // 4'0" (updated from 60)
            max={96} // 8'0"
            step={1}
            className="w-full"
            disabled={isLocked}
          />
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
              <Button
                variant="outline"
                size="sm"
                onClick={onUpgradeClick}
                className="text-xs"
              >
                <Lock className="h-3 w-3 mr-1" />
                Upgrade for Height Filter
              </Button>
            </div>
          )}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>4&apos;0&quot;</span>
          <span>8&apos;0&quot;</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">
            Minimum Weight: {minWeight} lbs
          </Label>
          {isLocked && (
            <div 
              className="flex items-center gap-1 text-xs text-amber-600 cursor-pointer hover:text-amber-700 transition-colors" 
              onClick={onUpgradeClick}
            >
              <Crown className="h-3 w-3" />
              <span>Premium</span>
            </div>
          )}
        </div>
        <div className={cn("relative", isLocked && "pointer-events-none opacity-50")}>
          <Slider
            value={[minWeight]}
            onValueChange={(value: number[]) => onWeightChange(value[0])}
            min={50} // Updated from 100
            max={500}
            step={5}
            className="w-full"
            disabled={isLocked}
          />
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
              <Button
                variant="outline"
                size="sm"
                onClick={onUpgradeClick}
                className="text-xs"
              >
                <Lock className="h-3 w-3 mr-1" />
                Upgrade for Weight Filter
              </Button>
            </div>
          )}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>50 lbs</span>
          <span>500 lbs</span>
        </div>
      </div>
    </div>
  );
}

// Verified Filter Component
interface VerifiedFilterProps {
  verifiedFilter: boolean | null;
  onVerifiedChange: (verified: boolean | null) => void;
  className?: string;
  isPremium?: boolean;
  onUpgradeClick?: () => void;
}

function VerifiedFilter({
  verifiedFilter,
  onVerifiedChange,
  className,
  isPremium = false,
  onUpgradeClick
}: VerifiedFilterProps) {
  const isLocked = !isPremium;
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">
          Verification Status
        </Label>
        {isLocked && (
          <div 
            className="flex items-center gap-1 text-xs text-amber-600 cursor-pointer hover:text-amber-700 transition-colors" 
            onClick={onUpgradeClick}
          >
            <Crown className="h-3 w-3" />
            <span>Premium</span>
          </div>
        )}
      </div>
      
      <div className={cn("relative", isLocked && "pointer-events-none opacity-50")}>
        <div 
          className={cn(
            "flex items-center justify-between p-3 border rounded-md transition-all duration-200",
            !isLocked && "cursor-pointer hover:bg-accent/50",
            verifiedFilter === true 
              ? "bg-primary/10 border-primary/20 hover:bg-primary/20" 
              : "bg-background border-border hover:bg-accent/30"
          )}
          onClick={!isLocked ? () => onVerifiedChange(verifiedFilter === true ? null : true) : undefined}
        >
          <div className="flex items-center gap-2">
            <Shield className={cn(
              "h-4 w-4",
              verifiedFilter === true ? "text-primary" : "text-muted-foreground"
            )} />
            <span className="text-sm font-medium">Verified Only</span>
          </div>
          <div className={cn(
            "px-3 py-1 rounded text-xs font-medium transition-colors",
            verifiedFilter === true 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          )}>
            {verifiedFilter === true ? "On" : "Off"}
          </div>
        </div>
        
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
            <Button
              variant="outline"
              size="sm"
              onClick={onUpgradeClick}
              className="text-xs"
            >
              <Lock className="h-3 w-3 mr-1" />
              Upgrade for Verified Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const UserCard: React.FC<UserCardProps> = ({ connection, onRemoveConnection }) => {
  const router = useRouter();
  const { otherUser } = connection;

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
    const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://bucket.updrafted.us';
    return `${baseUrl}/${profileImage}`;
  };

  return (
    <div className="relative">
      <Card className="group transition-all duration-200 hover:shadow-xl hover:shadow-[#01ae79]/15 border border-border hover:border-[#01ae79]/40 dark:hover:border-[#01ae79]/50 overflow-hidden">
        <CardContent className="p-3 sm:p-4 md:p-5">
          {/* Header Section with Date */}
          <Link 
            href={generateProfileUrl(otherUser.fullName, otherUser.userId)}
            className="block"
          >
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
                  {otherUser.isVerified ? (
                    <div className="absolute -bottom-1 -right-1 bg-[#01ae79] rounded-full p-1 border-2 border-background">
                      <Shield className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1 border-2 border-background">
                      <Shield className="h-3 w-3 text-whiteopacity-95" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base text-foreground leading-tight hover:text-[#01ae79] transition-colors flex-1 min-w-0">
                      {otherUser.fullName}
                    </h3>
                    <span className="text-xs text-muted-foreground font-medium flex-shrink-0 mt-0.5">
                      {formatDate(connection.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {getRoleBadge(otherUser.role, otherUser.division, otherUser.educationLevel)}
                  </div>

                  <p className="text-sm font-medium text-muted-foreground truncate">
                    {otherUser.title || (otherUser.role === 'athlete' ? otherUser.sport : 'No title specified')}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Status Section */}
          <div className="mb-3 md:mb-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#01ae79]/10 text-[#01ae79] rounded-full border border-[#01ae79]/20">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#01ae79] rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium">Connected</span>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 gap-2 text-sm mb-3 md:mb-4">
            {/* Organization */}
            <div className="flex items-center text-muted-foreground">
              <Building2 className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
              <span className="font-medium truncate">{otherUser.organizationName}</span>
            </div>

            {/* Sport */}
            {otherUser.sport && (
              <div className="flex items-center text-muted-foreground">
                <User className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">{otherUser.sport}</span>
              </div>
            )}

            {/* Scholarships Available for Coaches and Recruiters */}
            {(otherUser.role === 'coach' || otherUser.role === 'recruiter') && otherUser.recruitingNeeds?.scholarshipsAvailable !== null && otherUser.recruitingNeeds?.scholarshipsAvailable !== undefined && (
              <div className="flex items-center text-muted-foreground">
                <Target className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">Scholarships: {otherUser.recruitingNeeds.scholarshipsAvailable}</span>
              </div>
            )}

            {/* Location */}
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
              <span className="font-medium truncate">{otherUser.city}, {otherUser.state}</span>
            </div>

            {/* Athlete-specific information */}
            {otherUser.role === 'athlete' && (
              <>
                {/* Height & Weight */}
                {(otherUser.height || otherUser.weight) && (
                  <div className="flex items-center text-muted-foreground">
                    <User className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                    <span className="font-medium">
                      {[
                        otherUser.height, 
                        otherUser.weight ? `${otherUser.weight} lbs` : null
                      ].filter(Boolean).join(' / ')}
                    </span>
                  </div>
                )}

                {/* Graduation Year */}
                {otherUser.graduationYear && (
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                    <span className="font-medium">Class of {otherUser.graduationYear}</span>
                  </div>
                )}

                {/* Positions */}
                {otherUser.positions && otherUser.positions.length > 0 && (
                  <div className="flex items-center text-muted-foreground">
                    <Target className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                    <span className="font-medium">{otherUser.positions.join(', ')}</span>
                  </div>
                )}
              </>
            )}

            {/* Student Classifications for Coaches and Recruiters */}
            {(otherUser.role === 'coach' || otherUser.role === 'recruiter') && otherUser.recruitingNeeds && otherUser.recruitingNeeds.studentClassifications && otherUser.recruitingNeeds.studentClassifications.length > 0 && (
              <div className="flex items-center text-muted-foreground">
                <Users className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">Looking for: {otherUser.recruitingNeeds.studentClassifications.map(classification => {
                  switch(classification) {
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
            {(otherUser.role === 'coach' || otherUser.role === 'recruiter') && otherUser.recruitingNeeds && otherUser.recruitingNeeds.positions && otherUser.recruitingNeeds.positions.length > 0 && (
              <div className="flex items-center text-muted-foreground">
                <Target className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">Positions in need: {otherUser.recruitingNeeds.positions.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 md:pt-4 border-t border-border/50 space-y-2">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push('/messages');
              }}
              className="w-full h-8 sm:h-8 md:h-9 bg-[#01ae79] hover:bg-[#01ae79]/90 text-white text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
            >
              <MessageSquare size={14} className="mr-1.5 sm:mr-2" />  
              Send Message
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemoveConnection(connection.id, otherUser.userId);
              }}
              variant="outline"
              className="w-full h-8 sm:h-8 md:h-9 text-xs sm:text-sm font-medium hover:bg-destructive/10 dark:hover:bg-destructive/50 hover:text-destructive-foreground hover:border-destructive"
            >
              <X size={14} className="mr-1.5 sm:mr-2" />  
              Remove Connection
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

  // Format date as "June 3rd, 2025" with shorter format for mobile
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
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
      <Card className="group transition-all duration-200 hover:shadow-xl hover:shadow-[#01ae79]/15 border border-border hover:border-[#01ae79]/40 dark:hover:border-[#01ae79]/50 overflow-hidden">
        <CardContent className="p-3 sm:p-4 md:p-5">
          {/* Header Section with Date */}
          <Link 
            href={generateProfileUrl(otherUser.fullName, otherUser.userId)}
            className="block"
          >
            <div className="flex items-start justify-between mb-3 md:mb-4 gap-3">
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
                  {otherUser.isVerified ? (
                    <div className="absolute -bottom-1 -right-1 bg-[#01ae79] rounded-full p-1 border-2 border-background">
                      <Shield className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1 border-2 border-background">
                      <Shield className="h-3 w-3 text-whiteopacity-95" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base text-foreground leading-tight hover:text-[#01ae79] transition-colors flex-1 min-w-0">
                      {otherUser.fullName}
                    </h3>
                    <span className="text-xs text-muted-foreground font-medium flex-shrink-0 mt-0.5">
                      {formatDate(request.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="flex-shrink-0">
                      {getRoleBadge(otherUser.role, otherUser.division, otherUser.educationLevel)}
                    </div>
                  </div>

                  <p className="text-sm font-medium text-muted-foreground truncate">
                    {otherUser.title || (otherUser.role === 'athlete' ? otherUser.sport : 'No title specified')}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Status Section */}
          <div className="mb-3 md:mb-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-700">
              <Clock size={10} className="sm:hidden" />
              <Clock size={12} className="hidden sm:block" />
              <span className="text-xs sm:text-sm font-medium">Pending Request</span>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 gap-2 text-sm mb-3 md:mb-4">
            {/* Organization */}
            <div className="flex items-center text-muted-foreground">
              <Building2 className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
              <span className="font-medium truncate">{otherUser.organizationName}</span>
            </div>

            {/* Sport */}
            {otherUser.sport && (
              <div className="flex items-center text-muted-foreground">
                <User className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">{otherUser.sport}</span>
              </div>
            )}

            {/* Scholarships Available for Coaches and Recruiters */}
            {(otherUser.role === 'coach' || otherUser.role === 'recruiter') && otherUser.recruitingNeeds?.scholarshipsAvailable !== null && otherUser.recruitingNeeds?.scholarshipsAvailable !== undefined && (
              <div className="flex items-center text-muted-foreground">
                <Target className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">Scholarships: {otherUser.recruitingNeeds.scholarshipsAvailable}</span>
              </div>
            )}

            {/* Location */}
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
              <span className="font-medium truncate">{otherUser.city}, {otherUser.state}</span>
            </div>

            {/* Athlete-specific information */}
            {otherUser.role === 'athlete' && (
              <>
                {/* Height & Weight */}
                {(otherUser.height || otherUser.weight) && (
                  <div className="flex items-center text-muted-foreground">
                    <User className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                    <span className="font-medium">
                      {[
                        otherUser.height, 
                        otherUser.weight ? `${otherUser.weight} lbs` : null
                      ].filter(Boolean).join(' / ')}
                    </span>
                  </div>
                )}

                {/* Graduation Year */}
                {otherUser.graduationYear && (
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                    <span className="font-medium">Class of {otherUser.graduationYear}</span>
                  </div>
                )}

                {/* Positions */}
                {otherUser.positions && otherUser.positions.length > 0 && (
                  <div className="flex items-center text-muted-foreground">
                    <Target className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                    <span className="font-medium">{otherUser.positions.join(', ')}</span>
                  </div>
                )}
              </>
            )}

            {/* Student Classifications for Coaches and Recruiters */}
            {(otherUser.role === 'coach' || otherUser.role === 'recruiter') && otherUser.recruitingNeeds && otherUser.recruitingNeeds.studentClassifications && otherUser.recruitingNeeds.studentClassifications.length > 0 && (
              <div className="flex items-center text-muted-foreground">
                <Users className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">Looking for: {otherUser.recruitingNeeds.studentClassifications.map(classification => {
                  switch(classification) {
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
            {(otherUser.role === 'coach' || otherUser.role === 'recruiter') && otherUser.recruitingNeeds && otherUser.recruitingNeeds.positions && otherUser.recruitingNeeds.positions.length > 0 && (
              <div className="flex items-center text-muted-foreground">
                <Target className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">Positions in need: {otherUser.recruitingNeeds.positions.join(', ')}</span>
              </div>
            )}
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
              size="sm"
              variant="outline"
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

  // Format date as "June 3rd, 2025" with shorter format for mobile
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
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
      <Card className="group transition-all duration-200 hover:shadow-xl hover:shadow-[#01ae79]/15 border border-border hover:border-[#01ae79]/40 dark:hover:border-[#01ae79]/50 overflow-hidden">
        <CardContent className="p-3 sm:p-4 md:p-5">
          {/* Header Section with Date */}
          <Link 
            href={generateProfileUrl(otherUser.fullName, otherUser.userId)}
            className="block"
          >
            <div className="flex items-start justify-between mb-3 md:mb-4 gap-3">
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
                  {otherUser.isVerified ? (
                    <div className="absolute -bottom-1 -right-1 bg-[#01ae79] rounded-full p-1 border-2 border-background">
                      <Shield className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1 border-2 border-background">
                      <Shield className="h-3 w-3 text-whiteopacity-95" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base text-foreground leading-tight hover:text-[#01ae79] transition-colors flex-1 min-w-0">
                      {otherUser.fullName}
                    </h3>
                    <span className="text-xs text-muted-foreground font-medium flex-shrink-0 mt-0.5">
                      {formatDate(request.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="flex-shrink-0">
                      {getRoleBadge(otherUser.role, otherUser.division, otherUser.educationLevel)}
                    </div>
                  </div>

                  <p className="text-sm font-medium text-muted-foreground truncate">
                    {otherUser.title || (otherUser.role === 'athlete' ? otherUser.sport : 'No title specified')}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Status Section */}
          <div className="mb-3 md:mb-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-700">
              <Send size={10} className="sm:hidden" />
              <Send size={12} className="hidden sm:block" />
              <span className="text-xs sm:text-sm font-medium">Request Sent</span>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 gap-2 text-sm mb-3 md:mb-4">
            {/* Organization */}
            <div className="flex items-center text-muted-foreground">
              <Building2 className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
              <span className="font-medium truncate">{otherUser.organizationName}</span>
            </div>

            {/* Sport */}
            {otherUser.sport && (
              <div className="flex items-center text-muted-foreground">
                <User className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">{otherUser.sport}</span>
              </div>
            )}

            {/* Scholarships Available for Coaches and Recruiters */}
            {(otherUser.role === 'coach' || otherUser.role === 'recruiter') && otherUser.recruitingNeeds?.scholarshipsAvailable !== null && otherUser.recruitingNeeds?.scholarshipsAvailable !== undefined && (
              <div className="flex items-center text-muted-foreground">
                <Target className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">Scholarships: {otherUser.recruitingNeeds.scholarshipsAvailable}</span>
              </div>
            )}

            {/* Location */}
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
              <span className="font-medium truncate">{otherUser.city}, {otherUser.state}</span>
            </div>

            {/* Athlete-specific information */}
            {otherUser.role === 'athlete' && (
              <>
                {/* Height & Weight */}
                {(otherUser.height || otherUser.weight) && (
                  <div className="flex items-center text-muted-foreground">
                    <User className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                    <span className="font-medium">
                      {[
                        otherUser.height, 
                        otherUser.weight ? `${otherUser.weight} lbs` : null
                      ].filter(Boolean).join(' / ')}
                    </span>
                  </div>
                )}

                {/* Graduation Year */}
                {otherUser.graduationYear && (
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                    <span className="font-medium">Class of {otherUser.graduationYear}</span>
                  </div>
                )}

                {/* Positions */}
                {otherUser.positions && otherUser.positions.length > 0 && (
                  <div className="flex items-center text-muted-foreground">
                    <Target className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                    <span className="font-medium">{otherUser.positions.join(', ')}</span>
                  </div>
                )}
              </>
            )}

            {/* Student Classifications for Coaches and Recruiters */}
            {(otherUser.role === 'coach' || otherUser.role === 'recruiter') && otherUser.recruitingNeeds && otherUser.recruitingNeeds.studentClassifications && otherUser.recruitingNeeds.studentClassifications.length > 0 && (
              <div className="flex items-center text-muted-foreground">
                <Users className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">Looking for: {otherUser.recruitingNeeds.studentClassifications.map(classification => {
                  switch(classification) {
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
            {(otherUser.role === 'coach' || otherUser.role === 'recruiter') && otherUser.recruitingNeeds && otherUser.recruitingNeeds.positions && otherUser.recruitingNeeds.positions.length > 0 && (
              <div className="flex items-center text-muted-foreground">
                <Target className="h-4 w-4 mr-2 text-[#01ae79] flex-shrink-0" />
                <span className="font-medium">Positions in need: {otherUser.recruitingNeeds.positions.join(', ')}</span>
              </div>
            )}
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

// Advanced Filters Component
interface AdvancedFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  selectedSports: FilterOption[];
  setSelectedSports: (sports: FilterOption[]) => void;
  selectedDivisions: FilterOption[];
  setSelectedDivisions: (divisions: FilterOption[]) => void;
  selectedCountries: FilterOption[];
  setSelectedCountries: (countries: FilterOption[]) => void;
  selectedStates: FilterOption[];
  setSelectedStates: (states: FilterOption[]) => void;
  selectedPositions: FilterOption[];
  setSelectedPositions: (positions: FilterOption[]) => void;
  selectedGraduatingClasses: FilterOption[];
  setSelectedGraduatingClasses: (classes: FilterOption[]) => void;
  selectedConferences: FilterOption[];
  setSelectedConferences: (conferences: FilterOption[]) => void;
  selectedRequestTypes: FilterOption[];
  setSelectedRequestTypes: (types: FilterOption[]) => void;
  minHeight: number;
  setMinHeight: (height: number) => void;
  minWeight: number;
  setMinWeight: (weight: number) => void;
  verifiedFilter: boolean | null;
  setVerifiedFilter: (verified: boolean | null) => void;
  userRole: string;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  activeTab: string;
  hasAdvancedSearch: boolean;
  onUpgradeClick: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  currentFilter,
  onFilterChange,
  selectedSports,
  setSelectedSports,
  selectedDivisions,
  setSelectedDivisions,
  selectedCountries,
  setSelectedCountries,
  selectedStates,
  setSelectedStates,
  selectedPositions,
  setSelectedPositions,
  selectedGraduatingClasses,
  setSelectedGraduatingClasses,
  selectedConferences,
  setSelectedConferences,
  selectedRequestTypes,
  setSelectedRequestTypes,
  minHeight,
  setMinHeight,
  minWeight,
  setMinWeight,
  verifiedFilter,
  setVerifiedFilter,
  userRole,
  onApplyFilters,
  onClearFilters,
  activeTab,
  hasAdvancedSearch,
  onUpgradeClick,

}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Basic role filters for connections - exclude athletes filter for athlete users
  const basicFilters = useMemo(() => {
    const allFilters = [
      { id: 'all', label: 'All', icon: Users },
      { id: 'athletes', label: 'Athletes', icon: User },
      { id: 'coaches', label: 'Coaches', icon: UserCheck },
      { id: 'recruiters', label: 'Recruiters', icon: Users2 }
    ];
    
    // Remove athletes option if user is an athlete (they can't connect to other athletes)
    if (userRole === 'athlete') {
      return allFilters.filter(filter => filter.id !== 'athletes');
    }
    
    return allFilters;
  }, [userRole]);

  // Request type filter options (for pending/sent requests) - exclude athletes for athlete users
  const requestTypeOptions = useMemo(() => {
    const allOptions = [
      { value: 'athletes', label: 'Athletes' },
      { value: 'coaches', label: 'Coaches' },
      { value: 'recruiters', label: 'Recruiters' }
    ];
    
    // Remove athletes option if user is an athlete
    if (userRole === 'athlete') {
      return allOptions.filter(option => option.value !== 'athletes');
    }
    
    return allOptions;
  }, [userRole]);

  // Filter options
  // Using SportFilter for categorized sport filtering

  const divisionsOptions = useMemo(() =>
    getOrderedDivisions().map(division => ({
      value: division,
      label: division
    }))
  , []);

  const statesOptions = useMemo(() =>
    US_STATES.map(state => ({
      value: state,
      label: state
    }))
  , []);

  const countryOptions = useMemo(() =>
    COUNTRIES.map(country => ({
      value: country,
      label: country
    }))
  , []);

  const showStatesFilter = useMemo(() =>
    selectedCountries.some(country => country.value === 'United States')
  , [selectedCountries]);

  const positionsOptions = useMemo(() =>
    getPositionsForSports(selectedSports)
  , [selectedSports]);

  const graduatingClassOptions = useMemo(() =>
    getGraduationYearOptions()
  , []);

  const conferencesOptions = useMemo(() =>
    getConferencesForDivisions(selectedDivisions)
  , [selectedDivisions]);

  // Check if user is admin to show all filters
  const isAdmin = userRole === 'admin';

  // Check if any advanced filters are applied
  const hasAdvancedFilters = selectedSports.length > 0 || 
    selectedDivisions.length > 0 || 
    selectedCountries.length > 1 || // More than just United States
    selectedStates.length > 0 ||
    selectedPositions.length > 0 ||
    selectedGraduatingClasses.length > 0 ||
    selectedConferences.length > 0 ||
    selectedRequestTypes.length > 0 ||
    verifiedFilter !== null || // Include verification filter
    (isAdmin && (minHeight > 48 || minWeight > 50)); // Include height/weight for admin

  return (
    <div className="space-y-4 mb-6">
      {/* Basic Role Filters */}
      <div className="flex flex-wrap gap-2">
        {basicFilters.map((filter) => {
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
        
        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`h-9 ${hasAdvancedFilters ? 'border-[#01ae79] text-[#01ae79]' : ''}`}
        >
          <Filter size={16} className="mr-2" />
          Advanced {hasAdvancedFilters && <span className="ml-1 text-xs">({Object.values({
            sports: selectedSports.length,
            divisions: selectedDivisions.length,
            countries: selectedCountries.length > 1 ? selectedCountries.length : 0,
            states: selectedStates.length,
            positions: selectedPositions.length,
            classes: selectedGraduatingClasses.length,
            conferences: selectedConferences.length,
            requestTypes: selectedRequestTypes.length,
            verified: verifiedFilter !== null ? 1 : 0, // Include verification filter
            height: (userRole === 'coach' || userRole === 'recruiter' || isAdmin) && minHeight > 48 ? 1 : 0, // Updated from 60 to 48
            weight: (userRole === 'coach' || userRole === 'recruiter' || isAdmin) && minWeight > 50 ? 1 : 0 // Updated from 100 to 50
          }).reduce((a, b) => a + b, 0)})</span>}
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="border border-border rounded-lg p-3 sm:p-4 space-y-1.5 sm:space-y-4 bg-muted/30">
          {/* Basic Filters Grid - Fixed layout to prevent shifts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Sports Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Sports
                {(userRole === 'coach' || userRole === 'recruiter') && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    💡 Select one sport to filter by positions
                  </span>
                )}
              </Label>
              <SportFilter
                selected={selectedSports}
                onSelectionChange={setSelectedSports}
                placeholder="Select sports..."
                searchPlaceholder="Search sports..."

              />
            </div>

            {/* Divisions Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Divisions</Label>
              <MultiSelectFilter
                options={divisionsOptions}
                selected={selectedDivisions}
                onSelectionChange={setSelectedDivisions}
                placeholder="Select divisions..."
                searchPlaceholder="Search divisions..."
              />
            </div>

            {/* Countries Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Countries</Label>
              <MultiSelectFilter
                options={countryOptions}
                selected={selectedCountries}
                onSelectionChange={setSelectedCountries}
                placeholder="Select countries..."
                searchPlaceholder="Search countries..."
              />
            </div>

            {/* States Filter - Always reserve space to prevent layout shift */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {showStatesFilter ? 'States (US)' : 'States'}
              </Label>
              {showStatesFilter ? (
                <MultiSelectFilter
                  options={statesOptions}
                  selected={selectedStates}
                  onSelectionChange={setSelectedStates}
                  placeholder="Select states..."
                  searchPlaceholder="Search states..."
                />
              ) : (
                <div className="h-10 flex items-center px-3 py-2 border border-border rounded-md bg-muted/50 text-muted-foreground text-sm">
                  Select United States to filter by states
                </div>
              )}
            </div>

            {/* Request Type Filter - Reserve space for pending/sent requests tabs */}
            {(activeTab === 'requests' || activeTab === 'sent-requests') ? (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Request Types</Label>
                {requestTypeOptions.length > 0 ? (
                  <MultiSelectFilter
                    options={requestTypeOptions}
                    selected={selectedRequestTypes}
                    onSelectionChange={setSelectedRequestTypes}
                    placeholder="Filter by user type..."
                    searchPlaceholder="Search user types..."
                  />
                ) : (
                  <div className="h-10 flex items-center px-3 py-2 border border-border rounded-md bg-muted/50 text-muted-foreground text-sm">
                    No request type filters available
                  </div>
                )}
              </div>
            ) : (
              // Placeholder to maintain consistent spacing on connections tab
              <div className="h-[60px]"></div>
            )}
          </div>

          {/* Advanced Filters for Coaches/Recruiters - Fixed positioning */}
          {(userRole === 'coach' || userRole === 'recruiter' || isAdmin) && (
            <div className="space-y-1.5 sm:space-y-4">
              {/* Advanced Filters */}
              <div className="border-t border-border pt-1 sm:pt-3 relative">
                <Label className="text-sm font-medium mb-1 sm:mb-3 block">Advanced Filters</Label>
                <div className="space-y-1.5 sm:space-y-4">
                  {/* Graduating Class - First in advanced filters */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Graduating Class</Label>
                    {hasAdvancedSearch ? (
                      <MultiSelectFilter
                        options={graduatingClassOptions}
                        selected={selectedGraduatingClasses}
                        onSelectionChange={setSelectedGraduatingClasses}
                        placeholder="Select graduation years..."
                        searchPlaceholder="Search years..."
                      />
                    ) : (
                      <div className="h-10 flex items-center px-3 py-2 border border-border rounded-md bg-muted/50 text-muted-foreground text-sm">
                        Premium feature - Upgrade to filter by graduation year
                      </div>
                    )}
                  </div>
                  
                  {/* Positions Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Positions</Label>
                    {selectedSports.length > 0 && positionsOptions.length > 0 ? (
                      hasAdvancedSearch ? (
                        <MultiSelectFilter
                          options={positionsOptions}
                          selected={selectedPositions}
                          onSelectionChange={setSelectedPositions}
                          placeholder="Select positions..."
                          searchPlaceholder="Search positions..."
                        />
                      ) : (
                        <div className="h-10 flex items-center px-3 py-2 border border-border rounded-md bg-muted/50 text-muted-foreground text-sm">
                          Premium feature - Upgrade to filter by positions
                        </div>
                      )
                    ) : (
                      <div className="h-10 flex items-center px-3 py-2 border border-border rounded-md bg-muted/50 text-muted-foreground text-sm">
                        {selectedSports.length === 0 ? 'Select sports to filter by positions' : 'No positions available'}
                      </div>
                    )}
                  </div>

                  {/* Conferences Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Conferences</Label>
                    {selectedDivisions.length > 0 && conferencesOptions.length > 0 ? (
                      hasAdvancedSearch ? (
                        <MultiSelectFilter
                          options={conferencesOptions}
                          selected={selectedConferences}
                          onSelectionChange={setSelectedConferences}
                          placeholder="Select conferences..."
                          searchPlaceholder="Search conferences..."
                        />
                      ) : (
                        <div className="h-10 flex items-center px-3 py-2 border border-border rounded-md bg-muted/50 text-muted-foreground text-sm">
                          Premium feature - Upgrade to filter by conferences
                        </div>
                      )
                    ) : (
                      <div className="h-10 flex items-center px-3 py-2 border border-border rounded-md bg-muted/50 text-muted-foreground text-sm">
                        {selectedDivisions.length === 0 ? 'Select divisions to filter by conferences' : 'No conferences available'}
                      </div>
                    )}
                  </div>
                  
                  <HeightWeightFilter
                    minHeight={minHeight}
                    minWeight={minWeight}
                    onHeightChange={setMinHeight}
                    onWeightChange={setMinWeight}
                    isPremium={hasAdvancedSearch}
                    onUpgradeClick={onUpgradeClick}
                  />
                  <VerifiedFilter
                    verifiedFilter={verifiedFilter}
                    onVerifiedChange={setVerifiedFilter}
                    isPremium={hasAdvancedSearch}
                    onUpgradeClick={onUpgradeClick}
                  />
                </div>
                
                {/* Professional Premium Overlay */}
                {!hasAdvancedSearch && (
                  <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-background/15 to-background/20 backdrop-blur-[1px] rounded-lg border border-border/30 flex items-center justify-center">
                    <div className="text-center space-y-3 p-6 bg-background/90 rounded-lg border border-border/50 shadow-lg backdrop-blur-sm">
                      <div className="flex items-center justify-center space-x-2">
                        <Crown className="h-6 w-6 text-amber-500" />
                        <span className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                          Advanced Filters
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Unlock graduation year, positions, conferences, height/weight requirements, and verification status
                      </p>
                      <div className="flex justify-center">
                        <Button
                          onClick={() => window.location.href = '/pricing'}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-whiteborder-0 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade for Advanced Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Advanced Filters for Athletes - Similar to discover page */}
          {userRole === 'athlete' && (
            <div className="space-y-4">
              {/* Advanced Filters */}
              <div className="border-t border-border pt-4 relative">
                <Label className="text-sm font-medium mb-4 block">Advanced Filters</Label>
                
                {!hasAdvancedSearch ? (
                  <div className="relative">
                    {/* Preview/Locked State */}
                    <div className="space-y-4 pointer-events-none opacity-50">
                      {/* Conferences Filter Preview */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Conferences</Label>
                        <div className="h-10 flex items-center px-3 py-2 border border-border rounded-md bg-muted/50 text-muted-foreground text-sm">
                          Filter by conferences...
                        </div>
                      </div>
                      
                      {/* Verification Filter Preview */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Verification Status</Label>
                        <div className="h-10 flex items-center px-3 py-2 border border-border rounded-md bg-muted/50 text-muted-foreground text-sm">
                          Filter by verification...
                        </div>
                      </div>
                    </div>
                    
                    {/* Premium Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-background/20 via-background/15 to-background/20 backdrop-blur-[1px] rounded-lg border border-border/30 flex items-center justify-center">
                      <div className="text-center space-y-3 p-6 bg-background/90 rounded-lg border border-border/50 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center justify-center space-x-2">
                          <Crown className="h-6 w-6 text-amber-500" />
                          <span className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                            Advanced Filters
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                          Filter coaches and recruiters by conferences and verification status
                        </p>
                        <div className="flex justify-center">
                          <Button
                            onClick={() => window.location.href = '/pricing'}
                            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-whiteborder-0 shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Conferences Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Conferences</Label>
                      {selectedDivisions.length > 0 && conferencesOptions.length > 0 ? (
                        <MultiSelectFilter
                          options={conferencesOptions}
                          selected={selectedConferences}
                          onSelectionChange={setSelectedConferences}
                          placeholder="Select conferences..."
                          searchPlaceholder="Search conferences..."
                        />
                      ) : (
                        <div className="h-10 flex items-center px-3 py-2 border border-border rounded-md bg-muted/50 text-muted-foreground text-sm">
                          {selectedDivisions.length === 0 ? 'Select divisions to filter by conferences' : 'No conferences available'}
                        </div>
                      )}
                    </div>
                    
                    {/* Verification Filter */}
                    <VerifiedFilter
                      verifiedFilter={verifiedFilter}
                      onVerifiedChange={setVerifiedFilter}
                      isPremium={hasAdvancedSearch}
                      onUpgradeClick={onUpgradeClick}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={onApplyFilters}
              size="sm"
              className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
            >
              Apply Filters
            </Button>
            <Button
              onClick={onClearFilters}
              variant="outline"
              size="sm"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  const router = useRouter();
  const { user } = useUser();
  const effectiveRole = user?.publicMetadata?.role as string;
  const searchParams = useSearchParams();
  
  // Ref to prevent double mounting in React StrictMode
  const hasInitializedRef = useRef(false);
  // Request deduplication
  const pendingRequestRef = useRef<Promise<{ connected: Connection[], incoming: PendingRequest[], outgoing: PendingRequest[] }> | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get subscription features using the custom hook
  const features = useFeatureAccess();
  const hasAdvancedSearch = features.advancedSearch;

  // Since we're on the connections page, we don't need default sport selection
  
  // Advanced filter states
  const [selectedSports, setSelectedSports] = useState<FilterOption[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<FilterOption[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<FilterOption[]>([
    { value: 'United States', label: 'United States' } // Default to United States
  ]);
  const [selectedStates, setSelectedStates] = useState<FilterOption[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<FilterOption[]>([]);
  const [selectedGraduatingClasses, setSelectedGraduatingClasses] = useState<FilterOption[]>([]);
  const [selectedConferences, setSelectedConferences] = useState<FilterOption[]>([]);
  const [selectedRequestTypes, setSelectedRequestTypes] = useState<FilterOption[]>([]);
  
  // Height/Weight filters (for admin users)
  const [minHeight, setMinHeight] = useState(48); // 4'0" (updated from 60)
  const [minWeight, setMinWeight] = useState(50); // 50 lbs (updated from 100)
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | null>(null); // null = all, true = verified only
  const [clearingFilters, setClearingFilters] = useState(false);

  // No default sport selection needed for connections page



  interface FilterData {
    sports?: FilterOption[];
    divisions?: FilterOption[];
    states?: FilterOption[];
    countries?: FilterOption[];
    positions?: FilterOption[];
    graduatingClasses?: FilterOption[];
    conferences?: FilterOption[];
    requestTypes?: FilterOption[];
    minHeight?: number;
    minWeight?: number;
    verifiedFilter?: boolean | null;
  }

  const fetchConnections = useCallback(async (filters: FilterData = {}) => {
    // Prevent duplicate requests
    if (pendingRequestRef.current) {
      return pendingRequestRef.current;
    }

    setLoading(true);
    
    const request = (async () => {
      try {
        // Check if we need to use the filtered API
        const hasAdvancedFilters = filters.sports?.length || 
          filters.divisions?.length || 
          filters.states?.length || 
          filters.countries?.length || 
          filters.positions?.length ||
          filters.graduatingClasses?.length ||
          filters.conferences?.length ||
          filters.requestTypes?.length ||
          (filters.minHeight && filters.minHeight > 48) ||
          (filters.minWeight && filters.minWeight > 50) ||
          filters.verifiedFilter !== null;

        if (hasAdvancedFilters) {
          // Use filtered API for advanced filters
          const response = await fetch('/api/connections/filtered', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sports: filters.sports?.map(s => s.value) || [],
              divisions: filters.divisions?.map(d => d.value) || [],
              states: filters.states?.map(s => s.value) || [],
              countries: filters.countries?.map(c => c.value) || [],
              positions: filters.positions?.map(p => p.value) || [],
              graduatingClasses: filters.graduatingClasses?.map(g => g.value) || [],
              conferences: filters.conferences?.map(c => c.value) || [],
              requestTypes: filters.requestTypes?.map(r => r.value) || [],
              minHeight: filters.minHeight && filters.minHeight > 48 ? filters.minHeight : undefined,
              minWeight: filters.minWeight && filters.minWeight > 50 ? filters.minWeight : undefined,
              verified: filters.verifiedFilter,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch filtered connections');
          }
          const data = await response.json();
          setConnections(data.connected || []);
          setPendingRequests(data.incoming || []);
          setSentRequests(data.outgoing || []);
          return data;
        } else {
          // Use regular API for basic connections (no filters)
          const response = await fetch('/api/connections');
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch connections');
          }
          const data = await response.json();
          setConnections(data.connected || []);
          setPendingRequests(data.incoming || []);
          setSentRequests(data.outgoing || []);
          return data;
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching connections:', err);
        }
        throw err;
      } finally {
        setLoading(false);
        // Clear the pending request
        pendingRequestRef.current = null;
      }
    })();

    pendingRequestRef.current = request;
    return request;
  }, []);

  // Upgrade handler
  const handleUpgradeClick = useCallback(() => {
    router.push('/pricing');
  }, [router]);

  // Initial load effect - only runs once on mount
  useEffect(() => {
    // Prevent double mounting in React StrictMode
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const initialLoad = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/connections?');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch connections');
        }
        const data = await response.json();
        setConnections(data.connected || []);
        setPendingRequests(data.incoming || []);
        setSentRequests(data.outgoing || []);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching connections:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    
    initialLoad();
  }, []); // Empty dependency array ensures this only runs once

  // Handle clearing filters - reload when filters are cleared
  useEffect(() => {
    if (clearingFilters) {
      setClearingFilters(false);
      fetchConnections(); // Fetch with no filters
    }
  }, [clearingFilters, fetchConnections]);

  const handleApplyFilters = () => {
    const filters = {
      sports: selectedSports,
      divisions: selectedDivisions,
      states: selectedStates,
      countries: selectedCountries,
      positions: selectedPositions,
      graduatingClasses: selectedGraduatingClasses,
      conferences: selectedConferences,
      requestTypes: selectedRequestTypes,
      minHeight: minHeight,
      minWeight: minWeight,
      verifiedFilter: verifiedFilter,
    };
    fetchConnections(filters);
  };

  const handleResetFilters = () => {
    setClearingFilters(true);
    setSearchTerm('');
    setSelectedSports([]);
    setSelectedDivisions([]);
    setSelectedStates([]);
    setSelectedCountries([]);
    setSelectedPositions([]);
    setSelectedGraduatingClasses([]);
    setSelectedConferences([]);
    setSelectedRequestTypes([]);
    setMinHeight(48);
    setMinWeight(50);
    setVerifiedFilter(null);
  };

  const useFilteredConnections = (
    source: (Connection | PendingRequest)[],
  ) => {
    return useMemo(() => {
      if (!searchTerm) {
        return source;
      }
      return source.filter(item => {
        const { otherUser } = item;
        const searchLower = searchTerm.toLowerCase();

        // Client-side search term filter
        return (
          otherUser.fullName.toLowerCase().includes(searchLower) ||
          (otherUser.organizationName && otherUser.organizationName.toLowerCase().includes(searchLower)) ||
          (otherUser.sport && otherUser.sport.toLowerCase().includes(searchLower))
        );
      });
    }, [source]);
  };

  const filteredConnections = useFilteredConnections(connections);
  const filteredIncomingRequests = useFilteredConnections(pendingRequests);
  const filteredOutgoingRequests = useFilteredConnections(sentRequests);

  // Connection action handlers
  const [connectionToRemove, setConnectionToRemove] = useState<{id: number, targetUserId: string, userName: string} | null>(null);
  const [requestToWithdraw, setRequestToWithdraw] = useState<{id: number, targetUserId: string, userName: string} | null>(null);
  
  // Initialize activeTab from URL search params, default to 'connections'
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    // Validate tab parameter to prevent invalid values
    if (tabParam && ['connections', 'requests', 'sent-requests'].includes(tabParam)) {
      return tabParam;
    }
    return 'connections';
  });

  const handleRemoveConnection = (connectionId: number, targetUserId: string) => {
    // Find the connection to get the user's name for the dialog
    const connection = connections.find(c => c.id === connectionId);
    const userName = connection?.otherUser.fullName || 'this user';
    
    setConnectionToRemove({ id: connectionId, targetUserId, userName });
  };

  const confirmRemoveConnection = async () => {
    if (!connectionToRemove) return;
    
    try {
      const response = await fetch('/api/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          connectionId: connectionToRemove.id, 
          targetUserId: connectionToRemove.targetUserId 
        })
      });
      
      if (response.ok) {
        fetchConnections();
      }
    } catch (error) {
      console.error('Failed to remove connection:', error);
    } finally {
      setConnectionToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    setConnectionToRemove(null);
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      const response = await fetch('/api/connections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId: requestId })
      });
      
      if (response.ok) {
        fetchConnections();
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleDeclineRequest = async (requestId: number) => {
    try {
      const response = await fetch('/api/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId: requestId })
      });
      
      if (response.ok) {
        fetchConnections();
      }
    } catch (error) {
      console.error('Failed to decline request:', error);
    }
  };

  const handleWithdrawRequest = async (requestId: number, targetUserId: string) => {
    // Find the user name for the confirmation dialog
    const request = sentRequests.find(req => req.id === requestId);
    const userName = request?.otherUser.fullName || 'this user';
    setRequestToWithdraw({ id: requestId, targetUserId, userName });
  };

  const confirmWithdrawRequest = async () => {
    if (!requestToWithdraw) return;
    
    try {
      const response = await fetch('/api/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          connectionId: requestToWithdraw.id, 
          targetUserId: requestToWithdraw.targetUserId 
        })
      });
      
      if (response.ok) {
        fetchConnections();
      }
    } catch (error) {
      console.error('Failed to withdraw request:', error);
    } finally {
      setRequestToWithdraw(null);
    }
  };

  const cancelWithdrawRequest = () => {
    setRequestToWithdraw(null);
  };

  // Alias for compatibility
  const applyFilters = handleApplyFilters;
  const clearAllFilters = handleResetFilters;

  // Show page layout first, then load data (like messages page)
  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Connections</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-2">
            {effectiveRole === 'athlete' 
              ? 'Manage your professional network of coaches and recruiters'
              : 'Manage your professional network of athletes, coaches, and recruiters'
            }
          </p>
        </div>

        {/* Verification Info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-[#01ae79] rounded-full p-0.5">
                <Shield className="h-3 w-3 text-white" />
              </div>
              <span>Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-orange-500 rounded-full p-0.5">
                <Shield className="h-3 w-3 text-white opacity-95" />
              </div>
              <span>Unverified</span>
            </div>
          </div>
        </div>

        {/* Local Search - Always show to prevent layout shift */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground flex-shrink-0" size={20} />
          <input
            type="text"
            placeholder="Search Connections..."
            className="w-full pl-10 pr-4 py-3 text-base md:text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#01ae79]/20 focus:border-[#01ae79] min-w-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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

          <TabsContent value="connections" className="mt-6 min-h-[600px] pb-8">
            <AdvancedFilters
              currentFilter={filter}
              onFilterChange={setFilter}
              selectedSports={selectedSports}
              setSelectedSports={setSelectedSports}
              selectedDivisions={selectedDivisions}
              setSelectedDivisions={setSelectedDivisions}
              selectedCountries={selectedCountries}
              setSelectedCountries={setSelectedCountries}
              selectedStates={selectedStates}
              setSelectedStates={setSelectedStates}
              selectedPositions={selectedPositions}
              setSelectedPositions={setSelectedPositions}
              selectedGraduatingClasses={selectedGraduatingClasses}
              setSelectedGraduatingClasses={setSelectedGraduatingClasses}
              selectedConferences={selectedConferences}
              setSelectedConferences={setSelectedConferences}
              selectedRequestTypes={selectedRequestTypes}
              setSelectedRequestTypes={setSelectedRequestTypes}
              minHeight={minHeight}
              setMinHeight={setMinHeight}
              minWeight={minWeight}
              setMinWeight={setMinWeight}
              verifiedFilter={verifiedFilter}
              setVerifiedFilter={setVerifiedFilter}
              hasAdvancedSearch={hasAdvancedSearch}
              onUpgradeClick={handleUpgradeClick}
              userRole={effectiveRole || ''}
              onApplyFilters={applyFilters}
              onClearFilters={clearAllFilters}
              activeTab={activeTab}

            />

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01ae79] mx-auto"></div>
                <p className="mt-4 text-muted-foreground text-sm">Loading connections...</p>
              </div>
            ) : filteredConnections.length === 0 ? (
              <div className="text-center py-8">
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
                {filteredConnections.filter((item): item is Connection => 'status' in item && item.status !== 'pending').map((connection: Connection) => (
                  <UserCard
                    key={connection.id}
                    connection={connection}
                    onRemoveConnection={handleRemoveConnection}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-6 min-h-[600px] pb-8">
            <AdvancedFilters
              currentFilter={filter}
              onFilterChange={setFilter}
              selectedSports={selectedSports}
              setSelectedSports={setSelectedSports}
              selectedDivisions={selectedDivisions}
              setSelectedDivisions={setSelectedDivisions}
              selectedCountries={selectedCountries}
              setSelectedCountries={setSelectedCountries}
              selectedStates={selectedStates}
              setSelectedStates={setSelectedStates}
              selectedPositions={selectedPositions}
              setSelectedPositions={setSelectedPositions}
              selectedGraduatingClasses={selectedGraduatingClasses}
              setSelectedGraduatingClasses={setSelectedGraduatingClasses}
              selectedConferences={selectedConferences}
              setSelectedConferences={setSelectedConferences}
              selectedRequestTypes={selectedRequestTypes}
              setSelectedRequestTypes={setSelectedRequestTypes}
              minHeight={minHeight}
              setMinHeight={setMinHeight}
              minWeight={minWeight}
              setMinWeight={setMinWeight}
              verifiedFilter={verifiedFilter}
              setVerifiedFilter={setVerifiedFilter}
              hasAdvancedSearch={hasAdvancedSearch}
              onUpgradeClick={handleUpgradeClick}
              userRole={effectiveRole || ''}
              onApplyFilters={applyFilters}
              onClearFilters={clearAllFilters}
              activeTab={activeTab}
            />

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01ae79] mx-auto"></div>
                <p className="mt-4 text-muted-foreground text-sm">Loading requests...</p>
              </div>
            ) : filteredIncomingRequests.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Clock className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchTerm || filter !== 'all' ? 'No pending requests found' : 'No pending requests'}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchTerm || filter !== 'all'
                    ? 'Try adjusting your search terms or filters'
                    : 'You\'ll see connection requests from other users here'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIncomingRequests.filter((item): item is PendingRequest => 'status' in item && item.status === 'pending').map((request: PendingRequest) => (
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
                {/* The min-h-[624px] value is required to prevent a layout shift between tabs. The exact cause of this issue is currently unclear, but this value ensures consistent layout. Further investigation into the root cause is recommended for a more robust solution. */}
          <TabsContent value="sent-requests" className="mt-6 min-h-[624px] pb-8">
            <AdvancedFilters
              currentFilter={filter}
              onFilterChange={setFilter}
              selectedSports={selectedSports}
              setSelectedSports={setSelectedSports}
              selectedDivisions={selectedDivisions}
              setSelectedDivisions={setSelectedDivisions}
              selectedCountries={selectedCountries}
              setSelectedCountries={setSelectedCountries}
              selectedStates={selectedStates}
              setSelectedStates={setSelectedStates}
              selectedPositions={selectedPositions}
              setSelectedPositions={setSelectedPositions}
              selectedGraduatingClasses={selectedGraduatingClasses}
              setSelectedGraduatingClasses={setSelectedGraduatingClasses}
              selectedConferences={selectedConferences}
              setSelectedConferences={setSelectedConferences}
              selectedRequestTypes={selectedRequestTypes}
              setSelectedRequestTypes={setSelectedRequestTypes}
              minHeight={minHeight}
              setMinHeight={setMinHeight}
              minWeight={minWeight}
              setMinWeight={setMinWeight}
              verifiedFilter={verifiedFilter}
              setVerifiedFilter={setVerifiedFilter}
              hasAdvancedSearch={hasAdvancedSearch}
              onUpgradeClick={handleUpgradeClick}
              userRole={effectiveRole || ''}
              onApplyFilters={applyFilters}
              onClearFilters={clearAllFilters}
              activeTab={activeTab}
            />

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01ae79] mx-auto"></div>
                <p className="mt-4 text-muted-foreground text-sm">Loading sent requests...</p>
              </div>
            ) : filteredOutgoingRequests.length === 0 ? (
              <div className="text-center py-8 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Send className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchTerm || filter !== 'all' ? 'No sent requests found' : 'No sent requests'}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchTerm || filter !== 'all'
                    ? 'Try adjusting your search terms or filters'
                    : 'You\'ll see sent connection requests to other users here'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredOutgoingRequests.filter((item): item is PendingRequest => 'status' in item && item.status === 'pending').map((request: PendingRequest) => (
                  <SentRequestCard
                    key={request.id}
                    request={request}
                    onWithdraw={handleWithdrawRequest}
                    isWithdrawing={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={connectionToRemove !== null}
        onOpenChange={(open) => !open && handleCancelRemove()}
        title="Remove Connection"
        description={
          connectionToRemove 
            ? `Are you sure you want to remove your connection with ${connectionToRemove.userName}? This action cannot be undone.`
            : "Are you sure you want to remove this connection? This action cannot be undone."
        }
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmRemoveConnection}
        onCancel={handleCancelRemove}
      />

      <ConfirmationDialog
        open={requestToWithdraw !== null}
        onOpenChange={(open) => !open && cancelWithdrawRequest()}
        title="Withdraw Request"
        description={
          requestToWithdraw 
            ? `Are you sure you want to withdraw your connection request to ${requestToWithdraw.userName}? You will not be able to send another request to this person for 7 days to prevent spam.`
            : "Are you sure you want to withdraw this connection request? You will not be able to send another request to this person for 7 days to prevent spam."
        }
        confirmText="Withdraw"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmWithdrawRequest}
        onCancel={cancelWithdrawRequest}
      />
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
