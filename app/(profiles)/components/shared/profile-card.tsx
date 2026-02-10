"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  MapPin,
  Instagram,
  Building,
  Edit,
  Shield,
  ShieldCheck,
  ShieldX
} from "lucide-react";
import { BaseProfileData } from "../../lib/base-profile-types";
import { VerificationDialog } from "./verification-dialog";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";

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
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  const handleGetVerified = () => {
    setShowVerificationDialog(true);
  };

  return (
    <>
      <Card>
        <CardContent className="text-center space-y-4">
          <div className="relative group mx-auto w-32 h-32 md:w-36 md:h-36">
            <AvatarWithFallback
              src={data.profileImage}
              name={data.fullName}
              size="xl"
              className="w-full h-full"
            />
            {isOwnProfile && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => onEditSection?.('profile-picture')}
              >
                <Edit className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          <div className="relative px-4 py-3">
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
                className="absolute top-1 right-1"
                onClick={() => onEditSection?.('basic-info')}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>

          {/* Verification Status */}
          <div className="space-y-2">
            {data.isVerified ? (
              <Badge className="bg-green-500 text-white">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Verified {roleLabel}
              </Badge>
            ) : (
              <>
                {/* Show unverified badge to everyone */}
                <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:bg-amber-950/20">
                  <ShieldX className="w-3 h-3 mr-1" />
                  Unverified {roleLabel}
                </Badge>

                {/* Show "Get Verified" button only to profile owner */}
                {isOwnProfile && (
                  <div className="pt-2">
                    <Button
                      onClick={handleGetVerified}
                      size="sm"
                      className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Get Verified
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Build trust with recruits
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

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
                    className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Image src="/icons/x-white-logo.png" alt="X" width={16} height={16} />
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

      {/* Verification Dialog */}
      <VerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        role={roleLabel.toLowerCase() as "coach" | "recruiter"}
      />
    </>
  );
} 