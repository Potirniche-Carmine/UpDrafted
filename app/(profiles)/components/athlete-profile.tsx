"use client";

import React, { useState, useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Instagram,
  Twitter,
  ExternalLink,
  Edit,
  Plus,
  Save,
  Upload,
  X
} from "lucide-react";
import { ProfileHeader } from "./shared/profile-header";
import { ProfileCompletionBanner } from "./shared/profile-completion-banner";
import { AthleticHighlightsSection } from "./shared/athletic-highlights-section";
import { AcademicSummaryCard } from "./shared/academic-summary-card";
import { useRoleView } from '@/hooks/use-role-view';
import { calculateAthleteProfileCompletion } from '@/lib/profile-completion';
import { getSportsList, US_STATES, GRADUATION_YEARS, getPositionsForSport } from '@/lib/sports-data';

// Import form validation
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
  WEIGHT: { min: 50, max: 700 }, // in pounds
  GPA: { min: 0, max: 5.0 },
  SAT_SCORE: { min: 400, max: 1600 },
  ACT_SCORE: { min: 1, max: 36 }
};

export interface Measurable {
  id: string;
  sport: string;
  label: string;
  value: string;
  measurementDate: string;
}

export interface AthleteProfileData {
  id: string;
  // Basic Information
  fullName: string;
  profileImage?: string;
  sport: string;
  secondarySports?: string[];
  graduationYear: number;
  highSchool: string;
  city: string;
  state: string;
  gpa?: number | string;
  satScore?: number;
  actScore?: number;
  height: string;
  weight: string;
  positions: string[];

  // Verification
  maxPrepsUrl?: string;
  maxPrepsVerified: boolean;

  // Media
  hudlUrl?: string;
  hudlEmbedUrl?: string;
  youtubeVideos?: {
    id?: string;
    title: string;
    url: string;
    embedUrl: string;
    sortOrder?: number;
  }[];

  // Social Media (highlighted)
  socialMedia?: {
    instagram?: string;
    twitter?: string;
  };

  // Academic Information
  intendedMajor?: string;

  // Personal Statement
  personalStatement?: string;

  // Additional Info
  achievements?: string[];

  // Measurables
  measurables?: Measurable[];
}

interface AthleteProfileProps {
  data: AthleteProfileData;
  isOwnProfile?: boolean;
  onConnect?: () => void;
  onShare?: () => void;
}

// Memoize heavy components
const MeasurablesSection = memo(({ measurables, selectedSport }: { 
  measurables: Measurable[], 
  selectedSport: string 
}) => {
  const sportMeasurables = useMemo(() => 
    measurables.filter(m => m.sport === selectedSport), 
    [measurables, selectedSport]
  );

  if (sportMeasurables.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Measurables - {selectedSport}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {sportMeasurables.map((measurable) => (
            <div key={measurable.id} className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">{measurable.label}</div>
              <div className="font-semibold text-lg">{measurable.value}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(measurable.measurementDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

MeasurablesSection.displayName = "MeasurablesSection";

const SocialMediaSection = memo(({ socialMedia, isOwnProfile, onEdit }: { 
  socialMedia?: { instagram?: string; twitter?: string };
  isOwnProfile?: boolean;
  onEdit?: () => void;
}) => {
  if (!socialMedia && !isOwnProfile) return null;

  return (
    <div className="pt-2 relative">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium">Follow Me</p>
        {isOwnProfile && (
          <Button
            size="sm"
            variant="ghost"
            className="p-1 h-6 w-6"
            onClick={onEdit}
          >
            <Edit className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      {socialMedia?.instagram || socialMedia?.twitter ? (
        <div className="flex justify-center gap-3">
          {socialMedia.instagram && (
            <a
              href={`https://instagram.com/${socialMedia.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Instagram className="w-4 h-4" />
              <span className="text-sm font-medium">{socialMedia.instagram}</span>
            </a>
          )}
          {socialMedia.twitter && (
            <a
              href={`https://twitter.com/${socialMedia.twitter.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Twitter className="w-4 h-4" />
              <span className="text-sm font-medium">{socialMedia.twitter}</span>
            </a>
          )}
        </div>
      ) : isOwnProfile ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-2">No social media added</p>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Plus className="w-3 h-3 mr-1" />
            Add Social Media
          </Button>
        </div>
      ) : null}
    </div>
  );
});

SocialMediaSection.displayName = "SocialMediaSection";

export function AthleteProfile({ data, isOwnProfile = false, onConnect, onShare }: AthleteProfileProps) {
  const [selectedSport, setSelectedSport] = useState(data.sport);
  const [editDialogOpen, setEditDialogOpen] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, string | number | string[]>>({});
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const { effectiveRole } = useRoleView();
  
  // Calculate profile completion
  const profileCompletion = useMemo(() => 
    calculateAthleteProfileCompletion(data), 
    [data]
  );
  
  // Memoize computed values - use effectiveRole instead of currentUserRole for admin testing
  const allSports = useMemo(() => [data.sport, ...(data.secondarySports || [])], [data.sport, data.secondarySports]);
  const canDraft = useMemo(() => 
    !isOwnProfile && (effectiveRole === 'coach' || effectiveRole === 'recruiter'),
    [isOwnProfile, effectiveRole]
  );

  // Helper functions for height parsing
  const parseHeight = (heightString: string): { feet: string, inches: string } => {
    const match = heightString.match(/(\d+)'(\d+)"/);
    if (match) {
      return { feet: match[1], inches: match[2] };
    }
    return { feet: '', inches: '' };
  };

  // Secondary sports management
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

  // Positions management
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

  // Validation functions
  const validateField = (field: string, value: string | number): string | null => {
    switch (field) {
      case 'fullName':
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'Full name is required';
        }
        if (typeof value === 'string' && value.length > FIELD_LIMITS.FULL_NAME) {
          return `Name must be ${FIELD_LIMITS.FULL_NAME} characters or less`;
        }
        const namePattern = /^[a-zA-Z\s\-'\.]+$/;
        if (typeof value === 'string' && !namePattern.test(value)) {
          return 'Name can only contain letters, spaces, hyphens, and apostrophes';
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
      
      case 'satScore':
        if (typeof value === 'number' && (value < NUMERIC_LIMITS.SAT_SCORE.min || value > NUMERIC_LIMITS.SAT_SCORE.max)) {
          return `SAT score must be between ${NUMERIC_LIMITS.SAT_SCORE.min} and ${NUMERIC_LIMITS.SAT_SCORE.max}`;
        }
        break;
      
      case 'actScore':
        if (typeof value === 'number' && (value < NUMERIC_LIMITS.ACT_SCORE.min || value > NUMERIC_LIMITS.ACT_SCORE.max)) {
          return `ACT score must be between ${NUMERIC_LIMITS.ACT_SCORE.min} and ${NUMERIC_LIMITS.ACT_SCORE.max}`;
        }
        break;
    }
    return null;
  };

  const handleFieldChange = (field: string, value: string | number) => {
    // Update the value
    setEditData(prev => ({ ...prev, [field]: value }));
    
    // Validate and update errors
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

  const handleEditSection = (section: string) => {
    // Initialize edit data based on section
    switch (section) {
      case 'basic-info':
        const heightData = parseHeight(data.height);
        setEditData({
          fullName: data.fullName,
          sport: data.sport,
          secondarySports: data.secondarySports || [],
          city: data.city,
          state: data.state,
          highSchool: data.highSchool,
          graduationYear: data.graduationYear,
          heightFeet: heightData.feet,
          heightInches: heightData.inches,
          weight: data.weight.replace(' lbs', ''),
          positions: data.positions
        });
        break;
      case 'personal-statement':
      case 'add-personal-statement':
        setEditData({
          personalStatement: data.personalStatement || ''
        });
        break;
      case 'social-media':
        setEditData({
          instagram: data.socialMedia?.instagram || '',
          twitter: data.socialMedia?.twitter || ''
        });
        break;
      case 'academic-info':
        setEditData({
          gpa: data.gpa || '',
          satScore: data.satScore || '',
          actScore: data.actScore || '',
          intendedMajor: data.intendedMajor || ''
        });
        break;
      case 'add-maxpreps':
      case 'maxpreps-verification':
        setEditData({
          maxPrepsUrl: data.maxPrepsUrl || ''
        });
        break;
      case 'add-hudl':
      case 'hudl-highlights':
        setEditData({
          hudlUrl: data.hudlUrl || '',
          hudlEmbedUrl: data.hudlEmbedUrl || ''
        });
        break;
      case 'add-videos':
      case 'video-highlights':
        setEditData({
          youtubeUrl: '',
          title: ''
        });
        break;
      default:
        setEditData({});
    }
    
    setValidationErrors({});
    setEditDialogOpen(section);
  };

  const handleSaveEdit = () => {
    // TODO: Implement actual save functionality
    setEditDialogOpen(null);
    setEditData({});
    setValidationErrors({});
  };

  const handleReportProfile = () => {
    // TODO: Open report modal or navigate to report page
  };

  const renderEditDialog = () => {
    if (!editDialogOpen) return null;

    const getDialogContent = () => {
      switch (editDialogOpen) {
        case 'basic-info':
          const availableSports = getSportsList().filter(sport => 
            sport !== editData.sport && !(editData.secondarySports as string[])?.includes(sport)
          );
          const availablePositions = getPositionsForSport(editData.sport as string);
          
          return (
            <>
              <DialogHeader>
                <DialogTitle>Edit Basic Information</DialogTitle>
                <DialogDescription>
                  Update your personal information, sport, and physical details.
                </DialogDescription>
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
                  <p className="text-xs text-muted-foreground">
                    {String(editData.fullName || '').length}/{FIELD_LIMITS.FULL_NAME} characters
                  </p>
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
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
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
                              aria-label={`Remove ${sport}`}
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
                          <Label htmlFor={`edit-position-${index}`} className="text-sm">
                            {position}
                          </Label>
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
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
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
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
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
                        <SelectTrigger className="h-12" id="edit-heightFeet">
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
                        <SelectTrigger className="h-12" id="edit-heightInches">
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
                <DialogDescription>
                  Update your GPA, test scores, and intended major.
                </DialogDescription>
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
                    value={editData.gpa || ''}
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
                      value={editData.satScore || ''}
                      onChange={(e) => handleFieldChange('satScore', e.target.value ? parseInt(e.target.value) : '')}
                      className={`h-12 ${validationErrors.satScore ? 'border-red-500' : ''}`}
                    />
                    {validationErrors.satScore && (
                      <p className="text-sm text-red-500">{validationErrors.satScore}</p>
                    )}
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
                      value={editData.actScore || ''}
                      onChange={(e) => handleFieldChange('actScore', e.target.value ? parseInt(e.target.value) : '')}
                      className={`h-12 ${validationErrors.actScore ? 'border-red-500' : ''}`}
                    />
                    {validationErrors.actScore && (
                      <p className="text-sm text-red-500">{validationErrors.actScore}</p>
                    )}
                    <p className="text-xs text-muted-foreground">1-36</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-intendedMajor">Intended Major</Label>
                  <Input
                    id="edit-intendedMajor"
                    placeholder="e.g., Business Administration"
                    value={editData.intendedMajor || ''}
                    onChange={(e) => handleFieldChange('intendedMajor', e.target.value)}
                    className="h-12"
                    maxLength={FIELD_LIMITS.INTENDED_MAJOR}
                  />
                  <p className="text-xs text-muted-foreground">
                    {String(editData.intendedMajor || '').length}/{FIELD_LIMITS.INTENDED_MAJOR} characters
                  </p>
                </div>
              </div>
            </>
          );

        case 'personal-statement':
        case 'add-personal-statement':
          return (
            <>
              <DialogHeader>
                <DialogTitle>
                  {editDialogOpen === 'add-personal-statement' ? 'Add Personal Statement' : 'Edit Personal Statement'}
                </DialogTitle>
                <DialogDescription>
                  Tell coaches and recruiters about yourself, your goals, and what makes you unique.
                </DialogDescription>
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
                <DialogDescription>
                  Add your social media handles to connect with coaches and showcase your personality.
                </DialogDescription>
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
                  <p className="text-xs text-muted-foreground">
                    {String(editData.instagram || '').length}/{FIELD_LIMITS.INSTAGRAM_HANDLE} characters
                  </p>
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
                  <p className="text-xs text-muted-foreground">
                    {String(editData.twitter || '').length}/{FIELD_LIMITS.TWITTER_HANDLE} characters
                  </p>
                </div>
              </div>
            </>
          );

        case 'add-maxpreps':
        case 'maxpreps-verification':
          return (
            <>
              <DialogHeader>
                <DialogTitle>Add MaxPreps Profile</DialogTitle>
                <DialogDescription>
                  Connect your MaxPreps profile to showcase official stats and verification.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-maxPrepsUrl">MaxPreps Profile URL</Label>
                  <Input
                    id="edit-maxPrepsUrl"
                    placeholder="https://www.maxpreps.com/..."
                    value={editData.maxPrepsUrl || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, maxPrepsUrl: e.target.value }))}
                    className="h-12"
                    maxLength={FIELD_LIMITS.URL}
                  />
                  <p className="text-sm text-muted-foreground">
                    Add your MaxPreps profile to showcase official stats and verification
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {String(editData.maxPrepsUrl || '').length}/{FIELD_LIMITS.URL} characters
                  </p>
                </div>
              </div>
            </>
          );

        case 'add-hudl':
        case 'hudl-highlights':
          return (
            <>
              <DialogHeader>
                <DialogTitle>Add Hudl Profile</DialogTitle>
                <DialogDescription>
                  Connect your Hudl profile to showcase game film and highlight reels.
                </DialogDescription>
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
                  <p className="text-xs text-muted-foreground">
                    {String(editData.hudlUrl || '').length}/{FIELD_LIMITS.URL} characters
                  </p>
                </div>
              </div>
            </>
          );

        case 'add-videos':
        case 'video-highlights':
          return (
            <>
              <DialogHeader>
                <DialogTitle>Add Highlight Video</DialogTitle>
                <DialogDescription>
                  Add YouTube videos to showcase your best plays and skills.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
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
                  <p className="text-xs text-muted-foreground">
                    {String(editData.title || '').length}/100 characters
                  </p>
                </div>
              </div>
            </>
          );

        case 'profile-image':
          return (
            <>
              <DialogHeader>
                <DialogTitle>Update Profile Image</DialogTitle>
                <DialogDescription>
                  Upload a professional headshot or action photo to represent yourself.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 relative">
                    {data.profileImage ? (
                      <Image
                        src={data.profileImage}
                        alt="Profile"
                        fill
                        className="rounded-full object-cover"
                        sizes="(max-width: 768px) 96px, 128px"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                        <span className="text-2xl font-semibold text-muted-foreground">
                          {data.fullName.split(' ').map(n => n[0]).join('')}
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
                <DialogTitle>Edit {editDialogOpen}</DialogTitle>
                <DialogDescription>
                  Edit functionality for this section.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <p>Edit functionality for {editDialogOpen} coming soon!</p>
              </div>
            </>
          );
      }
    };

    // Determine dialog size based on content
    const getDialogClassName = () => {
      if (editDialogOpen === 'basic-info') {
        return "sm:max-w-2xl max-w-lg"; // Larger for basic info
      }
      return "sm:max-w-md max-w-lg"; // Standard size for others
    };

    return (
      <Dialog open={!!editDialogOpen} onOpenChange={() => setEditDialogOpen(null)}>
        <DialogContent className={getDialogClassName()}>
          {getDialogContent()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={Object.keys(validationErrors).length > 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Actions */}
      <ProfileHeader
        isOwnProfile={isOwnProfile}
        onConnect={canDraft ? onConnect : undefined}
        onReport={handleReportProfile}
        onShare={onShare}
        connectLabel="Draft"
        profileName={data.fullName}
        profileType="athlete"
      />

      {renderEditDialog()}

      <div className="container py-4 md:py-8">
        {/* Profile Completion Banner - Only for own profile */}
        {isOwnProfile && (
          <div className="mb-6">
            <ProfileCompletionBanner 
              completion={profileCompletion}
              isOwnProfile={isOwnProfile}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Sidebar - Basic Info */}
          <div className="space-y-4 md:space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="text-center">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4">
                    {data.profileImage ? (
                      <Image
                        src={data.profileImage}
                        alt={data.fullName || "Profile picture"}
                        fill
                        className="rounded-full object-cover"
                        sizes="(max-width: 768px) 96px, 128px"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                        <span className="text-lg md:text-xl font-semibold text-muted-foreground">
                          {data.fullName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                    {isOwnProfile && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full p-2 h-8 w-8"
                        onClick={() => handleEditSection('profile-image')}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <h1 className="text-lg md:text-xl font-bold">{data.fullName}</h1>
                      {isOwnProfile && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1 h-6 w-6"
                          onClick={() => handleEditSection('basic-info')}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      )}
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                      <Badge className="bg-[#01ae79] text-white hover:bg-[#01ae79]/90 text-xs">
                        {data.sport}
                      </Badge>
                      {data.secondarySports?.map(sport => (
                        <Badge key={sport} variant="outline" className="text-xs">
                          {sport}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center justify-center gap-1 min-w-0">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="text-center break-words whitespace-normal">{data.city}, {data.state}</span>
                      </div>
                      <p className="text-center break-words">{data.highSchool}</p>
                      <p className="text-center">Class of {data.graduationYear}</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-1 text-xs text-muted-foreground">
                      {data.positions.map(position => (
                        <span key={position} className="px-2 py-1 bg-muted rounded text-center break-words max-w-full">
                          {position}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Height</p>
                        <p className="font-semibold">{data.height}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Weight</p>
                        <p className="font-semibold">{data.weight}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <SocialMediaSection 
                  socialMedia={data.socialMedia} 
                  isOwnProfile={isOwnProfile}
                  onEdit={() => handleEditSection('social-media')}
                />

                {/* Sport Selector */}
                {allSports.length > 1 && (
                  <div className="pt-4 mt-4 border-t">
                    <p className="text-sm font-medium mb-2">View Stats For:</p>
                    <div className="flex flex-wrap gap-1">
                      {allSports.map(sport => (
                        <Button
                          key={sport}
                          size="sm"
                          variant={selectedSport === sport ? "default" : "outline"}
                          className="text-xs h-7"
                          onClick={() => setSelectedSport(sport)}
                        >
                          {sport}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Academic Summary Card - Moved up for better visibility */}
            <AcademicSummaryCard
              gpa={data.gpa}
              satScore={data.satScore}
              actScore={data.actScore}
              intendedMajor={data.intendedMajor}
              isOwnProfile={isOwnProfile}
              onEditSection={handleEditSection}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Personal Statement */}
            {data.personalStatement ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>About {data.fullName.split(' ')[0]}</CardTitle>
                    {isOwnProfile && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditSection('personal-statement')}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{data.personalStatement}</p>
                </CardContent>
              </Card>
            ) : isOwnProfile && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>About {data.fullName.split(' ')[0]}</CardTitle>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleEditSection('personal-statement')}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-6">
                    <div className="text-center">
                      <p className="font-medium text-muted-foreground mb-2">No Personal Statement Added</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Tell coaches and recruiters about yourself, your goals, and what makes you unique
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => handleEditSection('add-personal-statement')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Personal Statement
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Athletic Performance - Improved version */}
            <AthleticHighlightsSection
              measurables={data.measurables}
              selectedSport={selectedSport}
              isOwnProfile={isOwnProfile}
              onEditSection={handleEditSection}
            />

            {/* MaxPreps Verification - Simplified */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Official Stats & Verification</CardTitle>
                  {isOwnProfile && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleEditSection('maxpreps-verification')}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {data.maxPrepsUrl ? (
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">MaxPreps Profile</p>
                      <p className="text-sm text-muted-foreground">
                        Official stats, game logs, and team roster verification
                      </p>
                    </div>
                    <Link href={data.maxPrepsUrl} target="_blank">
                      <Button className="bg-[#01ae79] hover:bg-[#01ae79]/90 text-white">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Official Stats
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-center">
                      <p className="font-medium text-muted-foreground mb-2">MaxPreps Profile Not Added</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add your MaxPreps profile to showcase official stats and verification
                      </p>
                      {isOwnProfile && (
                        <Button 
                          variant="outline"
                          onClick={() => handleEditSection('add-maxpreps')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add MaxPreps URL
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Hudl Highlights - Only show if URL exists or if it's own profile */}
            {(data.hudlUrl || isOwnProfile) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Hudl Highlights</CardTitle>
                    {isOwnProfile && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditSection('hudl-highlights')}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {data.hudlUrl ? (
                    data.hudlEmbedUrl ? (
                      <div className="space-y-4">
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                          <iframe
                            src={data.hudlEmbedUrl}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Hudl Highlights"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">Game film and highlight reels</p>
                          <Link href={data.hudlUrl} target="_blank">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View Full Hudl
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">Hudl Profile</p>
                          <p className="text-sm text-muted-foreground">Game film and highlight reels</p>
                        </div>
                        <Link href={data.hudlUrl} target="_blank">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Hudl
                          </Button>
                        </Link>
                      </div>
                    )
                  ) : isOwnProfile && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-center">
                        <p className="font-medium text-muted-foreground mb-2">Hudl Profile Not Added</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add your Hudl profile to showcase game film and highlight reels
                        </p>
                        <Button 
                          variant="outline"
                          onClick={() => handleEditSection('add-hudl')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Hudl URL
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* YouTube Videos */}
            {(data.youtubeVideos && data.youtubeVideos.length > 0) || isOwnProfile ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Highlight Videos</CardTitle>
                    {isOwnProfile && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditSection('video-highlights')}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {data.youtubeVideos && data.youtubeVideos.length > 0 ? (
                    <div className="space-y-4">
                      {data.youtubeVideos.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((video, index) => (
                        <div key={video.id || index} className="space-y-2">
                          <h4 className="font-medium break-words">{video.title}</h4>
                          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                            <iframe
                              src={video.embedUrl}
                              className="absolute inset-0 w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={video.title}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : isOwnProfile && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-center">
                        <p className="font-medium text-muted-foreground mb-2">No Highlight Videos Added</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add YouTube videos to showcase your best plays and skills
                        </p>
                        <Button 
                          variant="outline"
                          onClick={() => handleEditSection('add-videos')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Videos
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
} 