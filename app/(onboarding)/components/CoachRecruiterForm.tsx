"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DIVISIONS,
  US_STATES, 
  GRADUATION_YEARS, 
  getPositionsForSport, 
  getSportsList 
} from "@/lib/sports-data";
import { OnboardingData } from "../components/types";

interface CoachRecruiterFormProps {
  data: OnboardingData;
  onInputChange: (field: keyof OnboardingData, value: string | number | string[] | number[] | File | null | boolean) => void;
}

export default function CoachRecruiterForm({ data, onInputChange }: CoachRecruiterFormProps) {
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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="title" className="text-base font-medium">Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Head Coach, Recruiting Coordinator"
            value={data.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            className="h-11 bg-background"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="organizationName" className="text-base font-medium">School/Organization *</Label>
          <Input
            id="organizationName"
            placeholder="e.g., University of Texas"
            value={data.organizationName}
            onChange={(e) => onInputChange('organizationName', e.target.value)}
            className="h-11 bg-background"
          />
        </div>
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
        <div className="space-y-3">
          <Label htmlFor="conference" className="text-base font-medium">Conference</Label>
          <Input
            id="conference"
            placeholder="e.g., Big 12"
            value={data.conference}
            onChange={(e) => onInputChange('conference', e.target.value)}
            className="h-11 bg-background"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="programWebsite" className="text-base font-medium">Program Website</Label>
          <Input
            id="programWebsite"
            placeholder="https://..."
            value={data.programWebsite}
            onChange={(e) => onInputChange('programWebsite', e.target.value)}
            className="h-11 bg-background"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="schoolWebsite" className="text-base font-medium">School Website</Label>
          <Input
            id="schoolWebsite"
            placeholder="https://..."
            value={data.schoolWebsite}
            onChange={(e) => onInputChange('schoolWebsite', e.target.value)}
            className="h-11 bg-background"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="orgInstagramHandle" className="text-base font-medium">Program Instagram</Label>
          <Input
            id="orgInstagramHandle"
            placeholder="@programname"
            value={data.orgInstagramHandle}
            onChange={(e) => onInputChange('orgInstagramHandle', e.target.value)}
            className="h-11 bg-background"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="orgTwitterHandle" className="text-base font-medium">Program Twitter</Label>
          <Input
            id="orgTwitterHandle"
            placeholder="@programname"
            value={data.orgTwitterHandle}
            onChange={(e) => onInputChange('orgTwitterHandle', e.target.value)}
            className="h-11 bg-background"
          />
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
          onChange={(e) => onInputChange('recruitingPhilosophy', e.target.value)}
          className="resize-none bg-background"
        />
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
            placeholder="Number of scholarships"
            value={data.scholarshipsAvailable || ''}
            onChange={(e) => onInputChange('scholarshipsAvailable', e.target.value ? parseInt(e.target.value) : null)}
            className="h-11 bg-background"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="whatLookingFor" className="text-base font-medium">What You&apos;re Looking For *</Label>
          <Textarea
            id="whatLookingFor"
            placeholder="Describe the type of athletes you're looking for, their characteristics, playing style, academic requirements, etc..."
            rows={3}
            value={data.whatLookingFor}
            onChange={(e) => onInputChange('whatLookingFor', e.target.value)}
            className="resize-none bg-background"
          />
        </div>
      </div>
    </>
  );
} 