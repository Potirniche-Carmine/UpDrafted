"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { 
  US_STATES, 
  GRADUATION_YEARS, 
  getPositionsForSport, 
  getSportsList 
} from "@/lib/sports-data";
import { FormValidator, FIELD_LIMITS } from "@/lib/form-validation";
import { OnboardingData } from "../components/types";

interface AthleteFormProps {
  data: OnboardingData;
  onInputChange: (field: keyof OnboardingData, value: string | number | string[] | number[] | File | null | boolean) => void;
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
    
    switch (field) {
      case 'fullName':
        const nameResult = FormValidator.validateName(value as string, true);
        if (nameResult.isValid) {
          delete newErrors.fullName;
        } else {
          newErrors.fullName = nameResult.error!;
        }
        break;
      case 'highSchool':
        const hsResult = FormValidator.validateText(value as string, 'High school', FIELD_LIMITS.HIGH_SCHOOL, true);
        if (hsResult.isValid) {
          delete newErrors.highSchool;
        } else {
          newErrors.highSchool = hsResult.error!;
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
        const majorResult = FormValidator.validateText(value as string, 'Intended major', FIELD_LIMITS.INTENDED_MAJOR, true);
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
          const maxprepsResult = FormValidator.validateURL(value as string, 'maxpreps');
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
          const hudlResult = FormValidator.validateURL(value as string, 'hudl');
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

  return (
    <>
      <div className="space-y-3">
        <Label htmlFor="sport" className="text-base font-medium">Primary Sport *</Label>
        <Select value={data.sport} onValueChange={(value) => onInputChange('sport', value)}>
          <SelectTrigger className="h-11 bg-background w-full" style={{ height: '2.75rem' }}>
            <SelectValue placeholder="Select your primary sport" />
          </SelectTrigger>
          <SelectContent>
            {getSportsList().map(sport => (
              <SelectItem key={sport} value={sport}>{sport}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Secondary Sports */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Secondary Sports</Label>
        <div className="space-y-3">
          <Select onValueChange={addSecondarySport}>
            <SelectTrigger className="h-11 bg-background w-full" style={{ height: '2.75rem' }}>
              <SelectValue placeholder="Add secondary sport (optional)" />
            </SelectTrigger>
            <SelectContent>
              {getSportsList().filter(sport => sport !== data.sport && !data.secondarySports.includes(sport)).map(sport => (
                <SelectItem key={sport} value={sport}>{sport}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="highSchool" className="text-base font-medium">High School *</Label>
          <Input
            id="highSchool"
            placeholder="Your high school name"
            value={data.highSchool}
            onChange={(e) => validateAndUpdateField('highSchool', e.target.value)}
            className={`h-11 bg-background ${validationErrors.highSchool ? 'border-red-500' : ''}`}
            maxLength={FIELD_LIMITS.HIGH_SCHOOL}
          />
          {validationErrors.highSchool && (
            <p className="text-sm text-red-500">{validationErrors.highSchool}</p>
          )}
          <p className="text-xs text-muted-foreground">{data.highSchool.length}/{FIELD_LIMITS.HIGH_SCHOOL} characters</p>
        </div>
        <div className="space-y-3">
          <Label htmlFor="intendedMajor" className="text-base font-medium">Intended Major *</Label>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-3">
          <Label className="text-base font-medium">Height *</Label>
          <div className="flex gap-1.5">
            <Select value={data.heightFeet} onValueChange={(value) => onInputChange('heightFeet', value)}>
              <SelectTrigger className="h-11 bg-background w-full" style={{ height: '2.75rem' }}>
                <SelectValue placeholder="Feet" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => i + 4).map(feet => (
                  <SelectItem key={feet} value={feet.toString()}>{feet}&apos;</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={data.heightInches} onValueChange={(value) => onInputChange('heightInches', value)}>
              <SelectTrigger className="h-11 bg-background w-full" style={{ height: '2.75rem' }}>
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
            <SelectTrigger className="h-11 bg-background w-full" style={{ height: '2.75rem' }}>
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-3">
          <Label htmlFor="graduationYear" className="text-base font-medium">Graduation Year *</Label>
          <Select value={data.graduationYear?.toString() || ''} onValueChange={(value) => onInputChange('graduationYear', parseInt(value))}>
            <SelectTrigger className="h-11 bg-background w-full" style={{ height: '2.75rem' }}>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {GRADUATION_YEARS.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      </div>
      <p className="text-sm text-muted-foreground">* Provide at least one: GPA, SAT, or ACT score</p>

      <div className="space-y-3">
        <Label htmlFor="maxprepsUrl" className="text-base font-medium">MaxPreps Profile URL</Label>
        <Input
          id="maxprepsUrl"
          placeholder="https://www.maxpreps.com/athlete/..."
          value={data.maxprepsUrl}
          onChange={(e) => validateAndUpdateField('maxprepsUrl', e.target.value)}
          className={`h-11 bg-background ${validationErrors.maxprepsUrl ? 'border-red-500' : ''}`}
          maxLength={FIELD_LIMITS.URL}
        />
        {validationErrors.maxprepsUrl && (
          <p className="text-sm text-red-500">{validationErrors.maxprepsUrl}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Optional but highly recommended. If your MaxPreps profile name matches your profile name, you&apos;ll receive a verified athlete badge.
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="hudlUrl" className="text-base font-medium">Hudl Profile URL</Label>
        <Input
          id="hudlUrl"
          placeholder="https://www.hudl.com/profile/..."
          value={data.hudlUrl}
          onChange={(e) => validateAndUpdateField('hudlUrl', e.target.value)}
          className={`h-11 bg-background ${validationErrors.hudlUrl ? 'border-red-500' : ''}`}
          maxLength={FIELD_LIMITS.URL}
        />
        {validationErrors.hudlUrl && (
          <p className="text-sm text-red-500">{validationErrors.hudlUrl}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="instagramHandle" className="text-base font-medium">Instagram Handle</Label>
          <Input
            id="instagramHandle"
            placeholder="@yourusername"
            value={data.instagramHandle}
            onChange={(e) => validateAndUpdateField('instagramHandle', e.target.value)}
            className={`h-11 bg-background ${validationErrors.instagramHandle ? 'border-red-500' : ''}`}
            maxLength={31} // 30 chars + @ symbol
          />
          {validationErrors.instagramHandle && (
            <p className="text-sm text-red-500">{validationErrors.instagramHandle}</p>
          )}
        </div>
        <div className="space-y-3">
          <Label htmlFor="twitterHandle" className="text-base font-medium">Twitter Handle</Label>
          <Input
            id="twitterHandle"
            placeholder="@yourusername"
            value={data.twitterHandle}
            onChange={(e) => validateAndUpdateField('twitterHandle', e.target.value)}
            className={`h-11 bg-background ${validationErrors.twitterHandle ? 'border-red-500' : ''}`}
            maxLength={16} // 15 chars + @ symbol
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
    </>
  );
} 