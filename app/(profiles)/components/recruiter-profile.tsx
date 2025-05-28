"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Target,
  GraduationCap,
  ExternalLink,
  Edit,
  Star,
  Search,
  Users
} from "lucide-react";
import { RecruitingProfileData } from "../lib/base-profile-types";
import { ProfileHeader } from "./shared/profile-header";
import { ProfileCard } from "./shared/profile-card";

interface RecruiterProfileProps {
  data: RecruitingProfileData;
  isOwnProfile?: boolean;
  onShowInterest?: () => void;
}

export function RecruiterProfile({ data, isOwnProfile = false, onShowInterest }: RecruiterProfileProps) {
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
        connectLabel="Get Recruited"
      />

      <div className="container py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Sidebar - Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <ProfileCard
              data={data}
              isOwnProfile={isOwnProfile}
              roleLabel="Recruiter"
              onEditSection={handleEditSection}
            />

            {/* Sport Recruiting Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg">
                    {data.sportRecruiting} Recruiting
                  </CardTitle>
                  {isOwnProfile && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditSection('recruiting-overview')}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm">{data.sportRecruiting}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Recruiting
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
            {/* Recruiting Philosophy */}
            {data.recruitingNeeds?.recruitingPhilosophy && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recruiting Philosophy</CardTitle>
                    {isOwnProfile && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditSection('recruiting-philosophy')}
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

            {/* Active Recruiting Targets */}
            {data.recruitingNeeds && (
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Target className="w-5 h-5" />
                      Active Recruiting Targets - {data.sportRecruiting}
                    </CardTitle>
                    {isOwnProfile && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditSection('recruiting-targets')}
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
                      <p className="text-sm text-muted-foreground mb-2">Target Graduation Years</p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {data.recruitingNeeds.graduationYears.map((year) => (
                          <Badge key={year} variant="outline" className="text-sm">
                            {year}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Priority Positions</p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {data.recruitingNeeds.positions.map((position) => (
                          <Badge key={position} className="bg-green-100 text-green-800 text-sm">
                            {position}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {data.recruitingNeeds.scholarshipsAvailable && (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Scholarships to Offer</p>
                        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                          <p className="font-bold text-green-600 text-2xl">{data.recruitingNeeds.scholarshipsAvailable}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional recruiting info for recruiters */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium">What We&apos;re Looking For</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We actively scout for student-athletes who demonstrate exceptional skills, 
                      strong academic performance, and character that aligns with our program values.
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
            <Card className="border-primary/20 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
              <CardContent className="text-center py-8">
                <Search className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Ready to Get Recruited?</h3>
                <p className="text-muted-foreground mb-4">
                  Join our {data.sportRecruiting} program and take your athletic career to the next level while earning your degree.
                </p>
                {!isOwnProfile && (
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={onShowInterest}
                  >
                    <Star className="w-5 h-5 mr-2" />
                    Get Recruited
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