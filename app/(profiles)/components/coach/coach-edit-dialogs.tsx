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
import { Save, X } from "lucide-react";
import { US_STATES, DIVISIONS, getPositionsForSport, getStudentClassificationOptions } from '@/lib/sports-data';
import { CoachProfileData } from './coach-profile-types';
import { sanitizeProfileData } from '@/utils/sanitization';
import { FileUpload } from '@/components/ui/file-upload';
import { useRoleView } from '@/hooks/use-role-view';
import { SchoolSelector } from "@/components/ui/school-selector";
import { cn } from '@/lib/utils';
import { UnifiedSportSelector } from "@/components/ui/unified-sport-selector";
import { ConferenceSelector } from "@/components/ui/conference-selector";


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

// Add countries list for country select
const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Brazil",
  "Mexico",
  "Japan",
  "South Korea",
  "Netherlands",
  "Sweden",
  "New Zealand"
];

interface CoachEditDialogsProps {
  isOpen: boolean;
  dialogType: string | null;
  profileData: CoachProfileData;
  onClose: () => void;
  onSave: (updates: Partial<CoachProfileData>) => void;
  hasPendingVerification?: boolean;
}

export function CoachEditDialogs({
  isOpen,
  dialogType,
  profileData,
  onClose,
  onSave,
  hasPendingVerification = false
}: CoachEditDialogsProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isUploading, setIsUploading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [organizationLogoPreview, setOrganizationLogoPreview] = useState<string | null>(null);
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
  const [selectedOrganizationFile, setSelectedOrganizationFile] = useState<File | null>(null);

  // Get admin role information for demo profile uploads
  const { isAdmin, viewingAs } = useRoleView();

  // Helper function to determine if fields should be locked due to pending verification
  const shouldLockFields = () => {
    return hasPendingVerification;
  };

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

    // Prevent auto-focus on dialog open
    if (document.activeElement && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
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
          country: profileData.country || '',
          division: profileData.division || '',
          conference: profileData.conference || '',
          personalStatement: profileData.personalStatement || '',
          programWebsite: profileData.programWebsite || '',
          schoolWebsite: profileData.schoolWebsite || '',
          instagramHandle: profileData.instagramHandle || '',
          twitterHandle: profileData.twitterHandle || '',
          showcaseVideoTitle: profileData.showcaseVideoTitle || '',
          showcaseVideoUrl: profileData.showcaseVideoUrl || '',
          showcaseVideoEmbedUrl: profileData.showcaseVideoEmbedUrl || ''
        });
        break;
      case 'personal-statement':
        setEditData({
          personalStatement: profileData.personalStatement || ''
        });
        break;
      case 'recruiting-needs':
        setEditData({
          studentClassifications: profileData.recruitingNeeds?.studentClassifications || [],
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
      case 'program-social-media':
        setEditData({
          programInstagram: (profileData.programInstagram || '').replace('@', ''),
          programTwitter: (profileData.programTwitter || '').replace('@', '')
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
    if (["fullName", "title", "sportCoaching", "organizationName", "city"].includes(field)) {
      if (!value || value.toString().trim() === "") {
        return "This field is required";
      }
    }
    if (field === "state") {
      // Only require state if country is United States or not set
      if ((!editData.country || editData.country === "United States") && (!value || value.toString().trim() === "")) {
        return "This field is required";
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
    if (['instagram', 'twitter', 'programInstagram', 'programTwitter'].includes(field) && value) {
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

  const toggleStudentClassification = (classification: string) => {
    const classifications = editData.studentClassifications || [];
    const newClassifications = classifications.includes(classification)
      ? classifications.filter((c: string) => c !== classification)
      : [...classifications, classification];
    handleFieldChange('studentClassifications', newClassifications);
  };

  const handleImageUpload = async (file: File, imageType: 'profile' | 'organization') => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', profileData.userId || profileData.id);
      formData.append('imageType', imageType);
      
      // Add demo profile type for admin users
      if (isAdmin && viewingAs) {
        formData.append('demoProfileType', viewingAs);
      }
      
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

  // Helper function to check if recruiting needs form is valid
  const isRecruitingNeedsFormValid = () => {
    if (dialogType !== 'recruiting-needs') return true;
    
    // Check required fields based on schema: studentClassifications and positions are required (.notNull())
    const hasStudentClassifications = editData.studentClassifications && editData.studentClassifications.length > 0;
    const hasPositions = editData.positions && editData.positions.length > 0;
    
    return hasStudentClassifications && hasPositions;
  };

  // Helper function to check if at least one program link exists
  const hasAtLeastOneProgramLink = (updates: Partial<Pick<CoachProfileData, 'instagramHandle' | 'twitterHandle' | 'programWebsite' | 'schoolWebsite'>>) => {
    const currentInstagram = profileData.instagramHandle;
    const currentTwitter = profileData.twitterHandle;
    const currentProgramWebsite = profileData.programWebsite;
    const currentSchoolWebsite = profileData.schoolWebsite;
    
    // For social media updates
    if (dialogType === 'social-media') {
      const newInstagram = updates.instagramHandle;
      const newTwitter = updates.twitterHandle;
      // Check if we're deleting both social media AND there are no websites
      if (!newInstagram && !newTwitter && !currentProgramWebsite && !currentSchoolWebsite) {
        return false;
      }
    }
    
    // For program links updates
    if (dialogType === 'program-links') {
      const newProgramWebsite = updates.programWebsite;
      const newSchoolWebsite = updates.schoolWebsite;
      // Check if we're deleting both websites AND there are no social media links
      if (!newProgramWebsite && !newSchoolWebsite && !currentInstagram && !currentTwitter) {
        return false;
      }
    }
    
    return true;
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

      // Additional validation for recruiting needs
      if (dialogType === 'recruiting-needs') {
        if (!editData.studentClassifications || editData.studentClassifications.length === 0) {
          errors.studentClassifications = 'At least one student classification is required';
        }
        if (!editData.positions || editData.positions.length === 0) {
          errors.positions = 'At least one position is required';
        }
        // Validate scholarshipsAvailable is a valid number if provided
        if (editData.scholarshipsAvailable !== '' && editData.scholarshipsAvailable !== undefined && isNaN(Number(editData.scholarshipsAvailable))) {
          errors.scholarshipsAvailable = 'Must be a valid number';
        }
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Prepare updates based on dialog type
      let updates: Partial<CoachProfileData> = {};

      switch (dialogType) {
        case 'basic-info':
          updates.fullName = editData.fullName;
          updates.title = editData.title;
          updates.sportCoaching = editData.sportCoaching;
          updates.organizationName = editData.organizationName;
          updates.city = editData.city;
          // If country is not United States, clear state
          if (editData.country && editData.country !== 'United States') {
            updates.state = '';
          } else {
            updates.state = editData.state;
          }
          updates.country = editData.country;
          updates.division = editData.division;
          updates.conference = editData.conference;
          updates.personalStatement = editData.personalStatement;
          updates.programWebsite = editData.programWebsite;
          updates.schoolWebsite = editData.schoolWebsite;
          updates.instagramHandle = editData.instagramHandle;
          updates.twitterHandle = editData.twitterHandle;
          updates.showcaseVideoTitle = editData.showcaseVideoTitle;
          updates.showcaseVideoUrl = editData.showcaseVideoUrl;
          updates.showcaseVideoEmbedUrl = editData.showcaseVideoEmbedUrl;
          break;
        case 'personal-statement':
          updates = {
            personalStatement: editData.personalStatement || undefined
          };
          break;
        case 'recruiting-needs':
          const scholarshipsValue = editData.scholarshipsAvailable && editData.scholarshipsAvailable !== '' ? Number(editData.scholarshipsAvailable) : undefined;
          updates = {
            recruitingNeeds: {
              ...(profileData.recruitingNeeds || {}),
              studentClassifications: editData.studentClassifications,
              positions: editData.positions,
              scholarshipsAvailable: scholarshipsValue,
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
        case 'program-social-media':
  
          updates = {
            programInstagram: editData.programInstagram ? editData.programInstagram.replace('@', '') : undefined,
            programTwitter: editData.programTwitter ? editData.programTwitter.replace('@', '') : undefined
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

      // Validate that at least one program link remains
      if (dialogType === 'social-media' || dialogType === 'program-links') {
        if (!hasAtLeastOneProgramLink(updates)) {
          setValidationErrors({ 
            general: 'You must have at least one program link (website or social media). Please add another link before removing this one.' 
          });
          return;
        }
      }

      // SECURITY: Sanitize all user input to prevent XSS attacks
      const sanitizedUpdates = sanitizeProfileData(updates) as Partial<CoachProfileData>;

      onSave(sanitizedUpdates);
      onClose();
    } catch (error) {
      console.error('Error saving profile data:', error);
      setValidationErrors({ general: 'An error occurred while saving. Please try again.' });
    }
  };

  const getDialogContent = () => {
    // Handle null dialogType to prevent showing default case during dialog close animation
    if (!dialogType) {
      return null;
    }
    
    switch (dialogType) {
      case 'basic-info':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={editData.fullName || ''}
                onChange={(e) => {
                  if (!shouldLockFields()) {
                    handleFieldChange('fullName', e.target.value);
                  }
                }}
                placeholder="Enter your full name"
                className={cn(
                  validationErrors.fullName ? 'border-red-500' : '',
                  shouldLockFields() && 'text-muted-foreground opacity-50 cursor-not-allowed bg-muted'
                )}
                autoComplete="off"
                inputMode="text"
                disabled={shouldLockFields()}
              />
              {validationErrors.fullName && <p className="text-red-500 text-sm">{validationErrors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title/Position *</Label>
              <Input
                id="title"
                value={editData.title || ''}
                onChange={(e) => {
                  if (!shouldLockFields()) {
                    handleFieldChange('title', e.target.value);
                  }
                }}
                placeholder="e.g., Head Coach, Assistant Coach, Program Director"
                className={cn(
                  validationErrors.title ? 'border-red-500' : '',
                  shouldLockFields() && 'text-muted-foreground opacity-50 cursor-not-allowed bg-muted'
                )}
                autoComplete="off"
                inputMode="text"
                disabled={shouldLockFields()}
              />
              {validationErrors.title && <p className="text-red-500 text-sm">{validationErrors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sportCoaching">Sport *</Label>
              <div className={cn(shouldLockFields() && 'opacity-50 cursor-not-allowed')}>
                <UnifiedSportSelector
                  mode="single"
                  value={editData.sportCoaching || ''}
                  onValueChange={(value) => {
                    if (!shouldLockFields()) {
                      handleFieldChange('sportCoaching', value);
                    }
                  }}
                  placeholder="Select sport"
                  userCurrentSport={profileData.sportCoaching}
                  disabled={shouldLockFields()}
                  className={cn(
                    validationErrors.sportCoaching && 'border-red-500'
                  )}
                />
              </div>
              {validationErrors.sportCoaching && <p className="text-red-500 text-sm">{validationErrors.sportCoaching}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="division">Division</Label>
              <Select value={editData.division || ''} onValueChange={(value) => {
                if (!shouldLockFields()) {
                  handleFieldChange('division', value);
                }
              }}>
                <SelectTrigger className={cn(
                  '!h-11 w-full',
                  shouldLockFields() && 'text-muted-foreground opacity-50 cursor-not-allowed bg-muted'
                )}>
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  {DIVISIONS.map(division => (
                    <SelectItem key={division} value={division}>{division}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <SchoolSelector
                value={editData.organizationName || ''}
                onValueChange={(value) => {
                  if (!shouldLockFields()) {
                    handleFieldChange('organizationName', value);
                  }
                }}
                placeholder="Start typing school name..."
                label="School/Organization"
                required={true}
                labelClassName="text-sm font-medium"
                description="Start typing to search - if your school isn't found, just type the full name"
                educationLevel="undergraduate"
                disabled={shouldLockFields()}
              />
              {validationErrors.organizationName && <p className="text-red-500 text-sm">{validationErrors.organizationName}</p>}
            </div>

            {/* Country select field */}
            <div className="space-y-2">
              <Label htmlFor="edit-country">Country *</Label>
              <Select
                value={String(editData.country || '')}
                onValueChange={(value) => {
                  if (!shouldLockFields()) {
                    setEditData(prev => ({ ...prev, country: value }));
                  }
                }}
              >
                <SelectTrigger className={cn(
                  '!h-11 w-full',
                  shouldLockFields() && 'text-muted-foreground opacity-50 cursor-not-allowed bg-muted'
                )} id="edit-country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-city">City *</Label>
                <Input
                  id="edit-city"
                  value={editData.city || ''}
                  onChange={(e) => {
                    if (!shouldLockFields()) {
                      handleFieldChange('city', e.target.value);
                    }
                  }}
                  className={cn(
                    "h-11 w-full",
                    shouldLockFields() && 'text-muted-foreground opacity-50 cursor-not-allowed bg-muted'
                  )}
                  disabled={shouldLockFields()}
                />
                {validationErrors.city && <p className="text-red-500 text-sm">{validationErrors.city}</p>}
              </div>
              {/* Only show State * if country is United States or not selected */}
              {(!editData.country || editData.country === 'United States') && (
                <div className="space-y-2">
                  <Label htmlFor="edit-state">State *</Label>
                  <Select
                    value={String(editData.state || '')}
                    onValueChange={(value) => {
                      if (!shouldLockFields()) {
                        setEditData(prev => ({ ...prev, state: value }));
                      }
                    }}
                  >
                    <SelectTrigger className={cn(
                      '!h-11 w-full',
                      shouldLockFields() && 'text-muted-foreground opacity-50 cursor-not-allowed bg-muted'
                    )} id="edit-state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="z-[70]">
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.state && <p className="text-red-500 text-sm">{validationErrors.state}</p>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="conference">Conference {editData.division && editData.division !== 'High School' && '*'}</Label>
              <ConferenceSelector
                division={editData.division || ''}
                value={editData.conference || ''}
                onValueChange={(value) => {
                  if (!shouldLockFields()) {
                    handleFieldChange('conference', value);
                  }
                }}
                placeholder="Select conference"
                label=""
                inDialog={true}
                height="h-11"
                disabled={shouldLockFields()}
                required={editData.division !== 'High School'}
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
                autoComplete="off"
                inputMode="text"
                
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
              <Label className={`${(!editData.studentClassifications || editData.studentClassifications.length === 0) && validationErrors.studentClassifications ? 'text-red-600' : ''}`}>
                Student Classifications Currently Recruiting *
              </Label>
              <p className="text-sm text-muted-foreground">
                Select the types of students you are actively recruiting.
              </p>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${(!editData.studentClassifications || editData.studentClassifications.length === 0) && validationErrors.studentClassifications ? 'border border-red-300 rounded-md p-2' : ''}`}>
                {getStudentClassificationOptions().map(({ value, label }) => (
                  <div key={value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`classification-${value}`}
                      checked={(editData.studentClassifications || []).includes(value)}
                      onCheckedChange={() => toggleStudentClassification(value)}
                    />
                    <Label htmlFor={`classification-${value}`} className="text-sm cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
              {validationErrors.studentClassifications && (
                <p className="text-red-500 text-sm">{validationErrors.studentClassifications}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label className={`${(!editData.positions || editData.positions.length === 0) && validationErrors.positions ? 'text-red-600' : ''}`}>
                Positions Looking For *
              </Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {(editData.positions || []).map((position: string) => (
                    <Badge key={position} variant="secondary" className="cursor-pointer" onClick={() => removePosition(position)}>
                      {position} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={(value) => addPosition(value)}>
                  <SelectTrigger className={`!h-11 w-full ${(!editData.positions || editData.positions.length === 0) && validationErrors.positions ? 'border-red-300' : ''}`}>
                    <SelectValue placeholder="Select a position to add" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {getPositionsForSport(profileData.sportCoaching)
                      .filter(position => !(editData.positions || []).includes(position))
                      .map(position => (
                        <SelectItem key={position} value={position}>{position}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Select positions from the dropdown. Click on badges to remove.</p>
              </div>
              {validationErrors.positions && (
                <p className="text-red-500 text-sm">{validationErrors.positions}</p>
              )}
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
                autoComplete="off"
                inputMode="numeric"
                
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
                autoComplete="off"
                inputMode="text"
                
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
                  autoComplete="off"
                  inputMode="text"
                  
                />
              </div>
              {validationErrors.instagram && <p className="text-red-500 text-sm">{validationErrors.instagram}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">X Handle</Label>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">@</span>
                <Input
                  id="twitter"
                  value={editData.twitter || ''}
                  onChange={(e) => handleFieldChange('twitter', e.target.value.replace('@', ''))}
                  placeholder="username"
                  className={validationErrors.twitter ? 'border-red-500' : ''}
                  autoComplete="off"
                  inputMode="text"
                  
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
                autoComplete="off"
                inputMode="url"
                
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
                autoComplete="off"
                inputMode="url"
                
              />
              {validationErrors.schoolWebsite && <p className="text-red-500 text-sm">{validationErrors.schoolWebsite}</p>}
            </div>
          </div>
        );

      case 'program-social-media':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="programInstagram">Program Instagram Handle</Label>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">@</span>
                <Input
                  id="programInstagram"
                  value={editData.programInstagram || ''}
                  onChange={(e) => handleFieldChange('programInstagram', e.target.value.replace('@', ''))}
                  placeholder="programhandle"
                  className={validationErrors.programInstagram ? 'border-red-500' : ''}
                  autoComplete="off"
                  inputMode="text"
                />
              </div>
              {validationErrors.programInstagram && <p className="text-red-500 text-sm">{validationErrors.programInstagram}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="programTwitter">Program X Handle</Label>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">@</span>
                <Input
                  id="programTwitter"
                  value={editData.programTwitter || ''}
                  onChange={(e) => handleFieldChange('programTwitter', e.target.value.replace('@', ''))}
                  placeholder="programhandle"
                  className={validationErrors.programTwitter ? 'border-red-500' : ''}
                  autoComplete="off"
                  inputMode="text"
                />
              </div>
              {validationErrors.programTwitter && <p className="text-red-500 text-sm">{validationErrors.programTwitter}</p>}
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
                autoComplete="off"
                inputMode="text"
                
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
                autoComplete="off"
                inputMode="url"
                
              />
              {validationErrors.showcaseVideoUrl && <p className="text-red-500 text-sm">{validationErrors.showcaseVideoUrl}</p>}
            </div>
          </div>
        );

      case 'profile-image':
        return (
          <FileUpload
            id="profileImageUpload"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleFileChange(e, 'profile')}
            onRemove={() => removeImagePreview('profile')}
            disabled={isUploading}
            preview={profileImagePreview}
            originalImage={profileData.profileImage}
            uploadText="Upload a profile picture"
            chooseText="Choose a new profile picture"
            supportedFormats="Supported formats: JPG, PNG, WebP"
            maxSize="5MB"
            isUploading={isUploading}
            error={validationErrors.upload}
            imageType="profile"
          />
        );

      case 'organization-logo':
        return (
          <FileUpload
            id="organizationLogoUpload"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleFileChange(e, 'organization')}
            onRemove={() => removeImagePreview('organization')}
            disabled={isUploading}
            preview={organizationLogoPreview}
            originalImage={profileData.organizationLogo}
            uploadText="Upload organization logo"
            chooseText="Choose a new logo"
            supportedFormats="Supported formats: JPG, PNG, WebP"
            maxSize="5MB"
            isUploading={isUploading}
            error={validationErrors.upload}
            imageType="organization"
          />
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
      case 'program-social-media': return 'Edit Program Social Media';
      case 'showcase-video': return 'Edit Showcase Video';
      case 'profile-image': return 'Change Profile Picture';
      case 'organization-logo': return 'Change Organization Logo';
      default: return 'Edit Profile';
    }
  };

  if (!dialogType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto overscroll-contain w-[95vw] sm:w-full flex flex-col"
        onOpenAutoFocus={e => e.preventDefault()}
        style={{ touchAction: 'pan-y' }}
        onWheel={(e) => e.stopPropagation()}
      >
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
            <Button 
              onClick={handleSave} 
              disabled={isUploading || !isRecruitingNeedsFormValid() || (dialogType === 'basic-info' && shouldLockFields())}
              className={cn(
                dialogType === 'basic-info' && shouldLockFields() && "opacity-50 cursor-not-allowed"
              )}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
              {dialogType === 'basic-info' && shouldLockFields() && (
                <span className="text-xs text-muted-foreground ml-2">(Locked)</span>
              )}
            </Button>
          )}
          {dialogType === 'profile-image' && profileImagePreview && (
            <Button onClick={() => handleManualUpload('profile')} disabled={isUploading}>
              <Save className="w-4 h-4 mr-2" />
              {isUploading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
          {dialogType === 'organization-logo' && organizationLogoPreview && (
            <Button onClick={() => handleManualUpload('organization')} disabled={isUploading}>
              <Save className="w-4 h-4 mr-2" />
              {isUploading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 