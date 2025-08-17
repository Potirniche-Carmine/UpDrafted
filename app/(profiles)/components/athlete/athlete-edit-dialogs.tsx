"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Save, X, Plus, Shield, CalendarIcon } from "lucide-react";
import { getSportsList, US_STATES, GRADUATION_YEARS, getPositionsForSport, getMeasurablesForSport, DIVISIONS } from '@/lib/sports-data';
import { EducationLevel } from '@/app/(onboarding)/lib/onboarding';
import { sanitizeProfileData } from '@/utils/sanitization';
import { FileUpload } from '@/components/ui/file-upload';
import { useRoleView } from '@/hooks/use-role-view';
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ConferenceSelector } from "@/components/ui/conference-selector";
import { SchoolSelector } from "@/components/ui/school-selector";
import { divisionHasConferences } from "@/lib/conference-data";
import { 
  generateCampDateOptions, 
  isoStringToDate,
  formatDateRange,
  toTitleCase,
  type CampDateOption,
  PRESENT_DATE,
  isPresentDate,
  formatCampDate,
  parseDateRange
} from '@/lib/date-utils';
import { cn } from "@/lib/utils";

// Import field validation
const FIELD_LIMITS = {
  FULL_NAME: 50,
  ORGANIZATION_NAME: 50,
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

// Filter divisions for athletes (exclude high school since it's handled by education level)
const ATHLETE_DIVISIONS = DIVISIONS.filter(div => div !== 'High School');

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

// Use the new date utilities for camp experience options
const CAMP_DATE_OPTIONS = generateCampDateOptions();

// Add constant for video limit
const VIDEO_LIMIT = 2;

// Add countries list for country select (same as onboarding forms)
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

// DatePicker component for camp experience dates
interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

function DatePicker({ date, onDateChange, placeholder, disabled, className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatCampDate(date) : placeholder}
        </Button>
      </PopoverTrigger>
             <PopoverContent className="w-auto p-0 z-[9999]" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          disabled={(date) => {
            // Disable dates more than 10 years in the past
            const tenYearsAgo = new Date();
            tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
            return date < tenYearsAgo;
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

// Present date picker component
interface PresentDatePickerProps {
  isPresent: boolean;
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  onPresentChange: (isPresent: boolean) => void;
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

function PresentDatePicker({ 
  isPresent, 
  date, 
  onDateChange, 
  onPresentChange, 
  placeholder, 
  disabled, 
  className 
}: PresentDatePickerProps) {
  return (
    <div className="space-y-2">
      <DatePicker
        date={date}
        onDateChange={onDateChange}
        placeholder={placeholder}
        disabled={disabled || isPresent}
        className={className}
      />
      <div className="flex items-center space-x-2">
        <Checkbox
          id="present-checkbox"
          checked={isPresent}
          onCheckedChange={(checked) => {
            onPresentChange(checked as boolean);
            if (checked) {
              onDateChange(undefined);
            }
          }}
          disabled={disabled}
        />
        <Label htmlFor="present-checkbox" className="text-sm font-bold">
          Present (ongoing)
        </Label>
      </div>
    </div>
  );
}

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
  division?: string;
  conference?: string;
  organizationName: string;
  city: string;
  state: string;
  country?: string;
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
  sports247Url?: string;
  espnUrl?: string;
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
      campExperience?: Array<{
      id?: number; // Database ID for existing experiences
      type: 'Camp' | 'Club',
      name: string,
      city: string;
      state: string;
      country: string;
      startDate: Date | string;
      endDate: Date | string; // Uses special date for "Present"
      sport: string,
      description: string
    }>;
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

// Add mockCampExperience at the top of the file for use in the dialog - COMMENTED OUT FOR TESTING EMPTY STATE
// const mockCampExperience: Array<{
//   type: 'Camp' | 'Club';
//   name: string;
//   city: string;
//   stateCountry: string;
//   startDate: string;
//   endDate: string;
//   sport: string;
//   description: string;
// }> = [
//   {
//     type: "Camp" as 'Camp',
//     name: "Nike Elite Football Camp",
//     city: "Dallas",
//     stateCountry: "TX",
//     startDate: "June 2023",
//     endDate: "June 2023",
//     sport: "Football",
//     description: "Participated in advanced skills training and scrimmages with top high school athletes. Selected for All-Star team.",
//   },
//   {
//     type: "Club" as 'Club',
//     name: "Dallas Select 7v7",
//     city: "Dallas",
//     stateCountry: "TX",
//     startDate: "Spring 2022",
//     endDate: "Summer 2023",
//     sport: "Flag Football",
//     description: "Starting Wide Receiver. Helped team reach state semifinals."
//   },
//   {
//     type: "Camp" as 'Camp',
//     name: "Adidas National Soccer Showcase",
//     city: "Houston",
//     stateCountry: "TX",
//     startDate: "July 2022",
//     endDate: "July 2022",
//     sport: "Soccer",
//     description: "Trained with top coaches and played in showcase matches."
//   }
// ];

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
  const [isUploading, setIsUploading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Add state for camp/club experience editing
  const [tempCampExperience, setTempCampExperience] = useState<Array<{
    id?: number; // Database ID for existing experiences
    type: 'Camp' | 'Club',
    name: string,
    city: string,
    state: string,
    country: string,
    startDate: Date,
    endDate: Date, // Uses special date for "Present"
    sport: string,
    description: string
  }>>([]);
  const [campEditIndex, setCampEditIndex] = useState<number | null>(null);
  const [campForm, setCampForm] = useState({
    type: 'Camp' as 'Camp' | 'Club',
    name: '',
    city: '',
    state: '',
    country: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    sport: '',
    description: ''
  });
  const [campEndDateIsPresent, setCampEndDateIsPresent] = useState(false);
  const [campFormError, setCampFormError] = useState<string | null>(null);

  // Ref for the add/edit form


  // Get admin role information for demo profile uploads
  const { isAdmin, viewingAs } = useRoleView();

  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: "warning" | "danger" | "info" | "success";
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    variant: "warning",
    onConfirm: () => {}
  });

  // Initialize tempVideos when dialog opens
  useEffect(() => {
    if (dialogType === 'video-highlights') {
      setTempVideos(profileData.youtubeVideos || []);
    }
  }, [dialogType, profileData.youtubeVideos]);



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
    if (!dialogType) {
      // Clean up state immediately when dialog is closed
      setProfileImagePreview(null);
      setSelectedProfileFile(null);
      setValidationErrors({});
      setTempVideos([]); // Clear temp videos when dialog closes
      return;
    }

    // Prevent auto-focus on dialog open
    if (document.activeElement && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    switch (dialogType) {
      case 'basic-info':
        const heightParts = profileData.height.match(/(\d+)'(\d+)"/);
        setEditData({
          fullName: profileData.fullName,
          sport: profileData.sport,
          secondarySports: profileData.secondarySports || [],
          educationLevel: profileData.educationLevel,
          division: profileData.division || '',
          conference: profileData.conference || '',
          city: profileData.city,
          state: profileData.state,
          // Add country to editData initialization
          country: profileData.country || '',
          organizationName: profileData.organizationName,
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
        // SECURITY: Prevent editing MaxPreps URL for verified users
        if (profileData.isVerified && profileData.maxPrepsUrl) {
          return; // Don't initialize edit data for verified users
        }
        setEditData({
          maxPrepsUrl: profileData.maxPrepsUrl || ''
        });
        break;
      case 'sports247-verification':
        setEditData({
          sports247Url: profileData.sports247Url || ''
        });
        break;
      case 'espn-verification':
        setEditData({
          espnUrl: profileData.espnUrl || ''
        });
        break;
      case 'hudl-highlights':
        setEditData({
          hudlUrl: profileData.hudlUrl || ''
        });
        break;
      case 'measurable':
      case 'edit-measurable':
      case 'measurables':
      case 'edit-measurables':
      case 'add-measurables':
        if (measurableToEdit) {
          const dateParts = measurableToEdit.measurementDate.split('-');
          setEditData({
            sport: measurableToEdit.sport,
            label: measurableToEdit.label,
            value: measurableToEdit.value,
            month: dateParts[1] || '',
            year: dateParts[0] || '',
            isCustom: !getMeasurablesForSport(measurableToEdit.sport).includes(measurableToEdit.label),
            customLabel: !getMeasurablesForSport(measurableToEdit.sport).includes(measurableToEdit.label) ? measurableToEdit.label : ''
          });
        } else {
          // Set default month to current month
          const currentDate = new Date();
          const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
          const currentYear = currentDate.getFullYear();
          
          setEditData({
            sport: selectedSport,
            label: '',
            value: '',
            month: currentMonth,
            year: currentYear.toString(),
            isCustom: false,
            customLabel: ''
          });
        }
        break;
      case 'profile-image':
        setEditData({});
        // Only reset image state when dialog first opens, not when profileData changes
        // This prevents resetting the form after successful image upload
        break;
      case 'camp-experience':
        // Initialization now handled in separate useEffect
        break;
    }
  }, [dialogType, profileData, measurableToEdit, selectedSport]);

  // Separate useEffect to handle profile-image dialog initialization
  // This only runs when the dialog type changes to 'profile-image'
  useEffect(() => {
    if (dialogType === 'profile-image') {
      // Always start fresh for image editing when dialog opens
      setProfileImagePreview(null);
      setSelectedProfileFile(null);
      setValidationErrors({});
    }
  }, [dialogType]); // Only depend on dialogType, not profileData

  // Reset dirty state when dialog closes or changes type
  useEffect(() => {
    if (!isOpen || !dialogType) {
      setIsDirty(false);
    }
  }, [isOpen, dialogType]);

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
      case 'hudlUrl':
        if (value && typeof value === 'string') {
          const trimmedValue = value.trim();
          
          // Validate Hudl URL format: [https://][www.]hudl.com/profile/{id}/{name}
          const hudlRegex = /^(https?:\/\/)?(www\.)?hudl\.com\/profile\/\d+\/[\w-]+/i;
          
          if (trimmedValue && !hudlRegex.test(trimmedValue)) {
            return 'Please enter a valid Hudl profile URL (e.g., hudl.com/profile/12345/your-name)';
          }
          
          // Extract athlete name for validation - just check if name appears anywhere in URL
          if (trimmedValue) {
            const athleteName = profileData.fullName.toLowerCase();
            const nameParts = athleteName.split(' ').filter(part => part.length > 1); // Filter out single character parts
            
            // Convert URL to lowercase for case-insensitive matching
            const urlLower = trimmedValue.toLowerCase();
            
            // Check if at least first and last name appear somewhere in the URL
            const firstNameMatch = nameParts[0] && urlLower.includes(nameParts[0]);
            const lastNameMatch = nameParts[nameParts.length - 1] && urlLower.includes(nameParts[nameParts.length - 1]);
            
            if (!firstNameMatch || !lastNameMatch) {
              return `Hudl URL should contain your name (${profileData.fullName}) to verify it's your profile`;
            }
          }
        }
        break;
      case 'youtubeUrl':
        if (value && typeof value === 'string') {
          const trimmedValue = value.trim();
          if (trimmedValue && !trimmedValue.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)/)) {
            return 'Please enter a valid YouTube URL';
          }
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
        if (typeof value === 'string' && value.trim()) {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            return 'GPA must be a valid number';
          }
          if (numValue < NUMERIC_LIMITS.GPA.min || numValue > NUMERIC_LIMITS.GPA.max) {
            return `GPA must be between ${NUMERIC_LIMITS.GPA.min} and ${NUMERIC_LIMITS.GPA.max}`;
          }
        }
        break;
      case 'instagram':
      case 'twitter':
        if (typeof value === 'string' && value) {
          const handle = value.toString().replace('@', '');
          if (!/^[a-zA-Z0-9._]+$/.test(handle)) {
            return 'Handle can only contain letters, numbers, periods, and underscores';
          }
        }
        break;
      case 'maxPrepsUrl':
        if (typeof value === 'string' && value.trim()) {
          const url = value.trim();
          
          // Validate MaxPreps URL format: [https://][www.]maxpreps.com/{state}/{city}/{school}/athletes/{name}
          // More flexible - just check for maxpreps.com and athletes path
          const maxPrepsRegex = /^(https?:\/\/)?(www\.)?maxpreps\.com\/.*\/athletes\//i;
          
          if (!maxPrepsRegex.test(url)) {
            return 'Please enter a valid MaxPreps athlete URL that contains "/athletes/" in the path';
          }
          
          // Extract athlete name for validation - just check if name appears anywhere in URL
          const athleteName = profileData.fullName.toLowerCase();
          const nameParts = athleteName.split(' ').filter(part => part.length > 1); // Filter out single character parts
          
          // Convert URL to lowercase for case-insensitive matching
          const urlLower = url.toLowerCase();
          
          // Check if at least first and last name appear somewhere in the URL
          const firstNameMatch = nameParts[0] && urlLower.includes(nameParts[0]);
          const lastNameMatch = nameParts[nameParts.length - 1] && urlLower.includes(nameParts[nameParts.length - 1]);
          
          if (!firstNameMatch || !lastNameMatch) {
            return `MaxPreps URL should contain your name (${profileData.fullName}) to verify it's your profile`;
          }
        }
        break;
             case 'sports247Url':
         if (typeof value === 'string' && value.trim()) {
           const url = value.trim();
           
           // Validate 247Sports URL format: [https://][www.]247sports.com/player/{name}-{id}
           const sports247Regex = /^(https?:\/\/)?(www\.)?247sports\.com\/player\//i;
           
           if (!sports247Regex.test(url)) {
             return 'Please enter a valid 247Sports player URL that contains "/player/" in the path';
           }
          
          // Extract athlete name for validation - just check if name appears anywhere in URL
          const athleteName = profileData.fullName.toLowerCase();
          const nameParts = athleteName.split(' ').filter(part => part.length > 1); // Filter out single character parts
          
          // Convert URL to lowercase for case-insensitive matching
          const urlLower = url.toLowerCase();
          
          // Check if at least first and last name appear somewhere in the URL
          const firstNameMatch = nameParts[0] && urlLower.includes(nameParts[0]);
          const lastNameMatch = nameParts[nameParts.length - 1] && urlLower.includes(nameParts[nameParts.length - 1]);
          
          if (!firstNameMatch || !lastNameMatch) {
            return `247Sports URL should contain your name (${profileData.fullName}) to verify it's your profile`;
          }
        }
        break;
      case 'espnUrl':
        if (typeof value === 'string' && value.trim()) {
          const url = value.trim();
          
          // Validate ESPN URL format: [https://][www.]espn.com/college-{sport}/player/_/id/{id}/{name}
          // or [https://][www.]espn.com/college-sports/{sport}/recruiting/player/_/id/{id}/{name}
          const espnRegex = /^(https?:\/\/)?(www\.)?espn\.com\/college(-sports)?\/(football|basketball|recruiting\/basketball|basketball\/recruiting)\/player\/_\/id\/\d+\//i;
          
          if (!espnRegex.test(url)) {
            return 'Please enter a valid ESPN player URL that contains "/player/_/id/" in the path';
          }
          
          // Extract athlete name for validation - just check if name appears anywhere in URL
          const athleteName = profileData.fullName.toLowerCase();
          const nameParts = athleteName.split(' ').filter(part => part.length > 1); // Filter out single character parts
          
          // Convert URL to lowercase for case-insensitive matching
          const urlLower = url.toLowerCase();
          
          // Check if at least first and last name appear somewhere in the URL
          const firstNameMatch = nameParts[0] && urlLower.includes(nameParts[0]);
          const lastNameMatch = nameParts[nameParts.length - 1] && urlLower.includes(nameParts[nameParts.length - 1]);
          
          if (!firstNameMatch || !lastNameMatch) {
            return `ESPN URL should contain your name (${profileData.fullName}) to verify it's your profile`;
          }
        }
        break;
    }
    return null;
  };

  // Modify handleFieldChange to track dirty state
  const handleFieldChange = (field: string, value: string | number) => {
    setIsDirty(true);
    
    // Apply title case to city and state fields
    let processedValue = value;
    if (typeof value === 'string' && (field === 'city' || field === 'state')) {
      processedValue = toTitleCase(value);
    }
    
    setEditData(prev => ({ ...prev, [field]: processedValue }));
    
    // Clear existing validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Validate the field
    const error = validateField(field, processedValue);
    if (error) {
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }
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
    
    // Check video limit
    if ((tempVideos || []).length >= VIDEO_LIMIT) {
      setValidationErrors(prev => ({ 
        ...prev, 
        youtubeUrl: `You can only have up to ${VIDEO_LIMIT} videos on your profile` 
      }));
      return;
    }
    
    // Validate YouTube URL
    const urlError = validateField('youtubeUrl', youtubeUrl);
    if (urlError) {
      setValidationErrors(prev => ({ ...prev, youtubeUrl: urlError }));
      return;
    }
    
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
        setIsDirty(true); // Mark form as dirty when adding video
        
        // Clear any validation errors
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.youtubeUrl;
          return newErrors;
        });
      } else {
        setValidationErrors(prev => ({ ...prev, youtubeUrl: 'Invalid YouTube URL format' }));
      }
    }
  };

  const removeTempVideo = (index: number) => {
    setTempVideos(prev => (prev || []).filter((_, i) => i !== index));
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', profileData.userId || profileData.id);
      formData.append('imageType', 'profile');
      
      // Add demo profile type for admin users
      if (isAdmin && viewingAs) {
        formData.append('demoProfileType', viewingAs);
      }
      
      // Add current image URL for deletion
      const currentImageUrl = profileData.profileImage;
      if (currentImageUrl) {
        // Remove any existing cache-busting parameters before sending for deletion
        const cleanUrl = currentImageUrl.split('?')[0];
        formData.append('currentImageUrl', cleanUrl);
      }

      // Get auth token
      const windowWithClerk = window as unknown as {
        Clerk?: {
          session?: {
            getToken: () => Promise<string>;
          };
        };
      };
      const token = await windowWithClerk.Clerk?.session?.getToken();

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Update profile data immediately with cache-busting parameter
      const updates: Partial<AthleteProfileData> = {
        // Add timestamp to force browser refresh
        profileImage: `${result.imageUrl}?t=${Date.now()}`
      };
      
      onSave(updates);
      
      // Reset state and close dialog
      setProfileImagePreview(null);
      setSelectedProfileFile(null);
      onClose();
    } catch (error) {
      console.error('Error uploading image:', error);
      setValidationErrors({ upload: 'Failed to upload image. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setValidationErrors({ upload: 'Please select a valid image file (JPEG, PNG, or WebP)' });
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setValidationErrors({ upload: 'File size must be less than 5MB' });
        return;
      }

      // Clear any previous errors
      setValidationErrors({});
      
      // Store the selected file
      setSelectedProfileFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImagePreview = () => {
    setProfileImagePreview(null);
    setSelectedProfileFile(null);
    setValidationErrors({});
    // Reset file input
    const fileInput = document.getElementById('profileImageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSaveImageChanges = async () => {
    if (!selectedProfileFile) return;
    await handleImageUpload(selectedProfileFile);
  };

  const handleDeleteMeasurable = () => {
    if (!measurableIdToEdit) return;
    
    const currentMeasurables = profileData.measurables || [];
    
    // Handle both database IDs (numbers) and stable IDs (strings)
    let updatedMeasurables;
    if (typeof measurableIdToEdit === 'number') {
      // Database ID - filter by exact match
      updatedMeasurables = currentMeasurables.filter(m => m.id !== measurableIdToEdit);
    } else if (typeof measurableIdToEdit === 'string' && measurableIdToEdit.startsWith('stable-')) {
      // Stable ID - parse the components and find matching measurable
      const stableIdParts = measurableIdToEdit.split('-');
      const index = parseInt(stableIdParts[stableIdParts.length - 1]);
      
      if (!isNaN(index) && index >= 0 && index < currentMeasurables.length) {
        // Remove by index
        updatedMeasurables = currentMeasurables.filter((_, i) => i !== index);
      } else {
        console.error('Could not parse stable ID for deletion:', measurableIdToEdit);
        return;
      }
    } else {
      // Unknown ID format
      console.error('Unknown measurable ID format for deletion:', measurableIdToEdit);
      return;
    }
    
    // Update the state with the new measurables array
    onSave({ measurables: updatedMeasurables });
    
    // Clear any validation errors
    setValidationErrors({});
    
    // Reset the measurable being edited
    setMeasurableToEdit(null);
    
    // Close the dialog
    onClose();
  };

  // Check if the current dialog can be saved
  const canSave = () => {
    // Delete dialogs don't use the save button
    if (dialogType === 'delete-measurable' || dialogType === 'profile-image') {
      return false;
    }
    
    // SECURITY: Prevent saving MaxPreps changes for verified users
    if (dialogType === 'maxpreps-verification' && profileData.isVerified && profileData.maxPrepsUrl) {
      return false;
    }
    
    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      return false;
    }
    
    // For measurable dialogs, check required fields
    if (dialogType?.includes('measurable')) {
      const hasLabel = editData.isCustom ? editData.customLabel?.trim() : editData.label;
      const hasValue = editData.value?.trim();
      return !!(hasLabel && hasValue);
    }
    
    return true;
  };

  // Modify handleSave to reset dirty state
  const handleSave = () => {
    const updates: Partial<AthleteProfileData> = {};

    switch (dialogType) {
      case 'basic-info':
        updates.fullName = editData.fullName;
        updates.sport = editData.sport;
        updates.secondarySports = editData.secondarySports;
        updates.educationLevel = editData.educationLevel;
        updates.division = editData.division;
        updates.conference = editData.conference;
        updates.positions = editData.positions;
        updates.city = editData.city;
        // If country is not United States, clear state on the frontend as well
        if (editData.country && editData.country !== 'United States') {
          updates.state = '';
        } else {
          updates.state = editData.state;
        }
        updates.organizationName = editData.organizationName;
        updates.graduationYear = editData.graduationYear;
        // Add country to updates
        updates.country = editData.country;
        // Construct height from feet and inches
        if (editData.heightFeet && editData.heightInches) {
          updates.height = `${editData.heightFeet}'${editData.heightInches}"`;
        }
        // Clean weight format (remove 'lbs' if user added it)
        if (editData.weight) {
          const cleanWeight = String(editData.weight).replace(/\s*lbs?\s*/gi, '').trim();
          updates.weight = cleanWeight ? `${cleanWeight} lbs` : '';
        }
        break;

      case 'academic-info':
        // Convert GPA string to number for saving
        updates.gpa = editData.gpa && String(editData.gpa).trim() ? parseFloat(String(editData.gpa)) : editData.gpa;
        updates.satScore = editData.satScore;
        updates.actScore = editData.actScore;
        updates.intendedMajor = editData.intendedMajor;
        break;

      case 'personal-statement':
        updates.personalStatement = editData.personalStatement;
        break;

      case 'social-media':
        updates.socialMedia = {
          instagram: editData.instagram,
          twitter: editData.twitter
        };
        break;

      case 'maxpreps-verification':
        updates.maxPrepsUrl = editData.maxPrepsUrl;
        // If MaxPreps URL is valid and passes validation, mark user as verified
        if (editData.maxPrepsUrl && !validateField('maxPrepsUrl', editData.maxPrepsUrl)) {
          updates.isVerified = true;
        }
        break;

      case 'hudl-highlights':
        updates.hudlUrl = editData.hudlUrl || undefined;
        // For high school athletes, adding Hudl verifies their profile
        if (profileData.educationLevel === 'high_school' && editData.hudlUrl) {
          updates.isVerified = true;
        }
        break;

      case 'sports247-verification':
        updates.sports247Url = editData.sports247Url || undefined;
        break;

      case 'espn-verification':
        updates.espnUrl = editData.espnUrl || undefined;
        break;

      case 'measurable':
      case 'edit-measurable':
      case 'measurables':
      case 'edit-measurables':
      case 'add-measurables': {
        const label = editData.isCustom 
          ? String(editData.customLabel).trim() 
          : String(editData.label).trim();
          
        if (label && String(editData.value).trim()) {
          let measurementDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
          if (editData.month && editData.year) {
            const month = String(editData.month).padStart(2, '0');
            const year = String(editData.year);
            measurementDate = `${year}-${month}-01`;
          }
          
          const currentMeasurables = profileData.measurables || [];
          
          // Check for duplicate measurable
          const isDuplicate = currentMeasurables.some(m => 
            m.label === label && 
            m.sport === selectedSport && 
            (!measurableToEdit || m.id !== measurableToEdit.id)
          );

          if (isDuplicate) {
            setValidationErrors({ 
              label: 'This metric already exists for this sport. Please edit the existing one instead.' 
            });
            return;
          }
          
          if (measurableToEdit) {
            // Editing existing measurable
            const updatedMeasurables = currentMeasurables.map(m => 
              m.id === measurableToEdit.id 
                ? {
                    ...m,
                    sport: selectedSport,
                    label: label,
                    value: String(editData.value).trim(),
                    measurementDate: measurementDate
                  }
                : m
            );
            updates.measurables = updatedMeasurables;
          } else {
            // Adding new measurable - ensure existing measurables keep their IDs
            const newMeasurable: Measurable = {
              id: `measurable-${Date.now()}`,
              sport: selectedSport,
              label: label,
              value: String(editData.value).trim(),
              measurementDate: measurementDate
            };
            
            // Make sure existing measurables have IDs - assign temp IDs if missing
            const measurablesWithIds = currentMeasurables.map(m => ({
              ...m,
              id: m.id || `existing-${Date.now()}-${Math.random()}`
            }));
            
            updates.measurables = [...measurablesWithIds, newMeasurable];
          }
        }
        break;
      }

      case 'video-highlights': {
        const hasReachedLimit = (tempVideos || []).length >= VIDEO_LIMIT;
        
        if (!hasReachedLimit) {
          updates.youtubeVideos = tempVideos;
        }
        break;
      }

      case 'profile-image':
        // Image uploads handle their own saving
        return;

      default:
        return;
    }

    // SECURITY: Sanitize all user input to prevent XSS attacks
    const sanitizedUpdates = sanitizeProfileData(updates) as Partial<AthleteProfileData>;

    onSave(sanitizedUpdates);
    setMeasurableToEdit(null);
    setIsDirty(false); // Reset dirty state after saving
    onClose(); // Close the dialog after saving
  };

  const getDialogContent = () => {
    // Handle null dialogType to prevent showing default case during dialog close animation
    if (!dialogType) {
      return null;
    }
    
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
                  className={`h-11 w-full ${validationErrors.fullName ? 'border-red-500' : ''}`}
                  maxLength={FIELD_LIMITS.FULL_NAME}
                  autoComplete="off"
                  inputMode="text"
                  
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
                  <SelectTrigger className="!h-11 w-full" id="edit-sport">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
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
                  <SelectTrigger className="!h-11 w-full" id="edit-educationLevel">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {EDUCATION_LEVEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Division and Conference - Only show for college athletes (not high school) */}
              {editData.educationLevel !== 'high_school' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-division">Division</Label>
                    <Select
                      value={String(editData.division || '')}
                      onValueChange={(value) => {
                        setEditData(prev => ({ 
                          ...prev, 
                          division: value,
                          conference: '' 
                        }));
                      }}
                    >
                      <SelectTrigger className="!h-11 w-full" id="edit-division">
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent className="z-[70]">
                        {ATHLETE_DIVISIONS.map(division => (
                          <SelectItem key={division} value={division}>{division}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Conference - Only show when division is selected and has conferences */}
                  {editData.division && divisionHasConferences(editData.division) && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-conference">Conference</Label>
                      <ConferenceSelector
                        division={editData.division || ''}
                        value={editData.conference || ''}
                        onValueChange={(value) => setEditData(prev => ({ ...prev, conference: value }))}
                        placeholder="Select conference"
                        label=""
                        inDialog={true}
                        height="h-12"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Secondary Sports */}
              <div className="space-y-2">
                <Label htmlFor="edit-secondarySports">Secondary Sports</Label>
                <div className="space-y-2">
                  <Select onValueChange={addSecondarySport}>
                    <SelectTrigger className="!h-11 w-full" id="edit-secondarySports">
                      <SelectValue placeholder="Add secondary sport (optional)" />
                    </SelectTrigger>
                    <SelectContent className="z-[70]">
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

              {/* Country select field */}
              <div className="space-y-2">
                <Label htmlFor="edit-country">Country *</Label>
                <Select
                  value={String(editData.country || '')}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, country: value }))}
                >
                  <SelectTrigger className="!h-11 w-full" id="edit-country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City *</Label>
                  <Input
                    id="edit-city"
                    placeholder="Los Angeles"
                    value={editData.city || ''}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    className={`h-11 w-full ${validationErrors.city ? 'border-red-500' : ''}`}
                    maxLength={FIELD_LIMITS.CITY}
                    autoComplete="off"
                    inputMode="text"
                    
                  />
                  {validationErrors.city && (
                    <p className="text-sm text-red-500">{validationErrors.city}</p>
                  )}
                </div>
                {/* Only show State * if country is United States or not selected */}
                {(!editData.country || editData.country === 'United States') && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-state">State *</Label>
                    <Select
                      value={String(editData.state || '')}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, state: value }))}
                    >
                      <SelectTrigger className="!h-11 w-full" id="edit-state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="z-[70]">
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <SchoolSelector
                  value={editData.organizationName || ''}
                  onValueChange={(value) => handleFieldChange('organizationName', value)}
                  placeholder="Start typing school name..."
                  label="School/Organization"
                  required={true}
                  labelClassName="text-sm font-medium"
                  description="Start typing to search - if your school isn't found, just type the full name"
                  educationLevel={editData.educationLevel as EducationLevel}
                />
                {validationErrors.organizationName && (
                  <p className="text-sm text-red-500">{validationErrors.organizationName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-graduationYear">Graduation Year *</Label>
                <Select
                  value={editData.graduationYear?.toString() || ''}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, graduationYear: parseInt(value) }))}
                >
                  <SelectTrigger className="!h-11 w-full" id="edit-graduationYear">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
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
                      <SelectTrigger className={`!h-11 ${!editData.heightFeet ? 'border-red-300' : ''}`}>
                        <SelectValue placeholder="Feet" />
                      </SelectTrigger>
                      <SelectContent className="z-[70]">
                        {Array.from({ length: 5 }, (_, i) => i + 4).map(feet => (
                          <SelectItem key={feet} value={feet.toString()}>{feet}&apos;</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={editData.heightInches as string || ''}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, heightInches: value }))}
                    >
                      <SelectTrigger className={`!h-11 ${!editData.heightInches ? 'border-red-300' : ''}`}>
                        <SelectValue placeholder="In" />
                      </SelectTrigger>
                      <SelectContent className="z-[70]">
                        {Array.from({ length: 12 }, (_, i) => i).map(inches => (
                          <SelectItem key={inches} value={inches.toString()}>{inches}&quot;</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {(!editData.heightFeet || !editData.heightInches) && (
                    <p className="text-sm text-red-500">Please select both feet and inches</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-weight">Weight *</Label>
                  <Input
                    id="edit-weight"
                    placeholder="185"
                    value={editData.weight || ''}
                    onChange={(e) => handleFieldChange('weight', e.target.value)}
                    className={`h-11 w-full ${validationErrors.weight ? 'border-red-500' : ''}`}
                    autoComplete="off"
                    inputMode="numeric"
                    
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
                  type="text"
                  step="0.01"
                  min="0"
                  max="5.0"
                  placeholder="3.85"
                  value={String(editData.gpa || '')}
                  onChange={(e) => handleFieldChange('gpa', e.target.value)}
                  className={`h-11 w-full ${validationErrors.gpa ? 'border-red-500' : ''}`}
                  autoComplete="off"
                  inputMode="decimal"
                  
                />
                {validationErrors.gpa && (
                  <p className="text-sm text-red-500">{validationErrors.gpa}</p>
                )}
                <p className="text-xs text-muted-foreground">Max 5.0</p>
              </div>
              
              <div className="space-y-4">
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
                    className="h-11 w-full"
                    autoComplete="off"
                    inputMode="numeric"
                    
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
                    className="h-11 w-full"
                    autoComplete="off"
                    inputMode="numeric"
                    
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
                  className="h-11 w-full"
                  maxLength={FIELD_LIMITS.INTENDED_MAJOR}
                  autoComplete="off"
                  inputMode="text"
                  
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
                  rows={10}
                  value={editData.personalStatement || ''}
                  onChange={(e) => handleFieldChange('personalStatement', e.target.value)}
                  className={`min-h-12 w-full ${validationErrors.personalStatement ? 'border-red-500' : ''}`}
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
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">@</span>
                  <Input
                    id="edit-instagram"
                    value={editData.instagram || ''}
                    onChange={(e) => handleFieldChange('instagram', e.target.value.replace('@', ''))}
                    placeholder="username"
                    className={`h-12 ${validationErrors.instagram ? 'border-red-500' : ''}`}
                    maxLength={FIELD_LIMITS.INSTAGRAM_HANDLE}
                    autoComplete="off"
                    inputMode="text"
                    
                  />
                </div>
                {validationErrors.instagram && <p className="text-red-500 text-sm">{validationErrors.instagram}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-twitter">Twitter/X Handle</Label>
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-2">@</span>
                  <Input
                    id="edit-twitter"
                    value={editData.twitter || ''}
                    onChange={(e) => handleFieldChange('twitter', e.target.value.replace('@', ''))}
                    placeholder="username"
                    className={`h-12 ${validationErrors.twitter ? 'border-red-500' : ''}`}
                    maxLength={FIELD_LIMITS.TWITTER_HANDLE}
                    autoComplete="off"
                    inputMode="text"
                    
                  />
                </div>
                {validationErrors.twitter && <p className="text-red-500 text-sm">{validationErrors.twitter}</p>}
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
              {/* SECURITY: Show warning for verified users */}
              {profileData.isVerified && profileData.maxPrepsUrl ? (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <Shield className="w-5 h-5" />
                    <h4 className="font-medium">MaxPreps URL Locked</h4>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    Your MaxPreps profile has been verified and is locked for security. 
                    This prevents impersonation and maintains the integrity of your athletic credentials.
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    Current verified MaxPreps URL: <span className="font-mono text-xs break-all">{profileData.maxPrepsUrl}</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="edit-maxPrepsUrl">MaxPreps Profile URL</Label>
                  <Input
                    id="edit-maxPrepsUrl"
                    placeholder={`maxpreps.com/state/city/school/athletes/${profileData.fullName.toLowerCase().replace(/\s+/g, '-')}/sport`}
                    value={editData.maxPrepsUrl || ''}
                    onChange={(e) => handleFieldChange('maxPrepsUrl', e.target.value)}
                    className={`h-12 ${validationErrors.maxPrepsUrl ? 'border-red-500' : ''}`}
                    maxLength={FIELD_LIMITS.URL}
                  />
                  {validationErrors.maxPrepsUrl && (
                    <p className="text-sm text-red-500">{validationErrors.maxPrepsUrl}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Add your MaxPreps athlete profile URL. Example: maxpreps.com/ca/los-angeles/school-name/athletes/{profileData.fullName.toLowerCase().replace(/\s+/g, '-')}/football/
                  </p>
                </div>
              )}
            </div>
          </>
        );

      case 'sports247-verification':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Add 247Sports Profile</DialogTitle>
              <DialogDescription>Connect your 247Sports profile to showcase recruiting rankings and evaluations.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-sports247Url">247Sports Profile URL</Label>
                <Input
                  id="edit-sports247Url"
                  placeholder={`247sports.com/player/${profileData.fullName.toLowerCase().replace(/\s+/g, '-')}-12345`}
                  value={editData.sports247Url || ''}
                  onChange={(e) => handleFieldChange('sports247Url', e.target.value)}
                  className={`h-12 ${validationErrors.sports247Url ? 'border-red-500' : ''}`}
                  maxLength={FIELD_LIMITS.URL}
                  autoComplete="off"
                  inputMode="url"
                />
                {validationErrors.sports247Url && (
                  <p className="text-sm text-red-500">{validationErrors.sports247Url}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Add your 247Sports player profile URL. Example: 247sports.com/player/{profileData.fullName.toLowerCase().replace(/\s+/g, '-')}-12345
                </p>
              </div>
            </div>
          </>
        );

      case 'espn-verification':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Add ESPN Profile</DialogTitle>
              <DialogDescription>Connect your ESPN profile to showcase rankings, stats, and evaluations.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-espnUrl">ESPN Profile URL</Label>
                <Input
                  id="edit-espnUrl"
                  placeholder={`espn.com/college-sports/football/recruiting/player/_/id/12345/${profileData.fullName.toLowerCase().replace(/\s+/g, '-')}`}
                  value={editData.espnUrl || ''}
                  onChange={(e) => handleFieldChange('espnUrl', e.target.value)}
                  className={`h-12 ${validationErrors.espnUrl ? 'border-red-500' : ''}`}
                  maxLength={FIELD_LIMITS.URL}
                  autoComplete="off"
                  inputMode="url"
                />
                {validationErrors.espnUrl && (
                  <p className="text-sm text-red-500">{validationErrors.espnUrl}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Add your ESPN player profile URL. Examples:<br/>
                  • Football: espn.com/college-sports/football/recruiting/player/_/id/12345/{profileData.fullName.toLowerCase().replace(/\s+/g, '-')}<br/>
                  • Basketball: espn.com/college-sports/basketball/recruiting/player/_/id/12345/{profileData.fullName.toLowerCase().replace(/\s+/g, '-')}
                </p>
              </div>
            </div>
          </>
        );

      case 'hudl-highlights':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Edit Hudl Profile</DialogTitle>
              <DialogDescription>Add your Hudl profile link to showcase game film and highlight reels.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-hudlUrl">Hudl Profile URL</Label>
                <Input
                  id="edit-hudlUrl"
                  placeholder={`hudl.com/profile/12345/${profileData.fullName.toLowerCase().replace(/\s+/g, '-')}`}
                  value={editData.hudlUrl || ''}
                  onChange={(e) => handleFieldChange('hudlUrl', e.target.value)}
                  className={`h-12 ${validationErrors.hudlUrl ? 'border-red-500' : ''}`}
                  maxLength={FIELD_LIMITS.URL}
                  autoComplete="off"
                  inputMode="url"
                  
                />
                {validationErrors.hudlUrl && (
                  <p className="text-sm text-red-500">{validationErrors.hudlUrl}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Add your Hudl profile URL. Example: hudl.com/profile/12345/{profileData.fullName.toLowerCase().replace(/\s+/g, '-')}
                </p>
              </div>
            </div>
          </>
        );

      case 'video-highlights': {
        const hasReachedLimit = (tempVideos || []).length >= VIDEO_LIMIT;
        
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
                  <div className="flex items-center justify-between">
                    <Label>Current Videos</Label>
                    <p className="text-sm text-muted-foreground">
                      {tempVideos.length} of {VIDEO_LIMIT} videos
                    </p>
                  </div>
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
              {!hasReachedLimit ? (
                <div className="space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-youtubeUrl">YouTube Video URL</Label>
                    <Input
                      id="edit-youtubeUrl"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={editData.youtubeUrl || ''}
                      onChange={(e) => handleFieldChange('youtubeUrl', e.target.value)}
                      className={`h-12 ${validationErrors.youtubeUrl ? 'border-red-500' : ''}`}
                      maxLength={FIELD_LIMITS.URL}
                      autoComplete="off"
                      inputMode="url"
                      
                    />
                    {validationErrors.youtubeUrl && (
                      <p className="text-sm text-red-500">{validationErrors.youtubeUrl}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-videoTitle">Video Title</Label>
                    <Input
                      id="edit-videoTitle"
                      placeholder="e.g., Senior Season Highlights"
                      value={editData.title || ''}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      className="h-12"
                      maxLength={100}
                      autoComplete="off"
                      inputMode="text"
                      
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
              ) : (
                <div className="border-t pt-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-center">
                      <p className="font-medium text-muted-foreground mb-2">Video Limit Reached</p>
                      <p className="text-sm text-muted-foreground">
                        You can have a maximum of {VIDEO_LIMIT} videos on your profile. Remove an existing video to add a new one.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        );
      }

      case 'measurable':
      case 'edit-measurable':
      case 'measurables':
      case 'edit-measurables':
      case 'add-measurables': {
        const suggestedMeasurables = getMeasurablesForSport(selectedSport);
        const isEditingExisting = !!measurableToEdit;
        
        // Filter out existing measurables from suggestions unless editing
        const availableMeasurables = suggestedMeasurables.filter(metric => {
          if (isEditingExisting) return true;
          return !profileData.measurables?.some(m => 
            m.label === metric && 
            m.sport === selectedSport
          );
        });
        
        return (
          <>
            <DialogHeader>
              <DialogTitle>
                {isEditingExisting ? 'Edit' : 'Add'} Performance Metric - {selectedSport}
              </DialogTitle>
              <DialogDescription>
                {isEditingExisting 
                  ? 'Update your athletic performance data to showcase your abilities.'
                  : 'Add your athletic performance data to showcase your abilities.'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-measurableType">Metric Type</Label>
                <Select
                  value={editData.isCustom ? 'custom' : editData.label || ''}
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setEditData(prev => ({ ...prev, isCustom: true, label: '' }));
                    } else {
                      setEditData(prev => ({ ...prev, isCustom: false, label: value }));
                    }
                    // Clear label validation error when changing
                    if (validationErrors.label) {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.label;
                        return newErrors;
                      });
                    }
                  }}
                >
                  <SelectTrigger className={`!h-11 w-full ${validationErrors.label ? 'border-red-500' : ''}`} id="edit-measurableType">
                    <SelectValue placeholder="Choose a metric" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {availableMeasurables.map((metric: string) => (
                      <SelectItem key={metric} value={metric}>{metric}</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Metric</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.label && (
                  <p className="text-sm text-red-500">{validationErrors.label}</p>
                )}
              </div>
              
              {editData.isCustom && (
                <div className="space-y-2">
                  <Label htmlFor="edit-customMetricName">Custom Metric Name</Label>
                  <Input
                    id="edit-customMetricName"
                    placeholder="Enter name of metric"
                    value={editData.customLabel || ''}
                    onChange={(e) => {
                      setEditData(prev => ({ ...prev, customLabel: e.target.value }));
                      // Clear validation error when typing
                      if (validationErrors.label) {
                        setValidationErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.label;
                          return newErrors;
                        });
                      }
                    }}
                    className={`h-12 w-full ${validationErrors.label ? 'border-red-500' : ''}`}
                    maxLength={50}
                    autoComplete="off"
                    inputMode="text"
                    
                  />
                  {validationErrors.label && (
                    <p className="text-sm text-red-500">{validationErrors.label}</p>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="edit-measurableValue">Value</Label>
                <Input
                  id="edit-measurableValue"
                  placeholder="e.g., 4.4s, 34 inches, 225 lbs"
                  value={editData.value || ''}
                  onChange={(e) => {
                    setEditData(prev => ({ ...prev, value: e.target.value }));
                    // Clear validation error when typing
                    if (validationErrors.value) {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.value;
                        return newErrors;
                      });
                    }
                  }}
                  className={`h-12 w-full ${validationErrors.value ? 'border-red-500' : ''}`}
                  maxLength={20}
                  autoComplete="off"
                  inputMode="text"
                />
                {validationErrors.value && (
                  <p className="text-sm text-red-500">{validationErrors.value}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Measurement Date</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-measurementMonth" className="text-sm">Month</Label>
                    <Select
                      value={editData.month || ''}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, month: value }))}
                    >
                      <SelectTrigger className="!h-11 w-full" id="edit-measurementMonth">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent className="z-[70]">
                        {MONTH_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-measurementYear" className="text-sm">Year</Label>
                    <Select
                      value={editData.year || ''}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, year: value }))}
                    >
                      <SelectTrigger className="!h-11 w-full" id="edit-measurementYear">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent className="z-[70]">
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
      }

      case 'profile-image':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Change Profile Picture</DialogTitle>
              <DialogDescription>Upload a professional headshot or action photo to represent yourself.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-4">
                <FileUpload
                  id="profileImageUpload"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  onRemove={removeImagePreview}
                  disabled={isUploading}
                  preview={profileImagePreview}
                  originalImage={profileData.profileImage}
                  uploadText="Upload a profile picture"
                  chooseText="Choose a new profile picture"
                  supportedFormats="Supported formats: JPG, PNG, WebP"
                  maxSize="5MB"
                  isUploading={isUploading}
                  error={validationErrors.upload}
                  imageType="profile"
                />
              </div>
              {validationErrors.upload && <p className="text-red-500 text-sm">{validationErrors.upload}</p>}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={onClose} disabled={isUploading}>
                Cancel
              </Button>
              {profileImagePreview && (
                <Button onClick={handleSaveImageChanges} disabled={isUploading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isUploading ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </DialogFooter>
          </>
        );

      case 'delete-measurable': {
        // Safety check: if no measurableIdToEdit, don't render the dialog content yet
        if (!measurableIdToEdit) {
          return (
            <>
              <DialogHeader>
                <DialogTitle>Delete Performance Metric</DialogTitle>
                <DialogDescription>
                  Loading metric details...
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </div>
            </>
          );
        }
        
        const measurableToDelete = profileData.measurables?.find(m => m.id === measurableIdToEdit);
        
        return (
          <>
            <DialogHeader>
              <DialogTitle>Delete Performance Metric</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this performance metric? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {measurableToDelete ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center">
                      <X className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">{measurableToDelete.label}</h4>
                      <p className="text-lg font-semibold text-foreground mb-1">{measurableToDelete.value}</p>
                      <p className="text-sm text-muted-foreground">
                        Recorded in {(() => {
                          // Parse the date string to avoid timezone issues
                          const [year, month] = measurableToDelete.measurementDate.split('-');
                          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                          return `${monthNames[parseInt(month) - 1]} ${year}`;
                        })()}
                      </p>
                      <p className="text-sm text-muted-foreground">Sport: {measurableToDelete.sport}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Measurable not found</p>
                </div>
              )}
            </div>
          </>
        );
      }

      case 'camp-experience': {
        // Limit to 3 experiences
        const MAX_EXPERIENCES = 3;
        const atMax = tempCampExperience.length >= MAX_EXPERIENCES;
        return (
          <>
            <DialogHeader>
              <DialogTitle>Edit Camp and Club Experience</DialogTitle>
              <DialogDescription>
                You can add up to 3 camp or club experiences. Edit, remove, or add new experiences below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* List current experiences */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  Current Experiences
                  <span className="text-xs text-muted-foreground">({tempCampExperience.length} / {MAX_EXPERIENCES})</span>
                </h4>
                {tempCampExperience.length === 0 && (
                  <div className="text-muted-foreground text-sm">No experiences added yet.</div>
                )}
                {tempCampExperience.map((exp, idx) => (
                  <div key={idx} className="border rounded-lg p-3 flex flex-col gap-1 bg-muted/30">
                    {campEditIndex === idx ? (
                      <>
                        <div className="flex flex-wrap gap-2 items-center mb-2">
                          {/* Type dropdown */}
                          <Select value={campForm.type} onValueChange={v => setCampForm(f => ({ ...f, type: v as 'Camp' | 'Club' }))}>
                            <SelectTrigger className="w-24 !h-11"><SelectValue /></SelectTrigger>
                            <SelectContent className="z-[9999]">
                              <SelectItem value="Camp">Camp</SelectItem>
                              <SelectItem value="Club">Club</SelectItem>
                            </SelectContent>
                          </Select>
                          {/* Sport dropdown */}
                          <Select value={campForm.sport} onValueChange={v => setCampForm(f => ({ ...f, sport: v }))}>
                            <SelectTrigger className="w-32 !h-11"><SelectValue placeholder="Sport" /></SelectTrigger>
                            <SelectContent className="z-[9999]">
                              {getSportsList().map(sport => (
                                <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Editable title */}
                        <Input
                          className="font-semibold text-base mb-1"
                          value={campForm.name}
                          onChange={e => setCampForm(f => ({ ...f, name: e.target.value }))}
                          maxLength={50}
                          placeholder="Name of Camp / Name of Club Team"
                        />
                        {/* Location fields: Country, State (if US), and City */}
                        <div className="flex flex-row gap-4 text-sm text-muted-foreground mb-1 flex-nowrap">
                          <Select
                            value={campForm.country}
                            onValueChange={value => setCampForm(f => ({ ...f, country: value, state: value === 'United States' ? f.state : '' }))}
                          >
                            <SelectTrigger className="w-40 !h-11">
                              <SelectValue placeholder="Country" />
                            </SelectTrigger>
                            <SelectContent className="z-[9999]">
                              {COUNTRIES.map(country => (
                                <SelectItem key={country} value={country}>{country}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {campForm.country === 'United States' && (
                            <Select
                              value={campForm.state}
                              onValueChange={value => setCampForm(f => ({ ...f, state: value }))}
                            >
                              <SelectTrigger className="w-32 !h-11">
                                <SelectValue placeholder="State" />
                              </SelectTrigger>
                              <SelectContent className="z-[9999]">
                                {US_STATES.map(state => (
                                  <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <Input
                            className="w-32"
                            value={campForm.city}
                            onChange={e => {
                              const value = e.target.value;
                              // Allow spaces and apply title case to each word
                              const titleCased = value.split(' ').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                              ).join(' ');
                              setCampForm(f => ({ ...f, city: titleCased }));
                            }}
                            maxLength={50}
                            placeholder="City"
                            disabled={!campForm.country}
                          />
                        </div>
                        {/* Date Range */}
                        <div className="text-sm text-muted-foreground mb-1">
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-xs">Start Date</Label>
                              <StartDatePicker
                                date={campForm.startDate}
                                onDateChange={(date) => setCampForm(f => ({ ...f, startDate: date }))}
                                placeholder="Select start date"
                                className="!h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">End Date</Label>
                              <EndDatePicker
                                date={campForm.endDate}
                                onDateChange={(date) => setCampForm(f => ({ ...f, endDate: date }))}
                                onPresentChange={(isPresent) => {
                                  setCampEndDateIsPresent(isPresent);
                                  if (isPresent) {
                                    setCampForm(f => ({ ...f, endDate: PRESENT_DATE }));
                                  }
                                }}
                                isPresent={campEndDateIsPresent}
                                placeholder="Select end date"
                                className="!h-11"
                              />
                            </div>
                          </div>
                        </div>
                        {/* Editable description */}
                        <Textarea
                          className="text-sm text-foreground mt-1"
                          value={campForm.description}
                          onChange={e => setCampForm(f => ({ ...f, description: e.target.value }))}
                          maxLength={200}
                          rows={2}
                          placeholder="Description"
                        />
                        {campFormError && <p className="text-red-500 text-sm mt-2">{campFormError}</p>}
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={() => {
                            // Validate
                            if (!campForm.name.trim() || !campForm.city.trim() || !campForm.country.trim() || !campForm.startDate || !campForm.sport.trim() || !campForm.description.trim()) {
                              setCampFormError('All fields are required.');
                              return;
                            }
                            
                            // Additional validation for US state
                            if (campForm.country === 'United States' && !campForm.state.trim()) {
                              setCampFormError('State is required for United States.');
                              return;
                            }
                            
                            // Validate and parse dates
                            const parsedDates = validateAndParseDateRange(campForm.startDate, campForm.endDate, campEndDateIsPresent);
                            if (!parsedDates) {
                              setCampFormError('Please select valid start and end dates.');
                              return;
                            }
                            
                            const { startDate, endDate } = parsedDates;
                            
                            setCampFormError(null);
                            // Save changes to this experience
                            const updated = [...tempCampExperience];
                            const newExperience = {
                              type: campForm.type,
                              name: campForm.name,
                              city: campForm.city,
                              state: campForm.state,
                              country: campForm.country,
                              startDate,
                              endDate,
                              sport: campForm.sport,
                              description: campForm.description
                            };
                            
                            if (campEditIndex < tempCampExperience.length) {
                              // Editing existing experience
                              updated[campEditIndex] = newExperience;
                            } else {
                              // Adding new experience
                              updated.push(newExperience);
                            }
                            setTempCampExperience(updated);
                            setCampEditIndex(null);
                            setCampForm({ type: 'Camp', name: '', city: '', state: '', country: '', startDate: undefined, endDate: undefined, sport: '', description: '' });
                            setCampEndDateIsPresent(false);
                            setIsDirty(true);
                          }}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            setCampEditIndex(null);
                            setCampForm({ type: 'Camp', name: '', city: '', state: '', country: '', startDate: undefined, endDate: undefined, sport: '', description: '' });
                            setCampEndDateIsPresent(false);
                            setCampFormError(null);
                          }}>Cancel</Button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Badges always at the top of the card */}
                        <div className="flex gap-1 mb-2">
                          <Badge className={exp.type === 'Camp' ? 'bg-blue-600 text-white' : 'bg-cyan-700 text-white'}>{exp.type}</Badge>
                          <Badge className="bg-muted text-foreground border border-border">{exp.sport}</Badge>
                        </div>
                        {/* Title underneath badges */}
                        <div className="font-semibold text-base mb-1">{exp.name}</div>
                        <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground mb- space-x-1">
                          <span>{
                            exp.city && exp.country 
                              ? exp.country === 'United States' && exp.state
                                ? `${exp.city}, ${exp.state}`
                                : `${exp.city}, ${exp.country}`
                              : exp.city || exp.country
                          }</span>
                          <span>{formatDateRange(exp.startDate, exp.endDate)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{exp.description}</div>
                        <div className="flex gap-2 mt-1">
                                      <Button size="sm" variant="outline" onClick={() => {
              setCampEditIndex(idx);
              
              // Convert existing dates to Date objects
              const startDate = typeof exp.startDate === 'string' ? isoStringToDate(exp.startDate) : exp.startDate;
              const endDate = typeof exp.endDate === 'string' ? isoStringToDate(exp.endDate) : exp.endDate;
              
              const newCampForm = {
                type: exp.type,
                name: exp.name,
                city: exp.city,
                state: exp.state,
                country: exp.country,
                startDate: startDate,
                endDate: endDate,
                sport: exp.sport,
                description: exp.description
              };
              
              setCampForm(newCampForm);
              
              // Set the present state based on the end date
              setCampEndDateIsPresent(endDate ? isPresentDate(endDate) : false);
              
              setCampFormError(null);
            }}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => {
                            setTempCampExperience(tempCampExperience.filter((_, i) => i !== idx));
                            setIsDirty(true);
                            if (campEditIndex === idx) {
                              setCampEditIndex(null);
                              setCampForm({ type: 'Camp', name: '', city: '', state: '', country: '', startDate: undefined, endDate: undefined, sport: '', description: '' });
                              setCampEndDateIsPresent(false);
                            }
                          }}>Remove</Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {/* New experience form */}
                {campEditIndex === tempCampExperience.length && (
                  <div className="border rounded-lg p-3 flex flex-col gap-1 bg-muted/30 border-dashed">
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                      {/* Type dropdown */}
                      <Select value={campForm.type} onValueChange={v => setCampForm(f => ({ ...f, type: v as 'Camp' | 'Club' }))}>
                        <SelectTrigger className="w-24 !h-11"><SelectValue /></SelectTrigger>
                        <SelectContent className="z-[9999]">
                          <SelectItem value="Camp">Camp</SelectItem>
                          <SelectItem value="Club">Club</SelectItem>
                        </SelectContent>
                      </Select>
                      {/* Sport dropdown */}
                      <Select value={campForm.sport} onValueChange={v => setCampForm(f => ({ ...f, sport: v }))}>
                        <SelectTrigger className="w-32 !h-11"><SelectValue placeholder="Sport" /></SelectTrigger>
                        <SelectContent className="z-[9999]">
                          {getSportsList().map(sport => (
                            <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Editable title */}
                    <Input
                      className="font-semibold text-base mb-1"
                      value={campForm.name}
                      onChange={e => setCampForm(f => ({ ...f, name: e.target.value }))}
                      maxLength={50}
                      placeholder="Name of Camp / Name of Club Team"
                    />
                    {/* Location fields: Country, State (if US), and City */}
                    <div className="flex flex-row gap-4 text-sm text-muted-foreground mb-1 flex-nowrap">
                      <Select
                        value={campForm.country}
                        onValueChange={value => setCampForm(f => ({ ...f, country: value, state: value === 'United States' ? f.state : '' }))}
                      >
                        <SelectTrigger className="w-40 !h-11">
                          <SelectValue placeholder="Country" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          {COUNTRIES.map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {campForm.country === 'United States' && (
                        <Select
                          value={campForm.state}
                          onValueChange={value => setCampForm(f => ({ ...f, state: value }))}
                        >
                          <SelectTrigger className="w-32 !h-11">
                            <SelectValue placeholder="State" />
                          </SelectTrigger>
                          <SelectContent className="z-[9999]">
                            {US_STATES.map(state => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <Input
                        className="w-32"
                        value={campForm.city}
                        onChange={e => {
                          const value = e.target.value;
                          // Allow spaces and apply title case to each word
                          const titleCased = value.split(' ').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(' ');
                          setCampForm(f => ({ ...f, city: titleCased }));
                        }}
                        maxLength={50}
                        placeholder="City"
                        disabled={!campForm.country}
                      />
                    </div>
                    {/* Date Range */}
                    <div className="text-sm text-muted-foreground mb-1">
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Start Date</Label>
                          <StartDatePicker
                            date={campForm.startDate}
                            onDateChange={(date) => setCampForm(f => ({ ...f, startDate: date }))}
                            placeholder="Select start date"
                            className="!h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">End Date</Label>
                          <EndDatePicker
                            date={campForm.endDate}
                            onDateChange={(date) => setCampForm(f => ({ ...f, endDate: date }))}
                            onPresentChange={(isPresent) => {
                              setCampEndDateIsPresent(isPresent);
                              if (isPresent) {
                                setCampForm(f => ({ ...f, endDate: PRESENT_DATE }));
                              }
                            }}
                            isPresent={campEndDateIsPresent}
                            placeholder="Select end date"
                            className="!h-11"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Editable description */}
                    <Textarea
                      className="text-sm text-foreground mt-1"
                      value={campForm.description}
                      onChange={e => setCampForm(f => ({ ...f, description: e.target.value }))}
                      maxLength={200}
                      rows={2}
                      placeholder="Description"
                    />
                    {campFormError && <p className="text-red-500 text-sm mt-2">{campFormError}</p>}
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => {
                        // Validate
                        if (!campForm.name.trim() || !campForm.city.trim() || !campForm.country.trim() || !campForm.startDate || !campForm.sport.trim() || !campForm.description.trim()) {
                          setCampFormError('All fields are required.');
                          return;
                        }
                        
                        // Additional validation for US state
                        if (campForm.country === 'United States' && !campForm.state.trim()) {
                          setCampFormError('State is required for United States.');
                          return;
                        }
                        
                        // Validate and parse dates
                        const parsedDates = validateAndParseDateRange(campForm.startDate, campForm.endDate, campEndDateIsPresent);
                        if (!parsedDates) {
                          setCampFormError('Please select valid start and end dates.');
                          return;
                        }
                        
                        const { startDate, endDate } = parsedDates;
                        
                        setCampFormError(null);
                        // Add new experience
                        const updated = [...tempCampExperience];
                        const newExperience = {
                          type: campForm.type,
                          name: campForm.name,
                          city: campForm.city,
                          state: campForm.state,
                          country: campForm.country,
                          startDate,
                          endDate,
                          sport: campForm.sport,
                          description: campForm.description
                        };
                        updated.push(newExperience);
                        setTempCampExperience(updated);
                        setCampEditIndex(null);
                        setCampForm({ type: 'Camp', name: '', city: '', state: '', country: '', startDate: undefined, endDate: undefined, sport: '', description: '' });
                        setCampEndDateIsPresent(false);
                        setIsDirty(true);
                      }}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setCampEditIndex(null);
                        setCampForm({ type: 'Camp', name: '', city: '', state: '', country: '', startDate: undefined, endDate: undefined, sport: '', description: '' });
                        setCampEndDateIsPresent(false);
                        setCampFormError(null);
                      }}>Cancel</Button>
                    </div>
                  </div>
                )}
                {/* Add new experience button if less than 3 and not editing */}
                {!atMax && campEditIndex === null && (
                  <div className="pt-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      setCampEditIndex(tempCampExperience.length);
                      setCampForm({ type: 'Camp', name: '', city: '', state: '', country: '', startDate: undefined, endDate: undefined, sport: '', description: '' });
                      setCampEndDateIsPresent(false);
                      setCampFormError(null);
                    }}>
                      + Add New Experience
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={() => {
                // Remove any empty new experience that was never saved
                const cleaned = tempCampExperience.filter(exp => exp.name.trim() && exp.city.trim() && exp.country.trim() && exp.sport.trim() && exp.description.trim());
                onSave({ campExperience: cleaned });
                setIsDirty(false);
                onClose();
              }} disabled={!isDirty}>Save All Changes</Button>
            </DialogFooter>
          </>
        );
      }

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

  // Only initialize tempCampExperience when dialog is first opened for camp-experience
  useEffect(() => {
    if (isOpen && dialogType === 'camp-experience' && !campExperienceInitializedRef.current) {
      setTempCampExperience(
        Array.isArray(profileData.campExperience) && profileData.campExperience.length > 0
          ? profileData.campExperience.map(exp => {
              // Handle migration from old stateCountry format to new state/country format
              let state = exp.state || '';
              let country = exp.country || '';
              
              // If we have the old stateCountry format, try to parse it
              if (!state && !country && (exp as any).stateCountry) {
                const stateCountry = (exp as any).stateCountry;
                // Check if it's a US state
                if (US_STATES.includes(stateCountry)) {
                  state = stateCountry;
                  country = 'United States';
                } else {
                  // Assume it's a country
                  country = stateCountry;
                }
              }
              
              return {
                ...exp, // This preserves the id field if it exists
                state,
                country,
                startDate: typeof exp.startDate === 'string' ? isoStringToDate(exp.startDate) : exp.startDate,
                endDate: typeof exp.endDate === 'string' ? isoStringToDate(exp.endDate) : exp.endDate
              };
            })
          : []
      );
      setCampEditIndex(null);
      setCampForm({ type: 'Camp', name: '', city: '', state: '', country: '', startDate: undefined, endDate: undefined, sport: '', description: '' });
      setCampEndDateIsPresent(false);
      setCampFormError(null);
      campExperienceInitializedRef.current = true;
    }
    if (!isOpen) {
      campExperienceInitializedRef.current = false;
    }
  }, [isOpen, dialogType, profileData.campExperience]);

  // Add a ref to track if initialization has happened for this open session
  const campExperienceInitializedRef = useRef(false);



  // Helper function to validate and parse date range
  const validateAndParseDateRange = (startDate: Date | string | undefined, endDate: Date | string | undefined, isPresent: boolean = false): { startDate: Date; endDate: Date } | null => {
    if (!startDate) {
      return null;
    }
    
    // If isPresent is true, we don't need a valid endDate
    if (!endDate && !isPresent) {
      return null;
    }
    
    let parsedStartDate: Date;
    let parsedEndDate: Date;
    
    // Parse start date
    if (startDate instanceof Date) {
      parsedStartDate = startDate;
    } else if (typeof startDate === 'string') {
      const parsed = new Date(startDate);
      if (isNaN(parsed.getTime())) {
        return null;
      }
      parsedStartDate = parsed;
    } else {
      return null;
    }
    
    // Parse end date
    if (isPresent) {
      parsedEndDate = PRESENT_DATE;
    } else if (endDate instanceof Date) {
      parsedEndDate = endDate;
    } else if (typeof endDate === 'string') {
      if (endDate === 'Present' || isPresentDate(endDate)) {
        parsedEndDate = PRESENT_DATE;
      } else {
        const parsed = new Date(endDate);
        if (isNaN(parsed.getTime())) {
          return null;
        }
        parsedEndDate = parsed;
      }
    } else {
      return null;
    }
    
    // Validate that end date is not before start date (unless it's "Present")
    if (!isPresent && parsedEndDate < parsedStartDate) {
      return null;
    }
    
    return { startDate: parsedStartDate, endDate: parsedEndDate };
  };

  // Start Date Picker component for camp experience
  interface StartDatePickerProps {
    date?: Date;
    onDateChange: (date: Date | undefined) => void;
    placeholder: string;
    disabled?: boolean;
    className?: string;
  }

  function StartDatePicker({ date, onDateChange, placeholder, disabled, className }: StartDatePickerProps) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? formatCampDate(date) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[9999]" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            initialFocus
            disabled={(date: Date) => {
              // Disable dates more than 10 years in the past
              const tenYearsAgo = new Date();
              tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
              return date < tenYearsAgo;
            }}
          />
        </PopoverContent>
      </Popover>
    );
  }

  // End Date Picker component for camp experience
  interface EndDatePickerProps {
    date?: Date;
    onDateChange: (date: Date | undefined) => void;
    onPresentChange: (isPresent: boolean) => void;
    isPresent: boolean;
    placeholder: string;
    disabled?: boolean;
    className?: string;
  }

  function EndDatePicker({ 
    date, 
    onDateChange, 
    onPresentChange, 
    isPresent, 
    placeholder, 
    disabled, 
    className 
  }: EndDatePickerProps) {
    return (
      <div className="space-y-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                (!date && !isPresent) && "text-muted-foreground",
                className
              )}
              disabled={disabled || isPresent}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {isPresent ? 'Present' : (date ? formatCampDate(date) : placeholder)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[9999]" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              initialFocus
              disabled={(date: Date) => {
                // Disable dates more than 10 years in the past
                const tenYearsAgo = new Date();
                tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
                return date < tenYearsAgo;
              }}
            />
          </PopoverContent>
        </Popover>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="present-checkbox"
            checked={isPresent}
            onCheckedChange={(checked) => {
              onPresentChange(checked as boolean);
              if (checked) {
                onDateChange(undefined);
              }
            }}
            disabled={disabled}
          />
          <Label htmlFor="present-checkbox" className="text-sm font-bold">
            Present (ongoing)
          </Label>
        </div>
      </div>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && !isDirty) {
          onClose();
        } else if (!open && isDirty) {
          // Show custom confirmation dialog instead of window.confirm
          setConfirmationDialog({
            open: true,
            title: "Discard Changes?",
            description: "You have unsaved changes. Are you sure you want to close? Any unsaved changes will be lost.",
            confirmText: "Discard",
            variant: "warning",
            onConfirm: () => {
              setIsDirty(false);
              setConfirmationDialog(prev => ({ ...prev, open: false }));
              onClose();
            }
          });
        }
      }}>
        <DialogContent 
          className={`${dialogType === 'basic-info' ? "sm:max-w-2xl max-w-lg" : "sm:max-w-md max-w-lg"} z-[60] max-h-[95vh] flex flex-col`}
          onOpenAutoFocus={e => e.preventDefault()}
        >
          {getDialogContent()}
          {/* Only render footer if dialog type exists (prevents flash during close) */}
          {dialogType && (
            dialogType === 'delete-measurable' ? (
              <DialogFooter className="sm:justify-start">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteMeasurable}
                  disabled={!measurableIdToEdit}
                >
                  Delete Metric
                </Button>
              </DialogFooter>
            ) : (dialogType !== 'profile-image' && dialogType !== 'camp-experience') ? (
              <DialogFooter>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button 
                  onClick={handleSave}
                  disabled={!canSave() || isUploading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            ) : null
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) => setConfirmationDialog(prev => ({ ...prev, open }))}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
        confirmText={confirmationDialog.confirmText}
        variant={confirmationDialog.variant}
        onConfirm={confirmationDialog.onConfirm}
      />
    </>
  );
} 