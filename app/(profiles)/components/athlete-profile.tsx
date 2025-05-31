"use client";

import React, { useState, useMemo, memo } from "react";
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
  Plus
} from "lucide-react";
import { ProfileHeader } from "./shared/profile-header";
import { useRoleView } from '@/hooks/use-role-view';

export interface Measurable {
  id: string;
  sport: string;
  label: string;
  value: string;
  measurementDate: string;
}

export interface AthleteProfileData {
  id: string;
  // Basic Information
  fullName: string;
  profileImage?: string;
  sport: string;
  secondarySports?: string[];
  graduationYear: number;
  highSchool: string;
  city: string;
  state: string;
  gpa?: number;
  satScore?: number;
  actScore?: number;
  height: string;
  weight: string;
  positions: string[];

  // Verification
  maxPrepsUrl?: string;
  maxPrepsVerified: boolean;

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

  // Social Media (highlighted)
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

const SocialMediaSection = memo(({ socialMedia }: { socialMedia?: { instagram?: string; twitter?: string } }) => {
  if (!socialMedia) return null;

  return (
    <div className="pt-2 relative">
      <p className="text-sm font-medium mb-2">Follow Me</p>
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
    </div>
  );
});

SocialMediaSection.displayName = "SocialMediaSection";

export function AthleteProfile({ data, isOwnProfile = false, onConnect, onShare }: AthleteProfileProps) {
  const [selectedSport, setSelectedSport] = useState(data.sport);
  const { effectiveRole } = useRoleView();
  
  // Memoize computed values - use effectiveRole instead of currentUserRole for admin testing
  const allSports = useMemo(() => [data.sport, ...(data.secondarySports || [])], [data.sport, data.secondarySports]);
  const canDraft = useMemo(() => 
    !isOwnProfile && (effectiveRole === 'coach' || effectiveRole === 'recruiter'),
    [isOwnProfile, effectiveRole]
  );

  const handleEditSection = (section: string) => {
    console.log(`Edit ${section} clicked`);
    // TODO: Open edit modal for specific section
  };

  const handleReportProfile = () => {
    console.log('Report profile clicked');
    // TODO: Open report modal or navigate to report page
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Actions */}
      <ProfileHeader
        isOwnProfile={isOwnProfile}
        onConnect={canDraft ? onConnect : undefined}
        onReport={handleReportProfile}
        onShare={onShare}
        connectLabel="Draft"
        profileName={data.fullName}
        profileType="athlete"
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
                    {data.profileImage ? (
                      <Image
                        src={data.profileImage}
                        alt={data.fullName}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                        <span className="text-lg md:text-xl font-semibold text-muted-foreground">
                          {data.fullName.split(' ').map(n => n[0]).join('')}
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
                      <h1 className="text-lg md:text-xl font-bold">{data.fullName}</h1>
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
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {data.sport}
                      </Badge>
                      {data.secondarySports?.map(sport => (
                        <Badge key={sport} variant="outline" className="text-xs">
                          {sport}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{data.city}, {data.state}</span>
                      </div>
                      <p>{data.highSchool}</p>
                      <p>Class of {data.graduationYear}</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-1 text-xs text-muted-foreground">
                      {data.positions.map(position => (
                        <span key={position} className="px-2 py-1 bg-muted rounded">
                          {position}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Height</p>
                        <p className="font-semibold">{data.height}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Weight</p>
                        <p className="font-semibold">{data.weight}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <SocialMediaSection socialMedia={data.socialMedia} />

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

                {/* Measurables */}
                <div className="pt-4 mt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">{selectedSport} Measurables</p>
                    {isOwnProfile && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditSection('add-measurable')}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                  
                  {data.measurables && data.measurables.filter(m => m.sport === selectedSport).length > 0 ? (
                    <MeasurablesSection measurables={data.measurables} selectedSport={selectedSport} />
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          No {selectedSport} measurables added yet
                        </p>
                        {isOwnProfile ? (
                          <>
                            <p className="text-xs text-muted-foreground mb-3">
                              Add your performance metrics to showcase your athletic abilities
                            </p>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditSection('add-first-measurable')}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add First Measurable
                            </Button>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Performance data will be displayed here when available
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Academic Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg">Academic Profile</CardTitle>
                  {isOwnProfile && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleEditSection('academic-profile')}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.gpa && (
                  <div>
                    <p className="text-sm text-muted-foreground">GPA</p>
                    <p className="font-semibold">
                      {(() => {
                        const gpaNum = parseFloat(data.gpa.toString());
                        return isNaN(gpaNum) ? data.gpa : gpaNum.toFixed(2);
                      })()}
                    </p>
                  </div>
                )}

                {(data.satScore || data.actScore) && (
                  <div className="grid grid-cols-2 gap-4">
                    {data.satScore && (
                      <div>
                        <p className="text-sm text-muted-foreground">SAT</p>
                        <p className="font-semibold">{data.satScore}</p>
                      </div>
                    )}
                    {data.actScore && (
                      <div>
                        <p className="text-sm text-muted-foreground">ACT</p>
                        <p className="font-semibold">{data.actScore}</p>
                      </div>
                    )}
                  </div>
                )}

                {data.intendedMajor && (
                  <div>
                    <p className="text-sm text-muted-foreground">Intended Major</p>
                    <p className="font-semibold">{data.intendedMajor}</p>
                  </div>
                )}

                {!data.gpa && !data.satScore && !data.actScore && !data.intendedMajor && isOwnProfile && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Academic info not added</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Add your GPA, test scores, and intended major
                      </p>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditSection('add-academic-info')}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Academic Info
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Personal Statement */}
            {data.personalStatement ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>About {data.fullName.split(' ')[0]}</CardTitle>
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
                  <p className="text-muted-foreground leading-relaxed">{data.personalStatement}</p>
                </CardContent>
              </Card>
            ) : isOwnProfile && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>About {data.fullName.split(' ')[0]}</CardTitle>
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

            {/* MaxPreps Verification - Simplified */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Official Stats & Verification</CardTitle>
                  {isOwnProfile && (
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
                {data.maxPrepsUrl ? (
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">MaxPreps Profile</p>
                      <p className="text-sm text-muted-foreground">
                        Official stats, game logs, and team roster verification
                      </p>
                    </div>
                    <Link href={data.maxPrepsUrl} target="_blank">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Official Stats
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-center">
                      <p className="font-medium text-muted-foreground mb-2">MaxPreps Profile Not Added</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add your MaxPreps profile to showcase official stats and verification
                      </p>
                      {isOwnProfile && (
                        <Button 
                          variant="outline"
                          onClick={() => handleEditSection('add-maxpreps')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add MaxPreps URL
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Hudl Highlights - Only show if URL exists or if it's own profile */}
            {(data.hudlUrl || isOwnProfile) && (
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
                  {data.hudlUrl ? (
                    data.hudlEmbedUrl ? (
                      <div className="space-y-4">
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                          <iframe
                            src={data.hudlEmbedUrl}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">Game film and highlight reels</p>
                          <Link href={data.hudlUrl} target="_blank">
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
                        <Link href={data.hudlUrl} target="_blank">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Hudl
                          </Button>
                        </Link>
                      </div>
                    )
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-center">
                        <p className="font-medium text-muted-foreground mb-2">Hudl Profile Not Added</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add your Hudl profile to showcase game film and highlight reels
                        </p>
                        {isOwnProfile && (
                          <Button 
                            variant="outline"
                            onClick={() => handleEditSection('add-hudl')}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Hudl URL
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* YouTube Videos - Max 2 videos, only show if videos exist or if it's own profile */}
            {((data.youtubeVideos && data.youtubeVideos.length > 0) || isOwnProfile) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Video Highlights</CardTitle>
                    <div className="flex gap-2">
                      {isOwnProfile && (
                        <>
                          {(!data.youtubeVideos || data.youtubeVideos.length < 2) && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditSection('add-video')}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Video
                            </Button>
                          )}
                          {data.youtubeVideos && data.youtubeVideos.length > 0 && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleEditSection('youtube-videos')}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {data.youtubeVideos && data.youtubeVideos.length > 0 ? (
                    <div className="space-y-6">
                      {data.youtubeVideos.slice(0, 2).map((video, index) => (
                        <div key={video.id || index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{video.title}</h4>
                            <Link href={video.url} target="_blank">
                              <Button variant="outline" size="sm">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                YouTube
                              </Button>
                            </Link>
                          </div>
                          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                            <iframe
                              src={video.embedUrl}
                              className="absolute inset-0 w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      ))}
                      {data.youtubeVideos.length >= 2 && isOwnProfile && (
                        <div className="text-center text-sm text-muted-foreground">
                          Maximum of 2 videos allowed. Edit to replace existing videos.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-center">
                        <p className="font-medium text-muted-foreground mb-2">No Video Highlights Added</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add YouTube videos to showcase your best performances and skills (max 2 videos)
                        </p>
                        {isOwnProfile && (
                          <Button 
                            variant="outline"
                            onClick={() => handleEditSection('add-video')}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Video
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 