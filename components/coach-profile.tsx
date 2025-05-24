"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import {
  Heart,
  MapPin,
  Instagram,
  Twitter,
  Star,
  Users,
  Award,
  Trophy,
  Building,
  ChevronLeft,
  Target,
  GraduationCap
} from "lucide-react";

export type UserRole = "coach" | "recruiter";

export interface CoachProfileData {
  id: string;
  // Basic Information
  fullName: string;
  profileImage?: string;
  title: string; // e.g., Head Coach, Assistant Coach, Recruiting Coordinator
  role: UserRole;
  sportsCoaching: string[]; // Can coach multiple sports
  
  // Organization Information
  organizationName: string;
  organizationLogo?: string;
  division: string; // e.g., NCAA D1, NAIA, JUCO
  conference?: string;
  city: string;
  state: string;
  
  // Verification
  isVerified: boolean;
  
  // Program Information
  programInfo?: {
    founded?: number;
    arena?: string;
    capacity?: number;
    facilitiesDescription?: string;
    academicRanking?: string;
    graduationRate?: number;
    campusLife?: string;
  };
  
  // What We Offer (Key selling points)
  whatWeOffer?: {
    highlights: string[];
    playingTimeOpportunity?: string;
    academicSupport?: string;
    facilityFeatures?: string[];
    coachingStyle?: string;
  };
  
  // Recruiting Information
  recruitingNeeds: {
    graduationYears: number[];
    positions: string[];
    scholarshipsAvailable?: number;
    recruitingPhilosophy?: string;
  };
  
  // Social Media
  socialMedia?: {
    twitter?: string;
    instagram?: string;
  };
  
  // Program Success (simplified)
  programSuccess?: {
    recentAchievements: string[];
    conferenceChampionships?: number;
    nationalChampionships?: number;
    playoffAppearances?: number;
  };
}

interface CoachProfileProps {
  data: CoachProfileData;
  isOwnProfile?: boolean;
  onShowInterest?: () => void;
}

export function CoachProfile({ data, isOwnProfile = false, onShowInterest }: CoachProfileProps) {
  const roleLabel = data.role === "coach" ? "Coach" : "Recruiter";
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header Actions */}
      {!isOwnProfile && (
        <div className="border-b">
          <div className="container flex items-center justify-between py-4">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-1" />
                Follow Program
              </Button>
              <Button 
                size="sm" 
                className="bg-orange-600 hover:bg-orange-700"
                onClick={onShowInterest}
              >
                <Star className="w-4 h-4 mr-1" />
                Show Interest
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Sidebar - Basic Info */}
          <div className="space-y-4 md:space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="text-center space-y-4">
                {data.profileImage ? (
                  <Image
                    src={data.profileImage}
                    alt={data.fullName}
                    width={120}
                    height={120}
                    className="mx-auto rounded-full object-cover w-24 h-24 md:w-30 md:h-30"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-30 md:h-30 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Users className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground" />
                  </div>
                )}
                
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">{data.fullName}</h1>
                  <p className="text-base md:text-lg text-muted-foreground">{data.title}</p>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                    <Building className="w-4 h-4" />
                    <span>{data.organizationName}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{data.city}, {data.state}</span>
                  </div>
                </div>

                {data.isVerified && (
                  <Badge className="bg-green-500 text-white">
                    <Award className="w-3 h-3 mr-1" />
                    Verified {roleLabel}
                  </Badge>
                )}
                
                <Badge variant="outline" className="font-medium">
                  {data.division}
                  {data.conference && ` • ${data.conference}`}
                </Badge>

                {/* Social Media */}
                {data.socialMedia && (
                  <div className="pt-2">
                    <p className="text-sm font-medium mb-2">Follow Our Program</p>
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
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Program Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Program Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Sports</p>
                  <p className="font-semibold">{data.sportsCoaching.join(", ")}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Division</p>
                  <p className="font-semibold">{data.division}</p>
                </div>
                
                {data.conference && (
                  <div>
                    <p className="text-sm text-muted-foreground">Conference</p>
                    <p className="font-semibold">{data.conference}</p>
                  </div>
                )}
                
                {data.programInfo && (
                  <>
                    {data.programInfo.founded && (
                      <div>
                        <p className="text-sm text-muted-foreground">Founded</p>
                        <p className="font-semibold">{data.programInfo.founded}</p>
                      </div>
                    )}
                    
                    {data.programInfo.graduationRate && (
                      <div>
                        <p className="text-sm text-muted-foreground">Graduation Rate</p>
                        <p className="font-semibold text-green-600">{data.programInfo.graduationRate}%</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Current Recruiting Needs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Recruiting Needs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Graduation Years</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.recruitingNeeds.graduationYears.map((year) => (
                      <Badge key={year} variant="outline" className="text-xs">
                        {year}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Positions Needed</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.recruitingNeeds.positions.map((position) => (
                      <Badge key={position} className="bg-blue-100 text-blue-800 text-xs">
                        {position}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {data.recruitingNeeds.scholarshipsAvailable && (
                  <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Scholarships Available</p>
                    <p className="font-bold text-green-600 text-lg">{data.recruitingNeeds.scholarshipsAvailable}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* What We Offer - Key Section */}
            {data.whatWeOffer && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Trophy className="w-5 h-5" />
                    What We Offer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.whatWeOffer.highlights && data.whatWeOffer.highlights.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Program Highlights</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data.whatWeOffer.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
                            <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                            <span className="text-sm font-medium">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.whatWeOffer.playingTimeOpportunity && (
                    <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-600" />
                        Playing Time Opportunity
                      </h4>
                      <p className="text-sm text-muted-foreground">{data.whatWeOffer.playingTimeOpportunity}</p>
                    </div>
                  )}

                  {data.whatWeOffer.academicSupport && (
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-green-600" />
                        Academic Excellence
                      </h4>
                      <p className="text-sm text-muted-foreground">{data.whatWeOffer.academicSupport}</p>
                    </div>
                  )}

                  {data.whatWeOffer.facilityFeatures && data.whatWeOffer.facilityFeatures.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">World-Class Facilities</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {data.whatWeOffer.facilityFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.whatWeOffer.coachingStyle && (
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Our Coaching Philosophy</h4>
                      <p className="text-sm text-muted-foreground">{data.whatWeOffer.coachingStyle}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recruiting Philosophy */}
            {data.recruitingNeeds.recruitingPhilosophy && (
              <Card>
                <CardHeader>
                  <CardTitle>Why Choose Our Program</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{data.recruitingNeeds.recruitingPhilosophy}</p>
                </CardContent>
              </Card>
            )}

            {/* Program Success */}
            {data.programSuccess && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Success</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {data.programSuccess.conferenceChampionships !== undefined && (
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl md:text-3xl font-bold text-primary">{data.programSuccess.conferenceChampionships}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Conference Titles</p>
                      </div>
                    )}
                    {data.programSuccess.nationalChampionships !== undefined && (
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl md:text-3xl font-bold text-primary">{data.programSuccess.nationalChampionships}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">National Titles</p>
                      </div>
                    )}
                    {data.programSuccess.playoffAppearances !== undefined && (
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl md:text-3xl font-bold text-primary">{data.programSuccess.playoffAppearances}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Playoff Appearances</p>
                      </div>
                    )}
                  </div>
                  
                  {data.programSuccess.recentAchievements.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Recent Achievements</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data.programSuccess.recentAchievements.map((achievement, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                            <Trophy className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                            <span className="text-sm font-medium">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Campus & Academic Life */}
            {data.programInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Campus Life & Academics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.programInfo.arena && (
                    <div>
                      <h4 className="font-semibold mb-2">Home Venue</h4>
                      <p className="text-muted-foreground">
                        {data.programInfo.arena}
                        {data.programInfo.capacity && ` (${data.programInfo.capacity.toLocaleString()} capacity)`}
                      </p>
                    </div>
                  )}
                  
                  {data.programInfo.facilitiesDescription && (
                    <div>
                      <h4 className="font-semibold mb-2">Facilities</h4>
                      <p className="text-muted-foreground">{data.programInfo.facilitiesDescription}</p>
                    </div>
                  )}
                  
                  {data.programInfo.academicRanking && (
                    <div>
                      <h4 className="font-semibold mb-2">Academic Excellence</h4>
                      <p className="text-muted-foreground">{data.programInfo.academicRanking}</p>
                    </div>
                  )}

                  {data.programInfo.campusLife && (
                    <div>
                      <h4 className="font-semibold mb-2">Campus Experience</h4>
                      <p className="text-muted-foreground">{data.programInfo.campusLife}</p>
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