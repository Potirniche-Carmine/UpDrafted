"use client";

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
import { OnboardingData } from "../onboarding/types";

interface AthleteFormProps {
  data: OnboardingData;
  onInputChange: (field: keyof OnboardingData, value: string | number | string[] | number[] | File | null | boolean) => void;
}

export default function AthleteForm({ data, onInputChange }: AthleteFormProps) {
  const addSecondarySport = (sport: string) => {
    if (sport && !data.secondarySports.includes(sport) && sport !== data.sport) {
      onInputChange('secondarySports', [...data.secondarySports, sport]);
    }
  };

  const removeSecondarySport = (sport: string) => {
    onInputChange('secondarySports', data.secondarySports.filter(s => s !== sport));
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
            onChange={(e) => onInputChange('highSchool', e.target.value)}
            className="h-11 bg-background"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="intendedMajor" className="text-base font-medium">Intended Major *</Label>
          <Input
            id="intendedMajor"
            placeholder="e.g., Business Administration"
            value={data.intendedMajor}
            onChange={(e) => onInputChange('intendedMajor', e.target.value)}
            className="h-11 bg-background"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="city" className="text-base font-medium">City *</Label>
          <Input
            id="city"
            placeholder="Your city"
            value={data.city}
            onChange={(e) => onInputChange('city', e.target.value)}
            className="h-11 bg-background"
          />
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
            placeholder="185 lbs"
            value={data.weight}
            onChange={(e) => onInputChange('weight', e.target.value)}
            className="h-11 bg-background"
          />
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
            placeholder="3.85"
            value={data.gpa || ''}
            onChange={(e) => onInputChange('gpa', e.target.value ? parseFloat(e.target.value) : null)}
            className="h-11 bg-background"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="satScore" className="text-base font-medium">SAT Score</Label>
          <Input
            id="satScore"
            type="number"
            placeholder="1320"
            value={data.satScore || ''}
            onChange={(e) => onInputChange('satScore', e.target.value ? parseInt(e.target.value) : null)}
            className="h-11 bg-background"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="actScore" className="text-base font-medium">ACT Score</Label>
          <Input
            id="actScore"
            type="number"
            placeholder="28"
            value={data.actScore || ''}
            onChange={(e) => onInputChange('actScore', e.target.value ? parseInt(e.target.value) : null)}
            className="h-11 bg-background"
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">* Provide at least one: GPA, SAT, or ACT score</p>

      <div className="space-y-3">
        <Label htmlFor="maxprepsUrl" className="text-base font-medium">MaxPreps Profile URL</Label>
        <Input
          id="maxprepsUrl"
          placeholder="https://www.maxpreps.com/athlete/..."
          value={data.maxprepsUrl}
          onChange={(e) => onInputChange('maxprepsUrl', e.target.value)}
          className="h-11 bg-background"
        />
        <p className="text-sm text-muted-foreground">
          Adding this helps verify your athletic status and can lead to verified athlete badge
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="hudlUrl" className="text-base font-medium">Hudl Profile URL</Label>
        <Input
          id="hudlUrl"
          placeholder="https://www.hudl.com/profile/..."
          value={data.hudlUrl}
          onChange={(e) => onInputChange('hudlUrl', e.target.value)}
          className="h-11 bg-background"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="instagramHandle" className="text-base font-medium">Instagram Handle</Label>
          <Input
            id="instagramHandle"
            placeholder="@yourusername"
            value={data.instagramHandle}
            onChange={(e) => onInputChange('instagramHandle', e.target.value)}
            className="h-11 bg-background"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="twitterHandle" className="text-base font-medium">Twitter Handle</Label>
          <Input
            id="twitterHandle"
            placeholder="@yourusername"
            value={data.twitterHandle}
            onChange={(e) => onInputChange('twitterHandle', e.target.value)}
            className="h-11 bg-background"
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">* Provide at least one social media handle</p>

      <div className="space-y-3">
        <Label htmlFor="personalStatement" className="text-base font-medium">Personal Statement *</Label>
        <Textarea
          id="personalStatement"
          placeholder="Tell coaches about yourself, your goals, athletic achievements, and what makes you unique..."
          rows={4}
          value={data.personalStatement}
          onChange={(e) => onInputChange('personalStatement', e.target.value)}
          className="resize-none bg-background"
        />
      </div>
    </>
  );
} 