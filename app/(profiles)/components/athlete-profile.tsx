"use client";

import React, { useState } from "react";
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
  Users,
  Award,
  Edit,
  Plus,
  ShieldX,
} from "lucide-react";
import { ProfileHeader } from "./shared/profile-header";

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
  maxPrepsUrl: string;
  maxPrepsVerified: boolean;

  // Media
  hudlUrl?: string;
  hudlEmbedUrl?: string;
  youtubeVideos: {
    title: string;
    url: string;
    embedUrl: string;
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
  achievements: string[];

  // Measurables
  measurables?: Measurable[];
}

interface AthleteProfileProps {
  data: AthleteProfileData;
  isOwnProfile?: boolean;
  currentUserRole?: string | null;
  onConnect?: () => void;
  onShare?: () => void;
}

export function AthleteProfile({ data, isOwnProfile = false, currentUserRole, onConnect, onShare }: AthleteProfileProps) {
  const [selectedSport, setSelectedSport] = useState(data.sport);
  
  // Get all sports (primary + secondary)
  const allSports = [data.sport, ...(data.secondarySports || [])];
  
  // Filter measurables by selected sport
  const sportMeasurables = data.measurables?.filter(m => m.sport === selectedSport) || [];

  // Determine if current user can draft this athlete (coaches, recruiters, and admins)
  const canDraft = !isOwnProfile && (currentUserRole === 'coach' || currentUserRole === 'recruiter' || currentUserRole === 'admin');

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
              <CardContent className="text-center space-y-4">
                <div className="relative group">
                  {data.profileImage ? (
                    <div className="w-32 h-32 md:w-36 md:h-36 mx-auto rounded-full overflow-hidden bg-muted">
                      <Image
                        src={data.profileImage}
                        alt={data.fullName}
                        width={144}
                        height={144}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 md:w-36 md:h-36 mx-auto rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground" />
                    </div>
                  )}
                  {isOwnProfile && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => handleEditSection('profile-picture')}>
                      <Edit className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>

                <div className="relative">
                  <h1 className="text-xl md:text-2xl font-bold">{data.fullName}</h1>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm md:text-base">
                    <span>{data.positions.join(" / ")}</span>
                    <span>•</span>
                    <span>Class of {data.graduationYear}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{data.city}, {data.state}</span>
                  </div>
                  {isOwnProfile && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute -top-2 -right-2"
                      onClick={() => handleEditSection('basic-info')}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>

                {data.maxPrepsVerified ? (
                  <Badge className="bg-green-500 text-white">
                    <Award className="w-3 h-3 mr-1" />
                    Verified Athlete
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:bg-amber-950/20">
                    <ShieldX className="w-3 h-3 mr-1" />
                    Unverified Athlete
                  </Badge>
                )}

                {/* Social Media - Highlighted */}
                {data.socialMedia && (
                  <div className="pt-2 relative">
                    <p className="text-sm font-medium mb-2">Follow Me</p>
                    <div className="flex justify-center gap-3">
                      {data.socialMedia.instagram && (
                        <a
                          href={`https://instagram.com/${data.socialMedia.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                          <Instagram className="w-4 h-4" />
                          <span className="text-sm font-medium">{data.socialMedia.instagram}</span>
                        </a>
                      )}
                      {data.socialMedia.twitter && (
                        <a
                          href={`https://twitter.com/${data.socialMedia.twitter.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                          <Twitter className="w-4 h-4" />
                          <span className="text-sm font-medium">{data.socialMedia.twitter}</span>
                        </a>
                      )}
                    </div>
                    {isOwnProfile && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute -top-2 -right-2"
                        onClick={() => handleEditSection('social-media')}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Athletic Profile */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg">Athletic Profile</CardTitle>
                  {isOwnProfile && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleEditSection('athletic-profile')}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Height</p>
                    <p className="font-semibold">{data.height}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="font-semibold">{data.weight}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Primary Sport</p>
                  <p className="font-semibold">{data.sport}</p>
                </div>

                {data.secondarySports && data.secondarySports.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Secondary Sports</p>
                    <p className="font-semibold">{data.secondarySports.join(", ")}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">High School</p>
                  <p className="font-semibold">{data.highSchool}</p>
                </div>
              </CardContent>
            </Card>

            {/* Sports & Measurables Combined */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg">Sports & Measurables</CardTitle>
                  {isOwnProfile && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleEditSection('measurables')}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sports Selection */}
                {allSports.length > 1 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Select Sport</p>
                    <div className="flex flex-wrap gap-2">
                      {allSports.map((sport) => (
                        <Button
                          key={sport}
                          variant={selectedSport === sport ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSport(sport)}
                          className="text-xs"
                        >
                          {sport}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Measurables */}
                <div>
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
                  
                  {sportMeasurables.length > 0 ? (
                    <div className="space-y-3">
                      {sportMeasurables.map((measurable) => (
                        <div key={measurable.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <div>
                            <p className="text-sm text-muted-foreground">{measurable.label}</p>
                            <p className="font-semibold">{measurable.value}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(measurable.measurementDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">
                        {isOwnProfile ? "Add your measurables to showcase your athletic performance" : "No measurables recorded for this sport"}
                      </p>
                      {isOwnProfile && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditSection('add-measurable')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Measurables
                        </Button>
                      )}
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
                    <p className="font-semibold">{data.gpa.toFixed(2)}</p>
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

              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Personal Statement */}
            {data.personalStatement && (
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
              </CardContent>
            </Card>
            {/* Hudl Highlights */}
            {data.hudlUrl && (
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
                  {data.hudlEmbedUrl ? (
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
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* YouTube Videos */}
            {data.youtubeVideos.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Video Highlights</CardTitle>
                    <div className="flex gap-2">
                      {isOwnProfile && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditSection('add-video')}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Video
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditSection('youtube-videos')}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {data.youtubeVideos.map((video, index) => (
                      <div key={index} className="space-y-2">
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
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 