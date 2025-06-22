"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Save, X, Upload } from "lucide-react";
import Image from "next/image";
import { getSportsList, US_STATES, GRADUATION_YEARS, DIVISIONS, getPositionsForSport } from '@/lib/sports-data';
import { CoachProfileData } from './coach-profile-types';
import { sanitizeProfileData } from '@/utils/sanitization';

// Field validation limits
const FIELD_LIMITS = {
  FULL_NAME: 50,
  TITLE: 100,
  ORGANIZATION_NAME: 100,
  CITY: 50,
  COACH_BIO: 1000,
  PERSONAL_STATEMENT: 1000,
  RECRUITING_PHILOSOPHY: 500,
  INSTAGRAM_HANDLE: 50,
  TWITTER_HANDLE: 50,
  URL: 300,
  SHOWCASE_VIDEO_TITLE: 100
};

const NUMERIC_LIMITS = {
  SCHOLARSHIPS_AVAILABLE: { min: 0, max: 50 }
};

interface CoachEditDialogsProps {
  isOpen: boolean;
  dialogType: string | null;
  profileData: CoachProfileData;
  onClose: () => void;
  onSave: (updates: Partial<CoachProfileData>) => void;
}

export function CoachEditDialogs({
  isOpen,
  dialogType,
  profileData,
  onClose,
  onSave
}: CoachEditDialogsProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isUploading, setIsUploading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [organizationLogoPreview, setOrganizationLogoPreview] = useState<string | null>(null);
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
  const [selectedOrganizationFile, setSelectedOrganizationFile] = useState<File | null>(null);

  // Initialize edit data when dialog opens
  useEffect(() => {
    if (!dialogType) {
      // Clean up preview state when dialog is closed
      setProfileImagePreview(null);
      setOrganizationLogoPreview(null);
      setSelectedProfileFile(null);
      setSelectedOrganizationFile(null);
      setValidationErrors({});
      return;
    }

    switch (dialogType) {
      case 'basic-info':
        setEditData({
          fullName: profileData.fullName,
          title: profileData.title,
          sportCoaching: profileData.sportCoaching,
          organizationName: profileData.organizationName,
          city: profileData.city,
          state: profileData.state,
          division: profileData.division || '',
          conference: profileData.conference || ''
        });
        break;
      case 'personal-statement':
        setEditData({
          personalStatement: profileData.personalStatement || ''
        });
        break;
      case 'recruiting-needs':
        setEditData({
          graduationYears: profileData.recruitingNeeds?.graduationYears || [],
          positions: profileData.recruitingNeeds?.positions || [],
          scholarshipsAvailable: profileData.recruitingNeeds?.scholarshipsAvailable ?? '',
          recruitingPhilosophy: profileData.recruitingNeeds?.recruitingPhilosophy || ''
        });
        break;
      case 'social-media':
        setEditData({
          instagram: (profileData.instagramHandle || '').replace('@', ''),
          twitter: (profileData.twitterHandle || '').replace('@', '')
        });
        break;
      case 'program-links':
        setEditData({
          programWebsite: profileData.programWebsite || '',
          schoolWebsite: profileData.schoolWebsite || ''
        });
        break;
      case 'showcase-video':
        setEditData({
          showcaseVideoTitle: profileData.showcaseVideoTitle || '',
          showcaseVideoUrl: profileData.showcaseVideoUrl || ''
        });
        break;
      case 'profile-image':
        setEditData({});
        // Always start fresh for image editing
        setProfileImagePreview(null);
        setSelectedProfileFile(null);
        break;
      case 'organization-logo':
        setEditData({});
        // Always start fresh for logo editing
        setOrganizationLogoPreview(null);
        setSelectedOrganizationFile(null);
        break;
    }
  }, [dialogType, profileData]);

  const validateField = (field: string, value: string | number): string | null => {
    // Required field validation
    if (['fullName', 'title', 'sportCoaching', 'organizationName', 'city', 'state'].includes(field)) {
      if (!value || value.toString().trim() === '') {
        return 'This field is required';
      }
    }

    // String length validation
    if (typeof value === 'string') {
      const limit = FIELD_LIMITS[field.toUpperCase() as keyof typeof FIELD_LIMITS];
      if (limit && value.length > limit) {
        return `Must be ${limit} characters or less`;
      }
    }

    // Number validation
    if (field === 'scholarshipsAvailable' && value !== '') {
      const num = Number(value);
      if (isNaN(num) || num < NUMERIC_LIMITS.SCHOLARSHIPS_AVAILABLE.min || num > NUMERIC_LIMITS.SCHOLARSHIPS_AVAILABLE.max) {
        return `Must be between ${NUMERIC_LIMITS.SCHOLARSHIPS_AVAILABLE.min} and ${NUMERIC_LIMITS.SCHOLARSHIPS_AVAILABLE.max}`;
      }
    }

    // URL validation
    if (['programWebsite', 'schoolWebsite', 'showcaseVideoUrl'].includes(field) && value) {
      try {
        new URL(value.toString());
      } catch {
        return 'Please enter a valid URL';
      }
    }

    // Social media handle validation
    if (['instagram', 'twitter'].includes(field) && value) {
      const handle = value.toString().replace('@', '');
      if (!/^[a-zA-Z0-9._]+$/.test(handle)) {
        return 'Handle can only contain letters, numbers, periods, and underscores';
      }
    }

    return null;
  };

  const handleFieldChange = (field: string, value: string | number | string[]) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleGraduationYear = (year: number) => {
    const years = editData.graduationYears || [];
    const updatedYears = years.includes(year)
      ? years.filter((y: number) => y !== year)
      : [...years, year].sort();
    handleFieldChange('graduationYears', updatedYears);
  };

  const addPosition = (position: string) => {
    const positions = editData.positions || [];
    if (!positions.includes(position)) {
      handleFieldChange('positions', [...positions, position]);
    }
  };

  const removePosition = (position: string) => {
    const positions = editData.positions || [];
    handleFieldChange('positions', positions.filter((p: string) => p !== position));
  };

  const handleImageUpload = async (file: File, imageType: 'profile' | 'organization') => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', profileData.userId || profileData.id);
      formData.append('imageType', imageType);
      
      // Add current image URL for deletion
      const currentImageUrl = imageType === 'profile' 
        ? profileData.profileImage 
        : profileData.organizationLogo;
      if (currentImageUrl) {
        // Remove any existing cache-busting parameters before sending for deletion
        const cleanUrl = currentImageUrl.split('?')[0];
        formData.append('currentImageUrl', cleanUrl);
      }

      // Get auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Update profile data immediately with cache-busting parameter
      const updates: Partial<CoachProfileData> = {};
      if (imageType === 'profile') {
        // Add timestamp to force browser refresh
        updates.profileImage = `${result.imageUrl}?t=${Date.now()}`;
      } else {
        // Add timestamp to force browser refresh
        updates.organizationLogo = `${result.imageUrl}?t=${Date.now()}`;
      }
      
      onSave(updates);
      
      // Reset state and close dialog with error handling
      try {
        setProfileImagePreview(null);
        setOrganizationLogoPreview(null);
        setSelectedProfileFile(null);
        setSelectedOrganizationFile(null);
        // Use setTimeout to ensure state updates complete before closing dialog
        setTimeout(() => {
          onClose();
        }, 0);
      } catch (error) {
        console.error('Error cleaning up dialog state:', error);
        onClose(); // Still try to close even if cleanup fails
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setValidationErrors({ upload: 'Failed to upload image. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, imageType: 'profile' | 'organization') => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setValidationErrors({ upload: 'Please select a valid image file (JPEG, PNG, or WebP)' });
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setValidationErrors({ upload: 'File size must be less than 5MB' });
        return;
      }

      // Clear any previous errors
      setValidationErrors({});
      
      // Store the selected file
      if (imageType === 'profile') {
        setSelectedProfileFile(file);
      } else {
        setSelectedOrganizationFile(file);
      }
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        if (imageType === 'profile') {
          setProfileImagePreview(reader.result as string);
        } else {
          setOrganizationLogoPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImagePreview = (imageType: 'profile' | 'organization') => {
    if (imageType === 'profile') {
      setProfileImagePreview(null);
      setSelectedProfileFile(null);
    } else {
      setOrganizationLogoPreview(null);
      setSelectedOrganizationFile(null);
    }
    setValidationErrors({});
    // Reset file input
    const fileInput = document.getElementById(
      imageType === 'profile' ? 'profileImageUpload' : 'organizationLogoUpload'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleManualUpload = async (imageType: 'profile' | 'organization') => {
    const file = imageType === 'profile' ? selectedProfileFile : selectedOrganizationFile;
    if (!file) return;

    await handleImageUpload(file, imageType);
  };

  const handleSave = () => {
    // Image uploads handle their own saving
    if (dialogType === 'profile-image' || dialogType === 'organization-logo') {
      return;
    }

    try {
      const errors: {[key: string]: string} = {};
      
      // Validate all fields
      Object.entries(editData).forEach(([field, value]) => {
        const error = validateField(field, value);
        if (error) {
          errors[field] = error;
        }
      });

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Prepare updates based on dialog type
      let updates: Partial<CoachProfileData> = {};

      switch (dialogType) {
        case 'basic-info':
          updates = {
            fullName: editData.fullName,
            title: editData.title,
            sportCoaching: editData.sportCoaching,
            organizationName: editData.organizationName,
            city: editData.city,
            state: editData.state,
            division: editData.division || undefined,
            conference: editData.conference || undefined
          };
          break;
        case 'personal-statement':
          updates = {
            personalStatement: editData.personalStatement || undefined
          };
          break;
        case 'recruiting-needs':
          updates = {
            recruitingNeeds: {
              ...profileData.recruitingNeeds,
              graduationYears: editData.graduationYears,
              positions: editData.positions,
              scholarshipsAvailable: editData.scholarshipsAvailable ? Number(editData.scholarshipsAvailable) : undefined,
              recruitingPhilosophy: editData.recruitingPhilosophy
            }
          };
          break;
        case 'social-media':
          updates = {
            instagramHandle: editData.instagram ? editData.instagram.replace('@', '') : undefined,
            twitterHandle: editData.twitter ? editData.twitter.replace('@', '') : undefined
          };
          break;
        case 'program-links':
          updates = {
            programWebsite: editData.programWebsite || undefined,
            schoolWebsite: editData.schoolWebsite || undefined
          };
          break;
        case 'showcase-video':
          updates = {
            showcaseVideoTitle: editData.showcaseVideoTitle || undefined,
            showcaseVideoUrl: editData.showcaseVideoUrl || undefined,
            showcaseVideoEmbedUrl: editData.showcaseVideoUrl ? 
              editData.showcaseVideoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/') : 
              undefined
          };
          break;
      }

      // SECURITY: Sanitize all user input to prevent XSS attacks
      const sanitizedUpdates = sanitizeProfileData(updates) as Partial<CoachProfileData>;

      onSave(sanitizedUpdates);
    } catch (error) {
      console.error('Error saving profile data:', error);
      setValidationErrors({ general: 'An error occurred while saving. Please try again.' });
    }
  };

  const getDialogContent = () => {
    switch (dialogType) {
      case 'basic-info':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={editData.fullName || ''}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                className={validationErrors.fullName ? 'border-red-500' : ''}
              />
              {validationErrors.fullName && <p className="text-red-500 text-sm">{validationErrors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title/Position *</Label>
              <Input
                id="title"
                value={editData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="e.g., Head Coach, Assistant Coach, Program Director"
                className={validationErrors.title ? 'border-red-500' : ''}
              />
              {validationErrors.title && <p className="text-red-500 text-sm">{validationErrors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sportCoaching">Sport *</Label>
              <Select value={editData.sportCoaching || ''} onValueChange={(value) => handleFieldChange('sportCoaching', value)}>
                <SelectTrigger className={validationErrors.sportCoaching ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {getSportsList().map(sport => (
                    <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.sportCoaching && <p className="text-red-500 text-sm">{validationErrors.sportCoaching}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="division">Division</Label>
              <Select value={editData.division || ''} onValueChange={(value) => handleFieldChange('division', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {DIVISIONS.map(division => (
                    <SelectItem key={division} value={division}>{division}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationName">School/Organization *</Label>
              <Input
                id="organizationName"
                value={editData.organizationName || ''}
                onChange={(e) => handleFieldChange('organizationName', e.target.value)}
                placeholder="Enter school or organization name"
                className={validationErrors.organizationName ? 'border-red-500' : ''}
              />
              {validationErrors.organizationName && <p className="text-red-500 text-sm">{validationErrors.organizationName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={editData.city || ''}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  placeholder="City"
                  className={validationErrors.city ? 'border-red-500' : ''}
                />
                {validationErrors.city && <p className="text-red-500 text-sm">{validationErrors.city}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select value={editData.state || ''} onValueChange={(value) => handleFieldChange('state', value)}>
                  <SelectTrigger className={validationErrors.state ? 'border-red-500' : ''}>
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.state && <p className="text-red-500 text-sm">{validationErrors.state}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conference">Conference</Label>
              <Input
                id="conference"
                value={editData.conference || ''}
                onChange={(e) => handleFieldChange('conference', e.target.value)}
                placeholder="e.g., Big Ten, SEC, WAC"
              />
            </div>
          </div>
        );

      case 'personal-statement':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personalStatement">About Coach</Label>
              <Textarea
                id="personalStatement"
                value={editData.personalStatement || ''}
                onChange={(e) => handleFieldChange('personalStatement', e.target.value)}
                placeholder="Share your personal story, coaching journey, coaching philosophy, and what drives your passion for coaching..."
                rows={8}
                className={validationErrors.personalStatement ? 'border-red-500' : ''}
              />
              <p className="text-xs text-muted-foreground">
                {(editData.personalStatement || '').length} / {FIELD_LIMITS.PERSONAL_STATEMENT}
              </p>
              {validationErrors.personalStatement && <p className="text-red-500 text-sm">{validationErrors.personalStatement}</p>}
            </div>
          </div>
        );

      case 'recruiting-needs':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Recruiting Graduation Years</Label>
              <div className="grid grid-cols-4 gap-2">
                {GRADUATION_YEARS.map(year => (
                  <div key={year} className="flex items-center space-x-2">
                    <Checkbox
                      id={`year-${year}`}
                      checked={(editData.graduationYears || []).includes(year)}
                      onCheckedChange={() => toggleGraduationYear(year)}
                    />
                    <Label htmlFor={`year-${year}`} className="text-sm">{year}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Positions Looking For</Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {(editData.positions || []).map((position: string) => (
                    <Badge key={position} variant="secondary" className="cursor-pointer" onClick={() => removePosition(position)}>
                      {position} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={(value) => addPosition(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a position to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {getPositionsForSport(profileData.sportCoaching)
                      .filter(position => !(editData.positions || []).includes(position))
                      .map(position => (
                        <SelectItem key={position} value={position}>{position}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Select positions from the dropdown. Click on badges to remove.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scholarshipsAvailable">Scholarships Available</Label>
              <Input
                id="scholarshipsAvailable"
                type="number"
                value={editData.scholarshipsAvailable ?? ''}
                onChange={(e) => handleFieldChange('scholarshipsAvailable', e.target.value)}
                placeholder="Number of scholarships available"
                min="0"
                max="50"
                className={validationErrors.scholarshipsAvailable ? 'border-red-500' : ''}
              />
              {validationErrors.scholarshipsAvailable && <p className="text-red-500 text-sm">{validationErrors.scholarshipsAvailable}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="recruitingPhilosophy">What We&apos;re Looking For</Label>
              <Textarea
                id="recruitingPhilosophy"
                value={editData.recruitingPhilosophy || ''}
                onChange={(e) => handleFieldChange('recruitingPhilosophy', e.target.value)}
                placeholder="Describe the qualities, skills, and characteristics you seek in student-athletes..."
                rows={4}
                className={validationErrors.recruitingPhilosophy ? 'border-red-500' : ''}
              />
              <p className="text-xs text-muted-foreground">
                {(editData.recruitingPhilosophy || '').length} / {FIELD_LIMITS.RECRUITING_PHILOSOPHY}
              </p>
              {validationErrors.recruitingPhilosophy && <p className="text-red-500 text-sm">{validationErrors.recruitingPhilosophy}</p>}
            </div>
          </div>
        );

      case 'social-media':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram Handle</Label>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">@</span>
                <Input
                  id="instagram"
                  value={editData.instagram || ''}
                  onChange={(e) => handleFieldChange('instagram', e.target.value.replace('@', ''))}
                  placeholder="username"
                  className={validationErrors.instagram ? 'border-red-500' : ''}
                />
              </div>
              {validationErrors.instagram && <p className="text-red-500 text-sm">{validationErrors.instagram}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter Handle</Label>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">@</span>
                <Input
                  id="twitter"
                  value={editData.twitter || ''}
                  onChange={(e) => handleFieldChange('twitter', e.target.value.replace('@', ''))}
                  placeholder="username"
                  className={validationErrors.twitter ? 'border-red-500' : ''}
                />
              </div>
              {validationErrors.twitter && <p className="text-red-500 text-sm">{validationErrors.twitter}</p>}
            </div>
          </div>
        );

      case 'program-links':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="programWebsite">Program Website</Label>
              <Input
                id="programWebsite"
                value={editData.programWebsite || ''}
                onChange={(e) => handleFieldChange('programWebsite', e.target.value)}
                placeholder="https://school.edu/athletics/basketball"
                className={validationErrors.programWebsite ? 'border-red-500' : ''}
              />
              {validationErrors.programWebsite && <p className="text-red-500 text-sm">{validationErrors.programWebsite}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolWebsite">School Website</Label>
              <Input
                id="schoolWebsite"
                value={editData.schoolWebsite || ''}
                onChange={(e) => handleFieldChange('schoolWebsite', e.target.value)}
                placeholder="https://school.edu"
                className={validationErrors.schoolWebsite ? 'border-red-500' : ''}
              />
              {validationErrors.schoolWebsite && <p className="text-red-500 text-sm">{validationErrors.schoolWebsite}</p>}
            </div>
          </div>
        );

      case 'showcase-video':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="showcaseVideoTitle">Video Title</Label>
              <Input
                id="showcaseVideoTitle"
                value={editData.showcaseVideoTitle || ''}
                onChange={(e) => handleFieldChange('showcaseVideoTitle', e.target.value)}
                placeholder="e.g., Program Highlights 2024"
                className={validationErrors.showcaseVideoTitle ? 'border-red-500' : ''}
              />
              {validationErrors.showcaseVideoTitle && <p className="text-red-500 text-sm">{validationErrors.showcaseVideoTitle}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="showcaseVideoUrl">YouTube Video URL</Label>
              <Input
                id="showcaseVideoUrl"
                value={editData.showcaseVideoUrl || ''}
                onChange={(e) => handleFieldChange('showcaseVideoUrl', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className={validationErrors.showcaseVideoUrl ? 'border-red-500' : ''}
              />
              {validationErrors.showcaseVideoUrl && <p className="text-red-500 text-sm">{validationErrors.showcaseVideoUrl}</p>}
            </div>
          </div>
        );

      case 'profile-image':
        return (
          <div className="space-y-4">
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
                    onClick={() => removeImagePreview('profile')}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="profileImageUpload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload a profile picture
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          Choose a new profile picture
                        </span>
                      </label>
                      <input
                        id="profileImageUpload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => handleFileChange(e, 'profile')}
                        disabled={isUploading}
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
                    onClick={() => document.getElementById('profileImageUpload')?.click()}
                    className="w-full"
                    disabled={isUploading}
                  >
                    Choose Photo
                  </Button>
                </div>
              )}
              {selectedProfileFile && profileImagePreview && (
                <div>
                  <Button
                    type="button"
                    onClick={() => handleManualUpload('profile')}
                    className="w-full"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats: JPG, PNG, WebP. Max size: 5MB
            </p>
            {validationErrors.upload && <p className="text-red-500 text-sm">{validationErrors.upload}</p>}
          </div>
        );

      case 'organization-logo':
        return (
          <div className="space-y-4">
            <div className="space-y-4">
              {organizationLogoPreview ? (
                <div className="relative w-24 h-20 mx-auto">
                  <Image
                    src={organizationLogoPreview}
                    alt="Organization logo preview"
                    width={96}
                    height={80}
                    className="rounded-lg object-contain border border-border/50"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImagePreview('organization')}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="organizationLogoUpload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload organization logo
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          Choose a new logo
                        </span>
                      </label>
                      <input
                        id="organizationLogoUpload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => handleFileChange(e, 'organization')}
                        disabled={isUploading}
                        className="sr-only"
                      />
                    </div>
                  </div>
                </div>
              )}
              {!organizationLogoPreview && (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('organizationLogoUpload')?.click()}
                    className="w-full"
                    disabled={isUploading}
                  >
                    Choose Logo
                  </Button>
                </div>
              )}
              {selectedOrganizationFile && organizationLogoPreview && (
                <div>
                  <Button
                    type="button"
                    onClick={() => handleManualUpload('organization')}
                    className="w-full"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Logo'}
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats: JPG, PNG, WebP. Max size: 5MB
            </p>
            {validationErrors.upload && <p className="text-red-500 text-sm">{validationErrors.upload}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case 'basic-info': return 'Edit Basic Information';
      case 'personal-statement': return 'Edit About Coach';
      case 'recruiting-needs': return 'Edit Recruiting Needs';
      case 'social-media': return 'Edit Social Media';
      case 'program-links': return 'Edit Program Links';
      case 'showcase-video': return 'Edit Showcase Video';
      case 'profile-image': return 'Change Profile Picture';
      case 'organization-logo': return 'Change Organization Logo';
      default: return 'Edit Profile';
    }
  };

  if (!dialogType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            Make changes to your profile information. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        
        {getDialogContent()}
        
        <DialogFooter className="gap-2">
          {validationErrors.general && (
            <p className="text-red-500 text-sm w-full text-center">{validationErrors.general}</p>
          )}
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          {dialogType !== 'profile-image' && dialogType !== 'organization-logo' && (
            <Button onClick={handleSave} disabled={isUploading}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 