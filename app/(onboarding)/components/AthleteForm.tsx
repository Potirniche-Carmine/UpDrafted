"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input, SocialInput } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  US_STATES, 
  getPositionsForSport, 
  getSportsList,
  getGraduationYearsForEducationLevel,
  DIVISIONS
} from "@/lib/sports-data";
import { FormValidator, FIELD_LIMITS } from "@/app/(onboarding)/lib/form-validation";
import { OnboardingData } from "../lib/types";
import { EducationLevel } from "../lib/onboarding";
import { ConferenceSelector } from "@/components/ui/conference-selector";
import { SchoolSelector } from "@/components/ui/school-selector";

interface AthleteFormProps {
  data: OnboardingData;
  onInputChange: (field: keyof OnboardingData, value: string | number | string[] | number[] | File | null | boolean) => void;
}

const EDUCATION_LEVEL_OPTIONS = [
  { value: 'high_school', label: 'High School' },
  { value: 'associate', label: 'Community College (Associate)' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'graduate', label: 'Graduate School' },
];

// Filter divisions for athletes (exclude high school since it's handled by education level)
const ATHLETE_DIVISIONS = DIVISIONS.filter(div => div !== 'High School');

const getSchoolLabel = (educationLevel: EducationLevel) => {
  switch (educationLevel) {
    case 'high_school':
      return 'High School';
    case 'associate':
      return 'Community College';
    case 'undergraduate':
    case 'graduate':
      return 'College/University';
    default:
      return 'School';
  }
};

const getMajorLabel = (educationLevel: EducationLevel) => {
  switch (educationLevel) {
    case 'high_school':
      return 'Intended Major';
    case 'associate':
    case 'undergraduate':
    case 'graduate':
      return 'Current Major';
    default:
      return 'Major';
  }
};

const shouldShowStandardizedTests = (educationLevel: EducationLevel) => {
  return educationLevel === 'high_school';
};

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

// Add country list for athlete recruiting
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

// Searchable Combobox Component for Country (same UI as SportCombobox)
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

export default function AthleteForm({ data, onInputChange }: AthleteFormProps) {
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const addSecondarySport = (sport: string) => {
    if (sport && !data.secondarySports.includes(sport) && sport !== data.sport) {
      onInputChange('secondarySports', [...data.secondarySports, sport]);
    }
  };

  const removeSecondarySport = (sport: string) => {
    onInputChange('secondarySports', data.secondarySports.filter(s => s !== sport));
  };

  // Validate field and update errors
  const validateAndUpdateField = (field: keyof OnboardingData, value: string | number | null) => {
    const newErrors = { ...validationErrors };
    let newFullName = data.fullName;
    if (field === 'fullName') {
      newFullName = value as string;
    }
    switch (field) {
      case 'fullName': {
        const nameResult = FormValidator.validateName(value as string, true);
        if (nameResult.isValid) {
          delete newErrors.fullName;
        } else {
          newErrors.fullName = nameResult.error!;
        }
        // Re-validate Hudl and MaxPreps URLs with new name
        if (data.hudlUrl) {
          const hudlResult = FormValidator.validateHudlURL(data.hudlUrl, value as string);
          if (hudlResult.isValid) {
            delete newErrors.hudlUrl;
          } else {
            newErrors.hudlUrl = hudlResult.error!;
          }
        }
        if (data.maxprepsUrl) {
          const maxprepsResult = FormValidator.validateMaxPrepsURL(data.maxprepsUrl, value as string);
          if (maxprepsResult.isValid) {
            delete newErrors.maxprepsUrl;
          } else {
            newErrors.maxprepsUrl = maxprepsResult.error!;
          }
        }
        break;
      }
      case 'organizationName':
        const orgResult = FormValidator.validateText(value as string, getSchoolLabel(data.educationLevel), FIELD_LIMITS.ORGANIZATION_NAME, true);
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
      case 'intendedMajor':
        const majorResult = FormValidator.validateText(value as string, getMajorLabel(data.educationLevel), FIELD_LIMITS.INTENDED_MAJOR, true);
        if (majorResult.isValid) {
          delete newErrors.intendedMajor;
        } else {
          newErrors.intendedMajor = majorResult.error!;
        }
        break;
      case 'weight':
        const weightResult = FormValidator.validateWeight(value as string, true);
        if (weightResult.isValid) {
          delete newErrors.weight;
          // Clean the input to remove "lbs"
          const cleanedWeight = FormValidator.cleanWeightInput(value as string);
          setValidationErrors(newErrors);
          onInputChange('weight', cleanedWeight);
          return; // Early return to avoid double onInputChange call
        } else {
          newErrors.weight = weightResult.error!;
        }
        break;
      case 'gpa':
        const gpaResult = FormValidator.validateGPA(value as number | null);
        if (gpaResult.isValid) {
          delete newErrors.gpa;
        } else {
          newErrors.gpa = gpaResult.error!;
        }
        break;
      case 'satScore':
        const satResult = FormValidator.validateSATScore(value as number | null);
        if (satResult.isValid) {
          delete newErrors.satScore;
        } else {
          newErrors.satScore = satResult.error!;
        }
        break;
      case 'actScore':
        const actResult = FormValidator.validateACTScore(value as number | null);
        if (actResult.isValid) {
          delete newErrors.actScore;
        } else {
          newErrors.actScore = actResult.error!;
        }
        break;
      case 'maxprepsUrl':
        if (value) {
          const maxprepsResult = FormValidator.validateMaxPrepsURL(value as string, newFullName);
          if (maxprepsResult.isValid) {
            delete newErrors.maxprepsUrl;
          } else {
            newErrors.maxprepsUrl = maxprepsResult.error!;
          }
        } else {
          delete newErrors.maxprepsUrl;
        }
        break;
      case 'hudlUrl':
        if (value) {
          // Accept Hudl URLs with or without protocol, and show error if name is missing
          const hudlResult = FormValidator.validateHudlURL(value as string, newFullName);
          if (hudlResult.isValid) {
            delete newErrors.hudlUrl;
          } else {
            newErrors.hudlUrl = hudlResult.error!;
          }
        } else {
          delete newErrors.hudlUrl;
        }
        break;
      case 'instagramHandle':
        if (value) {
          const igResult = FormValidator.validateSocialHandle(value as string, 'instagram');
          if (igResult.isValid) {
            delete newErrors.instagramHandle;
          } else {
            newErrors.instagramHandle = igResult.error!;
          }
        } else {
          delete newErrors.instagramHandle;
        }
        break;
      case 'twitterHandle':
        if (value) {
          const twitterResult = FormValidator.validateSocialHandle(value as string, 'twitter');
          if (twitterResult.isValid) {
            delete newErrors.twitterHandle;
          } else {
            newErrors.twitterHandle = twitterResult.error!;
          }
        } else {
          delete newErrors.twitterHandle;
        }
        break;
      case 'graduationYear':
        const graduationResult = FormValidator.validateGraduationYear(value as number, data.educationLevel);
        if (graduationResult.isValid) {
          delete newErrors.graduationYear;
        } else {
          newErrors.graduationYear = graduationResult.error!;
        }
        break;
      case 'personalStatement':
        const statementResult = FormValidator.validateText(value as string, 'Personal statement', FIELD_LIMITS.PERSONAL_STATEMENT, true);
        if (statementResult.isValid) {
          delete newErrors.personalStatement;
        } else {
          newErrors.personalStatement = statementResult.error!;
        }
        break;
    }
    
    setValidationErrors(newErrors);
    onInputChange(field, value);
  };

  // Clear state if country is changed to something other than United States
  const handleCountryChange = (value: string) => {
    onInputChange('country', value);
    if (value !== 'United States' && data.state) {
      onInputChange('state', '');
    }
  };

  return (
    <div className="space-y-8">
      {/* Education Level Selection - Moved to be always visible */}
      <div className="space-y-3">
        <Label htmlFor="educationLevel" className="text-base font-medium">Education Level *</Label>
        <Select value={data.educationLevel} onValueChange={(value) => {
          const newEducationLevel = value as EducationLevel;
          onInputChange('educationLevel', newEducationLevel);
          
          // Re-validate HUDL URL when education level changes (may become required/optional)
          // We need to check the new education level, not the old one
          const newErrors = { ...validationErrors };
          const isHighSchool = newEducationLevel === 'high_school';
          
          if (isHighSchool && !data.hudlUrl?.trim()) {
            newErrors.hudlUrl = 'Hudl URL is required for high school athletes';
          } else {
            delete newErrors.hudlUrl;
          }
          
          // Re-validate graduation year when education level changes
          if (data.graduationYear) {
            const graduationResult = FormValidator.validateGraduationYear(data.graduationYear, newEducationLevel);
            if (graduationResult.isValid) {
              delete newErrors.graduationYear;
            } else {
              newErrors.graduationYear = graduationResult.error!;
            }
          }
          
          setValidationErrors(newErrors);
        }}>
          <SelectTrigger className="!h-11 w-full bg-background">
            <SelectValue placeholder="Are you a high school or college athlete?" />
          </SelectTrigger>
          <SelectContent>
            {EDUCATION_LEVEL_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          This helps us customize your profile and determine requirements like HUDL.
        </p>
      </div>



      {/* Primary Sport Selection */}
      <div className="space-y-3">
        <Label htmlFor="sport" className="text-base font-medium">Primary Sport *</Label>
        <SportCombobox
          value={data.sport}
          onValueChange={(value) => onInputChange('sport', value)}
          placeholder="Select your primary sport"
        />
      </div>

      {/* Secondary Sports */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Secondary Sports</Label>
        <div className="space-y-3">
          <SportCombobox
            value=""
            onValueChange={addSecondarySport}
            placeholder="Add secondary sport (optional)"
            excludeSports={[data.sport, ...data.secondarySports].filter(Boolean)}
          />
          {data.secondarySports.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.secondarySports.map(sport => (
                <Badge key={sport} variant="secondary" className="flex items-center gap-1">
                  {sport}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeSecondarySport(sport)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Positions based on selected sport */}
      {data.sport && (
        <div className="space-y-3">
          <Label className="text-base font-medium">Positions *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {getPositionsForSport(data.sport).map(position => (
              <div key={position} className="flex items-center space-x-2">
                <Checkbox
                  id={position}
                  checked={data.positions.includes(position)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onInputChange('positions', [...data.positions, position]);
                    } else {
                      onInputChange('positions', data.positions.filter(p => p !== position));
                    }
                  }}
                />
                <label htmlFor={position} className="text-sm cursor-pointer">{position}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Division and Conference - Show for college athletes only (not high school) */}
      {data.educationLevel !== 'high_school' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="division" className="text-base font-medium">Division *</Label>
            <Select value={data.division} onValueChange={(value) => onInputChange('division', value)}>
              <SelectTrigger className="!h-11 bg-background border-input w-full">
                <SelectValue placeholder="Select your division" />
              </SelectTrigger>
              <SelectContent>
                {ATHLETE_DIVISIONS.map(division => (
                  <SelectItem key={division} value={division}>{division}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This helps coaches and recruiters understand your athletic background
            </p>
          </div>

          <div className="space-y-3">
            <ConferenceSelector
              division={data.division}
              value={data.conference}
              onValueChange={(value) => onInputChange('conference', value)}
              placeholder="Select conference"
              label="Conference"
              labelClassName="text-base font-medium"
              description="Choose your athletic conference for better recruiting visibility"
              height="h-11"
            />
          </div>
        </div>
      )}

      {/* School and Location Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <SchoolSelector
            value={data.organizationName}
            onValueChange={(value) => validateAndUpdateField('organizationName', value)}
            placeholder={`Start typing ${getSchoolLabel(data.educationLevel).toLowerCase()}...`}
            label={getSchoolLabel(data.educationLevel)}
            required={true}
            labelClassName="text-base font-medium"
            description="Start typing to search - if your school isn't found, just type the full name"
            educationLevel={data.educationLevel}
          />
          {validationErrors.organizationName && (
            <p className="text-sm text-red-500">{validationErrors.organizationName}</p>
          )}
        </div>
        <div className="space-y-3">
          <Label htmlFor="intendedMajor" className="text-base font-medium">{getMajorLabel(data.educationLevel)} *</Label>
          <Input
            id="intendedMajor"
            placeholder="e.g., Business Administration"
            value={data.intendedMajor}
            onChange={(e) => validateAndUpdateField('intendedMajor', e.target.value)}
            className={`h-11 bg-background ${validationErrors.intendedMajor ? 'border-red-500' : ''}`}
            maxLength={FIELD_LIMITS.INTENDED_MAJOR}
          />
          {validationErrors.intendedMajor && (
            <p className="text-sm text-red-500">{validationErrors.intendedMajor}</p>
          )}
          <p className="text-xs text-muted-foreground">{data.intendedMajor.length}/{FIELD_LIMITS.INTENDED_MAJOR} characters</p>
        </div>
      </div>

      {/* Move Country field above City and State */}
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
        {data.country === 'United States' && (
          <div className="space-y-3">
            <Label htmlFor="state" className="text-base font-medium">State *</Label>
            <Select value={data.state} onValueChange={(value) => onInputChange('state', value)}>
              <SelectTrigger className="!h-11 bg-background border-input w-full">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <Label className="text-base font-medium">Height *</Label>
          <div className="flex gap-1.5">
            <Select value={data.heightFeet} onValueChange={(value) => onInputChange('heightFeet', value)}>
              <SelectTrigger className="!h-11 bg-background w-full">
                <SelectValue placeholder="Feet" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => i + 4).map(feet => (
                  <SelectItem key={feet} value={feet.toString()}>{feet}&apos;</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={data.heightInches} onValueChange={(value) => onInputChange('heightInches', value)}>
              <SelectTrigger className="!h-11 bg-background w-full">
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
        <div className="space-y-3">
          <Label htmlFor="weight" className="text-base font-medium">Weight *</Label>
          <Input
            id="weight"
            placeholder="185"
            value={data.weight}
            onChange={(e) => validateAndUpdateField('weight', e.target.value)}
            className={`h-11 bg-background ${validationErrors.weight ? 'border-red-500' : ''}`}
          />
          {validationErrors.weight && (
            <p className="text-sm text-red-500">{validationErrors.weight}</p>
          )}
          <p className="text-xs text-muted-foreground">Enter weight in pounds (e.g., 185)</p>
        </div>
        <div className="space-y-3">
          <Label htmlFor="gender" className="text-base font-medium">Gender</Label>
          <Select value={data.gender} onValueChange={(value) => onInputChange('gender', value)}>
            <SelectTrigger className="!h-11 bg-background w-full">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Academic Information with conditional SAT/ACT */}
      <div className={`grid grid-cols-1 md:grid-cols-${shouldShowStandardizedTests(data.educationLevel) ? '4' : '2'} gap-6`}>
        <div className="space-y-3">
          <Label htmlFor="graduationYear" className="text-base font-medium">Graduation Year *</Label>
          <Select value={data.graduationYear?.toString() || ''} onValueChange={(value) => validateAndUpdateField('graduationYear', parseInt(value))}>
            <SelectTrigger className={`!h-11 bg-background w-full ${validationErrors.graduationYear ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {getGraduationYearsForEducationLevel(data.educationLevel).map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.graduationYear && (
            <p className="text-sm text-red-500">{validationErrors.graduationYear}</p>
          )}
          {data.educationLevel === 'high_school' ? (
            <p className="text-xs text-muted-foreground">
              ⚠️ Only Juniors and above can sign up to connect with coaches and recruiters
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Expected {data.educationLevel === 'graduate' ? 'graduation' : 'completion'} year
            </p>
          )}
        </div>
        <div className="space-y-3">
          <Label htmlFor="gpa" className="text-base font-medium">GPA</Label>
          <Input
            id="gpa"
            type="number"
            step="0.01"
            min="0"
            max="5.0"
            placeholder="3.85"
            value={data.gpa || ''}
            onChange={(e) => validateAndUpdateField('gpa', e.target.value ? parseFloat(e.target.value) : null)}
            className={`h-11 bg-background ${validationErrors.gpa ? 'border-red-500' : ''}`}
          />
          {validationErrors.gpa && (
            <p className="text-sm text-red-500">{validationErrors.gpa}</p>
          )}
          <p className="text-xs text-muted-foreground">Max 5.0</p>
        </div>
        
        {/* SAT and ACT scores - only show for high school students */}
        {shouldShowStandardizedTests(data.educationLevel) && (
          <>
            <div className="space-y-3">
              <Label htmlFor="satScore" className="text-base font-medium">SAT Score</Label>
              <Input
                id="satScore"
                type="number"
                min="400"
                max="1600"
                placeholder="1320"
                value={data.satScore || ''}
                onChange={(e) => validateAndUpdateField('satScore', e.target.value ? parseInt(e.target.value) : null)}
                className={`h-11 bg-background ${validationErrors.satScore ? 'border-red-500' : ''}`}
              />
              {validationErrors.satScore && (
                <p className="text-sm text-red-500">{validationErrors.satScore}</p>
              )}
              <p className="text-xs text-muted-foreground">400-1600</p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="actScore" className="text-base font-medium">ACT Score</Label>
              <Input
                id="actScore"
                type="number"
                min="1"
                max="36"
                placeholder="28"
                value={data.actScore || ''}
                onChange={(e) => validateAndUpdateField('actScore', e.target.value ? parseInt(e.target.value) : null)}
                className={`h-11 bg-background ${validationErrors.actScore ? 'border-red-500' : ''}`}
              />
              {validationErrors.actScore && (
                <p className="text-sm text-red-500">{validationErrors.actScore}</p>
              )}
              <p className="text-xs text-muted-foreground">1-36</p>
            </div>
          </>
        )}
      </div>
      
      {/* Updated requirement text based on education level */}
      {shouldShowStandardizedTests(data.educationLevel) ? (
        <p className="text-sm text-muted-foreground">* Provide at least one: GPA, SAT, or ACT score</p>
      ) : (
        <p className="text-sm text-muted-foreground">* GPA recommended for college students</p>
      )}

      <div className="space-y-3">
        <Label htmlFor="maxprepsUrl" className="text-base font-medium">MaxPreps Profile URL</Label>
        <Input
          id="maxprepsUrl"
          placeholder={data.fullName ? `maxpreps.com/athletes/${data.fullName.toLowerCase().replace(/\s+/g, '-')}` : "maxpreps.com/athletes/your-name"}
          value={data.maxprepsUrl}
          onChange={(e) => validateAndUpdateField('maxprepsUrl', e.target.value)}
          className={`h-11 bg-background ${validationErrors.maxprepsUrl ? 'border-red-500' : ''}`}
          maxLength={FIELD_LIMITS.URL}
        />
        {validationErrors.maxprepsUrl && (
          <p className="text-sm text-red-500">{validationErrors.maxprepsUrl}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="hudlUrl" className="text-base font-medium">
          Hudl Profile URL
        </Label>
        <Input
          id="hudlUrl"
          placeholder={data.fullName ? `hudl.com/profile/${data.fullName.toLowerCase().replace(/\s+/g, '-')}` : "hudl.com/profile/your-name"}
          value={data.hudlUrl}
          onChange={(e) => validateAndUpdateField('hudlUrl', e.target.value)}
          className={`h-11 bg-background ${validationErrors.hudlUrl ? 'border-red-500' : ''}`}
          maxLength={FIELD_LIMITS.URL}
        />
        {validationErrors.hudlUrl && (
          <p className="text-sm text-red-500">{validationErrors.hudlUrl}</p>
        )}
        {data.educationLevel === 'high_school' ? (
          <p className="text-sm text-muted-foreground">
        Optional for high school athletes. Your Hudl URL must contain your name (e.g., hudl.com/profile/{data.fullName ? data.fullName.toLowerCase().replace(/\s+/g, '-') : 'your-name'}). 
        Successfully providing this will automatically verify your profile.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
        Optional for college athletes. Your Hudl URL should contain your name (e.g., hudl.com/profile/{data.fullName ? data.fullName.toLowerCase().replace(/\s+/g, '-') : 'your-name'}). 
        Showcase your game footage to professional scouts and recruiters.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="instagramHandle" className="text-base font-medium">Instagram Handle</Label>
          <SocialInput
            id="instagramHandle"
            placeholder="yourusername"
            value={data.instagramHandle}
            onChange={(e) => validateAndUpdateField('instagramHandle', e.target.value)}
            className={`h-11 bg-background ${validationErrors.instagramHandle ? 'border-red-500' : ''}`}
            maxLength={30} // 30 chars (username only)
          />
          {validationErrors.instagramHandle && (
            <p className="text-sm text-red-500">{validationErrors.instagramHandle}</p>
          )}
        </div>
        <div className="space-y-3">
          <Label htmlFor="twitterHandle" className="text-base font-medium">Twitter Handle</Label>
          <SocialInput
            id="twitterHandle"
            placeholder="yourusername"
            value={data.twitterHandle}
            onChange={(e) => validateAndUpdateField('twitterHandle', e.target.value)}
            className={`h-11 bg-background ${validationErrors.twitterHandle ? 'border-red-500' : ''}`}
            maxLength={15} // 15 chars (username only)
          />
          {validationErrors.twitterHandle && (
            <p className="text-sm text-red-500">{validationErrors.twitterHandle}</p>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">We highly encourage adding at least one social media handle to help coaches learn more about you</p>

      <div className="space-y-3">
        <Label htmlFor="personalStatement" className="text-base font-medium">Personal Statement *</Label>
        <Textarea
          id="personalStatement"
          placeholder="Tell coaches about yourself, your goals, athletic achievements, and what makes you unique..."
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
    </div>
  );
} 