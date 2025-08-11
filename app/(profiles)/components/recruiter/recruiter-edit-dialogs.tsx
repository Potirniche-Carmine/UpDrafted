"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Save, X } from "lucide-react";
import { getSportsList, US_STATES, DIVISIONS, getPositionsForSport, getStudentClassificationOptions } from '@/lib/sports-data';
import { RecruiterProfileData } from './recruiter-profile-types';
import { sanitizeProfileData } from '@/utils/sanitization';
import { FileUpload } from '@/components/ui/file-upload';
import { useRoleView } from '@/hooks/use-role-view';

// Field validation limits
const FIELD_LIMITS = {
  FULL_NAME: 50,
  TITLE: 100,
  ORGANIZATION_NAME: 100,
  CITY: 50,
  RECRUITER_BIO: 1000,
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

interface RecruiterEditDialogsProps {
  isOpen: boolean;
  dialogType: string | null;
  profileData: RecruiterProfileData;
  selectedSport?: string;
  onClose: () => void;
  onSave: (updates: Partial<RecruiterProfileData>) => void;
}

export function RecruiterEditDialogs({
  isOpen,
  dialogType,
  profileData,
  selectedSport,
  onClose,
  onSave
}: RecruiterEditDialogsProps) {
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
          sportRecruiting: profileData.sportRecruiting,
          secondarySports: profileData.secondarySports || [],
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
        const currentSport = selectedSport || profileData.sportRecruiting;
        const currentNeeds = profileData.sportSpecificNeeds?.[currentSport];
        
        setEditData({
          studentClassifications: currentNeeds?.studentClassifications || [],
          positions: currentNeeds?.positions || [],
          scholarshipsAvailable: currentNeeds?.scholarshipsAvailable ?? '',
          recruitingPhilosophy: currentNeeds?.recruitingPhilosophy || '',
          sport: currentSport
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
      case 'add-sport':
        setEditData({
          newSport: '',
          studentClassifications: [],
          positions: [],
          scholarshipsAvailable: '',
          recruitingPhilosophy: ''
        });
        break;
    }
  }, [dialogType, profileData, selectedSport]);

  const validateField = (field: string, value: string | number): string | null => {
    // Required field validation
    if (["fullName", "title", "sportRecruiting", "organizationName", "city", "newSport"].includes(field)) {
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
    if (typeof value === "string") {
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
      const updates: Partial<RecruiterProfileData> = {};
      if (imageType === 'profile') {
        // Add timestamp to force browser refresh
        updates.profileImage = `${result.imageUrl}?t=${Date.now()}`;
      } else {
        // Add timestamp to force browser refresh
        updates.organizationLogo = `${result.imageUrl}?t=${Date.now()}`;
      }
      
      onSave(updates);
      
      // Reset state and close dialog
      setProfileImagePreview(null);
      setOrganizationLogoPreview(null);
      setSelectedProfileFile(null);
      setSelectedOrganizationFile(null);
      onClose();
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

  // Helper function to check if add-sport form is valid
  const isAddSportFormValid = () => {
    if (dialogType !== 'add-sport') return true;
    
    return (
      editData.newSport && 
      editData.newSport.trim() !== '' &&
      editData.studentClassifications && 
      editData.studentClassifications.length > 0 &&
      editData.positions && 
      editData.positions.length > 0 &&
      editData.recruitingPhilosophy && 
      editData.recruitingPhilosophy.trim() !== ''
    );
  };

  // Helper function to check if at least one program link exists
  const hasAtLeastOneProgramLink = (updates: any) => {
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

    // Additional validation for add-sport
    if (dialogType === 'add-sport') {
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
    let updates: Partial<RecruiterProfileData> = {};

    switch (dialogType) {
      case 'basic-info':
        updates.fullName = editData.fullName;
        updates.title = editData.title;
        updates.sportRecruiting = editData.sportRecruiting;
        updates.secondarySports = editData.secondarySports;
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
        const currentSportToUpdate = selectedSport || profileData.sportRecruiting;
        const scholarshipsValue = editData.scholarshipsAvailable && editData.scholarshipsAvailable !== '' ? Number(editData.scholarshipsAvailable) : undefined;
        
        updates = {
          sportSpecificNeeds: {
            ...profileData.sportSpecificNeeds,
            [currentSportToUpdate]: {
              studentClassifications: editData.studentClassifications,
              positions: editData.positions,
              scholarshipsAvailable: scholarshipsValue,
              recruitingPhilosophy: editData.recruitingPhilosophy
            }
          }
        };
        break;
      case 'social-media':
        updates = {
          instagramHandle: editData.instagram ? editData.instagram.replace('@', '') : null,
          twitterHandle: editData.twitter ? editData.twitter.replace('@', '') : null
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
          programInstagram: editData.programInstagram ? editData.programInstagram.replace('@', '') : null,
          programTwitter: editData.programTwitter ? editData.programTwitter.replace('@', '') : null
        };
        break;
      case 'showcase-video':
        // Convert YouTube URLs to embed URLs
        let embedUrl = '';
        if (editData.showcaseVideoUrl) {
          const url = editData.showcaseVideoUrl;
          const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
          const match = url.match(youtubeRegex);
          if (match) {
            embedUrl = `https://www.youtube.com/embed/${match[1]}`;
          }
        }

        updates = {
          showcaseVideoTitle: editData.showcaseVideoTitle || undefined,
          showcaseVideoUrl: editData.showcaseVideoUrl || undefined,
          showcaseVideoEmbedUrl: embedUrl || undefined
        };
        break;
      case 'add-sport':
        // Validate that the new sport isn't already in the profile
        const currentSports = [profileData.sportRecruiting, ...(profileData.secondarySports || [])];
        if (currentSports.includes(editData.newSport)) {
          setValidationErrors({ newSport: 'This sport is already added to your profile' });
          return;
        }
        
        const addSportScholarshipsValue = editData.scholarshipsAvailable && editData.scholarshipsAvailable !== '' ? Number(editData.scholarshipsAvailable) : undefined;
        
        updates = {
          secondarySports: [...(profileData.secondarySports || []), editData.newSport],
          sportSpecificNeeds: {
            ...profileData.sportSpecificNeeds,
            [editData.newSport]: {
              studentClassifications: editData.studentClassifications,
              positions: editData.positions,
              scholarshipsAvailable: addSportScholarshipsValue,
              recruitingPhilosophy: editData.recruitingPhilosophy
            }
          }
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
    const sanitizedUpdates = sanitizeProfileData(updates) as Partial<RecruiterProfileData>;

    onSave(sanitizedUpdates);
    onClose();
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
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                maxLength={FIELD_LIMITS.FULL_NAME}
                autoComplete="off"
                inputMode="text"
                autoFocus={false}
              />
              {validationErrors.fullName && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={editData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="e.g., Head Recruiter, Assistant Recruiter"
                maxLength={FIELD_LIMITS.TITLE}
                autoComplete="off"
                inputMode="text"
                autoFocus={false}
              />
              {validationErrors.title && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sportRecruiting">Sport Recruiting *</Label>
              <Select 
                value={editData.sportRecruiting || ''} 
                onValueChange={(value) => handleFieldChange('sportRecruiting', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  {getSportsList().map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.sportRecruiting && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.sportRecruiting}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name *</Label>
              <Input
                id="organizationName"
                value={editData.organizationName || ''}
                onChange={(e) => handleFieldChange('organizationName', e.target.value)}
                placeholder="e.g., University of State, State High School"
                maxLength={FIELD_LIMITS.ORGANIZATION_NAME}
                autoComplete="off"
                inputMode="text"
                autoFocus={false}
              />
              {validationErrors.organizationName && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.organizationName}</p>
              )}
            </div>

            {/* Country select field */}
            <div className="space-y-2">
              <Label htmlFor="edit-country">Country *</Label>
              <Select
                value={String(editData.country || '')}
                onValueChange={(value) => setEditData(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger className="h-12" id="edit-country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-city">City *</Label>
                <Input
                  id="edit-city"
                  value={editData.city || ''}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  className="h-12"
                />
              </div>
              {/* Only show State * if country is United States or not selected */}
              {(!editData.country || editData.country === 'United States') && (
                <div className="space-y-2">
                  <Label htmlFor="edit-state">State *</Label>
                  <Select
                    value={String(editData.state || '')}
                    onValueChange={(value) => setEditData(prev => ({ ...prev, state: value }))}
                  >
                    <SelectTrigger className="h-12" id="edit-state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="z-[70]">
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="division">Division</Label>
              <Select 
                value={editData.division || ''} 
                onValueChange={(value) => handleFieldChange('division', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  {DIVISIONS.map((division) => (
                    <SelectItem key={division} value={division}>
                      {division}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conference">Conference (Optional)</Label>
              <Input
                id="conference"
                value={editData.conference || ''}
                onChange={(e) => handleFieldChange('conference', e.target.value)}
                placeholder="e.g., Big Ten, ACC, etc."
                autoComplete="off"
                inputMode="text"
                autoFocus={false}
              />
            </div>
          </div>
        );

      case 'personal-statement':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personalStatement">About You</Label>
              <Textarea
                id="personalStatement"
                value={editData.personalStatement || ''}
                onChange={(e) => handleFieldChange('personalStatement', e.target.value)}
                placeholder="Share your recruiting philosophy, experience, and what makes you unique as a recruiter..."
                className="min-h-[120px]"
                maxLength={FIELD_LIMITS.PERSONAL_STATEMENT}
                autoComplete="off"
                inputMode="text"
                autoFocus={false}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {(editData.personalStatement || '').length}/{FIELD_LIMITS.PERSONAL_STATEMENT} characters
              </p>
            </div>
          </div>
        );

      case 'recruiting-needs':
        const currentSport = selectedSport || profileData.sportRecruiting;
        const availablePositions = getPositionsForSport(currentSport);
        
        return (
          <div className="space-y-6">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">
                Sport: <span className="text-foreground">{currentSport}</span>
              </p>
            </div>
            
            <div className="space-y-3">
              <Label className={`${(!editData.studentClassifications || editData.studentClassifications.length === 0) && validationErrors.studentClassifications ? 'text-red-600' : ''}`}>
                Student Classifications Currently Recruiting *
              </Label>
              <p className="text-sm text-muted-foreground">
                Select the types of students you are actively recruiting for this sport.
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

            <div>
              <Label className={`${(!editData.positions || editData.positions.length === 0) && validationErrors.positions ? 'text-red-600' : ''}`}>
                Positions Needed *
              </Label>
              <div className="mt-2">
                <Select onValueChange={addPosition}>
                  <SelectTrigger className={`${(!editData.positions || editData.positions.length === 0) && validationErrors.positions ? 'border-red-300' : ''}`}>
                    <SelectValue placeholder="Add position" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {availablePositions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {(editData.positions || []).map((position: string) => (
                  <Badge key={position} variant="secondary" className="flex items-center gap-1">
                    {position}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removePosition(position)}
                    />
                  </Badge>
                ))}
              </div>
              {validationErrors.positions && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.positions}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scholarshipsAvailable">Scholarships Available</Label>
              <Input
                id="scholarshipsAvailable"
                type="number"
                value={editData.scholarshipsAvailable ?? ''}
                onChange={(e) => handleFieldChange('scholarshipsAvailable', e.target.value)}
                placeholder="Number of scholarships"
                min={NUMERIC_LIMITS.SCHOLARSHIPS_AVAILABLE.min}
                max={NUMERIC_LIMITS.SCHOLARSHIPS_AVAILABLE.max}
                autoComplete="off"
                inputMode="numeric"
                autoFocus={false}
              />
              {validationErrors.scholarshipsAvailable && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.scholarshipsAvailable}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="recruitingPhilosophy">What You&apos;re Looking For</Label>
              <Textarea
                id="recruitingPhilosophy"
                value={editData.recruitingPhilosophy || ''}
                onChange={(e) => handleFieldChange('recruitingPhilosophy', e.target.value)}
                placeholder="Describe what you're looking for in student-athletes..."
                className="min-h-[100px]"
                maxLength={FIELD_LIMITS.RECRUITING_PHILOSOPHY}
                autoComplete="off"
                inputMode="text"
                autoFocus={false}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {(editData.recruitingPhilosophy || '').length}/{FIELD_LIMITS.RECRUITING_PHILOSOPHY} characters
              </p>
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
                  maxLength={FIELD_LIMITS.INSTAGRAM_HANDLE}
                  autoComplete="off"
                  inputMode="text"
                  autoFocus={false}
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
                  maxLength={FIELD_LIMITS.TWITTER_HANDLE}
                  autoComplete="off"
                  inputMode="text"
                  autoFocus={false}
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
                placeholder="https://example.com/athletics/program"
                maxLength={FIELD_LIMITS.URL}
                autoComplete="off"
                inputMode="url"
                autoFocus={false}
              />
              {validationErrors.programWebsite && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.programWebsite}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolWebsite">School Website</Label>
              <Input
                id="schoolWebsite"
                value={editData.schoolWebsite || ''}
                onChange={(e) => handleFieldChange('schoolWebsite', e.target.value)}
                placeholder="https://example.edu"
                maxLength={FIELD_LIMITS.URL}
                autoComplete="off"
                inputMode="url"
                autoFocus={false}
              />
              {validationErrors.schoolWebsite && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.schoolWebsite}</p>
              )}
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
                  maxLength={FIELD_LIMITS.SOCIAL_MEDIA_HANDLE}
                  autoComplete="off"
                  inputMode="text"
                  autoFocus={false}
                />
              </div>
              {validationErrors.programInstagram && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.programInstagram}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="programTwitter">Program Twitter Handle</Label>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">@</span>
                <Input
                  id="programTwitter"
                  value={editData.programTwitter || ''}
                  onChange={(e) => handleFieldChange('programTwitter', e.target.value.replace('@', ''))}
                  placeholder="programhandle"
                  maxLength={FIELD_LIMITS.SOCIAL_MEDIA_HANDLE}
                  autoComplete="off"
                  inputMode="text"
                  autoFocus={false}
                />
              </div>
              {validationErrors.programTwitter && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.programTwitter}</p>
              )}
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
                placeholder="e.g., Program Overview, Facility Tour"
                maxLength={FIELD_LIMITS.SHOWCASE_VIDEO_TITLE}
                autoComplete="off"
                inputMode="text"
                autoFocus={false}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="showcaseVideoUrl">YouTube URL</Label>
              <Input
                id="showcaseVideoUrl"
                value={editData.showcaseVideoUrl || ''}
                onChange={(e) => handleFieldChange('showcaseVideoUrl', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                maxLength={FIELD_LIMITS.URL}
                autoComplete="off"
                inputMode="url"
                autoFocus={false}
              />
              {validationErrors.showcaseVideoUrl && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.showcaseVideoUrl}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Paste a YouTube URL to showcase your program
              </p>
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

      case 'add-sport':
        const availablePositionsForNewSport = editData.newSport ? getPositionsForSport(editData.newSport) : [];
        const existingSports = [profileData.sportRecruiting, ...(profileData.secondarySports || [])];
        const availableSports = getSportsList().filter(sport => !existingSports.includes(sport));
        


        const toggleNeedsPosition = (position: string) => {
          const currentPositions = editData.positions || [];
          const newPositions = currentPositions.includes(position)
            ? currentPositions.filter((p: string) => p !== position)
            : [...currentPositions, position];
          handleFieldChange('positions', newPositions);
        };
        
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="newSport" className="text-base font-medium">Select Sport *</Label>
              <Select 
                value={editData.newSport || ''} 
                onValueChange={(value) => {
                  handleFieldChange('newSport', value);
                  // Reset positions when sport changes
                  handleFieldChange('positions', []);
                }}
              >
                <SelectTrigger className="h-11 bg-background">
                  <SelectValue placeholder="Select a sport to add" />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  {availableSports.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.newSport && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.newSport}</p>
              )}
              {availableSports.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  All available sports have already been added to your profile.
                </p>
              )}
            </div>

            {editData.newSport && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recruiting Needs for {editData.newSport}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Student Classifications */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Student Classifications Currently Recruiting *</Label>
                    <p className="text-sm text-muted-foreground">
                      Select the types of students you are actively recruiting for this sport.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getStudentClassificationOptions().map(({ value, label }) => (
                        <div key={value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${editData.newSport}-classification-${value}`}
                            checked={(editData.studentClassifications || []).includes(value)}
                            onCheckedChange={() => toggleStudentClassification(value)}
                          />
                          <Label htmlFor={`${editData.newSport}-classification-${value}`} className="text-sm cursor-pointer">
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {validationErrors.studentClassifications && (
                      <p className="text-red-500 text-sm">{validationErrors.studentClassifications}</p>
                    )}
                  </div>

                  {/* Positions */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Positions Currently Recruiting *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availablePositionsForNewSport.map(position => (
                        <div key={position} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${editData.newSport}-position-${position}`}
                            checked={(editData.positions || []).includes(position)}
                            onCheckedChange={() => toggleNeedsPosition(position)}
                          />
                          <Label htmlFor={`${editData.newSport}-position-${position}`} className="text-sm cursor-pointer">
                            {position}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {validationErrors.positions && (
                      <p className="text-red-500 text-sm">{validationErrors.positions}</p>
                    )}
                  </div>

                  {/* Scholarships Available */}
                  <div className="space-y-3">
                    <Label htmlFor={`${editData.newSport}-scholarships`} className="text-base font-medium">Scholarships Available (Optional)</Label>
                    <Input
                      id={`${editData.newSport}-scholarships`}
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g., 5"
                      value={editData.scholarshipsAvailable ?? ''}
                      onChange={(e) => handleFieldChange('scholarshipsAvailable', e.target.value)}
                      className="h-11 bg-background"
                      autoComplete="off"
                      inputMode="numeric"
                      autoFocus={false}
                    />
                    {validationErrors.scholarshipsAvailable && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.scholarshipsAvailable}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Number of scholarships or spots available for this sport (leave blank if not applicable)
                    </p>
                  </div>

                  {/* Sport-Specific Recruiting Philosophy */}
                  <div className="space-y-3">
                    <Label htmlFor={`${editData.newSport}-philosophy`} className="text-base font-medium">Recruiting Philosophy for {editData.newSport} *</Label>
                    <Textarea
                      id={`${editData.newSport}-philosophy`}
                      placeholder={`Describe what you look for in ${editData.newSport} athletes, your coaching style for this sport, and what makes your ${editData.newSport} program unique.`}
                      value={editData.recruitingPhilosophy || ''}
                      onChange={(e) => handleFieldChange('recruitingPhilosophy', e.target.value)}
                      className="min-h-24 bg-background resize-none"
                      maxLength={FIELD_LIMITS.RECRUITING_PHILOSOPHY}
                      autoComplete="off"
                      inputMode="text"
                      autoFocus={false}
                    />
                    <p className="text-xs text-muted-foreground">
                      {(editData.recruitingPhilosophy || '').length}/{FIELD_LIMITS.RECRUITING_PHILOSOPHY} characters
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return <div>Dialog content not found</div>;
    }
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case 'basic-info':
        return 'Edit Basic Information';
      case 'personal-statement':
        return 'Edit Personal Statement';
      case 'recruiting-needs':
        return 'Edit Recruiting Needs';
      case 'social-media':
        return 'Edit Social Media';
      case 'program-links':
        return 'Edit Program Links';
      case 'program-social-media':
        return 'Edit Program Social Media';
      case 'showcase-video':
        return 'Edit Showcase Video';
      case 'profile-image':
        return 'Edit Profile Picture';
      case 'organization-logo':
        return 'Edit Organization Logo';
      case 'add-sport':
        return 'Add New Sport';
      default:
        return 'Edit Profile';
    }
  };

  if (!dialogType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto w-[95vw] sm:w-full"
        onOpenAutoFocus={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            Make changes to your profile information. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        
        {getDialogContent()}
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          {dialogType !== 'profile-image' && dialogType !== 'organization-logo' && 
           dialogType !== 'add-sport' && (
            <Button 
              onClick={handleSave} 
              disabled={isUploading || !isRecruitingNeedsFormValid()}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
          {dialogType === 'add-sport' && (
            <Button 
              onClick={handleSave} 
              disabled={isUploading || !isAddSportFormValid()}
            >
              <Save className="w-4 h-4 mr-2" />
              Add Sport
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