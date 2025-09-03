"use client";

import React, { useState, useEffect, memo, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Instagram,
  ExternalLink,
  Edit,
  Plus,
  GraduationCap,
  Shield,
  Trophy,
  Users,
  Globe,
  Target,
  X,
  AlertTriangle
} from "lucide-react";
import { ProfileHeader } from "../shared/profile-header";
import { RecruiterEditDialogs } from "./recruiter-edit-dialogs";
import { RecruiterVerificationSection } from "./recruiter-verification-section";
import { RecruiterLevelBanner } from "./recruiter-level-banner";
import { VerificationDialog } from "../shared/verification-dialog";
import { OptimizedOrgLogo } from "../shared/optimized-org-logo";
import { RecruiterProfileData, RecruiterProfileProps } from './recruiter-profile-types';
import { ConnectionDialog } from "../shared/connection-dialog";
import { SendOverChatDialog } from "../shared/send-over-chat-dialog";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@clerk/nextjs";
import { useRoleView } from '@/hooks/use-role-view';
import { getStudentClassificationDisplayName, StudentClassification } from '@/lib/sports-data';
import { generateProfileSlug } from '@/lib/utils';

// Social Media Section Component (same as athlete profile)
const SocialMediaSection = memo(({ socialMedia, isOwnProfile, onEdit }: { 
  socialMedia?: { instagram?: string; twitter?: string };
  isOwnProfile?: boolean;
  onEdit?: () => void;
}) => {
  if (!socialMedia && !isOwnProfile) return null;

  // Helper function to get responsive text size based on handle length
  const getTextSizeClass = (handle: string) => {
    const cleanHandle = handle.replace('@', '');
    if (cleanHandle.length > 20) return 'text-xs';
    if (cleanHandle.length > 15) return 'text-sm';
    return 'text-sm';
  };

  // Helper function to truncate very long handles
  const formatHandle = (handle: string) => {
    const cleanHandle = handle.replace('@', '');
    // Only truncate if extremely long (more than 30 characters)
    if (cleanHandle.length > 30) {
      return `@${cleanHandle.substring(0, 27)}...`;
    }
    return `@${cleanHandle}`;
  };

  return (
    <div className="pt-2 relative">
      <div className="flex items-center justify-between mb-2">
        {isOwnProfile && (socialMedia?.instagram || socialMedia?.twitter) && (
          <Button
            size="sm"
            variant="ghost"
            className="p-1 h-6 w-6 ml-auto"
            onClick={onEdit}
          >
            <Edit className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      {socialMedia?.instagram || socialMedia?.twitter ? (
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
          {socialMedia.instagram && (
            <a
              href={`https://instagram.com/${socialMedia.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity min-w-0"
              title={`@${socialMedia.instagram.replace('@', '')}`}
            >
              <Instagram className="w-4 h-4 flex-shrink-0" />
              <span className={`${getTextSizeClass(socialMedia.instagram)} font-medium break-words`}>
                {formatHandle(socialMedia.instagram)}
              </span>
            </a>
          )}
          {socialMedia.twitter && (
            <a
              href={`https://twitter.com/${socialMedia.twitter.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-2 sm:px-3 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-opacity min-w-0"
              title={`@${socialMedia.twitter.replace('@', '')}`}
            >
              <Image src="/icons/x-white-logo.png" alt="X" width={16} height={16} className="flex-shrink-0" />
              <span className={`${getTextSizeClass(socialMedia.twitter)} font-medium break-words`}>
                {formatHandle(socialMedia.twitter)}
              </span>
            </a>
          )}
        </div>
      ) : isOwnProfile ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-2">No social media added</p>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Plus className="w-3 h-3 mr-1" />
            Add Social Media
          </Button>
        </div>
      ) : null}
    </div>
  );
});

SocialMediaSection.displayName = "SocialMediaSection";

// Program Social Media Section Component
const ProgramSocialMediaSection = memo(({ socialMedia, isOwnProfile, onEdit }: { 
  socialMedia?: { instagram?: string; twitter?: string };
  isOwnProfile?: boolean;
  onEdit?: () => void;
}) => {
  if (!socialMedia && !isOwnProfile) return null;

  // Helper function to get responsive text size based on handle length
  const getTextSizeClass = (handle: string) => {
    const cleanHandle = handle.replace('@', '');
    if (cleanHandle.length > 20) return 'text-xs';
    if (cleanHandle.length > 15) return 'text-sm';
    return 'text-sm';
  };

  // Helper function to truncate very long handles
  const formatHandle = (handle: string) => {
    const cleanHandle = handle.replace('@', '');
    // Only truncate if extremely long (more than 30 characters)
    if (cleanHandle.length > 30) {
      return `@${cleanHandle.substring(0, 27)}...`;
    }
    return `@${cleanHandle}`;
  };

  return (
    <div className="space-y-3">
      {socialMedia?.instagram || socialMedia?.twitter ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Program Social Media</p>
          {isOwnProfile && (
            <Button
              size="sm"
              variant="ghost"
              className="p-1 h-6 w-6"
              onClick={onEdit}
            >
              <Edit className="w-3 h-3" />
            </Button>
          )}
        </div>
      ) : null}
      
      {socialMedia?.instagram || socialMedia?.twitter ? (
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
          {socialMedia.instagram && (
            <a
              href={`https://instagram.com/${socialMedia.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity min-w-0"
              title={`@${socialMedia.instagram.replace('@', '')}`}
            >
              <Instagram className="w-4 h-4 flex-shrink-0" />
              <span className={`${getTextSizeClass(socialMedia.instagram)} font-medium break-words`}>
                {formatHandle(socialMedia.instagram)}
              </span>
            </a>
          )}
          {socialMedia.twitter && (
            <a
              href={`https://twitter.com/${socialMedia.twitter.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-2 sm:px-3 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-opacity min-w-0"
              title={`@${socialMedia.twitter.replace('@', '')}`}
            >
              <Image src="/icons/x-white-logo.png" alt="X" width={16} height={16} className="flex-shrink-0" />
              <span className={`${getTextSizeClass(socialMedia.twitter)} font-medium break-words`}>
                {formatHandle(socialMedia.twitter)}
              </span>
            </a>
          )}
        </div>
      ) : isOwnProfile ? (
        <div className="text-center py-4 border-2 border-dashed border-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">No program social media added</p>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Plus className="w-3 h-3 mr-1" />
            Add Social Media
          </Button>
        </div>
      ) : null}
    </div>
  );
});

ProgramSocialMediaSection.displayName = "ProgramSocialMediaSection";

// Sport-Specific Recruiting Needs Section Component
const SportSpecificNeedsSection = ({ 
  sportSpecificNeeds, 
  allSports, 
  selectedSport, 
  onSportChange, 
  isOwnProfile, 
  onEditSection,
  onRemoveSport
}: { 
  sportSpecificNeeds: { [sport: string]: { studentClassifications: string[]; positions: string[]; scholarshipsAvailable?: number; recruitingPhilosophy?: string; } };
  allSports: string[];
  selectedSport: string;
  onSportChange: (sport: string) => void;
  isOwnProfile?: boolean;
  onEditSection: (section: string, sport?: string) => void;
  onRemoveSport?: (sport: string) => void;
}) => {
  const currentNeeds = sportSpecificNeeds[selectedSport];
  
  const hasAnyNeeds = currentNeeds && (
    (currentNeeds.studentClassifications && currentNeeds.studentClassifications.length > 0) ||
    (currentNeeds.positions && currentNeeds.positions.length > 0) ||
    (currentNeeds.scholarshipsAvailable !== null && currentNeeds.scholarshipsAvailable !== undefined) ||
    currentNeeds.recruitingPhilosophy
  );

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary min-w-0">
              <Target className="w-5 h-5 flex-shrink-0" />
              Current Recruiting Needs
            </CardTitle>
            {isOwnProfile && (
              <div className="flex items-center gap-2 sm:flex-shrink-0">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-xs px-2 py-1"
                  onClick={() => onEditSection('add-sport')}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Sport
                </Button>
                {hasAnyNeeds && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs px-2 py-1"
                    onClick={() => onEditSection('recruiting-needs', selectedSport)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Sport Selector - Only show if multiple sports */}
          {allSports.length > 1 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">View recruiting needs for:</p>
              <div className="flex flex-wrap gap-2">
                {allSports.map(sport => (
                  <div key={sport} className="relative group">
                    <Button
                      size="sm"
                      variant={selectedSport === sport ? "default" : "outline"}
                      className="text-xs h-8 pr-8"
                      onClick={() => onSportChange(sport)}
                    >
                      {sport}
                      {sport === allSports[0] && <Badge variant="secondary" className="ml-2 text-xs">Primary</Badge>}
                    </Button>
                    {/* Red X button - only show for non-primary sports and when user owns profile */}
                    {isOwnProfile && sport !== allSports[0] && onRemoveSport && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSport(sport);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasAnyNeeds ? (
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Recruiting Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Student Classifications */}
                <div className="p-4 border rounded-lg bg-card">
                  <p className="text-sm font-medium text-foreground mb-3">Student Classifications</p>
                  <div className="flex flex-wrap gap-1">
                    {currentNeeds.studentClassifications && currentNeeds.studentClassifications.length > 0 ? (
                      currentNeeds.studentClassifications.map((classification) => (
                        <Badge key={classification} variant="outline" className="text-xs">
                          {getStudentClassificationDisplayName(classification as StudentClassification)}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No classifications specified</p>
                    )}
                  </div>
                </div>

                {/* Positions */}
                <div className="p-4 border rounded-lg bg-card">
                  <p className="text-sm font-medium text-foreground mb-3">Positions Needed</p>
                  <div className="flex flex-wrap gap-1">
                    {currentNeeds.positions && currentNeeds.positions.length > 0 ? (
                      currentNeeds.positions.map((position) => (
                        <Badge key={position} variant="outline" className="text-xs">
                          {position}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No positions specified</p>
                    )}
                  </div>
                </div>

                {/* Scholarships */}
                {(currentNeeds.scholarshipsAvailable !== null && currentNeeds.scholarshipsAvailable !== undefined) && (
                  <div className="p-4 border rounded-lg bg-card">
                    <p className="text-sm font-medium text-foreground mb-3">Scholarships Available</p>
                    <div className="flex items-center justify-center">
                      <div className="bg-gradient-to-r from-[#01ae79]/20 to-[#01ae79]/10 border border-[#01ae79]/30 rounded-xl px-6 py-4 min-w-[80px] flex items-center justify-center">
                        <span className="text-4xl font-bold text-[#01ae79]">{currentNeeds.scholarshipsAvailable}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* What We're Looking For section */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <h4 className="font-medium">What We&apos;re Looking For</h4>
                </div>
                {isOwnProfile && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-1 h-6 w-6 flex-shrink-0"
                    onClick={() => onEditSection('recruiting-needs', selectedSport)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
              </div>
              {currentNeeds.recruitingPhilosophy ? (
                <p className="text-sm text-muted-foreground">
                  {currentNeeds.recruitingPhilosophy}
                </p>
              ) : isOwnProfile ? (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Add what you&apos;re looking for in student-athletes
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEditSection('recruiting-needs', selectedSport)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Description
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  We seek student-athletes who demonstrate exceptional athletic ability, 
                  strong academic performance, and character that aligns with our program&apos;s values and culture.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Empty State */}
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              
              {isOwnProfile ? (
                <>
                  <h3 className="font-semibold text-lg mb-2 text-center">Set Your Recruiting Needs</h3>
                  <p className="text-sm text-muted-foreground mb-2 text-center">For {selectedSport}</p>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Help student-athletes understand what you&apos;re looking for in {selectedSport} recruits.
                  </p>
                  <div className="flex justify-center">
                    <Button 
                      className="mb-4"
                      size="default"
                      onClick={() => onEditSection('recruiting-needs', selectedSport)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Recruiting Needs
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-lg mb-2 text-center">Recruiting Needs</h3>
                  <p className="text-sm text-muted-foreground mb-2 text-center">For {selectedSport}</p>
                  <p className="text-muted-foreground">
                    {selectedSport} recruiting information will be displayed here when available.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

SportSpecificNeedsSection.displayName = "SportSpecificNeedsSection";

export function RecruiterProfile({ 
  data, 
  isOwnProfile = false, 
  onConnect, 
  hasPendingVerification,
  pendingSubmittedAt,
  hasRejectedVerification,
  rejectionReason,
  rejectedAt,
  connectionStatus = "none",
  connectionDirection
}: RecruiterProfileProps) {
  const [profileData, setProfileData] = useState<RecruiterProfileData>(data);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState<string | null>(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  // Initialize selectedSport to the first sport that has recruiting needs, or fallback to primary sport
  const [selectedSport, setSelectedSport] = useState(() => {
    if (data.sportSpecificNeeds && Object.keys(data.sportSpecificNeeds).length > 0) {
      return Object.keys(data.sportSpecificNeeds)[0];
    }
    return data.sportRecruiting;
  });
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentConnectionStatus, setCurrentConnectionStatus] = useState(connectionStatus);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [sendOverChatDialogOpen, setSendOverChatDialogOpen] = useState(false);

  // Update selectedSport when sportSpecificNeeds changes to ensure it always points to a sport with data
  useEffect(() => {
    if (profileData?.sportSpecificNeeds && Object.keys(profileData.sportSpecificNeeds).length > 0) {
      const availableSports = Object.keys(profileData.sportSpecificNeeds);
      // If current selectedSport doesn't have data, switch to the first sport that does
      if (!availableSports.includes(selectedSport)) {
        setSelectedSport(availableSports[0]);
      }
    }
  }, [profileData?.sportSpecificNeeds, selectedSport]);
  const { user } = useUser();
  const effectiveRole = user?.publicMetadata?.role as string;
  
  // Toast hook
  const toast = useToast();
  
  // Get admin role information for demo profile uploads
  const { isAdmin, viewingAs } = useRoleView();

  // Memoize computed values with safety checks
  const allSports = useMemo(() => {
    if (!profileData?.sportRecruiting) return [];
    return [profileData.sportRecruiting, ...(profileData.secondarySports || [])];
  }, [profileData?.sportRecruiting, profileData?.secondarySports]);
  
  // Calculate effective ownership - in preview mode, treat as if viewing someone else's profile
  const effectiveIsOwnProfile = isOwnProfile && !isPreviewMode;
  
  // Determine if current user can connect to this recruiter
  const canConnect = useMemo(() => 
    !effectiveIsOwnProfile && (effectiveRole === 'athlete' || effectiveRole === 'coach' || effectiveRole === 'recruiter'),
    [effectiveIsOwnProfile, effectiveRole]
  );

  // Track if profile data has changed from original
  const checkForChanges = (newData: RecruiterProfileData) => {
    const hasChanges = JSON.stringify(newData) !== JSON.stringify(data);
    setHasUnsavedChanges(hasChanges);
  };

  // Update profile data and track changes
  const updateProfileData = (updates: Partial<RecruiterProfileData>) => {
    try {
      // Handle nested object updates properly
      const newData = { ...profileData };
      
      // For each update, handle nested objects specially
      Object.keys(updates).forEach(key => {
        const typedKey = key as keyof RecruiterProfileData;
        if (typedKey === 'sportSpecificNeeds' && updates[typedKey] !== undefined) {
          // For sportSpecificNeeds, we want to replace the entire object, not merge
          // This allows us to properly handle deletions
          newData.sportSpecificNeeds = updates[typedKey] as RecruiterProfileData['sportSpecificNeeds'];
        } else {
          // @ts-expect-error - TypeScript can't infer the correct type here but it's safe
          newData[typedKey] = updates[typedKey];
        }
      });
      
      setProfileData(newData);
      checkForChanges(newData);
    } catch (error) {
      console.error('Error updating profile data:', error);
      // Show user-friendly error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = 'Error updating profile. Please try again.';
      document.body.appendChild(notification);
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    }
  };

  // Create ref to store beforeunload handler so we can remove it during save
  const beforeUnloadHandlerRef = useRef<((e: BeforeUnloadEvent) => void) | null>(null);

  // Warn user about unsaved changes when leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    beforeUnloadHandlerRef.current = handleBeforeUnload;
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Add safety check for profileData
  if (!profileData || !profileData.fullName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 relative flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted border-t-[#01ae79]"></div>
      </div>
    );
  }

  const handleEditSection = (section: string, sport?: string) => {
    if (section === 'manual-verification' || section === 'verification') {
      setVerificationDialogOpen(true);
      return;
    }
    
    // If editing recruiting needs for a specific sport, set the selected sport
    if (section === 'recruiting-needs' && sport) {
      setSelectedSport(sport);
    }
    
    setEditDialogOpen(section);
  };

  const handleRemoveSport = (sportToRemove: string) => {
    // Create a copy of the current sportSpecificNeeds, handling undefined case
    const updatedSportSpecificNeeds = { ...(profileData.sportSpecificNeeds || {}) };
    
    // Remove the sport from sportSpecificNeeds
    delete updatedSportSpecificNeeds[sportToRemove];
    
    // Also remove the sport from secondarySports if it exists there
    const updatedSecondarySports = profileData.secondarySports?.filter(sport => sport !== sportToRemove) || [];
    
    // Update the profile data
    updateProfileData({
      sportSpecificNeeds: updatedSportSpecificNeeds,
      secondarySports: updatedSecondarySports
    });
    
    // If the removed sport was the currently selected sport, switch to the primary sport
    if (selectedSport === sportToRemove) {
      setSelectedSport(profileData.sportRecruiting);
    }
  };

  const saveProfile = async () => {
    if (!effectiveIsOwnProfile || !hasUnsavedChanges) return;
    
    setIsSaving(true);
    const startTime = Date.now();
    
    try {
      // Get the current user's auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();
      
      // Check if images need to be removed
      const profileImageRemoved = data.profileImage && !profileData.profileImage;
      const organizationLogoRemoved = data.organizationLogo && !profileData.organizationLogo;
      
      // Handle image removal first if needed
      if (profileImageRemoved || organizationLogoRemoved) {
        if (profileImageRemoved) {
          const formData = new FormData();
          formData.append('userId', profileData.userId || profileData.id);
          formData.append('imageType', 'profile');
          
          // Add demo profile type for admin users
          if (isAdmin && viewingAs) {
            formData.append('demoProfileType', viewingAs);
          }
          
          // Remove any existing cache-busting parameters before sending for deletion
          const cleanUrl = data.profileImage!.split('?')[0];
          formData.append('currentImageUrl', cleanUrl);
          formData.append('removeOnly', 'true'); // Flag to only remove, not replace

          const imageResponse = await fetch('/api/profile/upload-image', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          if (!imageResponse.ok) {
            throw new Error('Failed to remove profile image');
          }
        }
        
        if (organizationLogoRemoved) {
          const formData = new FormData();
          formData.append('userId', profileData.userId || profileData.id);
          formData.append('imageType', 'organization');
          
          // Add demo profile type for admin users
          if (isAdmin && viewingAs) {
            formData.append('demoProfileType', viewingAs);
          }
          
          // Remove any existing cache-busting parameters before sending for deletion
          const cleanUrl = data.organizationLogo!.split('?')[0];
          formData.append('currentImageUrl', cleanUrl);
          formData.append('removeOnly', 'true'); // Flag to only remove, not replace

          const imageResponse = await fetch('/api/profile/upload-image', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          if (!imageResponse.ok) {
            throw new Error('Failed to remove organization logo');
          }
        }
      }
      
      // Use userId (Clerk user ID) instead of id (database primary key)
      const userIdForApi = profileData.userId || profileData.id;
      
      // Prepare profile data for saving, converting undefined to null for removed images
      const dataToSave = {
        ...profileData,
        profileImage: profileData.profileImage === undefined ? null : profileData.profileImage,
        organizationLogo: profileData.organizationLogo === undefined ? null : profileData.organizationLogo
      };
      
      const response = await fetch(`/api/profile/${generateProfileSlug(profileData.fullName)}/${userIdForApi}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      if (result.success) {
        // Remove beforeunload listener to prevent popup during reload
        if (beforeUnloadHandlerRef.current) {
          window.removeEventListener('beforeunload', beforeUnloadHandlerRef.current);
        }
        
        // Clear unsaved changes flag
        setHasUnsavedChanges(false);
        
        // Update the original data to match saved data
        setProfileData(result.data);        
        // Update the page data reference so changes are permanent
        Object.assign(data, result.data);
        
        // Ensure minimum loading time of 1.5 seconds for better UX
        const elapsedTime = Date.now() - startTime;
        const minLoadingTime = 1500; // 1.5 seconds
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        // Refresh the page after showing loading for minimum duration
        setTimeout(() => {
          window.location.reload();
        }, remainingTime);
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
      setIsSaving(false); // Only turn off loading on error
    }
  };

  const discardChanges = () => {
    setProfileData(data);
    setHasUnsavedChanges(false);
  };

  const handleRemoveImage = (imageType: 'profile' | 'organization') => {
    // Remove image from frontend and mark as unsaved change
    const updates: Partial<RecruiterProfileData> = {};
    if (imageType === 'profile') {
      updates.profileImage = undefined;
    } else {
      updates.organizationLogo = undefined;
    }
    
    updateProfileData(updates);
  };

  const handlePreviewProfile = () => {
    setIsPreviewMode(true);
  };

  const handleEditProfile = () => {
    setIsPreviewMode(false);
  };

  const handleShare = () => {
    setSendOverChatDialogOpen(true);
  };

  const handleConnectClick = () => {
    if (canConnect && currentConnectionStatus === "none") {
      setConnectionDialogOpen(true);
    }
  };

  const handleWithdrawConnection = async () => {
    setIsConnecting(true);
    try {
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
        body: JSON.stringify({
          targetUserId: profileData.userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Log error details to console
        console.error('Connection withdrawal failed:', {
          status: response.status,
          error: errorData.error,
          targetUserId: profileData.userId,
          timestamp: new Date().toISOString()
        });
        
        throw new Error(errorData.error || 'Failed to withdraw connection request');
      }

      const result = await response.json();
      if (result.success) {
        setCurrentConnectionStatus("none");
      } else {
        // Log unexpected API response structure to console
        console.error('Unexpected withdrawal API response:', {
          result,
          targetUserId: profileData.userId,
          timestamp: new Date().toISOString()
        });
        
        throw new Error(result.error || 'Failed to withdraw connection request');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error withdrawing connection request:', {
          message: error.message,
          stack: error.stack,
          targetUserId: profileData.userId,
          timestamp: new Date().toISOString()
        });
      }
      
      toast.error(
        "Connection Error",
        "Something went wrong while withdrawing your connection request. Please try again.",
        7000
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectionConfirm = async (note?: string) => {
    setIsConnecting(true);
    try {
      // Get the current user's auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();
      
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetUserId: profileData.userId,
          note: note
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if this is a 7-day cooldown error (status 429)
        if (response.status === 429) {
          // Show toast for 7-day double connection cooldown
          toast.error(
            "Connection Request Limit",
            errorData.error || 'You must wait before sending another connection request to this person.',
            7000
          );
          setConnectionDialogOpen(false);
          return;
        }
        
        // For all other errors, log to console and throw
        console.error('Connection request failed:', {
          status: response.status,
          error: errorData.error,
          targetUserId: profileData.userId,
          timestamp: new Date().toISOString()
        });
        
        throw new Error(errorData.error || 'Failed to send connection request');
      }

      const result = await response.json();
      if (result.success) {
        // Update connection status to pending
        setCurrentConnectionStatus("pending");
        setConnectionDialogOpen(false);
        // Show success toast
        toast.success(
          "Connection Request Sent",
          `Your connection request has been sent to ${profileData.fullName}`,
          5000
        );
        // Call the original onConnect if provided
        onConnect?.();
      } else {
        // Log unexpected API response structure to console
        console.error('Unexpected connection API response:', {
          result,
          targetUserId: profileData.userId,
          timestamp: new Date().toISOString()
        });
        
        throw new Error(result.error || 'Failed to send connection request');
      }
    } catch (error) {
      // Only show error toast if it's not the 7-day cooldown case (already handled above)
      if (error instanceof Error) {
        console.error('Error sending connection request:', {
          message: error.message,
          stack: error.stack,
          targetUserId: profileData.userId,
          timestamp: new Date().toISOString()
        });
        
        toast.error(
          "Connection Error",
          "Something went wrong while sending your connection request. Please try again.",
          7000
        );
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleReportProfile = () => {
    // TODO: Open report modal or navigate to report page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 relative">
      {/* Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-card border rounded-lg p-8 shadow-2xl flex flex-col items-center space-y-4 mx-4 max-w-sm w-full">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted border-t-[#01ae79]"></div>
            <div className="text-center">
              <h3 className="font-semibold text-xl text-foreground">Saving Profile</h3>
              <p className="text-muted-foreground mt-2">Please wait while we update your information...</p>
              <div className="mt-4 w-full bg-muted rounded-full h-2">
                <div className="bg-[#01ae79] h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header Actions */}
      <ProfileHeader
        isOwnProfile={isOwnProfile}
        onConnect={canConnect ? handleConnectClick : undefined}
        onWithdrawConnection={handleWithdrawConnection}
        onAcceptConnection={handleConnectionConfirm}
        onDeclineConnection={handleWithdrawConnection}
        onReport={handleReportProfile}
        onShare={handleShare}
        onPreviewProfile={isOwnProfile ? handlePreviewProfile : undefined}
        onEditProfile={isOwnProfile ? handleEditProfile : undefined}
        isPreviewMode={isPreviewMode}
        connectLabel="Connect with Recruiter"
        profileName={profileData.fullName}
        profileType="recruiter"
        reportedUserId={profileData.userId}
        connectionStatus={currentConnectionStatus}
        connectionDirection={connectionDirection}
        isConnecting={isConnecting}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSaveChanges={saveProfile}
        onDiscardChanges={discardChanges}
      />

      {/* Connection Dialog */}
      {!effectiveIsOwnProfile && canConnect && (
        <ConnectionDialog
          open={connectionDialogOpen}
          onOpenChange={setConnectionDialogOpen}
          profileName={profileData.fullName}
          profileType="recruiter"
          onConfirm={handleConnectionConfirm}
          isConnecting={isConnecting}
        />
      )}

      {/* Send Over Chat Dialog */}
      <SendOverChatDialog
        open={sendOverChatDialogOpen}
        onOpenChange={setSendOverChatDialogOpen}
        profileToShare={{
          id: profileData.userId || profileData.id,
          name: profileData.fullName,
          imageUrl: profileData.profileImage || undefined,
          role: 'recruiter',
          division: profileData.division,
          educationLevel: undefined
        }}

      />

      <div className="container py-4 md:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-6 xl:gap-8 max-w-screen-2xl mx-auto">
          {/* Sidebar - Basic Info */}
          <div className="space-y-2 lg:space-y-6 xl:space-y-8">
            {/* Profile Card */}
            <Card className="overflow-hidden">
              <CardContent className="p-4 md:p-6">
                <div className="text-center space-y-4">
                  <div className="relative w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 mx-auto flex-shrink-0">
                    {profileData.profileImage ? (
                      <Image
                        src={profileData.profileImage.includes('?') ? profileData.profileImage : `${profileData.profileImage}?v=1`}
                        alt={profileData.fullName || "Profile picture"}
                        fill
                        className="rounded-full object-cover"
                        sizes="(max-width: 768px) 80px, (max-width: 1024px) 112px, 128px"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                        <span className="text-base md:text-lg lg:text-xl font-semibold text-muted-foreground">
                          {profileData.fullName?.split(' ').map((n: string) => n[0]).join('') || '?'}
                        </span>
                      </div>
                    )}
                    {effectiveIsOwnProfile && (
                      <>
                        <Button
                          size="sm"
                          className="absolute -bottom-2 -right-2 rounded-full p-2 h-8 w-8"
                          onClick={() => handleEditSection('profile-image')}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        {profileData.profileImage && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 rounded-full p-1 h-6 w-6"
                            onClick={() => handleRemoveImage('profile')}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    {effectiveIsOwnProfile ? (
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-center break-words">{profileData.fullName}</h1>
                        <div className="flex items-center gap-2 flex-wrap justify-center">
                          {profileData.isVerified ? (
                            <Badge className="bg-green-600 text-white text-xs whitespace-nowrap">
                              <Shield className="w-3 h-3 mr-1 flex-shrink-0" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-orange-300 text-orange-600 text-xs whitespace-nowrap">
                              <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                              Unverified
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-1 h-6 w-6 flex-shrink-0"
                            onClick={() => handleEditSection('basic-info')}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-center break-words">{profileData.fullName}</h1>
                        {profileData.isVerified ? (
                          <Badge className="bg-green-600 text-white text-xs whitespace-nowrap">
                            <Shield className="w-3 h-3 mr-1 flex-shrink-0" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-orange-300 text-orange-600 text-xs whitespace-nowrap">
                            <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <p className="text-sm md:text-base text-muted-foreground">
                      {profileData.title}
                    </p>
                    
                    <div className="flex items-center justify-center gap-1 text-xs md:text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                      <span>
                        {/* Only show comma if state exists and country is United States */}
                        {profileData.city}
                        {profileData.country === 'United States' && profileData.state ? `, ${profileData.state}` : ''}
                      </span>
                    </div>
                    {profileData.country && (
                      <div className="flex justify-center mt-1">
                        <span className="text-sm text-muted-foreground">
                          {profileData.country}
                        </span>
                      </div>
                    )}

                    {/* Social Media Links */}
                    <SocialMediaSection 
                      socialMedia={{
                        instagram: profileData.instagramHandle,
                        twitter: profileData.twitterHandle
                      }} 
                      isOwnProfile={effectiveIsOwnProfile}
                      onEdit={() => handleEditSection('social-media')}
                    />
                  </div>


                </div>
              </CardContent>
            </Card>

            {/* Recruiter Level Banner */}
            <RecruiterLevelBanner
              division={profileData.division}
              conference={profileData.conference}
              organizationName={profileData.organizationName}
              sportRecruiting={profileData.sportRecruiting}
            />

            {/* Program Links */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg">Program Links</CardTitle>
                  {effectiveIsOwnProfile && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditSection('program-links')}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Organization Logo */}
                {profileData.organizationLogo ? (
                  <div className="text-center relative">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground">Organization Logo</p>
                      {effectiveIsOwnProfile && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditSection('organization-logo')}
                            className="p-1 h-6 w-6"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveImage('organization')}
                            className="p-1 h-6 w-6"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <OptimizedOrgLogo
                        src={profileData.organizationLogo}
                        organizationName={profileData.organizationName}
                        size="medium"
                      />
                    </div>
                  </div>
                ) : effectiveIsOwnProfile && (
                  <div className="text-center py-4 border-2 border-dashed border-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Add organization logo
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSection('organization-logo')}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Upload Logo
                    </Button>
                  </div>
                )}

                {profileData.programWebsite && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Program Website</p>
                    <Link href={profileData.programWebsite} target="_blank">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Program Site
                      </Button>
                    </Link>
                  </div>
                )}

                {profileData.schoolWebsite && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">School Website</p>
                    <Link href={profileData.schoolWebsite} target="_blank">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Visit School Site
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Program Social Media Section */}
                <ProgramSocialMediaSection 
                  socialMedia={{
                    instagram: profileData.programInstagram,
                    twitter: profileData.programTwitter
                  }} 
                  isOwnProfile={effectiveIsOwnProfile}
                  onEdit={() => handleEditSection('program-social-media')}
                />

                {!profileData.programWebsite && !profileData.schoolWebsite && effectiveIsOwnProfile && (
                  <div className="text-center py-4 border-2 border-dashed border-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Add website links
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSection('program-links')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Add Links
                    </Button>
                  </div>
                )}


              </CardContent>
            </Card>

            {/* Personal Statement - Mobile Only */}
            {profileData.personalStatement && (
              <Card className="lg:hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>About Recruiter {profileData.fullName.split(' ')[0]}</CardTitle>
                    {effectiveIsOwnProfile && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditSection('personal-statement')}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{profileData.personalStatement}</p>
                </CardContent>
              </Card>
            )}

            {/* Verification Section - Show for own profile or admin viewing */}
            {(effectiveIsOwnProfile || (effectiveRole && (hasPendingVerification !== undefined || hasRejectedVerification !== undefined))) && !isPreviewMode && (
              <RecruiterVerificationSection
                profileData={profileData}
                isOwnProfile={effectiveIsOwnProfile}
                onShowVerificationDialog={() => handleEditSection('verification')}
                hasPendingVerification={hasPendingVerification}
                pendingSubmittedAt={pendingSubmittedAt}
                hasRejectedVerification={hasRejectedVerification}
                rejectionReason={rejectionReason}
                rejectedAt={rejectedAt}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-2 lg:space-y-6 xl:space-y-8 min-w-0">
            {/* About Recruiter Section - Desktop Only */}
            {profileData.personalStatement ? (
              <Card className="hidden lg:block">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>About Recruiter {profileData.fullName.split(' ')[0]}</CardTitle>
                    {effectiveIsOwnProfile && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditSection('personal-statement')}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{profileData.personalStatement}</p>
                </CardContent>
              </Card>
            ) : effectiveIsOwnProfile && (
              <Card className="hidden lg:block">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>About Recruiter {profileData.fullName.split(' ')[0]}</CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditSection('personal-statement')}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-muted-foreground mb-2">Tell your story</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Share your recruiting philosophy, experience, and what makes you unique
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => handleEditSection('personal-statement')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add About Section
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Recruiting Needs */}
            <SportSpecificNeedsSection
              sportSpecificNeeds={profileData.sportSpecificNeeds || {}}
              allSports={allSports}
              selectedSport={selectedSport}
              onSportChange={setSelectedSport}
              isOwnProfile={effectiveIsOwnProfile}
              onEditSection={handleEditSection}
              onRemoveSport={handleRemoveSport}
            />

            {/* Showcase Video */}
            {(profileData.showcaseVideoUrl || effectiveIsOwnProfile) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Program Showcase</CardTitle>
                    {effectiveIsOwnProfile && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditSection('showcase-video')}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {profileData.showcaseVideoUrl ? (
                    <div className="space-y-4">
                      {profileData.showcaseVideoTitle && (
                        <h3 className="font-medium">{profileData.showcaseVideoTitle}</h3>
                      )}
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <iframe
                          src={profileData.showcaseVideoEmbedUrl || profileData.showcaseVideoUrl}
                          title={profileData.showcaseVideoTitle || "Program Showcase"}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  ) : effectiveIsOwnProfile ? (
                    <div className="text-center py-8">
                      <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium text-muted-foreground mb-2">Showcase your program</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add a video to highlight your program, facilities, or recruiting philosophy.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => handleEditSection('showcase-video')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Showcase Video
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {/* Call to Action for Athletes */}
            {!effectiveIsOwnProfile && (
              <Card className="border-primary/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                <CardContent className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">Ready to Take the Next Step?</h3>
                  <p className="text-muted-foreground mb-4">
                    Join our {profileData.sportRecruiting} program and compete at the highest level while pursuing your academic goals.
                  </p>
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={onConnect}
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    Express Interest
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialogs */}
      <RecruiterEditDialogs
        isOpen={!!editDialogOpen}
        dialogType={editDialogOpen}
        profileData={profileData}
        selectedSport={selectedSport}
        onClose={() => setEditDialogOpen(null)}
        hasPendingVerification={hasPendingVerification}
        onSave={(updates: Partial<RecruiterProfileData>) => {
          try {
            updateProfileData(updates);
            // Use setTimeout to ensure state update completes before closing dialog
            setTimeout(() => {
              setEditDialogOpen(null);
            }, 0);
          } catch (error) {
            console.error('Error updating profile data:', error);
            // Show user-friendly error notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
            notification.textContent = 'Error saving changes. Please try again.';
            document.body.appendChild(notification);
            setTimeout(() => {
              if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
              }
            }, 5000);
            // Keep dialog open if there's an error
          }
        }}
      />

      {/* Verification Dialog */}
              <VerificationDialog
          open={verificationDialogOpen}
          onOpenChange={(open) => setVerificationDialogOpen(open)}
          role="recruiter"
          onVerificationSubmitted={() => {
            setTimeout(() => {
              window.location.reload();
            }, 2000); // Give user time to read success message
          }}
        />
    </div>
  );
} 