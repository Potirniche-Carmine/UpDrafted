"use client";

import React, { useState, useMemo, memo, useEffect, useRef } from "react";
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
  Zap,
  Target,
  Timer,
  X,
  AlertTriangle
} from "lucide-react";
import { ProfileHeader } from "../shared/profile-header";
import { AcademicSummaryCard } from "../shared/academic-summary-card";
import { AthleteEditDialogs } from "./athlete-edit-dialogs";
import { VerificationSection } from "./athlete-verification-section";
import { VerificationDialog } from "../shared/verification-dialog";
import { useRoleView } from '@/hooks/use-role-view';
import { AthleteProfileData, AthleteProfileProps, Measurable } from './athlete-profile-types';
import { ConnectionDialog } from "../shared/connection-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useUser } from "@clerk/nextjs";

// Memoize heavy components
const MeasurablesSection = memo(({ measurables, allSports, selectedSport, onSportChange, isOwnProfile, onEditSection }: { 
  measurables: Measurable[], 
  allSports: string[],
  selectedSport: string,
  onSportChange: (sport: string) => void,
  isOwnProfile?: boolean,
  onEditSection: (section: string, measurableId?: string) => void
}) => {
  const sportMeasurables = useMemo(() => 
    measurables.filter(m => m.sport === selectedSport), 
    [measurables, selectedSport]
  );

  // Sport-specific performance metrics to icon mapping
  const getMeasurableIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('dash') || lowerLabel.includes('sprint') || lowerLabel.includes('speed')) return Timer;
    if (lowerLabel.includes('jump') || lowerLabel.includes('vertical') || lowerLabel.includes('broad')) return Zap;
    if (lowerLabel.includes('throw') || lowerLabel.includes('shot') || lowerLabel.includes('distance')) return Target;
    return Trophy;
  };

  const handleAddMeasurable = () => {
    onEditSection('add-measurables');
  };

  const handleEditMeasurable = (measurableId: string) => {
    onEditSection('edit-measurable', measurableId);
  };

  const handleDeleteMeasurable = (measurableId: string) => {
    onEditSection('delete-measurable', measurableId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Measurements
            </CardTitle>
            {isOwnProfile && (
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs px-2 py-1"
                onClick={handleAddMeasurable}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            )}
          </div>
          
          {/* Sport Selector - Only show if multiple sports */}
          {allSports.length > 1 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">View measurements for:</p>
              <div className="flex flex-wrap gap-2">
                {allSports.map(sport => (
                  <Button
                    key={sport}
                    size="sm"
                    variant={selectedSport === sport ? "default" : "outline"}
                    className="text-xs h-8"
                    onClick={() => onSportChange(sport)}
                  >
                    {sport}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {sportMeasurables.length === 0 ? (
          <div className="space-y-4">
            {/* Empty State */}
            <div key="empty-state" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-blue-600" />
              </div>
              
              {isOwnProfile ? (
                <>
                  <h3 className="font-semibold text-lg mb-2">Showcase Your Athletic Performance</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Add your performance metrics for {selectedSport} to stand out to coaches.
                  </p>
                  <div className="flex justify-center">
                    <Button 
                      className="mb-4"
                      size="default"
                      onClick={handleAddMeasurable}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Performance Metric
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-lg mb-2">Performance Metrics</h3>
                  <p className="text-muted-foreground">
                    {selectedSport} performance data will be displayed here when available.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sportMeasurables.map((measurable, index) => {
                const Icon = getMeasurableIcon(measurable.label);
                
                return (
                  <div key={`${measurable.id}-${index}`} className="bg-gradient-to-br from-muted/30 to-muted/50 rounded-lg p-4 border border-muted/50 relative group">
                    {isOwnProfile && (
                      <div key="actions" className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleEditMeasurable(measurable.id)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteMeasurable(measurable.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-2 pr-12">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-muted-foreground">{measurable.label}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {(() => {
                          // Parse the date string to avoid timezone issues
                          const [year, month] = measurable.measurementDate.split('-');
                          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                          return `${monthNames[parseInt(month) - 1]} ${year}`;
                        })()}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-foreground">{measurable.value}</div>
                  </div>
                );
              })}
            </div>

            {/* Add More Button for own profile */}
            {isOwnProfile && (
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEditSection('add-measurables')}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add More Metrics
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

MeasurablesSection.displayName = "MeasurablesSection";

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
        <div className="flex flex-col justify-center gap-2">
          {socialMedia.instagram && (
            <a
              href={`https://instagram.com/${socialMedia.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity min-w-0"
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
                className="flex items-center justify-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-opacity min-w-0"
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



// Update CampExperienceCard prop types and usage
import { formatDateRangeAsMonthYear } from '@/lib/date-utils';

function CampExperienceCard({ experiences, isOwnProfile, onEdit }: { 
  experiences: Array<{
    id?: number; // Database ID for existing experiences
    type: 'Camp' | 'Club';
    name: string;
    city: string;
    state: string;
    country: string;
    startDate: Date | string; // Allow both Date and string for flexibility
    endDate: Date | string; // Allow both Date and string for flexibility (uses special date for "Present")
    sport: string;
    description: string;
  }>, 
  isOwnProfile: boolean, 
  onEdit?: () => void 
}) {
  // If there are no experiences and it's not the user's own profile (including preview mode), don't show the card
  if (experiences.length === 0 && !isOwnProfile) {
    return null;
  }

    return (
    <Card className="w-full min-h-[260px]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-full">
              <Trophy className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Camp and Club Experience</h3>
                  <p className="text-sm text-muted-foreground">
                {experiences.length === 0 
                  ? "Start building your athletic resume" 
                  : "Showcase your athletic journey outside your main team"
                }
              </p>
            </div>
          </div>
          {isOwnProfile && (
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
        <div className="space-y-4">
          {experiences.length === 0 ? (
            <div className="bg-muted/50 rounded-lg p-6 text-center border border-border">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-muted-foreground" />
              </div>
              <h4 className="font-semibold text-base mb-2 text-foreground">No Camp or Club Experience Added</h4>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Showcase your athletic journey by adding camps, showcases, or clubs you&apos;ve participated in. This helps coaches see your dedication and versatility beyond your main team.
              </p>
              {isOwnProfile && (
                <Button size="sm" variant="default" onClick={onEdit}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Experience
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {experiences.map((exp: {
                id?: number; // Database ID for existing experiences
                type: 'Camp' | 'Club';
                name: string;
                city: string;
                state: string;
                country: string;
                startDate: Date | string; // Allow both Date and string for flexibility
                endDate: Date | string; // Allow both Date and string for flexibility (uses special date for "Present")
                sport: string;
                description: string;
              }, idx: number) => (
                <div key={idx} className="bg-muted/30 rounded-lg p-4 border border-border shadow-sm">
                  {/* Badges always at the top of the card */}
                  <div className="flex gap-1 mb-2">
                                                <Badge className={`text-white text-[10px] px-2 py-0.5 ${exp.type === 'Camp' ? 'bg-blue-600' : 'bg-cyan-700'}`}>{exp.type === 'Camp' ? 'Camp' : 'Club'}</Badge>
                            <Badge className="bg-muted text-foreground text-[10px] px-2 py-0.5 border border-border">{exp.sport}</Badge>
                  </div>
                  <div className="font-semibold text-base mb-1">{exp.name}</div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{
                      exp.city && exp.country 
                        ? exp.country === 'United States' && exp.state
                          ? `${exp.city}, ${exp.state}`
                          : `${exp.city}, ${exp.country}`
                        : exp.city || exp.country
                    }</span>
                    <span>{formatDateRangeAsMonthYear(exp.startDate, exp.endDate)}</span>
                  </div>
                  <p className="text-sm text-foreground mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AthleteProfile({ 
  data, 
  isOwnProfile = false, 
  onConnect, 
  onShare,
  hasPendingVerification,
  pendingSubmittedAt,
  hasRejectedVerification,
  rejectionReason,
  rejectedAt,
  hasPendingTransferPortalVerification,
  transferPortalPendingSubmittedAt,
  hasRejectedTransferPortalVerification,
  transferPortalRejectionReason,
  transferPortalRejectedAt,
  connectionStatus = "none",
  connectionDirection
}: AthleteProfileProps) {
  const [selectedSport, setSelectedSport] = useState(data.sport);
  const [editDialogOpen, setEditDialogOpen] = useState<string | null>(null);
  const [measurableIdToEdit, setMeasurableIdToEdit] = useState<string | null>(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState(data);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Get admin role information for demo profile uploads
  const { isAdmin, viewingAs } = useRoleView();
  const { user } = useUser();
  const effectiveRole = user?.publicMetadata?.role as string;
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentConnectionStatus, setCurrentConnectionStatus] = useState(connectionStatus);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: "warning" | "danger" | "info" | "success";
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    variant: "warning",
    onConfirm: () => {}
  });
  
  // Safety check: if profileData becomes undefined during save operations, use original data
  const safeProfileData = profileData || data;
  
  // Calculate effective ownership - in preview mode, treat as if viewing someone else's profile
  const effectiveIsOwnProfile = isOwnProfile && !isPreviewMode;
  
  // Memoize computed values
  const allSports = useMemo(() => {
    if (!safeProfileData) return [];
    return [safeProfileData.sport, ...(safeProfileData.secondarySports || [])];
  }, [safeProfileData]);
  
  // Ensure measurables have stable IDs for deletion
  const measurablesWithStableIds = useMemo(() => {
    if (!safeProfileData || !safeProfileData.measurables) return [];
    
    return safeProfileData.measurables.map((measurable, index) => {
      // Ensure each measurable has a stable ID
      const stableId = measurable.id || `stable-${measurable.sport}-${measurable.label}-${index}`;
      
      return {
        ...measurable,
        id: stableId
      };
    });
  }, [safeProfileData]);
  
  const canDraft = useMemo(() => 
    !effectiveIsOwnProfile && (effectiveRole === 'coach' || effectiveRole === 'recruiter'),
    [effectiveIsOwnProfile, effectiveRole]
  );

  // Track if profile data has changed from original
  const checkForChanges = (newData: AthleteProfileData) => {
    const hasChanges = JSON.stringify(newData) !== JSON.stringify(data);
    setHasUnsavedChanges(hasChanges);
  };

  // Update profile data and track changes
  const updateProfileData = (updates: Partial<AthleteProfileData>) => {
    const newData = { ...safeProfileData, ...updates };
    setProfileData(newData);
    checkForChanges(newData);
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

  const handleEditSection = (section: string, measurableId?: string) => {
    if (section === 'manual-verification') {
      setVerificationDialogOpen(true);
      return;
    }
    
    // Set measurable ID and dialog state consistently without setTimeout
    if (measurableId) {
      setMeasurableIdToEdit(measurableId);
    } else {
      setMeasurableIdToEdit(null);
    }
    setEditDialogOpen(section);
  };

  const saveProfile = async () => {
    if (!effectiveIsOwnProfile || !hasUnsavedChanges) return;
    
    setIsSaving(true);
    const startTime = Date.now();
    
    try {
      // Get the current user's auth token with proper type definition
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();
      
      // Check if profile image needs to be removed
      const profileImageRemoved = data.profileImage && !safeProfileData.profileImage;
      
      // Handle image removal first if needed
      if (profileImageRemoved) {
        const formData = new FormData();
        formData.append('userId', safeProfileData.userId || safeProfileData.id);
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
      
      // Use userId (Clerk user ID) instead of id (database primary key)
      const userIdForApi = safeProfileData.userId || safeProfileData.id;
      
      // Prepare profile data for saving, converting undefined to null for removed images
      const dataToSave = {
        ...safeProfileData,
        profileImage: safeProfileData.profileImage === undefined ? null : safeProfileData.profileImage
      };
      
      const response = await fetch(`/api/profile/${userIdForApi}`, {
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
        // Check if we should show verification dialog after successful save
        const savedProfile = result.data;
        const shouldShowTransferPortalVerification = 
          savedProfile &&
          (savedProfile.educationLevel === 'undergraduate' || savedProfile.educationLevel === 'graduate') &&
          savedProfile.division &&
          ['NCAA Division I', 'NCAA Division II', 'NCAA Division III'].includes(savedProfile.division) &&
          !savedProfile.isOnTransferPortal;

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
        
        // Show verification dialog if conditions are met
        if (shouldShowTransferPortalVerification) {
          setVerificationDialogOpen(true);
          setIsSaving(false); // Stop loading since we're showing dialog instead of reloading
          return; // Don't reload the page
        }
        
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
      console.error('Error saving profile:', error);
      setConfirmationDialog({
        open: true,
        title: "Save Failed",
        description: "Failed to save profile. Please try again.",
        confirmText: "OK",
        variant: "danger",
        onConfirm: () => setConfirmationDialog(prev => ({ ...prev, open: false }))
      });
      setIsSaving(false); // Only turn off loading on error
    }
  };

  const discardChanges = () => {
    if (hasUnsavedChanges) {
      setConfirmationDialog({
        open: true,
        title: "Discard Changes?",
        description: "You have unsaved changes. Are you sure you want to discard them?",
        confirmText: "Discard",
        variant: "warning",
        onConfirm: () => {
          setProfileData(data);
          setHasUnsavedChanges(false);
          setIsPreviewMode(false);
          setConfirmationDialog(prev => ({ ...prev, open: false }));
        }
      });
    }
  };

  const handleRemoveImage = () => {
    // Remove image from frontend and mark as unsaved change
    const updates: Partial<AthleteProfileData> = {
      profileImage: undefined
    };
    
    updateProfileData(updates);
  };

  const handlePreviewProfile = () => {
    setIsPreviewMode(true);
  };

  const handleEditProfile = () => {
    setIsPreviewMode(false);
  };

  const handleConnectClick = () => {
    if (!isOwnProfile && canDraft && currentConnectionStatus === "none") {
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
          targetUserId: safeProfileData.userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to withdraw connection request');
      }

      const result = await response.json();
      if (result.success) {
        setCurrentConnectionStatus("none");
      } else {
        throw new Error(result.error || 'Failed to withdraw connection request');
      }
    } catch (error) {
      console.error('Error withdrawing connection request:', error);
      setConfirmationDialog({
        open: true,
        title: "Connection Error",
        description: error instanceof Error ? error.message : 'Failed to withdraw connection request. Please try again.',
        confirmText: "OK",
        variant: "danger",
        onConfirm: () => setConfirmationDialog(prev => ({ ...prev, open: false }))
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAcceptConnection = async () => {
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromUserId: safeProfileData.userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept connection request');
      }

      const result = await response.json();
      if (result.success) {
        setCurrentConnectionStatus("connected");
      } else {
        throw new Error(result.error || 'Failed to accept connection request');
      }
    } catch (error) {
      console.error('Error accepting connection request:', error);
      setConfirmationDialog({
        open: true,
        title: "Connection Error",
        description: error instanceof Error ? error.message : 'Failed to accept connection request. Please try again.',
        confirmText: "OK",
        variant: "danger",
        onConfirm: () => setConfirmationDialog(prev => ({ ...prev, open: false }))
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDeclineConnection = async () => {
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
          targetUserId: safeProfileData.userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to decline connection request');
      }

      const result = await response.json();
      if (result.success) {
        setCurrentConnectionStatus("none");
      } else {
        throw new Error(result.error || 'Failed to decline connection request');
      }
    } catch (error) {
      console.error('Error declining connection request:', error);
      setConfirmationDialog({
        open: true,
        title: "Connection Error",
        description: error instanceof Error ? error.message : 'Failed to decline connection request. Please try again.',
        confirmText: "OK",
        variant: "danger",
        onConfirm: () => setConfirmationDialog(prev => ({ ...prev, open: false }))
      });
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
          targetUserId: safeProfileData.userId,
          note: note
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send connection request');
      }

      const result = await response.json();
      if (result.success) {
        // Update connection status to pending
        setCurrentConnectionStatus("pending");
        setConnectionDialogOpen(false);
        // Call the original onConnect if provided
        onConnect?.();
      } else {
        throw new Error(result.error || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      setConfirmationDialog({
        open: true,
        title: "Connection Error",
        description: error instanceof Error ? error.message : 'Failed to send connection request. Please try again.',
        confirmText: "OK",
        variant: "danger",
        onConfirm: () => setConfirmationDialog(prev => ({ ...prev, open: false }))
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Use campExperience from profileData if present, otherwise use empty array for testing
  const campExperience = safeProfileData.campExperience && safeProfileData.campExperience.length > 0
    ? safeProfileData.campExperience
    : [];

  if (!safeProfileData) {
    return null;
  }

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
      
      {/* Header with Profile Actions */}
      <ProfileHeader
        isOwnProfile={isOwnProfile}
        onConnect={canDraft ? handleConnectClick : undefined}
        onWithdrawConnection={handleWithdrawConnection}
        onAcceptConnection={handleAcceptConnection}
        onDeclineConnection={handleDeclineConnection}
        onReport={() => {}}
        onShare={onShare}
        onPreviewProfile={isOwnProfile ? handlePreviewProfile : undefined}
        onEditProfile={isOwnProfile ? handleEditProfile : undefined}
        isPreviewMode={isPreviewMode}
        connectLabel="Draft"
        profileName={safeProfileData.fullName}
        profileType="athlete"
        reportedUserId={safeProfileData.userId}
        connectionStatus={currentConnectionStatus}
        connectionDirection={connectionDirection}
        isConnecting={isConnecting}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSaveChanges={saveProfile}
        onDiscardChanges={discardChanges}
      />

      {/* Connection Dialog */}
      {!isOwnProfile && canDraft && (
        <ConnectionDialog
          open={connectionDialogOpen}
          onOpenChange={setConnectionDialogOpen}
          profileName={safeProfileData.fullName || ""}
          profileType="athlete"
          onConfirm={handleConnectionConfirm}
        />
      )}

      {/* Verification Dialog */}
      <VerificationDialog
        open={verificationDialogOpen}
        onOpenChange={setVerificationDialogOpen}
        role="athlete"
        educationLevel={safeProfileData.educationLevel}
        onVerificationSubmitted={() => {
          // Refresh the page or update verification status
          window.location.reload();
        }}
      />

      {/* Edit Dialogs */}
      <AthleteEditDialogs
        isOpen={!!editDialogOpen}
        dialogType={editDialogOpen}
        profileData={{
          ...safeProfileData,
          measurables: measurablesWithStableIds,
          campExperience: campExperience
        }}
        measurableIdToEdit={measurableIdToEdit}
        onClose={() => {
          setEditDialogOpen(null);
          setMeasurableIdToEdit(null);
        }}
        onSave={(updates: Partial<AthleteProfileData>) => {
          try {
            updateProfileData(updates);
            // Close dialog immediately after updating data
            setEditDialogOpen(null);
            setMeasurableIdToEdit(null);
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
        selectedSport={selectedSport}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) => setConfirmationDialog(prev => ({ ...prev, open }))}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
        confirmText={confirmationDialog.confirmText}
        variant={confirmationDialog.variant}
        onConfirm={confirmationDialog.onConfirm}
      />

      <div className="container py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-6 xl:gap-8">
          {/* Sidebar - Basic Info */}
          <div className="space-y-2 lg:space-y-4 xl:space-y-6">
            {/* Profile Card */}
            <Card className="w-full min-h-[260px]">
              <CardContent className="p-4 md:p-6">
                <div className="text-center">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 flex-shrink-0">
                    {safeProfileData.profileImage ? (
                      <Image
                        src={safeProfileData.profileImage}
                        alt={safeProfileData.fullName || "Profile picture"}
                        fill
                        className="rounded-full object-cover"
                        sizes="(max-width: 768px) 96px, 128px"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                        <span className="text-lg md:text-xl font-semibold text-muted-foreground">
                          {safeProfileData.fullName.split(' ').map((n: string) => n[0]).join('')}
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
                        {safeProfileData.profileImage && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 rounded-full p-1 h-6 w-6"
                            onClick={handleRemoveImage}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    {/* Name and Edit Button - Always together */}
                    <div className="flex items-center justify-center gap-2">
                      <h1 className="text-lg md:text-xl font-bold">{safeProfileData.fullName}</h1>
                      {effectiveIsOwnProfile && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-6 w-6"
                          onClick={() => handleEditSection('basic-info')}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Verified Badge - Below name on mobile, cleaner layout */}
                    {safeProfileData.isVerified && (
                      <div className="flex justify-center">
                        <Badge className={`text-white text-xs ${
                          safeProfileData.isOnTransferPortal === true
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {safeProfileData.isOnTransferPortal === true ? 'Verified Transfer' : 'Verified'}
                        </Badge>
                      </div>
                    )}

                    {/* Unverified Transfer Badge - For D1/D2/D3 athletes who need transfer portal verification */}
                    {!safeProfileData.isVerified && 
                     (safeProfileData.educationLevel === 'undergraduate' || safeProfileData.educationLevel === 'graduate') &&
                     safeProfileData.division &&
                     ['NCAA Division I', 'NCAA Division II', 'NCAA Division III'].includes(safeProfileData.division) &&
                     !safeProfileData.transferPortalVerifiedAt && (
                      <div className="flex justify-center">
                        <Badge variant="outline" className="border-orange-300 text-orange-600 text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Unverified Transfer
                        </Badge>
                      </div>
                    )}

                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                      {/* Main Sport with Team Level for High School Students */}
                      {(safeProfileData.educationLevel === 'high_school' || safeProfileData.isDemoProfile) ? (
                        <Badge className={`text-white hover:opacity-90 text-xs shadow-md ${
                          safeProfileData.teamLevel === 'varsity' 
                            ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                            : safeProfileData.teamLevel === 'jv'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                            : safeProfileData.teamLevel === 'freshman'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-gradient-to-r from-orange-500 to-red-500' // Default to varsity
                        }`}>
                          <Trophy className="w-3 h-3 mr-1" />
                          {safeProfileData.teamLevel === 'varsity' ? 'Varsity' :
                           safeProfileData.teamLevel === 'jv' ? 'Junior Varsity' :
                           safeProfileData.teamLevel === 'freshman' ? 'Freshman' : 'Varsity'} {safeProfileData.sport}
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white hover:from-cyan-600 hover:to-teal-700 text-xs shadow-md">
                          {safeProfileData.sport}
                        </Badge>
                      )}
                      {safeProfileData.secondarySports?.map(sport => (
                        <Badge key={sport} variant="outline" className="text-xs">
                          {sport}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center justify-center gap-1 min-w-0">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="text-center break-words whitespace-normal">
                          {safeProfileData.city && safeProfileData.country 
                            ? safeProfileData.country === 'United States' && safeProfileData.state
                              ? `${safeProfileData.city}, ${safeProfileData.state}`
                              : `${safeProfileData.city}, ${safeProfileData.country}`
                            : safeProfileData.city || safeProfileData.country
                          }
                        </span>
                      </div>
                      {/* Only show country separately if it's not United States and we have a state */}
                      {safeProfileData.country && safeProfileData.country !== 'United States' && safeProfileData.state && (
                        <div className="flex justify-center mt-1">
                          <span className="text-sm text-muted-foreground">
                            {safeProfileData.country}
                          </span>
                        </div>
                      )}
                      <p className="text-center break-words">{safeProfileData.organizationName}</p>
                      <p className="text-center">Class of {safeProfileData.graduationYear}</p>
                      
                      {/* Education Level and Competition Level Badges */}
                      <div className="flex flex-col items-center gap-2 pt-2">
                        <div className="flex items-center gap-2 px-3 py-2 text-foreground rounded-lg border border-border">
                          <GraduationCap className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {safeProfileData.educationLevel === 'high_school' && 'High School Student'}
                            {safeProfileData.educationLevel === 'undergraduate' && 'College Student'}
                            {safeProfileData.educationLevel === 'graduate' && 'Graduate Student'}
                            {safeProfileData.educationLevel === 'associate' && 'Community College Student'}
                          </span>
                        </div>
                        
                        {/* Competition Level Badge - Only show for college athletes */}
                        {safeProfileData.division && (safeProfileData.educationLevel === 'undergraduate' || safeProfileData.educationLevel === 'graduate') && (
                          <div className="flex items-center gap-2 px-3 py-2 text-foreground rounded-lg border border-border text-sm font-medium">
                            <Trophy className="w-4 h-4" />
                            <span>{safeProfileData.division}</span>
                          </div>
                        )}
                        
                        {/* Conference Badge - Show for D1/D2/D3 athletes with a conference */}
                        {safeProfileData.conference && 
                         safeProfileData.division && 
                         ['NCAA Division I', 'NCAA Division II', 'NCAA Division III'].includes(safeProfileData.division) && (
                          <div className="flex items-center gap-2 px-3 py-2 text-foreground rounded-lg border border-border text-sm font-medium">
                            <Trophy className="w-4 h-4" />
                            <span>{safeProfileData.conference}</span>
                          </div>
                        )}
                        
                        {/* Conference Text - Show for JUCOs, Club Sports and other divisions with conferences */}
                        {safeProfileData.conference && 
                         safeProfileData.division && 
                         !['NCAA Division I', 'NCAA Division II', 'NCAA Division III'].includes(safeProfileData.division) && (
                          <div className="text-sm text-muted-foreground text-center">
                            <span className="font-medium">Conference:</span> {safeProfileData.conference}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 text-sm">
                      {safeProfileData.positions.map(position => (
                        <Badge key={position} variant="secondary" className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {position}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Height</p>
                        <p className="font-semibold">{safeProfileData.height}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Weight</p>
                        <p className="font-semibold">{safeProfileData.weight}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <SocialMediaSection 
                  socialMedia={safeProfileData.socialMedia} 
                  isOwnProfile={effectiveIsOwnProfile}
                  onEdit={() => handleEditSection('social-media')}
                />
              </CardContent>
            </Card>

            {/* Personal Statement - Mobile Only */}
            <div className="lg:hidden">
              {safeProfileData.personalStatement ? (
                <Card className="w-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>About {safeProfileData.fullName.split(' ')[0]}</CardTitle>
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
                    <p className="text-muted-foreground leading-relaxed">{safeProfileData.personalStatement}</p>
                  </CardContent>
                </Card>
              ) : effectiveIsOwnProfile && (
                <Card className="w-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>About {safeProfileData.fullName.split(' ')[0]}</CardTitle>
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
                        <p className="font-medium text-muted-foreground mb-2">No Personal Statement Added</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Tell coaches and recruiters about yourself, your goals, and what makes you unique
                        </p>
                        <Button 
                          variant="outline"
                          onClick={() => handleEditSection('personal-statement')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Personal Statement
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Camp Experience / Club Card */}
            <CampExperienceCard 
              experiences={campExperience} 
              isOwnProfile={effectiveIsOwnProfile}
              onEdit={() => handleEditSection('camp-experience')}
            />
            {/* Academic Summary Card */}
            <AcademicSummaryCard
              gpa={safeProfileData.gpa}
              satScore={safeProfileData.satScore}
              actScore={safeProfileData.actScore}
              intendedMajor={safeProfileData.intendedMajor}
              educationLevel={safeProfileData.educationLevel}
              isOwnProfile={effectiveIsOwnProfile}
              onEditSection={handleEditSection}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-2 lg:space-y-6 xl:space-y-8">
            {/* Personal Statement - Desktop Only */}
            <div className="hidden lg:block">
              {safeProfileData.personalStatement ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>About {safeProfileData.fullName.split(' ')[0]}</CardTitle>
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
                    <p className="text-muted-foreground leading-relaxed">{safeProfileData.personalStatement}</p>
                  </CardContent>
                </Card>
              ) : effectiveIsOwnProfile && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>About {safeProfileData.fullName.split(' ')[0]}</CardTitle>
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
                        <p className="font-medium text-muted-foreground mb-2">No Personal Statement Added</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Tell coaches and recruiters about yourself, your goals, and what makes you unique
                        </p>
                        <Button 
                          variant="outline"
                          onClick={() => handleEditSection('personal-statement')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Personal Statement
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Measurements - Combined with sport selector */}
            <MeasurablesSection
              measurables={measurablesWithStableIds}
              allSports={allSports}
              selectedSport={selectedSport}
              onSportChange={setSelectedSport}
              isOwnProfile={effectiveIsOwnProfile}
              onEditSection={handleEditSection}
            />

            {/* Verification Section */}
            {effectiveIsOwnProfile && !isPreviewMode && (
              <VerificationSection
                profileData={data}
                displayData={safeProfileData}
                isOwnProfile={effectiveIsOwnProfile}
                onEditHudl={safeProfileData.isVerified ? undefined : () => handleEditSection('hudl-highlights')}
                onShowVerificationDialog={() => handleEditSection('manual-verification')}
                hasPendingVerification={hasPendingVerification}
                pendingSubmittedAt={pendingSubmittedAt}
                hasRejectedVerification={hasRejectedVerification}
                rejectionReason={rejectionReason}
                rejectedAt={rejectedAt}
                hasPendingTransferPortalVerification={hasPendingTransferPortalVerification}
                transferPortalPendingSubmittedAt={transferPortalPendingSubmittedAt}
                hasRejectedTransferPortalVerification={hasRejectedTransferPortalVerification}
                transferPortalRejectionReason={transferPortalRejectionReason}
                transferPortalRejectedAt={transferPortalRejectedAt}
              />
            )}
            
            {/* Hudl Profile - All Athletes */}
            {(safeProfileData.hudlUrl || effectiveIsOwnProfile) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Hudl Profile</CardTitle>
                    {effectiveIsOwnProfile && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditSection('hudl-highlights')}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {safeProfileData.hudlUrl ? (
                    <div className="bg-muted rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">Hudl Profile</p>
                        <p className="text-sm text-muted-foreground">
                          {safeProfileData.educationLevel === 'high_school' 
                            ? 'Game film, highlight reels, and athletic performance videos' 
                            : 'Athletic performance videos and highlight reels'}
                        </p>
                        {safeProfileData.educationLevel === 'high_school' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Can be used for profile verification
                          </p>
                        )}
                      </div>
                      <Link href={safeProfileData.hudlUrl} target="_blank" className="flex-shrink-0">
                        <Button variant="outline" size="sm" className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white border-[#01ae79] dark:bg-[#01ae79] dark:hover:bg-[#01ae79]/70 w-full sm:w-auto">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Film
                        </Button>
                      </Link>
                    </div>
                  ) : effectiveIsOwnProfile && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-center">
                        <p className="font-medium text-muted-foreground mb-2">Hudl Profile Not Added</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add your Hudl profile to showcase game film and highlight reels
                          {safeProfileData.educationLevel === 'high_school' && (
                            <span className="block mt-1 text-xs">
                              High school athletes can use Hudl for profile verification
                            </span>
                          )}
                        </p>
                        <Button 
                          variant="outline"
                          onClick={() => handleEditSection('hudl-highlights')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Hudl URL
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* MaxPreps Profile */}
            {(safeProfileData.maxPrepsUrl || effectiveIsOwnProfile) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>MaxPreps Profile</CardTitle>
                    {effectiveIsOwnProfile && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditSection('maxpreps-verification')}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {safeProfileData.maxPrepsUrl ? (
                    <div className="bg-muted rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">MaxPreps Profile</p>
                        <p className="text-sm text-muted-foreground">Official high school stats and verification</p>
                      </div>
                      <Link href={safeProfileData.maxPrepsUrl} target="_blank" className="flex-shrink-0">
                        <Button variant="outline" size="sm" className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white border-[#01ae79] dark:bg-[#01ae79] dark:hover:bg-[#01ae79]/70 w-full sm:w-auto">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Stats
                        </Button>
                      </Link>
                    </div>
                  ) : effectiveIsOwnProfile && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-center">
                        <p className="font-medium text-muted-foreground mb-2">MaxPreps Profile Not Added</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add your MaxPreps profile to showcase official stats and verification
                        </p>
                        <Button 
                          variant="outline"
                          onClick={() => handleEditSection('maxpreps-verification')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add MaxPreps URL
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 247Sports Profile */}
            {(safeProfileData.sports247Url || effectiveIsOwnProfile) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>247Sports Profile</CardTitle>
                    {effectiveIsOwnProfile && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditSection('sports247-verification')}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {safeProfileData.sports247Url ? (
                    <div className="bg-muted rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">247Sports Profile</p>
                        <p className="text-sm text-muted-foreground">Recruiting rankings, evaluations, and scouting reports</p>
                      </div>
                      <Link href={safeProfileData.sports247Url} target="_blank" className="flex-shrink-0">
                        <Button variant="outline" size="sm" className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white border-[#01ae79] dark:bg-[#01ae79] dark:hover:bg-[#01ae79]/70 w-full sm:w-auto">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  ) : effectiveIsOwnProfile && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-center">
                        <p className="font-medium text-muted-foreground mb-2">247Sports Profile Not Added</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add your 247Sports profile to showcase recruiting rankings and evaluations
                        </p>
                        <Button 
                          variant="outline"
                          onClick={() => handleEditSection('sports247-verification')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add 247Sports URL
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ESPN Profile */}
            {(safeProfileData.espnUrl || effectiveIsOwnProfile) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>ESPN Profile</CardTitle>
                    {effectiveIsOwnProfile && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditSection('espn-verification')}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {safeProfileData.espnUrl ? (
                    <div className="bg-muted rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">ESPN Profile</p>
                        <p className="text-sm text-muted-foreground">Rankings, stats, and evaluations</p>
                      </div>
                      <Link href={safeProfileData.espnUrl} target="_blank" className="flex-shrink-0">
                        <Button variant="outline" size="sm" className="bg-[#ff0000] hover:bg-[#ff0000]/90 text-white border-[#ff0000] dark:bg-[#ff0000] dark:hover:bg-[#ff0000]/70 w-full sm:w-auto">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  ) : effectiveIsOwnProfile && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-center">
                        <p className="font-medium text-muted-foreground mb-2">ESPN Profile Not Added</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add your ESPN profile to showcase rankings, stats, and evaluations
                        </p>
                        <Button 
                          variant="outline"
                          onClick={() => handleEditSection('espn-verification')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add ESPN URL
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* YouTube Videos */}
            {(safeProfileData.youtubeVideos && safeProfileData.youtubeVideos.length > 0) || effectiveIsOwnProfile ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Highlight Videos</CardTitle>
                    {effectiveIsOwnProfile && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditSection('video-highlights')}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {safeProfileData.youtubeVideos && safeProfileData.youtubeVideos.length > 0 ? (
                    <div className="space-y-4">
                      {safeProfileData.youtubeVideos.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((video, index) => (
                        <div key={video.id || index} className="space-y-2">
                          <h4 className="font-medium break-words">{video.title}</h4>
                          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                            <iframe
                              src={video.embedUrl}
                              className="absolute inset-0 w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={video.title}
                            />
                          </div>
                                              </div>
                    ))}
                  </div>
                ) : effectiveIsOwnProfile && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-center">
                      <p className="font-medium text-muted-foreground mb-2">No Highlight Videos Added</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add YouTube videos to showcase your best plays and skills
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => handleEditSection('video-highlights')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Videos
                      </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
} 