"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { OnboardingData } from "../onboarding/types";

interface CommonFieldsProps {
  fullName: string;
  profileImagePreview?: string;
  onInputChange: (field: keyof OnboardingData, value: string | number | string[] | number[] | File | null | boolean) => void;
}

export default function CommonFields({ 
  fullName, 
  profileImagePreview, 
  onInputChange 
}: CommonFieldsProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onInputChange('profileImage', file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        onInputChange('profileImagePreview', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    onInputChange('profileImage', null);
    onInputChange('profileImagePreview', '');
  };

  return (
    <>
      <div className="space-y-3">
        <Label htmlFor="fullName" className="text-base font-medium">Full Name *</Label>
        <Input
          id="fullName"
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => onInputChange('fullName', e.target.value)}
          className="h-11 bg-background"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-base font-medium">Profile Picture</Label>
        <div className="space-y-4">
          {profileImagePreview ? (
            <div className="flex items-start gap-4">
              <div className="relative">
                <Image
                  src={profileImagePreview}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  width={96}
                  height={96}
                />
                <button
                  type="button"
                  onClick={removeProfileImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Looking good! You can change your photo anytime.
                </p>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="profileImage" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload a profile picture
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      Optional - A default image will be selected if none provided
                    </span>
                  </label>
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>
          )}
          {!profileImagePreview && (
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('profileImage')?.click()}
                className="w-full"
              >
                Choose Photo
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 