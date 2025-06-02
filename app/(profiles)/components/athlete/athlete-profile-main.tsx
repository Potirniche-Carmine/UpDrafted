"use client";

import React, { useState, useMemo, memo, useEffect } from "react";
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
  Shield
} from "lucide-react";
import { ProfileHeader } from "../shared/profile-header";
import { AthleticHighlightsSection } from "../shared/athletic-highlights-section";
import { AcademicSummaryCard } from "../shared/academic-summary-card";
import { AthleteEditDialogs } from "./athlete-edit-dialogs";
import { VerificationSection } from "./athlete-verification-section";
import { VerificationDialog } from "../shared/verification-dialog";
import { useRoleView } from '@/hooks/use-role-view';
import { EducationLevel } from '@/app/(onboarding)/lib/onboarding';

export interface Measurable {
  id: string;
  sport: string;
  label: string;
  value: string;
  measurementDate: string;
}

export interface AthleteProfileData {
  id: string;
  userId?: string;
  // Basic Information
  fullName: string;
  profileImage?: string;
  sport: string;
  secondarySports?: string[];
  graduationYear: number;
  educationLevel: EducationLevel;
  highSchool: string;
  city: string;
  state: string;
  gpa?: number | string;
  satScore?: number;
  actScore?: number;
  height: string;
  weight: string;
  positions: string[];

  // Verification
  maxPrepsUrl?: string;
  isVerified: boolean;

  // Media
  hudlUrl?: string;
  hudlEmbedUrl?: string;
  youtubeVideos?: {
    id?: string;
    title: string;
    url: string;
    embedUrl: string;
    sortOrder?: number;
  }[];

  // Social Media
  socialMedia?: {
    instagram?: string;
    twitter?: string;
  };

  // Academic Information
  intendedMajor?: string;

  // Personal Statement
  personalStatement?: string;

  // Additional Info
  achievements?: string[];

  // Measurables
  measurables?: Measurable[];
}

interface AthleteProfileProps {
  data: AthleteProfileData;
  isOwnProfile?: boolean;
  onConnect?: () => void;
  onShare?: () => void;
}

// Memoize heavy components
const MeasurablesSection = memo(({ measurables, selectedSport }: { 
  measurables: Measurable[], 
  selectedSport: string 
}) => {
  const sportMeasurables = useMemo(() => 
    measurables.filter(m => m.sport === selectedSport), 
    [measurables, selectedSport]
  );

  if (sportMeasurables.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Measurables - {selectedSport}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {sportMeasurables.map((measurable) => (
            <div key={measurable.id} className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">{measurable.label}</div>
              <div className="font-semibold text-lg">{measurable.value}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(measurable.measurementDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
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
  const [editDialogOpen, setEditDialogOpen] = useState<string | null>(null);
  const [measurableIdToEdit, setMeasurableIdToEdit] = useState<string | null>(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState(data);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { effectiveRole } = useRoleView();
  
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

  const handleEditSection = (section: string, measurableId?: string) => {
    if (section === 'delete-measurable' && measurableId) {
      const confirmed = window.confirm('Are you sure you want to delete this performance metric? This action cannot be undone.');
      if (confirmed) {
        const updatedMeasurables = (profileData.measurables || []).filter(m => m.id !== measurableId);
        updateProfileData({ measurables: updatedMeasurables });
      }
      return;
    }
    
    if (section === 'manual-verification') {
      setVerificationDialogOpen(true);
      return;
    }
    
    if (measurableId) {
      setMeasurableIdToEdit(measurableId);
    }
    setEditDialogOpen(section);
  };

  const saveProfile = async () => {
    if (!isOwnProfile || !hasUnsavedChanges) return;
    
    setIsSaving(true);
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
        console.log('Profile updated successfully');
        
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
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSaveChanges={saveProfile}
        onDiscardChanges={discardChanges}
      />

      {/* Verification Dialog */}
      <VerificationDialog
        open={verificationDialogOpen}
        onOpenChange={setVerificationDialogOpen}
        role="athlete"
      />

      {/* Edit Dialogs */}
      <AthleteEditDialogs
        isOpen={!!editDialogOpen}
        dialogType={editDialogOpen}
        profileData={profileData}
        measurableIdToEdit={measurableIdToEdit}
        onClose={() => {
          setEditDialogOpen(null);
          setMeasurableIdToEdit(null);
        }}
        onSave={(updates: Partial<AthleteProfileData>) => {
          updateProfileData(updates);
          setEditDialogOpen(null);
          setMeasurableIdToEdit(null);
        }}
        selectedSport={selectedSport}
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
                      {profileData.isVerified && (
                        <Badge className="bg-green-600 text-white text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
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

            {/* Athletic Performance */}
            <AthleticHighlightsSection
              measurables={profileData.measurables}
              selectedSport={selectedSport}
              isOwnProfile={isOwnProfile}
              onEditSection={handleEditSection}
            />

            {/* Verification Section */}
            <VerificationSection
              profileData={profileData}
              isOwnProfile={isOwnProfile}
              onEditMaxPreps={() => handleEditSection('maxpreps-verification')}
              onShowVerificationDialog={() => handleEditSection('manual-verification')}
            />
            
            {/* Hudl Highlights */}
            {(profileData.hudlUrl || isOwnProfile) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Hudl Highlights</CardTitle>
                    {isOwnProfile && (
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
                  {profileData.hudlUrl ? (
                    profileData.hudlEmbedUrl ? (
                      <div className="space-y-4">
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                          <iframe
                            src={profileData.hudlEmbedUrl}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Hudl Highlights"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">Game film and highlight reels</p>
                          <Link href={profileData.hudlUrl} target="_blank">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View Full Hudl
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">Hudl Profile</p>
                          <p className="text-sm text-muted-foreground">Game film and highlight reels</p>
                        </div>
                        <Link href={profileData.hudlUrl} target="_blank">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Hudl
                          </Button>
                        </Link>
                      </div>
                    )
                  ) : isOwnProfile && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-center">
                        <p className="font-medium text-muted-foreground mb-2">Hudl Profile Not Added</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add your Hudl profile to showcase game film and highlight reels
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

            {/* YouTube Videos */}
            {(profileData.youtubeVideos && profileData.youtubeVideos.length > 0) || isOwnProfile ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Highlight Videos</CardTitle>
                    {isOwnProfile && (
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
                  {profileData.youtubeVideos && profileData.youtubeVideos.length > 0 ? (
                    <div className="space-y-4">
                      {profileData.youtubeVideos.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((video, index) => (
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
                  ) : isOwnProfile && (
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