"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MapPin,
  Instagram,
  Twitter,
  ExternalLink,
  Star,
  Users,
  Award,
  ChevronLeft
} from "lucide-react";

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
}

interface AthleteProfileProps {
  data: AthleteProfileData;
  isOwnProfile?: boolean;
  onConnect?: () => void;
}

export function AthleteProfile({ data, isOwnProfile = false, onConnect }: AthleteProfileProps) {
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
                Save
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={onConnect}>
                <Star className="w-4 h-4 mr-1" />
                Connect
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
                  <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm md:text-base">
                    <span>{data.positions.join(" / ")}</span>
                    <span>•</span>
                    <span>Class of {data.graduationYear}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{data.city}, {data.state}</span>
                  </div>
                </div>

                {data.maxPrepsVerified && (
                  <Badge className="bg-green-500 text-white">
                    <Award className="w-3 h-3 mr-1" />
                    Verified Athlete
                  </Badge>
                )}

                {/* Social Media - Highlighted */}
                {data.socialMedia && (
                  <div className="pt-2">
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
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Athletic Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Athletic Profile</CardTitle>
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

            {/* Academic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Academic Profile</CardTitle>
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
                  <CardTitle>About {data.fullName.split(' ')[0]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{data.personalStatement}</p>
                </CardContent>
              </Card>
            )}

            {/* Hudl Highlights */}
            {data.hudlUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Hudl Highlights</CardTitle>
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
            {/* MaxPreps Verification - Simplified */}
            <Card>
              <CardHeader>
                <CardTitle>Official Stats & Verification</CardTitle>
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

            {/* YouTube Videos */}
            {data.youtubeVideos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Video Highlights</CardTitle>
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
            {/* Achievements */}
            {data.achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Key Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                        <span className="text-sm font-medium">{achievement}</span>
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