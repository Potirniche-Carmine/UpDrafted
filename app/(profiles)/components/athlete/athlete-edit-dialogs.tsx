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
import { Save, X, Plus, Upload } from "lucide-react";
import { getSportsList, US_STATES, GRADUATION_YEARS, getPositionsForSport, getMeasurablesForSport } from '@/lib/sports-data';
import { EducationLevel } from '@/app/(onboarding)/lib/onboarding';
import Image from "next/image";

// Import field validation
const FIELD_LIMITS = {
  FULL_NAME: 50,
  HIGH_SCHOOL: 50,
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
  highSchool: string;
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
    if (!dialogType) return;

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
          highSchool: profileData.highSchool,
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
        setEditData({
          maxPrepsUrl: profileData.maxPrepsUrl || ''
        });
        break;
      case 'hudl-highlights':
        setEditData({
          hudlUrl: profileData.hudlUrl || '',
          hudlEmbedUrl: profileData.hudlEmbedUrl || ''
        });
        break;
      case 'video-highlights':
        setTempVideos(profileData.youtubeVideos || []);
        setEditData({
          youtubeUrl: '',
          title: ''
        });
        break;
      case 'add-measurables':
        const today = new Date();
        setEditData({
          label: '',
          value: '',
          customLabel: '',
          isCustom: false,
          measurementMonth: String(today.getMonth() + 1).padStart(2, '0'),
          measurementYear: today.getFullYear().toString()
        });
        break;
      case 'edit-measurable':
        if (measurableToEdit) {
          const measurementDate = new Date(measurableToEdit.measurementDate);
          // Check if it's a custom measurable (not in suggested list)
          const suggestedMeasurables = getMeasurablesForSport(selectedSport);
          const isCustom = !suggestedMeasurables.includes(measurableToEdit.label);
          
          setEditData({
            label: isCustom ? '' : measurableToEdit.label,
            value: measurableToEdit.value,
            customLabel: isCustom ? measurableToEdit.label : '',
            isCustom: isCustom,
            measurementMonth: String(measurementDate.getMonth() + 1).padStart(2, '0'),
            measurementYear: measurementDate.getFullYear().toString()
          });
        }
        break;
      default:
        setEditData({});
    }
    setValidationErrors({});
  }, [dialogType, profileData, measurableToEdit, selectedSport]);

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

  const handleFieldChange = (field: string, value: string | number) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    
    const error = validateField(field, value);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
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
      }
    }
  };

  const removeTempVideo = (index: number) => {
    setTempVideos(prev => (prev || []).filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const updates: Partial<AthleteProfileData> = {};

    switch (dialogType) {
      case 'basic-info':
        if (editData.fullName !== undefined) updates.fullName = editData.fullName as string;
        if (editData.sport !== undefined) updates.sport = editData.sport as string;
        if (editData.secondarySports !== undefined) updates.secondarySports = editData.secondarySports as string[];
        if (editData.graduationYear !== undefined) updates.graduationYear = editData.graduationYear as number;
        if (editData.educationLevel !== undefined) updates.educationLevel = editData.educationLevel as EducationLevel;
        if (editData.highSchool !== undefined) updates.highSchool = editData.highSchool as string;
        if (editData.city !== undefined) updates.city = editData.city as string;
        if (editData.state !== undefined) updates.state = editData.state as string;
        if (editData.positions !== undefined) updates.positions = editData.positions as string[];
        
        if (editData.heightFeet !== undefined && editData.heightInches !== undefined) {
          updates.height = `${editData.heightFeet}'${editData.heightInches}"`;
        }
        
        if (editData.weight !== undefined) {
          const cleanWeight = String(editData.weight).replace(/\s*lbs?\s*/gi, '').trim();
          updates.weight = cleanWeight ? `${cleanWeight} lbs` : '';
        }
        break;

      case 'academic-info':
        updates.gpa = editData.gpa === '' ? undefined : editData.gpa as number;
        updates.satScore = editData.satScore === '' ? undefined : editData.satScore as number;
        updates.actScore = editData.actScore === '' ? undefined : editData.actScore as number;
        updates.intendedMajor = editData.intendedMajor === '' ? undefined : editData.intendedMajor as string;
        break;

      case 'personal-statement':
        updates.personalStatement = editData.personalStatement === '' ? undefined : editData.personalStatement as string;
        break;

      case 'social-media':
        const newSocial: { instagram?: string; twitter?: string } = {};
        if (editData.instagram !== undefined) {
          const instagramValue = String(editData.instagram).trim();
          if (instagramValue) newSocial.instagram = instagramValue;
        }
        if (editData.twitter !== undefined) {
          const twitterValue = String(editData.twitter).trim();
          if (twitterValue) newSocial.twitter = twitterValue;
        }
        updates.socialMedia = Object.keys(newSocial).length > 0 ? newSocial : undefined;
        break;

      case 'maxpreps-verification':
        const maxPrepsUrl = String(editData.maxPrepsUrl).trim();
        if (maxPrepsUrl) {
          // If we have a MaxPreps URL and validation passed, set as verified
          updates.maxPrepsUrl = maxPrepsUrl;
          updates.isVerified = true;
        } else {
          // If MaxPreps URL is removed, remove verification
          updates.maxPrepsUrl = undefined;
          updates.isVerified = false;
        }
        break;

      case 'hudl-highlights':
        const hudlUrl = String(editData.hudlUrl).trim();
        const hudlEmbedUrl = String(editData.hudlEmbedUrl).trim();
        updates.hudlUrl = hudlUrl === '' ? undefined : hudlUrl;
        updates.hudlEmbedUrl = hudlEmbedUrl === '' ? undefined : hudlEmbedUrl;
        break;

      case 'video-highlights':
        updates.youtubeVideos = tempVideos || [];
        break;

      case 'add-measurables':
        const label = editData.isCustom 
          ? String(editData.customLabel).trim() 
          : String(editData.label).trim();
          
        if (label && String(editData.value).trim()) {
          let measurementDate = new Date().toISOString();
          if (editData.measurementMonth && editData.measurementYear) {
            const month = parseInt(editData.measurementMonth);
            const year = parseInt(editData.measurementYear);
            measurementDate = new Date(year, month - 1, 1).toISOString();
          }
          
          const newMeasurable: Measurable = {
            id: `temp-${Date.now()}`,
            sport: selectedSport,
            label: label,
            value: editData.value.trim(),
            measurementDate: measurementDate
          };
          
          updates.measurables = [...(profileData.measurables || []), newMeasurable];
        }
        break;

      case 'edit-measurable':
        if (measurableToEdit) {
          const label = editData.isCustom 
            ? String(editData.customLabel).trim() 
            : String(editData.label).trim();
            
          if (label && String(editData.value).trim()) {
            let measurementDate = new Date().toISOString();
            if (editData.measurementMonth && editData.measurementYear) {
              const month = parseInt(editData.measurementMonth);
              const year = parseInt(editData.measurementYear);
              measurementDate = new Date(year, month - 1, 1).toISOString();
            }
            
            const updatedMeasurables = (profileData.measurables || []).map(m => 
              m.id === measurableToEdit.id 
                ? { ...m, label, value: editData.value.trim(), measurementDate }
                : m
            );
            
            updates.measurables = updatedMeasurables;
          }
        }
        break;

      case 'profile-image':
        // Profile image upload would be handled here
        console.log('Profile image upload functionality would be implemented here');
        break;
    }

    onSave(updates);
    setMeasurableToEdit(null);
  };

  if (!isOpen || !dialogType) return null;

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
                  <SelectContent>
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
                  <SelectContent>
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
                    <SelectContent>
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
                    value={String(editData.city || '')}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    className="h-12"
                    maxLength={FIELD_LIMITS.CITY}
                  />
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
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-highSchool">High School *</Label>
                <Input
                  id="edit-highSchool"
                  value={editData.highSchool || ''}
                  onChange={(e) => handleFieldChange('highSchool', e.target.value)}
                  className="h-12"
                  maxLength={FIELD_LIMITS.HIGH_SCHOOL}
                />
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
                  <SelectContent>
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
                      <SelectContent>
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
                      <SelectContent>
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
            </div>
          </>
        );

      case 'hudl-highlights':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Add Hudl Profile</DialogTitle>
              <DialogDescription>Connect your Hudl profile to showcase game film and highlight reels.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-hudlUrl">Hudl Profile URL</Label>
                <Input
                  id="edit-hudlUrl"
                  placeholder="https://www.hudl.com/..."
                  value={editData.hudlUrl || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, hudlUrl: e.target.value }))}
                  className="h-12"
                  maxLength={FIELD_LIMITS.URL}
                />
                <p className="text-sm text-muted-foreground">
                  Add your Hudl profile to showcase game film and highlight reels
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-hudlEmbedUrl">Hudl Embed URL (Optional)</Label>
                <Input
                  id="edit-hudlEmbedUrl"
                  placeholder="https://www.hudl.com/embed/..."
                  value={editData.hudlEmbedUrl || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, hudlEmbedUrl: e.target.value }))}
                  className="h-12"
                  maxLength={FIELD_LIMITS.URL}
                />
                <p className="text-sm text-muted-foreground">
                  Optional: Direct embed URL for video player
                </p>
              </div>
            </div>
          </>
        );

      case 'video-highlights':
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
                  <Label>Current Videos</Label>
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
              <div className="space-y-4 border-t pt-4">
                <Label>Add New Video</Label>
                <div className="space-y-2">
                  <Label htmlFor="edit-youtubeUrl">YouTube Video URL</Label>
                  <Input
                    id="edit-youtubeUrl"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={editData.youtubeUrl || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    className="h-12"
                    maxLength={FIELD_LIMITS.URL}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-videoTitle">Video Title</Label>
                  <Input
                    id="edit-videoTitle"
                    placeholder="e.g., Senior Season Highlights"
                    value={editData.title || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    className="h-12"
                    maxLength={100}
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
            </div>
          </>
        );

      case 'add-measurables':
        const suggestedMeasurables = getMeasurablesForSport(selectedSport);
        
        return (
          <>
            <DialogHeader>
              <DialogTitle>Add Performance Metric - {selectedSport}</DialogTitle>
              <DialogDescription>Add your athletic performance data to showcase your abilities.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-measurableType">Metric Type</Label>
                <Select
                  value={editData.isCustom ? 'custom' : editData.label}
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setEditData(prev => ({ ...prev, isCustom: true, label: '' }));
                    } else {
                      setEditData(prev => ({ ...prev, isCustom: false, label: value }));
                    }
                  }}
                >
                  <SelectTrigger className="h-12" id="edit-measurableType">
                    <SelectValue placeholder="Choose a metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {suggestedMeasurables.map((metric: string) => (
                      <SelectItem key={metric} value={metric}>{metric}</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Metric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {editData.isCustom && (
                <div className="space-y-2">
                  <Label htmlFor="edit-customMetricName">Custom Metric Name</Label>
                  <Input
                    id="edit-customMetricName"
                    placeholder="Enter name of metric"
                    value={editData.customLabel || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, customLabel: e.target.value }))}
                    className="h-12"
                    maxLength={50}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="edit-measurableValue">Value</Label>
                <Input
                  id="edit-measurableValue"
                  placeholder="e.g., 4.4s, 34 inches, 225 lbs"
                  value={editData.value}
                  onChange={(e) => setEditData(prev => ({ ...prev, value: e.target.value }))}
                  className="h-12"
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label>Measurement Date</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-measurementMonth" className="text-sm">Month</Label>
                    <Select
                      value={editData.measurementMonth}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, measurementMonth: value }))}
                    >
                      <SelectTrigger className="h-12" id="edit-measurementMonth">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTH_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-measurementYear" className="text-sm">Year</Label>
                    <Select
                      value={editData.measurementYear}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, measurementYear: value }))}
                    >
                      <SelectTrigger className="h-12" id="edit-measurementYear">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
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

      case 'edit-measurable':
        const suggestedMeasurablesEdit = getMeasurablesForSport(selectedSport);
        
        return (
          <>
            <DialogHeader>
              <DialogTitle>Edit Performance Metric - {selectedSport}</DialogTitle>
              <DialogDescription>Update your athletic performance data.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-measurableTypeEdit">Metric Type</Label>
                <Select
                  value={editData.isCustom ? 'custom' : editData.label}
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setEditData(prev => ({ ...prev, isCustom: true, label: '' }));
                    } else {
                      setEditData(prev => ({ ...prev, isCustom: false, label: value }));
                    }
                  }}
                >
                  <SelectTrigger className="h-12" id="edit-measurableTypeEdit">
                    <SelectValue placeholder="Choose a metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {suggestedMeasurablesEdit.map((metric: string) => (
                      <SelectItem key={metric} value={metric}>{metric}</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Metric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {editData.isCustom && (
                <div className="space-y-2">
                  <Label htmlFor="edit-customMetricNameEdit">Custom Metric Name</Label>
                  <Input
                    id="edit-customMetricNameEdit"
                    placeholder="Enter name of metric"
                    value={editData.customLabel || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, customLabel: e.target.value }))}
                    className="h-12"
                    maxLength={50}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="edit-measurableValueEdit">Value</Label>
                <Input
                  id="edit-measurableValueEdit"
                  placeholder="e.g., 4.4s, 34 inches, 225 lbs"
                  value={editData.value || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, value: e.target.value }))}
                  className="h-12"
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label>Measurement Date</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-measurementMonthEdit" className="text-sm">Month</Label>
                    <Select
                      value={editData.measurementMonth}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, measurementMonth: value }))}
                    >
                      <SelectTrigger className="h-12" id="edit-measurementMonthEdit">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTH_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-measurementYearEdit" className="text-sm">Year</Label>
                    <Select
                      value={editData.measurementYear}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, measurementYear: value }))}
                    >
                      <SelectTrigger className="h-12" id="edit-measurementYearEdit">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
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

      case 'profile-image':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Update Profile Image</DialogTitle>
              <DialogDescription>Upload a professional headshot or action photo to represent yourself.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="text-center">
                <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4">
                  {profileData.profileImage ? (
                    <Image
                      src={profileData.profileImage}
                      alt={profileData.fullName || "Profile picture"}
                      fill
                      className="rounded-full object-cover"
                      sizes="(max-width: 768px) 96px, 128px"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                      <span className="text-lg md:text-xl font-semibold text-muted-foreground">
                        {profileData.fullName.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="h-12">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Image
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload a professional headshot or action photo
                </p>
              </div>
            </div>
          </>
        );

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={dialogType === 'basic-info' ? "sm:max-w-2xl max-w-lg" : "sm:max-w-md max-w-lg"}>
        {getDialogContent()}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave}
            disabled={Object.keys(validationErrors).length > 0}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 