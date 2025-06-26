"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormValidator, FIELD_LIMITS } from "@/app/(onboarding)/lib/form-validation";
import { OnboardingData } from "../lib/types";
import { FileUpload } from '@/components/ui/file-upload';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      onInputChange('profileImage', file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        onInputChange('profileImagePreview', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
        <FileUpload
          id="profileImage"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          onRemove={removeImage}
          preview={profileImagePreview}
          uploadText="Click to upload profile picture"
          chooseText="Choose profile picture"
          supportedFormats="PNG, JPG, or WebP"
          maxSize="5MB"
          imageType="profile"
        />
        <p className="text-xs text-muted-foreground">Optional - A default image will be selected if none provided</p>
      </div>
    </>
  );
} 