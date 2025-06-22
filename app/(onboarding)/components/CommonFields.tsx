"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { FormValidator, FIELD_LIMITS } from "@/app/(onboarding)/lib/form-validation";
import { OnboardingData } from "../lib/types";

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
        <div className="space-y-4">
          {profileImagePreview ? (
            <div className="relative w-32 h-32 mx-auto p-2">
              <div className="relative w-full h-full overflow-hidden rounded-lg border border-border/50">
                <Image
                  src={profileImagePreview}
                  alt="Profile preview"
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-1 -right-1 w-6 h-6 p-0 rounded-full z-10"
                onClick={removeImage}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <label
              htmlFor="profileImage"
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-border/80 transition-colors block"
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Click to upload profile picture</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, or WebP (max 5MB)</p>
                <p className="text-xs text-muted-foreground">Optional - A default image will be selected if none provided</p>
              </div>
              <Input
                id="profileImage"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          )}
        </div>
      </div>
    </>
  );
} 