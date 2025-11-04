"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormValidator, FIELD_LIMITS } from "@/app/(onboarding)/lib/form-validation";
import { OnboardingData } from "../lib/types";
import { ProfilePictureUpload } from '@/components/ui/profile-picture-upload';

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
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const handleProfilePictureChange = (blob: Blob, croppedImageUrl: string) => {
    // Convert blob to file
    const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
    onInputChange('profileImage', file);
    onInputChange('profileImagePreview', croppedImageUrl);
  };

  const validateAndUpdateName = (value: string) => {
    const newErrors = { ...validationErrors };
    
    const nameResult = FormValidator.validateName(value, true);
    if (nameResult.isValid) {
      delete newErrors.fullName;
    } else {
      newErrors.fullName = nameResult.error!;
    }
    
    setValidationErrors(newErrors);
    onInputChange('fullName', value);
  };

  const removeImage = () => {
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
          onChange={(e) => validateAndUpdateName(e.target.value)}
          className={`h-11 bg-background ${validationErrors.fullName ? 'border-red-500' : ''}`}
          maxLength={FIELD_LIMITS.FULL_NAME}
        />
        {validationErrors.fullName && (
          <p className="text-sm text-red-500">{validationErrors.fullName}</p>
        )}
        <p className="text-xs text-muted-foreground">{fullName.length}/{FIELD_LIMITS.FULL_NAME} characters</p>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Profile Picture</Label>
        <ProfilePictureUpload
          id="profileImage"
          value={profileImagePreview}
          onChange={handleProfilePictureChange}
          onRemove={removeImage}
        />
        <p className="text-xs text-muted-foreground">Optional - A default image will be selected if none provided</p>
      </div>
    </>
  );
} 