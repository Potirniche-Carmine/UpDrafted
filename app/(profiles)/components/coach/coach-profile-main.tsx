"use client";

import React, { useState, useEffect, memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  X
} from "lucide-react";
import { ProfileHeader } from "../shared/profile-header";
import { CoachEditDialogs } from "./coach-edit-dialogs";
import { CoachVerificationSection } from "./coach-verification-section";
import { CoachLevelBanner } from "./coach-level-banner";
import { VerificationDialog } from "../shared/verification-dialog";
import { OptimizedOrgLogo } from "../shared/optimized-org-logo";
import { CoachProfileData, CoachProfileProps } from './coach-profile-types';
import { ConnectionDialog } from "../shared/connection-dialog";
import { useRoleView } from '@/hooks/use-role-view';

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
    if (cleanHandle.length > 22) {
      return `@${cleanHandle.substring(0, 19)}...`;
    }
    return `@${cleanHandle}`;
  };

  return (
    <div className="pt-2 relative">
      <div className="flex items-center justify-between mb-2">
        {isOwnProfile && (
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
              <span className={`${getTextSizeClass(socialMedia.instagram)} font-medium truncate max-w-[120px] sm:max-w-none`}>
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
              <span className={`${getTextSizeClass(socialMedia.twitter)} font-medium truncate max-w-[120px] sm:max-w-none`}>
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

export function CoachProfile({ 
  data, 
  isOwnProfile = false, 
  onConnect, 
  onShare,
  hasPendingVerification,
  pendingSubmittedAt,
  connectionStatus = "none"
}: CoachProfileProps) {
  const [profileData, setProfileData] = useState<CoachProfileData>(data);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState<string | null>(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentConnectionStatus, setCurrentConnectionStatus] = useState(connectionStatus);
  const { effectiveRole } = useRoleView();

  // Determine if current user can connect to this coach
  const canConnect = useMemo(() => 
    !isOwnProfile && (effectiveRole === 'athlete' || effectiveRole === 'recruiter' || effectiveRole === 'coach'),
    [isOwnProfile, effectiveRole]
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
      const newData = { ...profileData, ...updates };
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

  // Warn user about unsaved changes when leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleEditSection = (section: string) => {
    if (section === 'manual-verification') {
      setVerificationDialogOpen(true);
      return;
    }
    
    setEditDialogOpen(section);
  };

  const saveProfile = async () => {
    if (!isOwnProfile || !hasUnsavedChanges) return;
    
    setIsSaving(true);
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
      
      // Use userId (Clerk user ID) instead of id (database primary key)
      const userIdForApi = profileData.userId || profileData.id;
      
      const response = await fetch(`/api/profile/${userIdForApi}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      if (result.success) {
        // Update the original data to match saved data
        setProfileData(result.profile);
        setHasUnsavedChanges(false);        
        // Update the page data reference so changes are permanent
        Object.assign(data, result.profile);
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to discard them?');
      if (confirmed) {
        setProfileData(data);
        setHasUnsavedChanges(false);
      }
    }
  };

  const handleRemoveImage = async (imageType: 'profile' | 'organization') => {
    const imageName = imageType === 'profile' ? 'profile picture' : 'organization logo';
    const confirmed = window.confirm(`Are you sure you want to remove your ${imageName}? This action cannot be undone.`);
    
    if (!confirmed) return;

    setIsSaving(true);
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

      // Get current image URL for deletion
      const currentImageUrl = imageType === 'profile' 
        ? profileData.profileImage 
        : profileData.organizationLogo;

      if (!currentImageUrl) {
        alert('No image to remove');
        return;
      }

      const formData = new FormData();
      formData.append('userId', profileData.userId || profileData.id);
      formData.append('imageType', imageType);
      // Remove any existing cache-busting parameters before sending for deletion
      const cleanUrl = currentImageUrl.split('?')[0];
      formData.append('currentImageUrl', cleanUrl);
      formData.append('removeOnly', 'true'); // Flag to only remove, not replace

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to remove image');
      }

      // Update profile data immediately
      const updates: Partial<CoachProfileData> = {};
      if (imageType === 'profile') {
        updates.profileImage = undefined;
      } else {
        updates.organizationLogo = undefined;
      }
      
      updateProfileData(updates);      
    } catch (error) {
      console.error(`Error removing ${imageName}:`, error);
      alert(`Failed to remove ${imageName}. Please try again.`);
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header Actions */}
      <ProfileHeader
        isOwnProfile={isOwnProfile}
        onConnect={canConnect ? handleConnectClick : undefined}
        onWithdrawConnection={handleWithdrawConnection}
        onReport={() => {}}
        onShare={onShare}
        connectLabel="Connect with Coach"
        profileName={profileData.fullName}
        profileType="coach"
        reportedUserId={profileData.userId}
        connectionStatus={currentConnectionStatus}
        isConnecting={isConnecting}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSaveChanges={saveProfile}
        onDiscardChanges={discardChanges}
      />

      {/* Connection Dialog */}
      <ConnectionDialog
        open={connectionDialogOpen}
        onOpenChange={setConnectionDialogOpen}
        profileName={profileData.fullName}
        profileType="coach"
        onConfirm={handleConnectionConfirm}
        isConnecting={isConnecting}
      />

      {/* Verification Dialog */}
      <VerificationDialog
        open={verificationDialogOpen}
        onOpenChange={setVerificationDialogOpen}
        role="coach"
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
                  <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4">
                    {profileData.profileImage ? (
                      <Image
                        src={profileData.profileImage.includes('?') ? profileData.profileImage : `${profileData.profileImage}?v=1`}
                        alt={profileData.fullName || "Profile picture"}
                        fill
                        className="rounded-full object-cover"
                        sizes="(max-width: 768px) 96px, 128px"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                        <span className="text-lg md:text-xl font-semibold text-muted-foreground">
                          {profileData.fullName?.split(' ').map((n: string) => n[0]).join('') || '?'}
                        </span>
                      </div>
                    )}
                    {isOwnProfile && (
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
                            disabled={isSaving}
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
                      {isOwnProfile && (
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
                      <span>{profileData.city}, {profileData.state}</span>
                    </div>
                  </div>

                  {/* Social Media Links */}
                  <SocialMediaSection 
                    socialMedia={{
                      instagram: profileData.instagramHandle,
                      twitter: profileData.twitterHandle
                    }} 
                    isOwnProfile={isOwnProfile}
                    onEdit={() => handleEditSection('social-media')}
                  />
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
                  {isOwnProfile && (
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
                      {isOwnProfile && (
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
                            disabled={isSaving}
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
                ) : isOwnProfile && (
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

                {!profileData.programWebsite && !profileData.schoolWebsite && isOwnProfile && (
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

            {/* Verification Section */}
            {isOwnProfile && (
              <CoachVerificationSection
                profileData={profileData}
                isOwnProfile={isOwnProfile}
                onShowVerificationDialog={() => handleEditSection('manual-verification')}
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
                    {isOwnProfile && (
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
            ) : isOwnProfile && (
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
                    {isOwnProfile && (
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Graduation Years</p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {profileData.recruitingNeeds.graduationYears?.map((year) => (
                          <Badge key={year} variant="outline" className="text-sm">
                            {year}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Positions Needed</p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {profileData.recruitingNeeds.positions?.map((position) => (
                          <Badge key={position} className="bg-blue-100 text-blue-800 text-sm">
                            {position}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {profileData.recruitingNeeds.scholarshipsAvailable && (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Scholarships Available</p>
                        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                          <p className="font-bold text-green-600 text-2xl">{profileData.recruitingNeeds.scholarshipsAvailable}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* What We're Looking For section - uses recruitingPhilosophy */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-orange-50 dark:from-blue-950 dark:to-orange-950 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium">What We&apos;re Looking For</h4>
                      {isOwnProfile && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-6 w-6 ml-auto"
                          onClick={() => handleEditSection('recruiting-needs')}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    {profileData.recruitingNeeds.recruitingPhilosophy ? (
                      <p className="text-sm text-muted-foreground">
                        {profileData.recruitingNeeds.recruitingPhilosophy}
                      </p>
                    ) : isOwnProfile ? (
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
            ) : isOwnProfile ? (
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
            {(profileData.showcaseVideoUrl || isOwnProfile) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Program Showcase</CardTitle>
                    {isOwnProfile && (
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
                  ) : isOwnProfile ? (
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
            <Card className="border-primary/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Ready to Take the Next Step?</h3>
                <p className="text-muted-foreground mb-4">
                  Join our {profileData.sportCoaching} program and compete at the highest level while pursuing your academic goals.
                </p>
                {!isOwnProfile && (
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={onConnect}
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    Express Interest
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 