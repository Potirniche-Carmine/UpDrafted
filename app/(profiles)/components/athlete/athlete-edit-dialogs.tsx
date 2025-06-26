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
import { Save, X, Plus, Shield } from "lucide-react";
import { getSportsList, US_STATES, GRADUATION_YEARS, getPositionsForSport, getMeasurablesForSport } from '@/lib/sports-data';
import { EducationLevel } from '@/app/(onboarding)/lib/onboarding';
import { sanitizeProfileData } from '@/utils/sanitization';
import { FileUpload } from '@/components/ui/file-upload';

// Import field validation
const FIELD_LIMITS = {
  FULL_NAME: 50,
  ORGANIZATION_NAME: 50,
  CITY: 50,
  INTENDED_MAJOR: 50,
  PERSONAL_STATEMENT: 400,
  INSTAGRAM_HANDLE: 50,
  TWITTER_HANDLE: 50,
  URL: 300
};

const NUMERIC_LIMITS = {
  WEIGHT: { min: 50, max: 700 },
  GPA: { min: 0, max: 5.0 },
  SAT_SCORE: { min: 400, max: 1600 },
  ACT_SCORE: { min: 1, max: 36 }
};

const EDUCATION_LEVEL_OPTIONS = [
  { value: 'high_school', label: 'High School' },
  { value: 'associate', label: 'Community College (Associate)' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'graduate', label: 'Graduate School' },
];

// Month and year options
const MONTH_OPTIONS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => {
  const year = currentYear - i;
  return { value: year.toString(), label: year.toString() };
});

// Add constant for video limit
const VIDEO_LIMIT = 2;

export interface Measurable {
  id: string;
  sport: string;
  label: string;
  value: string;
  measurementDate: string;
}

export interface AthleteProfileData {
  id: string;
  userId?: string;
  fullName: string;
  profileImage?: string;
  sport: string;
  secondarySports?: string[];
  graduationYear: number;
  educationLevel: EducationLevel;
  organizationName: string;
  city: string;
  state: string;
  gpa?: number | string;
  satScore?: number;
  actScore?: number;
  height: string;
  weight: string;
  positions: string[];
  maxPrepsUrl?: string;
  isVerified: boolean;
  hudlUrl?: string;
  hudlEmbedUrl?: string;
  youtubeVideos?: {
    id?: string;
    title: string;
    url: string;
    embedUrl: string;
    sortOrder?: number;
  }[];
  socialMedia?: {
    instagram?: string;
    twitter?: string;
  };
  intendedMajor?: string;
  personalStatement?: string;
  achievements?: string[];
  measurables?: Measurable[];
}

interface AthleteEditDialogsProps {
  isOpen: boolean;
  dialogType: string | null;
  profileData: AthleteProfileData;
  measurableIdToEdit?: string | null;
  onClose: () => void;
  onSave: (updates: Partial<AthleteProfileData>) => void;
  selectedSport: string;
}

export function AthleteEditDialogs({
  isOpen,
  dialogType,
  profileData,
  measurableIdToEdit,
  onClose,
  onSave,
  selectedSport
}: AthleteEditDialogsProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [tempVideos, setTempVideos] = useState<typeof profileData.youtubeVideos>([]);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [measurableToEdit, setMeasurableToEdit] = useState<Measurable | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Initialize tempVideos when dialog opens
  useEffect(() => {
    if (dialogType === 'video-highlights') {
      setTempVideos(profileData.youtubeVideos || []);
    }
  }, [dialogType, profileData.youtubeVideos]);

  // Set measurable to edit when measurableIdToEdit changes
  useEffect(() => {
    if (measurableIdToEdit && profileData.measurables) {
      const measurable = profileData.measurables.find(m => m.id === measurableIdToEdit);
      setMeasurableToEdit(measurable || null);
    } else {
      setMeasurableToEdit(null);
    }
  }, [measurableIdToEdit, profileData.measurables]);

  // Initialize edit data when dialog opens
  useEffect(() => {
    if (!dialogType) {
      // Clean up state when dialog is closed
      setProfileImagePreview(null);
      setSelectedProfileFile(null);
      setValidationErrors({});
      setTempVideos([]); // Clear temp videos when dialog closes
      return;
    }

    switch (dialogType) {
      case 'basic-info':
        const heightParts = profileData.height.match(/(\d+)'(\d+)"/);
        setEditData({
          fullName: profileData.fullName,
          sport: profileData.sport,
          secondarySports: profileData.secondarySports || [],
          educationLevel: profileData.educationLevel,
          city: profileData.city,
          state: profileData.state,
          organizationName: profileData.organizationName,
          graduationYear: profileData.graduationYear,
          heightFeet: heightParts ? heightParts[1] : '',
          heightInches: heightParts ? heightParts[2] : '',
          weight: profileData.weight.replace(/\s*lbs?\s*/gi, ''),
          positions: profileData.positions
        });
        break;
      case 'academic-info':
        setEditData({
          gpa: profileData.gpa || '',
          satScore: profileData.satScore || '',
          actScore: profileData.actScore || '',
          intendedMajor: profileData.intendedMajor || ''
        });
        break;
      case 'personal-statement':
        setEditData({
          personalStatement: profileData.personalStatement || ''
        });
        break;
      case 'social-media':
        setEditData({
          instagram: profileData.socialMedia?.instagram || '',
          twitter: profileData.socialMedia?.twitter || ''
        });
        break;
      case 'maxpreps-verification':
        // SECURITY: Prevent editing MaxPreps URL for verified users
        if (profileData.isVerified && profileData.maxPrepsUrl) {
          return; // Don't initialize edit data for verified users
        }
        setEditData({
          maxPrepsUrl: profileData.maxPrepsUrl || ''
        });
        break;
      case 'hudl-highlights':
        setEditData({
          hudlUrl: profileData.hudlUrl || ''
        });
        break;
      case 'measurable':
      case 'edit-measurable':
      case 'measurables':
      case 'edit-measurables':
      case 'add-measurables':
        if (measurableToEdit) {
          const dateParts = measurableToEdit.measurementDate.split('-');
          setEditData({
            sport: measurableToEdit.sport,
            label: measurableToEdit.label,
            value: measurableToEdit.value,
            month: dateParts[1] || '',
            year: dateParts[0] || '',
            isCustom: !getMeasurablesForSport(measurableToEdit.sport).includes(measurableToEdit.label),
            customLabel: !getMeasurablesForSport(measurableToEdit.sport).includes(measurableToEdit.label) ? measurableToEdit.label : ''
          });
        } else {
          // Set default month to current month
          const currentDate = new Date();
          const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
          const currentYear = currentDate.getFullYear();
          
          setEditData({
            sport: selectedSport,
            label: '',
            value: '',
            month: currentMonth,
            year: currentYear.toString(),
            isCustom: false,
            customLabel: ''
          });
        }
        break;
      case 'profile-image':
        setEditData({});
        // Always start fresh for image editing
        setProfileImagePreview(null);
        setSelectedProfileFile(null);
        break;
    }
  }, [dialogType, profileData, measurableToEdit, selectedSport]);

  // Reset dirty state when dialog closes or changes type
  useEffect(() => {
    if (!isOpen || !dialogType) {
      setIsDirty(false);
    }
  }, [isOpen, dialogType]);

  // Validation function
  const validateField = (field: string, value: string | number): string | null => {
    switch (field) {
      case 'fullName':
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'Full name is required';
        }
        if (typeof value === 'string' && value.length > FIELD_LIMITS.FULL_NAME) {
          return `Name must be ${FIELD_LIMITS.FULL_NAME} characters or less`;
        }
        break;
      case 'hudlUrl':
        if (value && typeof value === 'string') {
          const trimmedValue = value.trim();
          if (trimmedValue && !trimmedValue.includes('hudl.com')) {
            return 'Please enter a valid Hudl URL (must contain hudl.com)';
          }
        }
        break;
      case 'youtubeUrl':
        if (value && typeof value === 'string') {
          const trimmedValue = value.trim();
          if (trimmedValue && !trimmedValue.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)/)) {
            return 'Please enter a valid YouTube URL';
          }
        }
        break;
      case 'personalStatement':
        if (typeof value === 'string' && value.length > FIELD_LIMITS.PERSONAL_STATEMENT) {
          return `Personal statement must be ${FIELD_LIMITS.PERSONAL_STATEMENT} characters or less`;
        }
        break;
      case 'weight':
        if (typeof value === 'string') {
          const cleanedValue = value.replace(/\s*lbs?\s*/gi, '').trim();
          const numericValue = parseFloat(cleanedValue);
          if (cleanedValue && isNaN(numericValue)) {
            return 'Weight must be a valid number';
          }
          if (numericValue && (numericValue < NUMERIC_LIMITS.WEIGHT.min || numericValue > NUMERIC_LIMITS.WEIGHT.max)) {
            return `Weight must be between ${NUMERIC_LIMITS.WEIGHT.min} and ${NUMERIC_LIMITS.WEIGHT.max} pounds`;
          }
        }
        break;
      case 'gpa':
        if (typeof value === 'number' && (value < NUMERIC_LIMITS.GPA.min || value > NUMERIC_LIMITS.GPA.max)) {
          return `GPA must be between ${NUMERIC_LIMITS.GPA.min} and ${NUMERIC_LIMITS.GPA.max}`;
        }
        break;
      case 'maxPrepsUrl':
        if (typeof value === 'string' && value.trim()) {
          const url = value.trim();
          // Check if it's a valid MaxPreps URL
          if (!url.includes('maxpreps.com')) {
            return 'Please enter a valid MaxPreps URL';
          }
          
          // Extract athlete name for validation
          const athleteName = profileData.fullName.toLowerCase();
          const nameParts = athleteName.split(' ').filter(part => part.length > 1); // Filter out single character parts
          
          // Convert URL to lowercase for case-insensitive matching
          const urlLower = url.toLowerCase();
          
          // Check if at least first and last name appear in the URL
          const firstNameMatch = nameParts[0] && urlLower.includes(nameParts[0]);
          const lastNameMatch = nameParts[nameParts.length - 1] && urlLower.includes(nameParts[nameParts.length - 1]);
          
          if (!firstNameMatch || !lastNameMatch) {
            return `MaxPreps URL should contain your name (${profileData.fullName}) to verify it's your profile`;
          }
        }
        break;
    }
    return null;
  };

  // Modify handleFieldChange to track dirty state
  const handleFieldChange = (field: string, value: string | number) => {
    setIsDirty(true);
    setEditData(prev => ({ ...prev, [field]: value }));
    
    // Clear existing validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Validate the field
    const error = validateField(field, value);
    if (error) {
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // Helper functions
  const addSecondarySport = (sport: string) => {
    const currentSports = (editData.secondarySports as string[]) || [];
    if (sport && !currentSports.includes(sport) && sport !== editData.sport) {
      setEditData(prev => ({ 
        ...prev, 
        secondarySports: [...currentSports, sport] 
      }));
    }
  };

  const removeSecondarySport = (sport: string) => {
    const currentSports = (editData.secondarySports as string[]) || [];
    setEditData(prev => ({ 
      ...prev, 
      secondarySports: currentSports.filter(s => s !== sport) 
    }));
  };

  const togglePosition = (position: string) => {
    const currentPositions = (editData.positions as string[]) || [];
    if (currentPositions.includes(position)) {
      setEditData(prev => ({ 
        ...prev, 
        positions: currentPositions.filter(p => p !== position) 
      }));
    } else {
      setEditData(prev => ({ 
        ...prev, 
        positions: [...currentPositions, position] 
      }));
    }
  };

  const addTempVideo = () => {
    const youtubeUrl = editData.youtubeUrl as string;
    const title = editData.title as string;
    
    // Check video limit
    if ((tempVideos || []).length >= VIDEO_LIMIT) {
      setValidationErrors(prev => ({ 
        ...prev, 
        youtubeUrl: `You can only have up to ${VIDEO_LIMIT} videos on your profile` 
      }));
      return;
    }
    
    // Validate YouTube URL
    const urlError = validateField('youtubeUrl', youtubeUrl);
    if (urlError) {
      setValidationErrors(prev => ({ ...prev, youtubeUrl: urlError }));
      return;
    }
    
    if (youtubeUrl?.trim() && title?.trim()) {
      const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      if (videoIdMatch) {
        const videoId = videoIdMatch[1];
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        
        const newVideo = {
          id: `temp-${Date.now()}`,
          title: title.trim(),
          url: youtubeUrl.trim(),
          embedUrl,
          sortOrder: (tempVideos || []).length + 1
        };
        
        setTempVideos(prev => [...(prev || []), newVideo]);
        setEditData(prev => ({ ...prev, youtubeUrl: '', title: '' }));
        setIsDirty(true); // Mark form as dirty when adding video
        
        // Clear any validation errors
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.youtubeUrl;
          return newErrors;
        });
      } else {
        setValidationErrors(prev => ({ ...prev, youtubeUrl: 'Invalid YouTube URL format' }));
      }
    }
  };

  const removeTempVideo = (index: number) => {
    setTempVideos(prev => (prev || []).filter((_, i) => i !== index));
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', profileData.userId || profileData.id);
      formData.append('imageType', 'profile');
      
      // Add current image URL for deletion
      const currentImageUrl = profileData.profileImage;
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
      const updates: Partial<AthleteProfileData> = {
        // Add timestamp to force browser refresh
        profileImage: `${result.imageUrl}?t=${Date.now()}`
      };
      
      onSave(updates);
      
      // Reset state and close dialog
      setProfileImagePreview(null);
      setSelectedProfileFile(null);
      onClose();
    } catch (error) {
      console.error('Error uploading image:', error);
      setValidationErrors({ upload: 'Failed to upload image. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setSelectedProfileFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImagePreview = () => {
    setProfileImagePreview(null);
    setSelectedProfileFile(null);
    setValidationErrors({});
    // Reset file input
    const fileInput = document.getElementById('profileImageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleManualUpload = async () => {
    if (!selectedProfileFile) return;
    await handleImageUpload(selectedProfileFile);
  };

  const handleDeleteMeasurable = () => {
    if (!measurableIdToEdit) return;
    
    const currentMeasurables = profileData.measurables || [];
    
    // Handle both database IDs (numbers) and stable IDs (strings)
    let updatedMeasurables;
    if (typeof measurableIdToEdit === 'number') {
      // Database ID - filter by exact match
      updatedMeasurables = currentMeasurables.filter(m => m.id !== measurableIdToEdit);
    } else if (typeof measurableIdToEdit === 'string' && measurableIdToEdit.startsWith('stable-')) {
      // Stable ID - parse the components and find matching measurable
      const stableIdParts = measurableIdToEdit.split('-');
      const index = parseInt(stableIdParts[stableIdParts.length - 1]);
      
      if (!isNaN(index) && index >= 0 && index < currentMeasurables.length) {
        // Remove by index
        updatedMeasurables = currentMeasurables.filter((_, i) => i !== index);
      } else {
        console.error('Could not parse stable ID for deletion:', measurableIdToEdit);
        return;
      }
    } else {
      // Unknown ID format
      console.error('Unknown measurable ID format for deletion:', measurableIdToEdit);
      return;
    }
    
    // Update the state with the new measurables array
    onSave({ measurables: updatedMeasurables });
    
    // Clear any validation errors
    setValidationErrors({});
    
    // Reset the measurable being edited
    setMeasurableToEdit(null);
    
    // Close the dialog
    onClose();
  };

  // Check if the current dialog can be saved
  const canSave = () => {
    // Delete dialogs don't use the save button
    if (dialogType === 'delete-measurable' || dialogType === 'profile-image') {
      return false;
    }
    
    // SECURITY: Prevent saving MaxPreps changes for verified users
    if (dialogType === 'maxpreps-verification' && profileData.isVerified && profileData.maxPrepsUrl) {
      return false;
    }
    
    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      return false;
    }
    
    // For measurable dialogs, check required fields
    if (dialogType?.includes('measurable')) {
      const hasLabel = editData.isCustom ? editData.customLabel?.trim() : editData.label;
      const hasValue = editData.value?.trim();
      return !!(hasLabel && hasValue);
    }
    
    return true;
  };

  // Modify handleSave to reset dirty state
  const handleSave = () => {
    const updates: Partial<AthleteProfileData> = {};

    switch (dialogType) {
      case 'basic-info':
        updates.fullName = editData.fullName;
        updates.sport = editData.sport;
        updates.secondarySports = editData.secondarySports;
        updates.educationLevel = editData.educationLevel;
        updates.positions = editData.positions;
        updates.city = editData.city;
        updates.state = editData.state;
        updates.gpa = editData.gpa;
        updates.satScore = editData.satScore;
        updates.actScore = editData.actScore;
        updates.height = editData.height;
        updates.weight = editData.weight;
        break;

      case 'academic-info':
        updates.gpa = editData.gpa;
        updates.satScore = editData.satScore;
        updates.actScore = editData.actScore;
        updates.intendedMajor = editData.intendedMajor;
        break;

      case 'personal-statement':
        updates.personalStatement = editData.personalStatement;
        break;

      case 'social-media':
        updates.socialMedia = {
          instagram: editData.instagram,
          twitter: editData.twitter
        };
        break;

      case 'maxpreps-verification':
        updates.maxPrepsUrl = editData.maxPrepsUrl;
        // If MaxPreps URL is valid and passes validation, mark user as verified
        if (editData.maxPrepsUrl && !validateField('maxPrepsUrl', editData.maxPrepsUrl)) {
          updates.isVerified = true;
        }
        break;

      case 'hudl-highlights':
        updates.hudlUrl = editData.hudlUrl || undefined;
        break;

      case 'measurable':
      case 'edit-measurable':
      case 'measurables':
      case 'edit-measurables':
      case 'add-measurables': {
        const label = editData.isCustom 
          ? String(editData.customLabel).trim() 
          : String(editData.label).trim();
          
        if (label && String(editData.value).trim()) {
          let measurementDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
          if (editData.month && editData.year) {
            const month = String(editData.month).padStart(2, '0');
            const year = String(editData.year);
            measurementDate = `${year}-${month}-01`;
          }
          
          const currentMeasurables = profileData.measurables || [];
          
          // Check for duplicate measurable
          const isDuplicate = currentMeasurables.some(m => 
            m.label === label && 
            m.sport === selectedSport && 
            (!measurableToEdit || m.id !== measurableToEdit.id)
          );

          if (isDuplicate) {
            setValidationErrors({ 
              label: 'This metric already exists for this sport. Please edit the existing one instead.' 
            });
            return;
          }
          
          if (measurableToEdit) {
            // Editing existing measurable
            const updatedMeasurables = currentMeasurables.map(m => 
              m.id === measurableToEdit.id 
                ? {
                    ...m,
                    sport: selectedSport,
                    label: label,
                    value: String(editData.value).trim(),
                    measurementDate: measurementDate
                  }
                : m
            );
            updates.measurables = updatedMeasurables;
          } else {
            // Adding new measurable - ensure existing measurables keep their IDs
            const newMeasurable: Measurable = {
              id: `measurable-${Date.now()}`,
              sport: selectedSport,
              label: label,
              value: String(editData.value).trim(),
              measurementDate: measurementDate
            };
            
            // Make sure existing measurables have IDs - assign temp IDs if missing
            const measurablesWithIds = currentMeasurables.map(m => ({
              ...m,
              id: m.id || `existing-${Date.now()}-${Math.random()}`
            }));
            
            updates.measurables = [...measurablesWithIds, newMeasurable];
          }
        }
        break;
      }

      case 'video-highlights': {
        const hasReachedLimit = (tempVideos || []).length >= VIDEO_LIMIT;
        
        if (!hasReachedLimit) {
          updates.youtubeVideos = tempVideos;
        }
        break;
      }

      case 'profile-image':
        // Image uploads handle their own saving
        return;

      default:
        return;
    }

    // SECURITY: Sanitize all user input to prevent XSS attacks
    const sanitizedUpdates = sanitizeProfileData(updates) as Partial<AthleteProfileData>;

    onSave(sanitizedUpdates);
    setMeasurableToEdit(null);
    setIsDirty(false); // Reset dirty state after saving
    onClose(); // Close the dialog after saving
  };

  const getDialogContent = () => {
    switch (dialogType) {
      case 'basic-info':
        const availableSports = getSportsList().filter(sport => 
          sport !== editData.sport && !(editData.secondarySports as string[])?.includes(sport)
        );
        const availablePositions = getPositionsForSport(editData.sport as string);
        
        return (
          <>
            <DialogHeader>
              <DialogTitle>Edit Basic Information</DialogTitle>
              <DialogDescription>Update your personal information, sport, and physical details.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">Full Name *</Label>
                <Input
                  id="edit-fullName"
                  value={editData.fullName || ''}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  className={`h-12 ${validationErrors.fullName ? 'border-red-500' : ''}`}
                  maxLength={FIELD_LIMITS.FULL_NAME}
                  autoComplete="off"
                  inputMode="text"
                  
                />
                {validationErrors.fullName && (
                  <p className="text-sm text-red-500">{validationErrors.fullName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-sport">Primary Sport *</Label>
                <Select
                  value={String(editData.sport || '')}
                  onValueChange={(value) => {
                    setEditData(prev => ({ ...prev, sport: value, positions: [] }));
                  }}
                >
                  <SelectTrigger className="h-12" id="edit-sport">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {getSportsList().map((sport) => (
                      <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-educationLevel">Education Level *</Label>
                <Select
                  value={String(editData.educationLevel || '')}
                  onValueChange={(value) => {
                    setEditData(prev => ({ ...prev, educationLevel: value }));
                  }}
                >
                  <SelectTrigger className="h-12" id="edit-educationLevel">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {EDUCATION_LEVEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Secondary Sports */}
              <div className="space-y-2">
                <Label htmlFor="edit-secondarySports">Secondary Sports</Label>
                <div className="space-y-2">
                  <Select onValueChange={addSecondarySport}>
                    <SelectTrigger className="h-12" id="edit-secondarySports">
                      <SelectValue placeholder="Add secondary sport (optional)" />
                    </SelectTrigger>
                    <SelectContent className="z-[70]">
                      {availableSports.map(sport => (
                        <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {(editData.secondarySports as string[])?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(editData.secondarySports as string[]).map(sport => (
                        <Badge key={sport} variant="secondary" className="px-2 py-1">
                          {sport}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-1 h-4 w-4 p-0"
                            onClick={() => removeSecondarySport(sport)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Positions */}
              {availablePositions.length > 0 && (
                <div className="space-y-2">
                  <Label>Positions *</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {availablePositions.map((position, index) => (
                      <div key={position} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-position-${index}`}
                          checked={(editData.positions as string[])?.includes(position) || false}
                          onCheckedChange={() => togglePosition(position)}
                        />
                        <Label htmlFor={`edit-position-${index}`} className="text-sm">{position}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City *</Label>
                  <Input
                    id="edit-city"
                    placeholder="Los Angeles"
                    value={editData.city || ''}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    className={`h-12 ${validationErrors.city ? 'border-red-500' : ''}`}
                    maxLength={FIELD_LIMITS.CITY}
                    autoComplete="off"
                    inputMode="text"
                    
                  />
                  {validationErrors.city && (
                    <p className="text-sm text-red-500">{validationErrors.city}</p>
                  )}
                </div>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-organizationName">School/Organization *</Label>
                <Input
                  id="edit-organizationName"
                  placeholder="University of California"
                  value={editData.organizationName || ''}
                  onChange={(e) => handleFieldChange('organizationName', e.target.value)}
                  className={`h-12 ${validationErrors.organizationName ? 'border-red-500' : ''}`}
                  maxLength={FIELD_LIMITS.ORGANIZATION_NAME}
                  autoComplete="off"
                  inputMode="text"
                />
                {validationErrors.organizationName && (
                  <p className="text-sm text-red-500">{validationErrors.organizationName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-graduationYear">Graduation Year *</Label>
                <Select
                  value={editData.graduationYear?.toString() || ''}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, graduationYear: parseInt(value) }))}
                >
                  <SelectTrigger className="h-12" id="edit-graduationYear">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {GRADUATION_YEARS.map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Height *</Label>
                  <div className="flex gap-2">
                    <Select
                      value={editData.heightFeet as string || ''}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, heightFeet: value }))}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Feet" />
                      </SelectTrigger>
                      <SelectContent className="z-[70]">
                        {Array.from({ length: 5 }, (_, i) => i + 4).map(feet => (
                          <SelectItem key={feet} value={feet.toString()}>{feet}&apos;</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={editData.heightInches as string || ''}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, heightInches: value }))}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="In" />
                      </SelectTrigger>
                      <SelectContent className="z-[70]">
                        {Array.from({ length: 12 }, (_, i) => i).map(inches => (
                          <SelectItem key={inches} value={inches.toString()}>{inches}&quot;</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-weight">Weight *</Label>
                  <Input
                    id="edit-weight"
                    placeholder="185"
                    value={editData.weight || ''}
                    onChange={(e) => handleFieldChange('weight', e.target.value)}
                    className={`h-12 ${validationErrors.weight ? 'border-red-500' : ''}`}
                    autoComplete="off"
                    inputMode="numeric"
                    
                  />
                  {validationErrors.weight && (
                    <p className="text-sm text-red-500">{validationErrors.weight}</p>
                  )}
                  <p className="text-xs text-muted-foreground">In pounds (e.g., 185)</p>
                </div>
              </div>
            </div>
          </>
        );

      case 'academic-info':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Edit Academic Information</DialogTitle>
              <DialogDescription>Update your GPA and academic details.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-gpa">GPA</Label>
                <Input
                  id="edit-gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="5.0"
                  placeholder="3.85"
                  value={String(editData.gpa || '')}
                  onChange={(e) => handleFieldChange('gpa', e.target.value ? parseFloat(e.target.value) : '')}
                  className={`h-12 ${validationErrors.gpa ? 'border-red-500' : ''}`}
                  autoComplete="off"
                  inputMode="decimal"
                  
                />
                {validationErrors.gpa && (
                  <p className="text-sm text-red-500">{validationErrors.gpa}</p>
                )}
                <p className="text-xs text-muted-foreground">Max 5.0</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-satScore">SAT Score</Label>
                  <Input
                    id="edit-satScore"
                    type="number"
                    min="400"
                    max="1600"
                    placeholder="1420"
                    value={String(editData.satScore || '')}
                    onChange={(e) => handleFieldChange('satScore', e.target.value ? parseInt(e.target.value) : '')}
                    className="h-12"
                    autoComplete="off"
                    inputMode="numeric"
                    
                  />
                  <p className="text-xs text-muted-foreground">400-1600</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-actScore">ACT Score</Label>
                  <Input
                    id="edit-actScore"
                    type="number"
                    min="1"
                    max="36"
                    placeholder="32"
                    value={String(editData.actScore || '')}
                    onChange={(e) => handleFieldChange('actScore', e.target.value ? parseInt(e.target.value) : '')}
                    className="h-12"
                    autoComplete="off"
                    inputMode="numeric"
                    
                  />
                  <p className="text-xs text-muted-foreground">1-36</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-intendedMajor">
                  {profileData.educationLevel === 'high_school' ? 'Intended Major' : 'Major'}
                </Label>
                <Input
                  id="edit-intendedMajor"
                  placeholder="e.g., Business Administration"
                  value={String(editData.intendedMajor || '')}
                  onChange={(e) => handleFieldChange('intendedMajor', e.target.value)}
                  className="h-12"
                  maxLength={FIELD_LIMITS.INTENDED_MAJOR}
                  autoComplete="off"
                  inputMode="text"
                  
                />
              </div>
            </div>
          </>
        );

      case 'personal-statement':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Edit Personal Statement</DialogTitle>
              <DialogDescription>Tell coaches and recruiters about yourself, your goals, and what makes you unique.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-personalStatement">Personal Statement</Label>
                <Textarea
                  id="edit-personalStatement"
                  placeholder="Tell coaches and recruiters about yourself, your goals, and what makes you unique..."
                  rows={6}
                  value={editData.personalStatement || ''}
                  onChange={(e) => handleFieldChange('personalStatement', e.target.value)}
                  className={`min-h-12 ${validationErrors.personalStatement ? 'border-red-500' : ''}`}
                  maxLength={FIELD_LIMITS.PERSONAL_STATEMENT}
                />
                {validationErrors.personalStatement && (
                  <p className="text-sm text-red-500">{validationErrors.personalStatement}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {String(editData.personalStatement || '').length}/{FIELD_LIMITS.PERSONAL_STATEMENT} characters
                </p>
              </div>
            </div>
          </>
        );

      case 'social-media':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Edit Social Media</DialogTitle>
              <DialogDescription>Add your social media handles to connect with coaches and showcase your personality.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-instagram">Instagram Handle</Label>
                <Input
                  id="edit-instagram"
                  placeholder="@username"
                  value={editData.instagram || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, instagram: e.target.value }))}
                  className="h-12"
                  maxLength={FIELD_LIMITS.INSTAGRAM_HANDLE}
                  autoComplete="off"
                  inputMode="text"
                  
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-twitter">Twitter/X Handle</Label>
                <Input
                  id="edit-twitter"
                  placeholder="@username"
                  value={editData.twitter || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, twitter: e.target.value }))}
                  className="h-12"
                  maxLength={FIELD_LIMITS.TWITTER_HANDLE}
                  autoComplete="off"
                  inputMode="text"
                  
                />
              </div>
            </div>
          </>
        );

      case 'maxpreps-verification':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Add MaxPreps Profile</DialogTitle>
              <DialogDescription>Connect your MaxPreps profile to showcase official stats and verification.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* SECURITY: Show warning for verified users */}
              {profileData.isVerified && profileData.maxPrepsUrl ? (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <Shield className="w-5 h-5" />
                    <h4 className="font-medium">MaxPreps URL Locked</h4>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    Your MaxPreps profile has been verified and is locked for security. 
                    This prevents impersonation and maintains the integrity of your athletic credentials.
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    Current verified MaxPreps URL: <span className="font-mono text-xs break-all">{profileData.maxPrepsUrl}</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="edit-maxPrepsUrl">MaxPreps Profile URL</Label>
                  <Input
                    id="edit-maxPrepsUrl"
                    placeholder="https://www.maxpreps.com/..."
                    value={editData.maxPrepsUrl || ''}
                    onChange={(e) => handleFieldChange('maxPrepsUrl', e.target.value)}
                    className={`h-12 ${validationErrors.maxPrepsUrl ? 'border-red-500' : ''}`}
                    maxLength={FIELD_LIMITS.URL}
                  />
                  {validationErrors.maxPrepsUrl && (
                    <p className="text-sm text-red-500">{validationErrors.maxPrepsUrl}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Add your MaxPreps profile to showcase official stats and verification. The URL should contain your name to verify it&apos;s your profile.
                  </p>
                </div>
              )}
            </div>
          </>
        );

      case 'hudl-highlights':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Edit Hudl Profile</DialogTitle>
              <DialogDescription>Add your Hudl profile link to showcase game film and highlight reels.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-hudlUrl">Hudl Profile URL</Label>
                <Input
                  id="edit-hudlUrl"
                  placeholder="https://www.hudl.com/..."
                  value={editData.hudlUrl || ''}
                  onChange={(e) => handleFieldChange('hudlUrl', e.target.value)}
                  className={`h-12 ${validationErrors.hudlUrl ? 'border-red-500' : ''}`}
                  maxLength={FIELD_LIMITS.URL}
                  autoComplete="off"
                  inputMode="url"
                  
                />
                {validationErrors.hudlUrl && (
                  <p className="text-sm text-red-500">{validationErrors.hudlUrl}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Add your Hudl profile link to showcase game film and highlight reels
                </p>
              </div>
            </div>
          </>
        );

      case 'video-highlights': {
        const hasReachedLimit = (tempVideos || []).length >= VIDEO_LIMIT;
        
        return (
          <>
            <DialogHeader>
              <DialogTitle>Manage Highlight Videos</DialogTitle>
              <DialogDescription>Add YouTube videos to showcase your best plays and skills.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Existing videos */}
              {tempVideos && tempVideos.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Current Videos</Label>
                    <p className="text-sm text-muted-foreground">
                      {tempVideos.length} of {VIDEO_LIMIT} videos
                    </p>
                  </div>
                  {tempVideos.map((video, index) => (
                    <div key={video.id || index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{video.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{video.url}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeTempVideo(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add new video form */}
              {!hasReachedLimit ? (
                <div className="space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-youtubeUrl">YouTube Video URL</Label>
                    <Input
                      id="edit-youtubeUrl"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={editData.youtubeUrl || ''}
                      onChange={(e) => handleFieldChange('youtubeUrl', e.target.value)}
                      className={`h-12 ${validationErrors.youtubeUrl ? 'border-red-500' : ''}`}
                      maxLength={FIELD_LIMITS.URL}
                      autoComplete="off"
                      inputMode="url"
                      
                    />
                    {validationErrors.youtubeUrl && (
                      <p className="text-sm text-red-500">{validationErrors.youtubeUrl}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-videoTitle">Video Title</Label>
                    <Input
                      id="edit-videoTitle"
                      placeholder="e.g., Senior Season Highlights"
                      value={editData.title || ''}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      className="h-12"
                      maxLength={100}
                      autoComplete="off"
                      inputMode="text"
                      
                    />
                  </div>
                  <Button 
                    type="button"
                    onClick={addTempVideo}
                    disabled={!editData.youtubeUrl || !editData.title}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Video
                  </Button>
                </div>
              ) : (
                <div className="border-t pt-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-center">
                      <p className="font-medium text-muted-foreground mb-2">Video Limit Reached</p>
                      <p className="text-sm text-muted-foreground">
                        You can have a maximum of {VIDEO_LIMIT} videos on your profile. Remove an existing video to add a new one.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        );
      }

      case 'measurable':
      case 'edit-measurable':
      case 'measurables':
      case 'edit-measurables':
      case 'add-measurables': {
        const suggestedMeasurables = getMeasurablesForSport(selectedSport);
        const isEditingExisting = !!measurableToEdit;
        
        // Filter out existing measurables from suggestions unless editing
        const availableMeasurables = suggestedMeasurables.filter(metric => {
          if (isEditingExisting) return true;
          return !profileData.measurables?.some(m => 
            m.label === metric && 
            m.sport === selectedSport
          );
        });
        
        return (
          <>
            <DialogHeader>
              <DialogTitle>
                {isEditingExisting ? 'Edit' : 'Add'} Performance Metric - {selectedSport}
              </DialogTitle>
              <DialogDescription>
                {isEditingExisting 
                  ? 'Update your athletic performance data to showcase your abilities.'
                  : 'Add your athletic performance data to showcase your abilities.'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-measurableType">Metric Type</Label>
                <Select
                  value={editData.isCustom ? 'custom' : editData.label || ''}
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setEditData(prev => ({ ...prev, isCustom: true, label: '' }));
                    } else {
                      setEditData(prev => ({ ...prev, isCustom: false, label: value }));
                    }
                    // Clear label validation error when changing
                    if (validationErrors.label) {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.label;
                        return newErrors;
                      });
                    }
                  }}
                >
                  <SelectTrigger className={`h-12 ${validationErrors.label ? 'border-red-500' : ''}`} id="edit-measurableType">
                    <SelectValue placeholder="Choose a metric" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {availableMeasurables.map((metric: string) => (
                      <SelectItem key={metric} value={metric}>{metric}</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Metric</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.label && (
                  <p className="text-sm text-red-500">{validationErrors.label}</p>
                )}
              </div>
              
              {editData.isCustom && (
                <div className="space-y-2">
                  <Label htmlFor="edit-customMetricName">Custom Metric Name</Label>
                  <Input
                    id="edit-customMetricName"
                    placeholder="Enter name of metric"
                    value={editData.customLabel || ''}
                    onChange={(e) => {
                      setEditData(prev => ({ ...prev, customLabel: e.target.value }));
                      // Clear validation error when typing
                      if (validationErrors.label) {
                        setValidationErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.label;
                          return newErrors;
                        });
                      }
                    }}
                    className={`h-12 ${validationErrors.label ? 'border-red-500' : ''}`}
                    maxLength={50}
                    autoComplete="off"
                    inputMode="text"
                    
                  />
                  {validationErrors.label && (
                    <p className="text-sm text-red-500">{validationErrors.label}</p>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="edit-measurableValue">Value</Label>
                <Input
                  id="edit-measurableValue"
                  placeholder="e.g., 4.4s, 34 inches, 225 lbs"
                  value={editData.value || ''}
                  onChange={(e) => {
                    setEditData(prev => ({ ...prev, value: e.target.value }));
                    // Clear validation error when typing
                    if (validationErrors.value) {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.value;
                        return newErrors;
                      });
                    }
                  }}
                  className={`h-12 ${validationErrors.value ? 'border-red-500' : ''}`}
                  maxLength={20}
                  autoComplete="off"
                  inputMode="text"
                />
                {validationErrors.value && (
                  <p className="text-sm text-red-500">{validationErrors.value}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Measurement Date</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-measurementMonth" className="text-sm">Month</Label>
                    <Select
                      value={editData.month || ''}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, month: value }))}
                    >
                      <SelectTrigger className="h-12" id="edit-measurementMonth">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent className="z-[70]">
                        {MONTH_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-measurementYear" className="text-sm">Year</Label>
                    <Select
                      value={editData.year || ''}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, year: value }))}
                    >
                      <SelectTrigger className="h-12" id="edit-measurementYear">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent className="z-[70]">
                        {YEAR_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      }

      case 'profile-image':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Change Profile Picture</DialogTitle>
              <DialogDescription>Upload a professional headshot or action photo to represent yourself.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-4">
                <FileUpload
                  id="profileImageUpload"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  onUpload={handleManualUpload}
                  onRemove={removeImagePreview}
                  disabled={isUploading}
                  preview={profileImagePreview}
                  uploadText="Upload a profile picture"
                  chooseText="Choose a new profile picture"
                  supportedFormats="Supported formats: JPG, PNG, WebP"
                  maxSize="5MB"
                  showUploadButton={!!selectedProfileFile}
                  isUploading={isUploading}
                  error={validationErrors.upload}
                  imageType="profile"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, WebP. Max size: 5MB
              </p>
              {validationErrors.upload && <p className="text-red-500 text-sm">{validationErrors.upload}</p>}
            </div>
          </>
        );

      case 'delete-measurable': {
        // Safety check: if no measurableIdToEdit, don't render the dialog content yet
        if (!measurableIdToEdit) {
          return (
            <>
              <DialogHeader>
                <DialogTitle>Delete Performance Metric</DialogTitle>
                <DialogDescription>
                  Loading metric details...
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </div>
            </>
          );
        }
        
        const measurableToDelete = profileData.measurables?.find(m => m.id === measurableIdToEdit);
        
        return (
          <>
            <DialogHeader>
              <DialogTitle>Delete Performance Metric</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this performance metric? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {measurableToDelete ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center">
                      <X className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">{measurableToDelete.label}</h4>
                      <p className="text-lg font-semibold text-foreground mb-1">{measurableToDelete.value}</p>
                      <p className="text-sm text-muted-foreground">
                        Recorded in {(() => {
                          // Parse the date string to avoid timezone issues
                          const [year, month] = measurableToDelete.measurementDate.split('-');
                          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                          return `${monthNames[parseInt(month) - 1]} ${year}`;
                        })()}
                      </p>
                      <p className="text-sm text-muted-foreground">Sport: {measurableToDelete.sport}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Measurable not found</p>
                </div>
              )}
            </div>
          </>
        );
      }

      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Edit {dialogType}</DialogTitle>
              <DialogDescription>Edit functionality for this section.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <p>Edit functionality for {dialogType} coming soon!</p>
            </div>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isDirty) {
        onClose();
      } else if (!open && isDirty) {
        // Only show confirmation if there are unsaved changes
        if (window.confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
          setIsDirty(false);
          onClose();
        }
      }
    }}>
      <DialogContent className={`${dialogType === 'basic-info' ? "sm:max-w-2xl max-w-lg" : "sm:max-w-md max-w-lg"} z-[60]`}>
        {getDialogContent()}
        {dialogType === 'delete-measurable' ? (
          <DialogFooter className="sm:justify-start">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteMeasurable}
              disabled={!measurableIdToEdit}
            >
              Delete Metric
            </Button>
          </DialogFooter>
        ) : dialogType !== 'profile-image' ? (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSave}
              disabled={!canSave() || isUploading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
} 