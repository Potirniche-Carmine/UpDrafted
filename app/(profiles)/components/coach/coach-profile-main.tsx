"use client";

import React, { useState, useEffect, memo, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Instagram,
  Twitter,
  ExternalLink,
  Edit,
  Plus,
  GraduationCap,
  Shield,
  Trophy,
  Users,
  Globe,
  Target,
  AlertTriangle,
  X,
} from "lucide-react";
import { ProfileHeader } from "../shared/profile-header";
import { CoachEditDialogs } from "./coach-edit-dialogs";
import { CoachVerificationSection } from "./coach-verification-section";
import { CoachLevelBanner } from "./coach-level-banner";
import { VerificationDialog } from "../shared/verification-dialog";
import { OptimizedOrgLogo } from "../shared/optimized-org-logo";
import { CoachProfileData, CoachProfileProps } from './coach-profile-types';
import { ConnectionDialog } from "../shared/connection-dialog";
import { useUser } from "@clerk/nextjs";
import { useRoleView } from '@/hooks/use-role-view';
import { getStudentClassificationDisplayName, StudentClassification } from '@/lib/sports-data';

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
              className="flex items-center justify-center gap-2 px-2 sm:px-3 py-2 bg-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity min-w-0"
              title={`@${socialMedia.twitter.replace('@', '')}`}
            >
              <Twitter className="w-4 h-4 flex-shrink-0" />
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

  // Check if we have any valid social media handles
  const hasValidSocialMedia = socialMedia?.instagram || socialMedia?.twitter;

  return (
    <div className="space-y-3">
      {hasValidSocialMedia ? (
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
      
      {hasValidSocialMedia ? (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
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
              className="flex items-center justify-center gap-2 px-2 sm:px-3 py-2 bg-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity min-w-0"
              title={`@${socialMedia.twitter.replace('@', '')}`}
            >
              <Twitter className="w-4 h-4 flex-shrink-0" />
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

export function CoachProfile({ 
  data, 
  isOwnProfile = false, 
  onConnect, 
  onShare,
  hasPendingVerification,
  pendingSubmittedAt,
  connectionStatus = "none",
  connectionDirection
}: CoachProfileProps) {
  const [profileData, setProfileData] = useState<CoachProfileData>(data);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState<string | null>(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentConnectionStatus, setCurrentConnectionStatus] = useState(connectionStatus);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
    const { user } = useUser();
  const effectiveRole = user?.publicMetadata?.role as string;
  
  // Get admin role information for demo profile uploads
  const { isAdmin, viewingAs } = useRoleView();

  // Calculate effective ownership - in preview mode, treat as if viewing someone else's profile
  const effectiveIsOwnProfile = isOwnProfile && !isPreviewMode;

  // Determine if current user can connect to this coach
  const canConnect = useMemo(() => 
    !effectiveIsOwnProfile && (effectiveRole === 'athlete' || effectiveRole === 'recruiter' || effectiveRole === 'coach'),
    [effectiveIsOwnProfile, effectiveRole]
  );

  // Track if profile data has changed from original
  const checkForChanges = (newData: CoachProfileData) => {
    try {
      const hasChanges = JSON.stringify(newData) !== JSON.stringify(data);
      setHasUnsavedChanges(hasChanges);
    } catch (error) {
      console.error('Error checking for changes:', error);
      // If we can't compare, assume there are changes to be safe
      setHasUnsavedChanges(true);
    }
  };

  // Update profile data and track changes
  const updateProfileData = (updates: Partial<CoachProfileData>) => {
    try {
      // Add debugging for program social media updates
      if (updates.programInstagram !== undefined || updates.programTwitter !== undefined) {
        console.log('updateProfileData - program social media update:', {
          updates,
          currentProgramInstagram: profileData.programInstagram,
          currentProgramTwitter: profileData.programTwitter,
          newProgramInstagram: updates.programInstagram,
          newProgramTwitter: updates.programTwitter
        });
      }

      // Handle nested object updates properly
      const newData = { ...profileData };
      
      // For each update, handle nested objects specially
      Object.keys(updates).forEach(key => {
        const typedKey = key as keyof CoachProfileData;
        if (typedKey === 'recruitingNeeds' && updates[typedKey]) {
          // Ensure recruitingNeeds is properly merged
          newData.recruitingNeeds = {
            ...(profileData.recruitingNeeds || {}),
            ...updates[typedKey]
          };
        } else {
          // Add debugging for program social media fields
          if (typedKey === 'programInstagram' || typedKey === 'programTwitter') {
            console.log(`updateProfileData - setting ${typedKey}:`, {
              oldValue: newData[typedKey],
              newValue: updates[typedKey],
              isUndefined: updates[typedKey] === undefined
            });
          }
          // @ts-expect-error - TypeScript can't infer the correct type here but it's safe
          newData[typedKey] = updates[typedKey];
        }
      });
      
      console.log('updateProfileData - new data after update:', {
        programInstagram: newData.programInstagram,
        programTwitter: newData.programTwitter
      });
      
      setProfileData(newData);
      checkForChanges(newData);
    } catch (error) {
      console.error('Error updating profile data:', error);
      // Optionally show a user-friendly error message
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = 'Error updating profile. Please try again.';
      document.body.appendChild(notification);
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
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

  const handleEditSection = (section: string) => {
    if (section === 'manual-verification' || section === 'verification') {
      setVerificationDialogOpen(true);
      return;
    }
    
    setEditDialogOpen(section);
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
      
      const response = await fetch(`/api/profile/${userIdForApi}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        // Get the actual error message from the response
        let errorMessage = 'Failed to update profile';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use a generic message
          errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
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
      console.error('Error saving profile:', error);
      
      // Show a detailed error message to the user
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Create a more prominent error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md text-center';
      notification.innerHTML = `
        <div class="font-semibold">Failed to save profile</div>
        <div class="text-sm mt-1">${errorMessage}</div>
        <div class="text-xs mt-2 opacity-90">Please try again or contact support if the issue persists.</div>
      `;
      document.body.appendChild(notification);
      
      // Remove notification after 8 seconds
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 8000);
      
      setIsSaving(false); // Only turn off loading on error
    }
  };

  const discardChanges = () => {
    if (hasUnsavedChanges) {
      setConfirmDiscardOpen(true);
    }
  };

  const handleConfirmDiscard = () => {
    setProfileData(data);
    setHasUnsavedChanges(false);
    setConfirmDiscardOpen(false);
  };

  const handleRemoveImage = (imageType: 'profile' | 'organization') => {
    // Remove image from frontend and mark as unsaved change
    const updates: Partial<CoachProfileData> = {};
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
      alert(error instanceof Error ? error.message : 'Failed to withdraw connection request. Please try again.');
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
      alert(error instanceof Error ? error.message : 'Failed to send connection request. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Add safety check for profileData
  if (!profileData || !profileData.fullName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 relative flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted border-t-[#01ae79]"></div>
      </div>
    );
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
      
      {/* Header Actions */}
      <ProfileHeader
        isOwnProfile={isOwnProfile}
        onConnect={canConnect ? handleConnectClick : undefined}
        onWithdrawConnection={handleWithdrawConnection}
        onAcceptConnection={handleConnectionConfirm}
        onDeclineConnection={handleWithdrawConnection}
        onReport={() => {}}
        onShare={onShare}
        onPreviewProfile={isOwnProfile ? handlePreviewProfile : undefined}
        onEditProfile={isOwnProfile ? handleEditProfile : undefined}
        isPreviewMode={isPreviewMode}
        connectLabel="Connect with Coach"
        profileName={profileData.fullName}
        profileType="coach"
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
          profileType="coach"
          onConfirm={handleConnectionConfirm}
          isConnecting={isConnecting}
        />
      )}

      {/* Verification Dialog */}
      <VerificationDialog
        open={verificationDialogOpen}
        onOpenChange={setVerificationDialogOpen}
        role="coach"
        onVerificationSubmitted={() => {
          setTimeout(() => {
            window.location.reload();
          }, 2000); // Give user time to read success message
        }}
      />

      {/* Edit Dialogs */}
      <CoachEditDialogs
        isOpen={!!editDialogOpen}
        dialogType={editDialogOpen}
        profileData={profileData}
        onClose={() => setEditDialogOpen(null)}
        onSave={(updates: Partial<CoachProfileData>) => {
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

      <div className="container py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Sidebar - Basic Info */}
          <div className="space-y-4 md:space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="text-center">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 flex-shrink-0">
                    {profileData.profileImage ? (
                      <Image
                        src={profileData.profileImage.includes('?') ? profileData.profileImage : `${profileData.profileImage}?v=1`}
                        alt={profileData.fullName || "Profile picture"}
                        fill
                        className="rounded-full object-cover"
                        sizes="(max-width: 768px) 96px, 128px"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                        <span className="text-lg md:text-xl font-semibold text-muted-foreground">
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
                    <div className="flex items-center justify-center gap-2">
                      <h1 className="text-lg md:text-xl font-bold">{profileData.fullName}</h1>
                      {profileData.isVerified ? (
                        <Badge className="bg-green-600 text-white text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-orange-300 text-orange-600 text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
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

            {/* Coach Level Banner */}
            <CoachLevelBanner
              division={profileData.division}
              conference={profileData.conference}
              organizationName={profileData.organizationName}
              sportCoaching={profileData.sportCoaching}
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

            {/* Verification Section - Show for own profile or admin viewing */}
            {(effectiveIsOwnProfile || (effectiveRole && hasPendingVerification !== undefined)) && !isPreviewMode && (
              <CoachVerificationSection
                profileData={profileData}
                isOwnProfile={effectiveIsOwnProfile}
                onShowVerificationDialog={() => handleEditSection('verification')}
                hasPendingVerification={hasPendingVerification}
                pendingSubmittedAt={pendingSubmittedAt}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Coach Section - uses personalStatement from database */}
            {profileData.personalStatement ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>About Coach {profileData.fullName.split(' ')[0]}</CardTitle>
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
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>About Coach {profileData.fullName.split(' ')[0]}</CardTitle>
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
                      <p className="font-medium text-muted-foreground mb-2">No Information Added</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Share your personal story, coaching journey, and what drives your passion
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
            {profileData.recruitingNeeds ? (
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Target className="w-5 h-5" />
                      Current Recruiting Needs - {profileData.sportCoaching}
                    </CardTitle>
                    {effectiveIsOwnProfile && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditSection('recruiting-needs')}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    {/* Recruiting Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Student Classifications */}
                      <div className="p-4 border rounded-lg bg-card">
                        <p className="text-sm font-medium text-foreground mb-3">Student Classifications</p>
                        <div className="flex flex-wrap gap-1">
                          {profileData.recruitingNeeds?.studentClassifications && profileData.recruitingNeeds.studentClassifications.length > 0 ? (
                            profileData.recruitingNeeds.studentClassifications.map((classification) => (
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
                          {profileData.recruitingNeeds?.positions && profileData.recruitingNeeds.positions.length > 0 ? (
                            profileData.recruitingNeeds.positions.map((position) => (
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
                      {profileData.recruitingNeeds?.scholarshipsAvailable && (
                        <div className="p-4 border rounded-lg bg-card">
                          <p className="text-sm font-medium text-foreground mb-3">Scholarships Available</p>
                          <div className="flex items-center justify-center">
                            <div className="bg-gradient-to-r from-[#01ae79]/20 to-[#01ae79]/10 border border-[#01ae79]/30 rounded-xl px-6 py-4 min-w-[80px] flex items-center justify-center">
                              <span className="text-4xl font-bold text-[#01ae79]">{profileData.recruitingNeeds.scholarshipsAvailable}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* What We're Looking For section - uses recruitingPhilosophy */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <h4 className="font-medium">What We&apos;re Looking For</h4>
                      </div>
                      {effectiveIsOwnProfile && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-6 w-6 flex-shrink-0"
                          onClick={() => handleEditSection('recruiting-needs')}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    {profileData.recruitingNeeds?.recruitingPhilosophy ? (
                      <p className="text-sm text-muted-foreground">
                        {profileData.recruitingNeeds.recruitingPhilosophy}
                      </p>
                    ) : effectiveIsOwnProfile ? (
                      <div className="text-center py-2">
                        <p className="text-sm text-muted-foreground mb-2">
                          Add what you&apos;re looking for in student-athletes
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditSection('recruiting-needs')}
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
                </CardContent>
              </Card>
            ) : effectiveIsOwnProfile ? (
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Target className="w-5 h-5" />
                      Current Recruiting Needs - {profileData.sportCoaching}
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditSection('recruiting-needs')}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-muted-foreground mb-2">No recruiting information yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add your current recruiting needs to help athletes understand what you&apos;re looking for
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => handleEditSection('recruiting-needs')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Recruiting Needs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

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
                        Add a video to highlight your program, facilities, or coaching philosophy.
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
                    Join our {profileData.sportCoaching} program and compete at the highest level while pursuing your academic goals.
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

      {/* Confirm Discard Changes Dialog */}
      <Dialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Changes?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            You have unsaved changes. Are you sure you want to discard them?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDiscardOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDiscard}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 