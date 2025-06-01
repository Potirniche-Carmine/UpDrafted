"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { 
  DIVISIONS,
  US_STATES, 
  GRADUATION_YEARS, 
  getPositionsForSport, 
  getSportsList 
} from "@/lib/sports-data";
import { FormValidator, FIELD_LIMITS } from "@/app/(onboarding)/lib/form-validation";
import { OnboardingData } from "../lib/types";

interface CoachRecruiterFormProps {
  data: OnboardingData;
  onInputChange: (field: keyof OnboardingData, value: string | number | string[] | number[] | File | null | boolean) => void;
}

export default function CoachRecruiterForm({ data, onInputChange }: CoachRecruiterFormProps) {
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const toggleRecruitingYear = (year: number) => {
    const years = data.recruitingGraduationYears.includes(year)
      ? data.recruitingGraduationYears.filter(y => y !== year)
      : [...data.recruitingGraduationYears, year];
    onInputChange('recruitingGraduationYears', years);
  };

  const toggleRecruitingPosition = (position: string) => {
    const positions = data.recruitingPositions.includes(position)
      ? data.recruitingPositions.filter(p => p !== position)
      : [...data.recruitingPositions, position];
    onInputChange('recruitingPositions', positions);
  };

  // Validate field and update errors
  const validateAndUpdateField = (field: keyof OnboardingData, value: string | number | null) => {
    const newErrors = { ...validationErrors };
    
    switch (field) {
      case 'title':
        const titleResult = FormValidator.validateText(value as string, 'Title', FIELD_LIMITS.TITLE, true);
        if (titleResult.isValid) {
          delete newErrors.title;
        } else {
          newErrors.title = titleResult.error!;
        }
        break;
      case 'organizationName':
        const orgResult = FormValidator.validateText(value as string, 'Organization name', FIELD_LIMITS.ORGANIZATION_NAME, true);
        if (orgResult.isValid) {
          delete newErrors.organizationName;
        } else {
          newErrors.organizationName = orgResult.error!;
        }
        break;
      case 'city':
        const cityResult = FormValidator.validateText(value as string, 'City', FIELD_LIMITS.CITY, true);
        if (cityResult.isValid) {
          delete newErrors.city;
        } else {
          newErrors.city = cityResult.error!;
        }
        break;
      case 'conference':
        if (value) {
          const confResult = FormValidator.validateText(value as string, 'Conference', FIELD_LIMITS.CONFERENCE);
          if (confResult.isValid) {
            delete newErrors.conference;
          } else {
            newErrors.conference = confResult.error!;
          }
        } else {
          delete newErrors.conference;
        }
        break;
      case 'programWebsite':
        if (value) {
          const programWebResult = FormValidator.validateURL(value as string);
          if (programWebResult.isValid) {
            delete newErrors.programWebsite;
          } else {
            newErrors.programWebsite = programWebResult.error!;
          }
        } else {
          delete newErrors.programWebsite;
        }
        break;
      case 'schoolWebsite':
        if (value) {
          const schoolWebResult = FormValidator.validateURL(value as string);
          if (schoolWebResult.isValid) {
            delete newErrors.schoolWebsite;
          } else {
            newErrors.schoolWebsite = schoolWebResult.error!;
          }
        } else {
          delete newErrors.schoolWebsite;
        }
        break;
      case 'orgInstagramHandle':
        if (value) {
          const igResult = FormValidator.validateSocialHandle(value as string, 'instagram');
          if (igResult.isValid) {
            delete newErrors.orgInstagramHandle;
          } else {
            newErrors.orgInstagramHandle = igResult.error!;
          }
        } else {
          delete newErrors.orgInstagramHandle;
        }
        break;
      case 'orgTwitterHandle':
        if (value) {
          const twitterResult = FormValidator.validateSocialHandle(value as string, 'twitter');
          if (twitterResult.isValid) {
            delete newErrors.orgTwitterHandle;
          } else {
            newErrors.orgTwitterHandle = twitterResult.error!;
          }
        } else {
          delete newErrors.orgTwitterHandle;
        }
        break;
      case 'recruitingPhilosophy':
        const philosophyResult = FormValidator.validateText(value as string, 'About your program', FIELD_LIMITS.RECRUITING_PHILOSOPHY, true);
        if (philosophyResult.isValid) {
          delete newErrors.recruitingPhilosophy;
        } else {
          newErrors.recruitingPhilosophy = philosophyResult.error!;
        }
        break;
      case 'whatLookingFor':
        const lookingForResult = FormValidator.validateText(value as string, 'What you are looking for', FIELD_LIMITS.WHAT_LOOKING_FOR, true);
        if (lookingForResult.isValid) {
          delete newErrors.whatLookingFor;
        } else {
          newErrors.whatLookingFor = lookingForResult.error!;
        }
        break;
      case 'scholarshipsAvailable':
        if (value !== null && value !== undefined) {
          const scholarshipValue = value as number;
          if (scholarshipValue < 0 || scholarshipValue > 100) {
            newErrors.scholarshipsAvailable = 'Scholarships must be between 0 and 100';
          } else {
            delete newErrors.scholarshipsAvailable;
          }
        } else {
          delete newErrors.scholarshipsAvailable;
        }
        break;
    }
    
    setValidationErrors(newErrors);
    onInputChange(field, value);
  };

  const handleOrganizationLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      onInputChange('organizationLogo', file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        onInputChange('organizationLogoPreview', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeOrganizationLogo = () => {
    onInputChange('organizationLogo', null);
    onInputChange('organizationLogoPreview', '');
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="title" className="text-base font-medium">Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Head Coach, Recruiting Coordinator"
            value={data.title}
            onChange={(e) => validateAndUpdateField('title', e.target.value)}
            className={`h-11 bg-background ${validationErrors.title ? 'border-red-500' : ''}`}
            maxLength={FIELD_LIMITS.TITLE}
          />
          {validationErrors.title && (
            <p className="text-sm text-red-500">{validationErrors.title}</p>
          )}
          <p className="text-xs text-muted-foreground">{data.title.length}/{FIELD_LIMITS.TITLE} characters</p>
        </div>
        <div className="space-y-3">
          <Label htmlFor="organizationName" className="text-base font-medium">School/Organization *</Label>
          <Input
            id="organizationName"
            placeholder="e.g., University of Texas"
            value={data.organizationName}
            onChange={(e) => validateAndUpdateField('organizationName', e.target.value)}
            className={`h-11 bg-background ${validationErrors.organizationName ? 'border-red-500' : ''}`}
            maxLength={FIELD_LIMITS.ORGANIZATION_NAME}
          />
          {validationErrors.organizationName && (
            <p className="text-sm text-red-500">{validationErrors.organizationName}</p>
          )}
          <p className="text-xs text-muted-foreground">{data.organizationName.length}/{FIELD_LIMITS.ORGANIZATION_NAME} characters</p>
        </div>
      </div>

      {/* Organization Logo Upload */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Organization Logo</Label>
        <div className="space-y-4">
          {data.organizationLogoPreview ? (
            <div className="relative w-24 h-20 mx-auto">
              <Image
                src={data.organizationLogoPreview}
                alt="Organization logo preview"
                width={96}
                height={80}
                className="rounded-lg object-contain border border-border/50"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeOrganizationLogo}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="organizationLogo" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload organization logo
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      Optional - Add your school or organization logo
                    </span>
                  </label>
                  <input
                    id="organizationLogo"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleOrganizationLogoChange}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>
          )}
          {!data.organizationLogoPreview && (
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('organizationLogo')?.click()}
                className="w-full"
              >
                Choose Logo
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Accepted formats: JPEG, PNG, WebP. Max size: 5MB.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="sportCoaching" className="text-base font-medium">Sport {data.role === 'recruiter' ? 'Recruiting For' : 'Coaching'} *</Label>
          <Select value={data.sportCoaching} onValueChange={(value) => onInputChange('sportCoaching', value)}>
            <SelectTrigger className="h-11 bg-background w-full" style={{ height: '2.75rem' }}>
              <SelectValue placeholder="Select sport" />
            </SelectTrigger>
            <SelectContent>
              {getSportsList().map(sport => (
                <SelectItem key={sport} value={sport}>{sport}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label htmlFor="division" className="text-base font-medium">Division *</Label>
          <Select value={data.division} onValueChange={(value) => onInputChange('division', value)}>
            <SelectTrigger className="h-11 bg-background w-full" style={{ height: '2.75rem' }}>
              <SelectValue placeholder="Select division" />
            </SelectTrigger>
            <SelectContent>
              {DIVISIONS.map(division => (
                <SelectItem key={division} value={division}>{division}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <Label htmlFor="city" className="text-base font-medium">City *</Label>
          <Input
            id="city"
            placeholder="Your city"
            value={data.city}
            onChange={(e) => validateAndUpdateField('city', e.target.value)}
            className={`h-11 bg-background ${validationErrors.city ? 'border-red-500' : ''}`}
            maxLength={FIELD_LIMITS.CITY}
          />
          {validationErrors.city && (
            <p className="text-sm text-red-500">{validationErrors.city}</p>
          )}
          <p className="text-xs text-muted-foreground">{data.city.length}/{FIELD_LIMITS.CITY} characters</p>
        </div>
        <div className="space-y-3">
          <Label htmlFor="state" className="text-base font-medium">State *</Label>
          <Select value={data.state} onValueChange={(value) => onInputChange('state', value)}>
            <SelectTrigger className="h-11 bg-background w-full" style={{ height: '2.75rem' }}>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label htmlFor="conference" className="text-base font-medium">Conference</Label>
          <Input
            id="conference"
            placeholder="e.g., Big 12"
            value={data.conference}
            onChange={(e) => validateAndUpdateField('conference', e.target.value)}
            className={`h-11 bg-background ${validationErrors.conference ? 'border-red-500' : ''}`}
            maxLength={FIELD_LIMITS.CONFERENCE}
          />
          {validationErrors.conference && (
            <p className="text-sm text-red-500">{validationErrors.conference}</p>
          )}
          <p className="text-xs text-muted-foreground">{data.conference.length}/{FIELD_LIMITS.CONFERENCE} characters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="programWebsite" className="text-base font-medium">Program Website</Label>
          <Input
            id="programWebsite"
            placeholder="https://..."
            value={data.programWebsite}
            onChange={(e) => validateAndUpdateField('programWebsite', e.target.value)}
            className={`h-11 bg-background ${validationErrors.programWebsite ? 'border-red-500' : ''}`}
            maxLength={FIELD_LIMITS.URL}
          />
          {validationErrors.programWebsite && (
            <p className="text-sm text-red-500">{validationErrors.programWebsite}</p>
          )}
        </div>
        <div className="space-y-3">
          <Label htmlFor="schoolWebsite" className="text-base font-medium">School Website</Label>
          <Input
            id="schoolWebsite"
            placeholder="https://..."
            value={data.schoolWebsite}
            onChange={(e) => validateAndUpdateField('schoolWebsite', e.target.value)}
            className={`h-11 bg-background ${validationErrors.schoolWebsite ? 'border-red-500' : ''}`}
            maxLength={FIELD_LIMITS.URL}
          />
          {validationErrors.schoolWebsite && (
            <p className="text-sm text-red-500">{validationErrors.schoolWebsite}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="orgInstagramHandle" className="text-base font-medium">Program Instagram</Label>
          <Input
            id="orgInstagramHandle"
            placeholder="@programname"
            value={data.orgInstagramHandle}
            onChange={(e) => validateAndUpdateField('orgInstagramHandle', e.target.value)}
            className={`h-11 bg-background ${validationErrors.orgInstagramHandle ? 'border-red-500' : ''}`}
            maxLength={31} // 30 chars + @ symbol
          />
          {validationErrors.orgInstagramHandle && (
            <p className="text-sm text-red-500">{validationErrors.orgInstagramHandle}</p>
          )}
        </div>
        <div className="space-y-3">
          <Label htmlFor="orgTwitterHandle" className="text-base font-medium">Program Twitter</Label>
          <Input
            id="orgTwitterHandle"
            placeholder="@programname"
            value={data.orgTwitterHandle}
            onChange={(e) => validateAndUpdateField('orgTwitterHandle', e.target.value)}
            className={`h-11 bg-background ${validationErrors.orgTwitterHandle ? 'border-red-500' : ''}`}
            maxLength={16} // 15 chars + @ symbol
          />
          {validationErrors.orgTwitterHandle && (
            <p className="text-sm text-red-500">{validationErrors.orgTwitterHandle}</p>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">* Provide at least one: website or social media</p>

      <div className="space-y-3">
        <Label htmlFor="recruitingPhilosophy" className="text-base font-medium">About Your Program *</Label>
        <Textarea
          id="recruitingPhilosophy"
          placeholder="Describe your program, coaching philosophy, and what makes your team special..."
          rows={4}
          value={data.recruitingPhilosophy}
          onChange={(e) => validateAndUpdateField('recruitingPhilosophy', e.target.value)}
          className={`resize-none bg-background ${validationErrors.recruitingPhilosophy ? 'border-red-500' : ''}`}
          maxLength={FIELD_LIMITS.RECRUITING_PHILOSOPHY}
        />
        {validationErrors.recruitingPhilosophy && (
          <p className="text-sm text-red-500">{validationErrors.recruitingPhilosophy}</p>
        )}
        <p className="text-xs text-muted-foreground">{data.recruitingPhilosophy.length}/{FIELD_LIMITS.RECRUITING_PHILOSOPHY} characters</p>
      </div>

      {/* Recruiting Needs */}
      <div className="border-t pt-6 space-y-6">
        <h3 className="text-lg font-semibold">Current Recruiting Needs</h3>
        
        <div className="space-y-3">
          <Label className="text-base font-medium">Graduation Years Recruiting *</Label>
          <div className="grid grid-cols-4 gap-3">
            {GRADUATION_YEARS.map(year => (
              <div key={year} className="flex items-center space-x-2">
                <Checkbox
                  id={`year-${year}`}
                  checked={data.recruitingGraduationYears.includes(year)}
                  onCheckedChange={() => toggleRecruitingYear(year)}
                />
                <label htmlFor={`year-${year}`} className="text-sm cursor-pointer">{year}</label>
              </div>
            ))}
          </div>
        </div>

        {data.sportCoaching && (
          <div className="space-y-3">
            <Label className="text-base font-medium">Positions Needed *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {getPositionsForSport(data.sportCoaching).map(position => (
                <div key={position} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pos-${position}`}
                    checked={data.recruitingPositions.includes(position)}
                    onCheckedChange={() => toggleRecruitingPosition(position)}
                  />
                  <label htmlFor={`pos-${position}`} className="text-sm cursor-pointer">{position}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label htmlFor="scholarshipsAvailable" className="text-base font-medium">Scholarships Available</Label>
          <Input
            id="scholarshipsAvailable"
            type="number"
            min="0"
            max="100"
            placeholder="Number of scholarships"
            value={data.scholarshipsAvailable || ''}
            onChange={(e) => validateAndUpdateField('scholarshipsAvailable', e.target.value ? parseInt(e.target.value) : null)}
            className={`h-11 bg-background ${validationErrors.scholarshipsAvailable ? 'border-red-500' : ''}`}
          />
          {validationErrors.scholarshipsAvailable && (
            <p className="text-sm text-red-500">{validationErrors.scholarshipsAvailable}</p>
          )}
          <p className="text-xs text-muted-foreground">Enter a number between 0-100</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="whatLookingFor" className="text-base font-medium">What You&apos;re Looking For *</Label>
          <Textarea
            id="whatLookingFor"
            placeholder="Describe the type of athletes you're looking for, their characteristics, playing style, academic requirements, etc..."
            rows={3}
            value={data.whatLookingFor}
            onChange={(e) => validateAndUpdateField('whatLookingFor', e.target.value)}
            className={`resize-none bg-background ${validationErrors.whatLookingFor ? 'border-red-500' : ''}`}
            maxLength={FIELD_LIMITS.WHAT_LOOKING_FOR}
          />
          {validationErrors.whatLookingFor && (
            <p className="text-sm text-red-500">{validationErrors.whatLookingFor}</p>
          )}
          <p className="text-xs text-muted-foreground">{data.whatLookingFor.length}/{FIELD_LIMITS.WHAT_LOOKING_FOR} characters</p>
        </div>
      </div>
    </>
  );
} 