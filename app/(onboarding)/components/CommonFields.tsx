"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { FormValidator, FIELD_LIMITS } from "@/lib/form-validation";
import { OnboardingData } from "../components/types";

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
            <div className="relative w-32 h-32 mx-auto">
              <Image
                src={profileImagePreview}
                alt="Profile preview"
                fill
                className="rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
              >
                <X className="w-4 h-4" />
              </Button>
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
                    accept="image/jpeg,image/jpg,image/png,image/webp"
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
        <p className="text-xs text-muted-foreground">
          Accepted formats: JPEG, PNG, WebP. Max size: 5MB.
        </p>
      </div>
    </>
  );
} 