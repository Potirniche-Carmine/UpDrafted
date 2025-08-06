"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input, SocialInput } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { 
  DIVISIONS,
  US_STATES, 
  getPositionsForSport, 
  getSportsList 
} from "@/lib/sports-data";
import { FormValidator, FIELD_LIMITS } from "@/app/(onboarding)/lib/form-validation";
import { OnboardingData } from "../lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { FileUpload } from '@/components/ui/file-upload';

interface CoachRecruiterFormProps {
  data: OnboardingData;
  onInputChange: (field: keyof OnboardingData, value: string | number | string[] | number[] | File | null | boolean) => void;
}

// Searchable Combobox Component for Sports
function SportCombobox({ 
  value, 
  onValueChange, 
  placeholder, 
  excludeSports = []
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  excludeSports?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const sports = getSportsList().filter(sport => !excludeSports.includes(sport));
  
  // Filter sports based on search, limit to 10 for performance
  const filteredSports = sports.filter(sport => 
    sport.toLowerCase().includes(searchValue.toLowerCase())
  ).slice(0, 30);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-11 w-full justify-between bg-background"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command>
          <CommandInput 
            placeholder="Search sports..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>No sport found.</CommandEmpty>
            <CommandGroup>
              {filteredSports.map((sport) => (
                <CommandItem
                  key={sport}
                  value={sport}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue);
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === sport ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {sport}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function CoachRecruiterForm({ data, onInputChange }: CoachRecruiterFormProps) {
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});



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
      case 'personalStatement':
        const personalResult = FormValidator.validateText(value as string, 'About yourself', FIELD_LIMITS.PERSONAL_STATEMENT, true);
        if (personalResult.isValid) {
          delete newErrors.personalStatement;
        } else {
          newErrors.personalStatement = personalResult.error!;
        }
        break;
      case 'recruitingPhilosophy':
        const philosophyResult = FormValidator.validateText(value as string, 'Recruiting philosophy', FIELD_LIMITS.RECRUITING_PHILOSOPHY, true);
        if (philosophyResult.isValid) {
          delete newErrors.recruitingPhilosophy;
        } else {
          newErrors.recruitingPhilosophy = philosophyResult.error!;
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
        <FileUpload
          id="organizationLogo"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleOrganizationLogoChange}
          onRemove={removeOrganizationLogo}
          preview={data.organizationLogoPreview}
          uploadText="Upload organization logo"
          chooseText="Choose organization logo"
          supportedFormats="Accepted formats: JPEG, PNG, WebP"
          maxSize="5MB"
          imageType="organization"
        />
        <p className="text-xs text-muted-foreground">Optional - Add your school or organization logo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="sportCoaching" className="text-base font-medium">Sport {data.role === 'recruiter' ? 'Recruiting For' : 'Coaching'} *</Label>
          <SportCombobox
            value={data.sportCoaching}
            onValueChange={(value) => onInputChange('sportCoaching', value)}
            placeholder="Select sport"
          />
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
          <SocialInput
            id="orgInstagramHandle"
            placeholder="programname"
            value={data.orgInstagramHandle}
            onChange={(e) => validateAndUpdateField('orgInstagramHandle', e.target.value)}
            className={`h-11 bg-background ${validationErrors.orgInstagramHandle ? 'border-red-500' : ''}`}
            maxLength={30}
          />
          {validationErrors.orgInstagramHandle && (
            <p className="text-sm text-red-500">{validationErrors.orgInstagramHandle}</p>
          )}
        </div>
        <div className="space-y-3">
          <Label htmlFor="orgTwitterHandle" className="text-base font-medium">Program Twitter</Label>
          <SocialInput
            id="orgTwitterHandle"
            placeholder="programname"
            value={data.orgTwitterHandle}
            onChange={(e) => validateAndUpdateField('orgTwitterHandle', e.target.value)}
            className={`h-11 bg-background ${validationErrors.orgTwitterHandle ? 'border-red-500' : ''}`}
            maxLength={15}
          />
          {validationErrors.orgTwitterHandle && (
            <p className="text-sm text-red-500">{validationErrors.orgTwitterHandle}</p>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">* Provide at least one: website or social media</p>

      <div className="space-y-3">
        <Label htmlFor="personalStatement" className="text-base font-medium">About Yourself *</Label>
        <Textarea
          id="personalStatement"
          placeholder="Tell us about yourself, your coaching background, and your approach to the sport..."
          rows={4}
          value={data.personalStatement}
          onChange={(e) => validateAndUpdateField('personalStatement', e.target.value)}
          className={`resize-none bg-background ${validationErrors.personalStatement ? 'border-red-500' : ''}`}
          maxLength={FIELD_LIMITS.PERSONAL_STATEMENT}
        />
        {validationErrors.personalStatement && (
          <p className="text-sm text-red-500">{validationErrors.personalStatement}</p>
        )}
        <p className="text-xs text-muted-foreground">{data.personalStatement.length}/{FIELD_LIMITS.PERSONAL_STATEMENT} characters</p>
      </div>

      {/* Recruiting Needs */}
      <div className="border-t pt-6 space-y-6">
        <h3 className="text-lg font-semibold">Current Recruiting Needs</h3>
        


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
            value={data.scholarshipsAvailable ?? ''}
            onChange={(e) => validateAndUpdateField('scholarshipsAvailable', e.target.value ? parseInt(e.target.value) : null)}
            className={`h-11 bg-background ${validationErrors.scholarshipsAvailable ? 'border-red-500' : ''}`}
          />
          {validationErrors.scholarshipsAvailable && (
            <p className="text-sm text-red-500">{validationErrors.scholarshipsAvailable}</p>
          )}
          <p className="text-xs text-muted-foreground">Enter a number between 0-100</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="recruitingPhilosophy" className="text-base font-medium">Recruiting Philosophy *</Label>
          <Textarea
            id="recruitingPhilosophy"
            placeholder="Describe your recruiting philosophy and approach..."
            rows={3}
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
      </div>
    </>
  );
} 