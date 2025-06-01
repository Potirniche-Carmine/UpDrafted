"use client";

import React, { useState, useMemo, memo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import {
  MapPin,
  Instagram,
  Twitter,
  Edit,
  Plus,
  GraduationCap,
  Shield
} from "lucide-react";
import { ProfileHeader } from "../shared/profile-header";
import { AthleticHighlightsSection } from "../shared/athletic-highlights-section";
import { AcademicSummaryCard } from "../shared/academic-summary-card";
import { VerificationDialog } from "../shared/verification-dialog";
import { VerificationSection } from "./athlete-verification-section";
import { AthleteEditDialogs } from "./athlete-edit-dialogs";
import { useRoleView } from '@/hooks/use-role-view';
import { AthleteProfileData, AthleteProfileProps, MeasurableEditData } from './athlete-profile-types';
import { EducationLevel } from '@/app/(onboarding)/lib/onboarding';

// Memoized social media section
const SocialMediaSection = memo(({ socialMedia, isOwnProfile, onEdit }: { 
  socialMedia?: { instagram?: string; twitter?: string };
  isOwnProfile?: boolean;
  onEdit?: () => void;
}) => {
  if (!socialMedia && !isOwnProfile) return null;

  return (
    <div className="pt-2 relative">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium">Follow Me</p>
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
      
      {socialMedia?.instagram || socialMedia?.twitter ? (
        <div className="flex justify-center gap-3">
          {socialMedia.instagram && (
            <a
              href={`https://instagram.com/${socialMedia.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Instagram className="w-4 h-4" />
              <span className="text-sm font-medium">{socialMedia.instagram}</span>
            </a>
          )}
          {socialMedia.twitter && (
            <a
              href={`https://twitter.com/${socialMedia.twitter.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Twitter className="w-4 h-4" />
              <span className="text-sm font-medium">{socialMedia.twitter}</span>
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

export function AthleteProfile({ data, isOwnProfile = false, onConnect, onShare }: AthleteProfileProps) {
  const [selectedSport, setSelectedSport] = useState(data.sport);
  const [profileData, setProfileData] = useState(data);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { effectiveRole } = useRoleView();
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, string | number | string[]>>({});
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [measurableEditData, setMeasurableEditData] = useState<MeasurableEditData>({
    label: '',
    value: '',
    customLabel: '',
    isCustom: false,
    measurementMonth: '',
    measurementYear: '',
    selectedMeasurableId: ''
  });
  const [tempVideos, setTempVideos] = useState<typeof profileData.youtubeVideos>(profileData.youtubeVideos || []);
  
  // Memoize computed values
  const allSports = useMemo(() => [profileData.sport, ...(profileData.secondarySports || [])], [profileData.sport, profileData.secondarySports]);
  const canDraft = useMemo(() => 
    !isOwnProfile && (effectiveRole === 'coach' || effectiveRole === 'recruiter'),
    [isOwnProfile, effectiveRole]
  );

  // Track if profile data has changed from original
  const checkForChanges = (newData: AthleteProfileData) => {
    const hasChanges = JSON.stringify(newData) !== JSON.stringify(data);
    setHasUnsavedChanges(hasChanges);
  };

  // Update profile data and track changes
  const updateProfileData = (updates: Partial<AthleteProfileData>) => {
    const newData = { ...profileData, ...updates };
    setProfileData(newData);
    checkForChanges(newData);
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

  // Initialize edit data when opening a dialog
  const initializeEditData = (section: string) => {
    switch (section) {
      case 'basic-info':
        const heightParts = profileData.height.match(/(\d+)'(\d+)"/);
        setEditData({
          fullName: profileData.fullName,
          sport: profileData.sport,
          educationLevel: profileData.educationLevel,
          secondarySports: profileData.secondarySports || [],
          positions: profileData.positions || [],
          city: profileData.city,
          state: profileData.state,
          highSchool: profileData.highSchool,
          graduationYear: profileData.graduationYear,
          heightFeet: heightParts ? heightParts[1] : '',
          heightInches: heightParts ? heightParts[2] : '',
          weight: profileData.weight.replace(/\s*lbs?\s*/gi, '')
        });
        break;
      case 'personal-statement':
      case 'add-personal-statement':
        setEditData({
          personalStatement: profileData.personalStatement || ''
        });
        break;
      case 'social-media':
        setEditData({
          instagram: profileData.socialMedia?.instagram || '',
          twitter: profileData.socialMedia?.twitter || ''
        });
        break;
      case 'add-maxpreps':
      case 'maxpreps-verification':
        setEditData({
          maxPrepsUrl: profileData.maxPrepsUrl || ''
        });
        break;
      default:
        setEditData({});
        break;
    }
    setValidationErrors({});
  };

  const handleEditSection = (section: string, measurableId?: string) => {
    initializeEditData(section);
    
    // If this is a delete operation for a specific measurable, directly delete it
    if (section === 'delete-measurable' && measurableId) {
      const confirmed = window.confirm('Are you sure you want to delete this performance metric? This action cannot be undone.');
      if (confirmed) {
        handleDeleteMeasurable(measurableId);
      }
      return;
    }
    
    setEditDialogOpen(section);
  };

  // Save edit data to profile
  const saveEditData = () => {
    const updates: Partial<AthleteProfileData> = {};
    
    if (editDialogOpen === 'basic-info') {
      updates.fullName = editData.fullName as string;
      updates.sport = editData.sport as string;
      updates.educationLevel = editData.educationLevel as EducationLevel;
      updates.secondarySports = editData.secondarySports as string[];
      updates.positions = editData.positions as string[];
      updates.city = editData.city as string;
      updates.state = editData.state as string;
      updates.highSchool = editData.highSchool as string;
      updates.graduationYear = editData.graduationYear as number;
      
      // Construct height string from feet and inches
      const feet = editData.heightFeet as string;
      const inches = editData.heightInches as string;
      if (feet && inches) {
        updates.height = `${feet}'${inches}"`;
      }
      
      // Add lbs to weight if not present
      const weight = editData.weight as string;
      if (weight) {
        updates.weight = weight.includes('lbs') ? weight : `${weight} lbs`;
      }
    } else if (editDialogOpen === 'personal-statement' || editDialogOpen === 'add-personal-statement') {
      updates.personalStatement = editData.personalStatement as string;
    } else if (editDialogOpen === 'social-media') {
      updates.socialMedia = {
        instagram: editData.instagram as string || undefined,
        twitter: editData.twitter as string || undefined
      };
    } else if (editDialogOpen === 'add-maxpreps' || editDialogOpen === 'maxpreps-verification') {
      updates.maxPrepsUrl = editData.maxPrepsUrl as string;
    }

    updateProfileData(updates);
    setEditDialogOpen(null);
  };

  // Delete measurable function
  const handleDeleteMeasurable = (measurableId: string) => {
    const updatedMeasurables = (profileData.measurables || []).filter(m => m.id !== measurableId);
    updateProfileData({ measurables: updatedMeasurables });
    setEditDialogOpen(null);
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
        setProfileData(result.profile);
        setHasUnsavedChanges(false);
        console.log('Profile updated successfully');
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header Actions */}
      <ProfileHeader
        isOwnProfile={isOwnProfile}
        onConnect={canDraft ? onConnect : undefined}
        onReport={() => {}}
        onShare={onShare}
        connectLabel="Draft"
        profileName={profileData.fullName}
        profileType="athlete"
        hasUnsavedChanges={isOwnProfile ? hasUnsavedChanges : false}
        isSaving={isSaving}
        onSaveChanges={saveProfile}
        onDiscardChanges={discardChanges}
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
                        src={profileData.profileImage}
                        alt={profileData.fullName || "Profile picture"}
                        fill
                        className="rounded-full object-cover"
                        sizes="(max-width: 768px) 96px, 128px"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                        <span className="text-lg md:text-xl font-semibold text-muted-foreground">
                          {profileData.fullName.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                    )}
                    {isOwnProfile && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full p-2 h-8 w-8"
                        onClick={() => handleEditSection('profile-image')}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <h1 className="text-lg md:text-xl font-bold">{profileData.fullName}</h1>
                      {/* Verification Badge */}
                      {profileData.maxPrepsVerified ? (
                        <Badge className="bg-green-600 text-white hover:bg-green-600 text-xs flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Verified Athlete
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs flex items-center gap-1">
                          <Shield className="w-3 h-3" />
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

                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                      <Badge className="bg-[#01ae79] text-white hover:bg-[#01ae79]/90 text-xs">
                        {profileData.sport}
                      </Badge>
                      {profileData.secondarySports?.map(sport => (
                        <Badge key={sport} variant="outline" className="text-xs">
                          {sport}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center justify-center gap-1 min-w-0">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="text-center break-words whitespace-normal">{profileData.city}, {profileData.state}</span>
                      </div>
                      <p className="text-center break-words">{profileData.highSchool}</p>
                      <p className="text-center">Class of {profileData.graduationYear}</p>
                      
                      {/* Education Level Badge */}
                      <div className="flex items-center justify-center pt-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-md">
                          <GraduationCap className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {profileData.educationLevel === 'high_school' && 'High School Student'}
                            {profileData.educationLevel === 'undergraduate' && 'College Student'}
                            {profileData.educationLevel === 'graduate' && 'Graduate Student'}
                            {profileData.educationLevel === 'associate' && 'Community College Student'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-1 text-xs text-muted-foreground">
                      {profileData.positions.map(position => (
                        <span key={position} className="px-2 py-1 bg-muted rounded text-center break-words max-w-full">
                          {position}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Height</p>
                        <p className="font-semibold">{profileData.height}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Weight</p>
                        <p className="font-semibold">{profileData.weight}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <SocialMediaSection 
                  socialMedia={profileData.socialMedia} 
                  isOwnProfile={isOwnProfile}
                  onEdit={() => handleEditSection('social-media')}
                />

                {/* Sport Selector */}
                {allSports.length > 1 && (
                  <div className="pt-4 mt-4 border-t">
                    <p className="text-sm font-medium mb-2">View Stats For:</p>
                    <div className="flex flex-wrap gap-1">
                      {allSports.map(sport => (
                        <Button
                          key={sport}
                          size="sm"
                          variant={selectedSport === sport ? "default" : "outline"}
                          className="text-xs h-7"
                          onClick={() => setSelectedSport(sport)}
                        >
                          {sport}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Academic Summary Card */}
            <AcademicSummaryCard
              gpa={profileData.gpa}
              satScore={profileData.satScore}
              actScore={profileData.actScore}
              intendedMajor={profileData.intendedMajor}
              educationLevel={profileData.educationLevel}
              isOwnProfile={isOwnProfile}
              onEditSection={handleEditSection}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Personal Statement */}
            {profileData.personalStatement ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>About {profileData.fullName.split(' ')[0]}</CardTitle>
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
                    <CardTitle>About {profileData.fullName.split(' ')[0]}</CardTitle>
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
                        onClick={() => handleEditSection('add-personal-statement')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Personal Statement
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Athletic Performance */}
            <AthleticHighlightsSection
              measurables={profileData.measurables}
              selectedSport={selectedSport}
              isOwnProfile={isOwnProfile}
              onEditSection={handleEditSection}
            />

            {/* Enhanced Verification Section */}
            <VerificationSection
              profileData={profileData}
              isOwnProfile={isOwnProfile}
              onEditMaxPreps={() => handleEditSection('maxpreps-verification')}
              onShowVerificationDialog={() => setShowVerificationDialog(true)}
            />
          </div>
        </div>

        {/* Edit Dialogs */}
        <AthleteEditDialogs
          editDialogOpen={editDialogOpen}
          setEditDialogOpen={setEditDialogOpen}
          profileData={profileData}
          editData={editData}
          setEditData={setEditData}
          measurableEditData={measurableEditData}
          setMeasurableEditData={setMeasurableEditData}
          tempVideos={tempVideos}
          setTempVideos={setTempVideos}
          validationErrors={validationErrors}
          setValidationErrors={setValidationErrors}
          onSave={saveEditData}
          selectedSport={selectedSport}
          onDeleteMeasurable={handleDeleteMeasurable}
        />

        {/* Verification Dialog */}
        <VerificationDialog 
          open={showVerificationDialog}
          onOpenChange={setShowVerificationDialog}
          role="athlete"
        />
      </div>
    </div>
  );
} 