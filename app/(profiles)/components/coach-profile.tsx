"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Trophy,
  Target,
  GraduationCap,
  ExternalLink,
  Edit,
  Star,
  Users
} from "lucide-react";
import { CoachProfileData } from "../lib/base-profile-types";
import { ProfileHeader } from "./shared/profile-header";
import { ProfileCard } from "./shared/profile-card";

interface CoachProfileProps {
  data: CoachProfileData;
  isOwnProfile?: boolean;
  currentUserRole?: string | null;
  onShowInterest?: () => void;
  onConnect?: () => void;
  onShare?: () => void;
}

export function CoachProfile({ data, isOwnProfile = false, onShowInterest, onShare }: CoachProfileProps) {
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
        onConnect={onShowInterest}
        onReport={handleReportProfile}
        onShare={onShare}
        connectLabel="Connect with Coach"
        profileName={data.fullName}
        profileType="coach"
      />

      <div className="container py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Sidebar - Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <ProfileCard
              data={data}
              isOwnProfile={isOwnProfile}
              roleLabel="Coach"
              onEditSection={handleEditSection}
            />

            {/* Sport Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg">
                    {data.sportCoaching} Coaching
                  </CardTitle>
                  {isOwnProfile && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditSection('coaching-overview')}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">{data.sportCoaching}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Coaching
                  </Badge>
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
              </CardContent>
            </Card>

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
                {data.programWebsite && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Program Website</p>
                    <Link href={data.programWebsite} target="_blank">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Program Site
                      </Button>
                    </Link>
                  </div>
                )}

                {data.schoolWebsite && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">School Website</p>
                    <Link href={data.schoolWebsite} target="_blank">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Visit School Site
                      </Button>
                    </Link>
                  </div>
                )}

                {!data.programWebsite && !data.schoolWebsite && isOwnProfile && (
                  <div className="text-center py-4 border-2 border-dashed border-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Add program and school website links
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
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coaching Philosophy */}
            {data.recruitingNeeds?.recruitingPhilosophy && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Coaching Philosophy</CardTitle>
                    {isOwnProfile && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditSection('coaching-philosophy')}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{data.recruitingNeeds.recruitingPhilosophy}</p>
                </CardContent>
              </Card>
            )}

            {/* Current Recruiting Needs */}
            {data.recruitingNeeds && (
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Target className="w-5 h-5" />
                      Current Recruiting Needs - {data.sportCoaching}
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
                        {data.recruitingNeeds.graduationYears.map((year) => (
                          <Badge key={year} variant="outline" className="text-sm">
                            {year}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Positions Needed</p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {data.recruitingNeeds.positions.map((position) => (
                          <Badge key={position} className="bg-blue-100 text-blue-800 text-sm">
                            {position}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {data.recruitingNeeds.scholarshipsAvailable && (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Scholarships Available</p>
                        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                          <p className="font-bold text-green-600 text-2xl">{data.recruitingNeeds.scholarshipsAvailable}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* What We're Looking For section */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-orange-50 dark:from-blue-950 dark:to-orange-950 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium">What We&apos;re Looking For</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We seek student-athletes who demonstrate exceptional athletic ability, 
                      strong academic performance, and character that aligns with our program&apos;s values and culture.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video Showcase */}
            {data.showcaseVideoEmbedUrl && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Program Showcase</CardTitle>
                    {isOwnProfile && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditSection('video-showcase')}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full">
                    <iframe
                      src={data.showcaseVideoEmbedUrl}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                      title={data.showcaseVideoTitle || "Program Showcase Video"}
                    />
                  </div>
                  {data.showcaseVideoTitle && (
                    <p className="mt-2 text-sm text-muted-foreground">{data.showcaseVideoTitle}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Call to Action for Athletes */}
            <Card className="border-primary/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Ready to Take the Next Step?</h3>
                <p className="text-muted-foreground mb-4">
                  Join our {data.sportCoaching} program and compete at the highest level while pursuing your academic goals.
                </p>
                {!isOwnProfile && (
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={onShowInterest}
                  >
                    <Star className="w-5 h-5 mr-2" />
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