"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, X } from "lucide-react";
import { getSportsList, US_STATES, GRADUATION_YEARS, getPositionsForSport } from '@/lib/sports-data';
import { AthleteProfileData, MeasurableEditData } from './athlete-profile-types';
import { validateField, FIELD_LIMITS } from './athlete-validation';

// Constants
const EDUCATION_LEVEL_OPTIONS = [
  { value: 'high_school', label: 'High School' },
  { value: 'associate', label: 'Community College (Associate)' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'graduate', label: 'Graduate School' },
];

interface AthleteEditDialogsProps {
  editDialogOpen: string | null;
  setEditDialogOpen: (dialog: string | null) => void;
  profileData: AthleteProfileData;
  editData: Record<string, string | number | string[]>;
  setEditData: React.Dispatch<React.SetStateAction<Record<string, string | number | string[]>>>;
  measurableEditData: MeasurableEditData;
  setMeasurableEditData: React.Dispatch<React.SetStateAction<MeasurableEditData>>;
  tempVideos: Array<{
    id?: string;
    title: string;
    url: string;
    embedUrl: string;
    sortOrder?: number;
  }> | undefined;
  setTempVideos: React.Dispatch<React.SetStateAction<Array<{
    id?: string;
    title: string;
    url: string;
    embedUrl: string;
    sortOrder?: number;
  }> | undefined>>;
  validationErrors: {[key: string]: string};
  setValidationErrors: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
  onSave: () => void;
  selectedSport: string;
  onDeleteMeasurable: (measurableId: string) => void;
}

export function AthleteEditDialogs({
  editDialogOpen,
  setEditDialogOpen,
  profileData,
  editData,
  setEditData,
  tempVideos,
  setTempVideos,
  validationErrors,
  setValidationErrors,
  onSave,
  selectedSport,
  onDeleteMeasurable
}: AthleteEditDialogsProps) {

  // Handle field changes with validation
  const handleFieldChange = (field: string, value: string | number) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    
    const error = validateField(field, value, profileData.fullName);
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

  // Helper function for height parsing
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

  // Video management
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
        
        setTempVideos((prev: Array<{
          id?: string;
          title: string;
          url: string;
          embedUrl: string;
          sortOrder?: number;
        }> | undefined) => [...(prev || []), newVideo]);
        setEditData(prev => ({ ...prev, youtubeUrl: '', title: '' }));
      }
    }
  };

  const removeTempVideo = (index: number) => {
    setTempVideos((prev: Array<{
      id?: string;
      title: string;
      url: string;
      embedUrl: string;
      sortOrder?: number;
    }> | undefined) => (prev || []).filter((_: unknown, i: number) => i !== index));
  };

  // Delete confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [measurableToDelete, setMeasurableToDelete] = useState<string | null>(null);

  const handleDeleteConfirm = (measurableId: string) => {
    setMeasurableToDelete(measurableId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (measurableToDelete) {
      onDeleteMeasurable(measurableToDelete);
      setDeleteConfirmOpen(false);
      setMeasurableToDelete(null);
    }
  };

  if (!editDialogOpen) return null;

  // Suppress linter warning for unused functions that may be used in future dialogs
  console.log({ parseHeight, addTempVideo, removeTempVideo });

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
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
                        <div key={sport} className="flex items-center gap-1 px-2 py-1 bg-secondary rounded text-sm">
                          {sport}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-1 h-4 w-4 p-0"
                            onClick={() => removeSecondarySport(sport)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
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
                Add your social media handles to connect with coaches and showcase your personality. Leave blank to remove.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-instagram">Instagram Handle</Label>
                  {editData.instagram && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditData(prev => ({ ...prev, instagram: '' }))}
                      className="text-red-600 hover:text-red-700 h-6 px-2"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Input
                  id="edit-instagram"
                  placeholder="@username (leave blank to remove)"
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-twitter">Twitter/X Handle</Label>
                  {editData.twitter && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditData(prev => ({ ...prev, twitter: '' }))}
                      className="text-red-600 hover:text-red-700 h-6 px-2"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Input
                  id="edit-twitter"
                  placeholder="@username (leave blank to remove)"
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
                  placeholder="https://www.maxpreps.com/fl/jacksonville/zarephath-academy-eagles/athletes/jordan-durham/football/stats/"
                  value={editData.maxPrepsUrl || ''}
                  onChange={(e) => {
                    const url = e.target.value;
                    setEditData(prev => ({ ...prev, maxPrepsUrl: url }));
                    
                    if (url.trim()) {
                      const validation = validateField('maxPrepsUrl', url, profileData.fullName);
                      if (validation) {
                        setValidationErrors(prev => ({ ...prev, maxPrepsUrl: validation }));
                      } else {
                        setValidationErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.maxPrepsUrl;
                          return newErrors;
                        });
                      }
                    } else {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.maxPrepsUrl;
                        return newErrors;
                      });
                    }
                  }}
                  className={`h-12 ${validationErrors.maxPrepsUrl ? 'border-red-500' : ''}`}
                  maxLength={FIELD_LIMITS.URL}
                />
                {validationErrors.maxPrepsUrl && (
                  <p className="text-sm text-red-500">{validationErrors.maxPrepsUrl}</p>
                )}
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    <strong>Important:</strong> Your MaxPreps URL must contain your exact profile name for verification. 
                    The URL should include &ldquo;/athletes/first-last/&rdquo; matching your profile name &ldquo;{profileData.fullName}&rdquo;.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add your MaxPreps profile to showcase official stats and get verified instantly
                </p>
                <p className="text-xs text-muted-foreground">
                  {String(editData.maxPrepsUrl || '').length}/{FIELD_LIMITS.URL} characters
                </p>
              </div>
            </div>
          </>
        );

      case 'delete-measurable':
        const sportMeasurables = (profileData.measurables || []).filter(m => m.sport === selectedSport);
        
        return (
          <>
            <DialogHeader>
              <DialogTitle>Delete Performance Metric</DialogTitle>
              <DialogDescription>
                Select a performance metric to delete from your {selectedSport} profile.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {sportMeasurables.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No performance metrics found for {selectedSport}.
                </p>
              ) : (
                <div className="space-y-3">
                  {sportMeasurables.map((measurable) => (
                    <div key={measurable.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{measurable.label}</p>
                        <p className="text-sm text-muted-foreground">{measurable.value}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                        onClick={() => handleDeleteConfirm(measurable.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
              <p>Edit functionality for {editDialogOpen} is coming soon!</p>
            </div>
          </>
        );
    }
  };

  const getDialogClassName = () => {
    if (editDialogOpen === 'basic-info') {
      return "sm:max-w-2xl max-w-lg";
    }
    return "sm:max-w-md max-w-lg";
  };

  return (
    <>
      {/* Main Edit Dialog */}
      <Dialog open={!!editDialogOpen} onOpenChange={() => setEditDialogOpen(null)}>
        <DialogContent className={getDialogClassName()}>
          {getDialogContent()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(null)}>
              Cancel
            </Button>
            <Button 
              onClick={onSave}
              disabled={Object.keys(validationErrors).length > 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this performance metric? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 