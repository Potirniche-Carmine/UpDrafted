"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { 
  MapPin, 
  Instagram, 
  Twitter, 
  Users, 
  Award, 
  Building, 
  Edit 
} from "lucide-react";
import { BaseProfileData } from "../../lib/base-profile-types";

interface ProfileCardProps {
  data: BaseProfileData;
  isOwnProfile?: boolean;
  roleLabel: string;
  onEditSection?: (section: string) => void;
}

export function ProfileCard({ 
  data, 
  isOwnProfile = false, 
  roleLabel,
  onEditSection 
}: ProfileCardProps) {
  return (
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
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" 
              onClick={() => onEditSection?.('profile-picture')}
            >
              <Edit className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        <div className="relative">
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
          {isOwnProfile && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute -top-2 -right-2"
              onClick={() => onEditSection?.('basic-info')}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
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
        {(data.instagramHandle || data.twitterHandle) && (
          <div className="pt-2 relative">
            <p className="text-sm font-medium mb-2">Follow Our Program</p>
            <div className="flex justify-center gap-3">
              {data.instagramHandle && (
                <a
                  href={`https://instagram.com/${data.instagramHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Instagram className="w-4 h-4" />
                  <span className="text-sm font-medium">{data.instagramHandle}</span>
                </a>
              )}
              {data.twitterHandle && (
                <a
                  href={`https://twitter.com/${data.twitterHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="text-sm font-medium">{data.twitterHandle}</span>
                </a>
              )}
            </div>
            {isOwnProfile && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute -top-2 -right-2"
                onClick={() => onEditSection?.('social-media')}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 