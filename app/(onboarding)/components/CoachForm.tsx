"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  DIVISIONS,
  US_STATES, 
  getPositionsForSport, 
  getSportsList,
  getStudentClassificationOptions
} from "@/lib/sports-data";
import { FormValidator, FIELD_LIMITS } from "@/app/(onboarding)/lib/form-validation";
import { OnboardingData } from "../lib/types";
import { FileUpload } from '@/components/ui/file-upload';
import { ConferenceSelector } from "@/components/ui/conference-selector";

interface CoachFormProps {
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

// Add country list for recruiting
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

// Searchable Combobox Component for Country (same UI as AthleteForm)
function CountryCombobox({
  value,
  onValueChange,
  placeholder
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const countries = COUNTRIES;
  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(searchValue.toLowerCase())
  );

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
            placeholder="Search country..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {filteredCountries.map((country) => (
                <CommandItem
                  key={country}
                  value={country}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue);
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === country ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {country}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function CoachForm({ data, onInputChange }: CoachFormProps) {
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});



  const toggleRecruitingPosition = (position: string) => {
    const positions = data.recruitingPositions.includes(position)
      ? data.recruitingPositions.filter(p => p !== position)
      : [...data.recruitingPositions, position];
    onInputChange('recruitingPositions', positions);
  };

  const toggleStudentClassification = (classification: string) => {
    const classifications = data.recruitingStudentClassifications.includes(classification)
      ? data.recruitingStudentClassifications.filter(c => c !== classification)
      : [...data.recruitingStudentClassifications, classification];
    onInputChange('recruitingStudentClassifications', classifications);
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

  const handleURLBlur = (field: 'programWebsite' | 'schoolWebsite', value: string) => {
    if (value && !value.match(/^https?:\/\//i)) {
      // Add https:// if it looks like a domain
      if (value.includes('.') && !value.includes(' ')) {
        const processedURL = `https://${value}`;
        onInputChange(field, processedURL);
      }
    }
  };

  // Clear state if country is changed to something other than United States
  const handleCountryChange = (value: string) => {
    onInputChange('country', value);
    if (value !== 'United States' && data.state) {
      onInputChange('state', '');
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="title" className="text-base font-medium">Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Head Coach, Assistant Coach"
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
          accept="image/*"
          onChange={handleOrganizationLogoChange}
          onRemove={removeOrganizationLogo}
          preview={data.organizationLogoPreview}
          uploadText="Click to upload organization logo"
          chooseText="Choose organization logo"
          supportedFormats="PNG, JPG, or WebP"
          maxSize="5MB"
          imageType="organization"
        />
        <p className="text-xs text-muted-foreground">Optional - Add your school or organization logo</p>
      </div>

      {/* Sport */}
      <div className="space-y-3">
        <Label htmlFor="sportCoaching" className="text-base font-medium">Sport *</Label>
        <SportCombobox
          value={data.sportCoaching}
          onValueChange={(value) => onInputChange('sportCoaching', value)}
          placeholder="Select sport"
        />
      </div>

      {/* Division and Conference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="division" className="text-base font-medium">Division *</Label>
          <div className="flex gap-1">
            <Select
              value={data.division}
              onValueChange={(value) => onInputChange('division', value)}
            >
              <SelectTrigger className="h-11 bg-background flex-1">
                <SelectValue placeholder="Select division" />
              </SelectTrigger>
              <SelectContent>
                {DIVISIONS.map(division => (
                  <SelectItem key={division} value={division}>{division}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-9 h-11"></div>
          </div>
        </div>
        <div className="space-y-3">
          <ConferenceSelector
            division={data.division}
            value={data.conference}
            onValueChange={(value) => onInputChange('conference', value)}
            placeholder="Select conference"
            label="Conference"
            labelClassName="text-base font-medium"
            height="h-11"
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <Label htmlFor="country" className="text-base font-medium">Country *</Label>
        <CountryCombobox
          value={data.country || "United States"}
          onValueChange={handleCountryChange}
          placeholder="Select your country"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="city" className="text-base font-medium">City *</Label>
          <Input
            id="city"
            placeholder="e.g., Austin"
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
        {data.country === 'United States' && (
          <div className="space-y-3">
            <Label htmlFor="state" className="text-base font-medium">State *</Label>
            <Select
              value={data.state}
              onValueChange={(value) => onInputChange('state', value)}
            >
              <SelectTrigger className="h-11 bg-background" style={{ height: '2.75rem' }}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Online Presence */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-base font-medium">Online Presence *</Label>
          <p className="text-sm text-muted-foreground">
            Provide at least one of the following to help athletes learn more about your program.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="programWebsite" className="text-sm font-medium">Program Website</Label>
            <Input
              id="programWebsite"
              placeholder="athletics.university.edu/football"
              value={data.programWebsite}
              onChange={(e) => validateAndUpdateField('programWebsite', e.target.value)}
              className={`h-11 bg-background ${validationErrors.programWebsite ? 'border-red-500' : ''}`}
              onBlur={(e) => handleURLBlur('programWebsite', e.target.value)}
            />
            {validationErrors.programWebsite && (
              <p className="text-sm text-red-500">{validationErrors.programWebsite}</p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="schoolWebsite" className="text-sm font-medium">School Website</Label>
            <Input
              id="schoolWebsite"
              placeholder="www.university.edu"
              value={data.schoolWebsite}
              onChange={(e) => validateAndUpdateField('schoolWebsite', e.target.value)}
              className={`h-11 bg-background ${validationErrors.schoolWebsite ? 'border-red-500' : ''}`}
              onBlur={(e) => handleURLBlur('schoolWebsite', e.target.value)}
            />
            {validationErrors.schoolWebsite && (
              <p className="text-sm text-red-500">{validationErrors.schoolWebsite}</p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="orgInstagramHandle" className="text-sm font-medium">Program Instagram</Label>
            <Input
              id="orgInstagramHandle"
              placeholder="@universityfootball"
              value={data.orgInstagramHandle}
              onChange={(e) => validateAndUpdateField('orgInstagramHandle', e.target.value)}
              className={`h-11 bg-background ${validationErrors.orgInstagramHandle ? 'border-red-500' : ''}`}
            />
            {validationErrors.orgInstagramHandle && (
              <p className="text-sm text-red-500">{validationErrors.orgInstagramHandle}</p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="orgTwitterHandle" className="text-sm font-medium">Program Twitter</Label>
            <Input
              id="orgTwitterHandle"
              placeholder="@UniversityFB"
              value={data.orgTwitterHandle}
              onChange={(e) => validateAndUpdateField('orgTwitterHandle', e.target.value)}
              className={`h-11 bg-background ${validationErrors.orgTwitterHandle ? 'border-red-500' : ''}`}
            />
            {validationErrors.orgTwitterHandle && (
              <p className="text-sm text-red-500">{validationErrors.orgTwitterHandle}</p>
            )}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-3">
        <Label htmlFor="personalStatement" className="text-base font-medium">About Yourself *</Label>
        <Textarea
          id="personalStatement"
          placeholder="Tell athletes about yourself, your coaching experience, and what makes your program special. This will be displayed on your profile to help athletes understand your background and coaching philosophy."
          value={data.personalStatement}
          onChange={(e) => validateAndUpdateField('personalStatement', e.target.value)}
          className={`min-h-32 bg-background resize-none ${validationErrors.personalStatement ? 'border-red-500' : ''}`}
          maxLength={FIELD_LIMITS.PERSONAL_STATEMENT}
        />
        {validationErrors.personalStatement && (
          <p className="text-sm text-red-500">{validationErrors.personalStatement}</p>
        )}
        <p className="text-xs text-muted-foreground">{data.personalStatement.length}/{FIELD_LIMITS.PERSONAL_STATEMENT} characters</p>
      </div>

      {/* Recruiting Needs */}
      {data.division !== 'High School' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-medium">Recruiting Needs *</Label>
            <p className="text-sm text-muted-foreground">
              Help athletes understand what you&apos;re looking for. This information will be displayed on your profile.
            </p>
          </div>



          {/* Student Classifications */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Student Classifications Currently Recruiting *</Label>
            <p className="text-sm text-muted-foreground">
              Select the types of students you are actively recruiting.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getStudentClassificationOptions().map(({ value, label }) => (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`recruiting-classification-${value}`}
                    checked={data.recruitingStudentClassifications.includes(value)}
                    onCheckedChange={() => toggleStudentClassification(value)}
                  />
                  <Label htmlFor={`recruiting-classification-${value}`} className="text-sm cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Positions */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Positions Currently Recruiting *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.sportCoaching && getPositionsForSport(data.sportCoaching).map(position => (
                <div key={position} className="flex items-center space-x-2">
                  <Checkbox
                    id={`recruiting-position-${position}`}
                    checked={data.recruitingPositions.includes(position)}
                    onCheckedChange={() => toggleRecruitingPosition(position)}
                  />
                  <Label htmlFor={`recruiting-position-${position}`} className="text-sm cursor-pointer">
                    {position}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Scholarships Available */}
          <div className="space-y-3">
            <Label htmlFor="scholarshipsAvailable" className="text-base font-medium">Scholarships Available (Optional)</Label>
            <Input
              id="scholarshipsAvailable"
              type="number"
              min="0"
              max="100"
              placeholder="e.g., 5"
              value={data.scholarshipsAvailable ?? ''}
              onChange={(e) => validateAndUpdateField('scholarshipsAvailable', e.target.value ? parseInt(e.target.value) : null)}
              className={`h-11 bg-background ${validationErrors.scholarshipsAvailable ? 'border-red-500' : ''}`}
            />
            {validationErrors.scholarshipsAvailable && (
              <p className="text-sm text-red-500">{validationErrors.scholarshipsAvailable}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Number of scholarships or spots available (leave blank if not applicable)
            </p>
          </div>

          {/* Recruiting Philosophy */}
          <div className="space-y-3">
            <Label htmlFor="recruitingPhilosophy" className="text-base font-medium">Recruiting Philosophy *</Label>
            <Textarea
              id="recruitingPhilosophy"
              placeholder="Describe what you look for in student-athletes, your coaching style, and what makes your program unique. This helps athletes understand if they would be a good fit for your program."
              value={data.recruitingPhilosophy}
              onChange={(e) => validateAndUpdateField('recruitingPhilosophy', e.target.value)}
              className={`min-h-24 bg-background resize-none ${validationErrors.recruitingPhilosophy ? 'border-red-500' : ''}`}
              maxLength={FIELD_LIMITS.RECRUITING_PHILOSOPHY}
            />
            {validationErrors.recruitingPhilosophy && (
              <p className="text-sm text-red-500">{validationErrors.recruitingPhilosophy}</p>
            )}
            <p className="text-xs text-muted-foreground">{data.recruitingPhilosophy.length}/{FIELD_LIMITS.RECRUITING_PHILOSOPHY} characters</p>
          </div>
        </div>
      )}
    </>
  );
} 