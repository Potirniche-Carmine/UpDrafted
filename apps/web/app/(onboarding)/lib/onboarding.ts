export type UserRole = "athlete" | "coach" | "recruiter";
export type EducationLevel = 'high_school' | 'undergraduate' | 'graduate' | 'associate';
export type InstitutionType = 'high_school' | 'juco' | 'club' | 'undergraduate' | 'graduate' | 'other';

export interface InstitutionHistoryEntry {
  id: string;
  name: string;
  type: InstitutionType;
  startYear: string;
  endYear: string;
  city?: string;
  state?: string;
  country?: string;
}

export type SportPositions = Record<string, string[]>;

// Interface for the onboarding form data (what the frontend sends)
export interface OnboardingFormData {
  role: UserRole | null;
  // Common fields
  fullName: string;
  profileImage?: File | string;
  profileImagePreview?: string;
  
  // Athlete fields
  sport: string;
  secondarySports: string[];
  sportPositions: SportPositions;
  graduationYear: number | null;
  educationLevel: EducationLevel;
  institutionType: InstitutionType;
  institutionHistory: InstitutionHistoryEntry[];
  organizationName: string;
  city: string;
  state: string;
  country: string; // New: athlete country (default United States)
  heightFeet: string;
  heightInches: string;
  weight: string;
  positions: string[];
  teamLevel?: 'varsity' | 'jv' | 'freshman' | 'none' | null; // Team level for high school athletes
  gpa: number | null;
  satScore: number | null;
  actScore: number | null;
  intendedMajor: string;
  gender: string;
  maxprepsUrl: string;
  hudlUrl: string;
  instagramHandle: string;
  twitterHandle: string;
  personalStatement: string;
  
  // Coach/Recruiter fields
  title: string;
  sportCoaching: string;
  secondarySportsRecruiting: string[];
  organizationLogo?: File | string;
  organizationLogoPreview?: string;
  division: string;
  conference: string;
  programWebsite: string;
  schoolWebsite: string;
  orgInstagramHandle: string;
  orgTwitterHandle: string;
  recruitingPhilosophy: string;
  
  // Recruiting needs (now sport-specific for recruiters)
  recruitingStudentClassifications: string[];
  recruitingPositions: string[];
  scholarshipsAvailable: number | null;
  
  // Sport-specific recruiting needs for recruiters
  sportSpecificNeeds: { [sport: string]: { studentClassifications: string[]; positions: string[]; scholarshipsAvailable: number | null; recruitingPhilosophy: string; } };
  
  whatLookingFor: string;
  
  // Terms agreement
  agreeToTerms: boolean;
  ageConfirmation: boolean;
}

// Interface for processed onboarding data (what gets sent to the database)
export interface OnboardingProfileData {
  fullName: string;
  
  // Athlete specific
  sport?: string;
  secondarySports?: string[];
  sportPositions?: SportPositions;
  graduationYear?: number;
  educationLevel?: EducationLevel;
  institutionType?: InstitutionType;
  institutionHistory?: InstitutionHistoryEntry[];
  organizationName?: string;
  city: string;
  state: string;
  country: string;
  height?: string; // Combined from heightFeet and heightInches
  weight?: string;
  positions?: string[];
  teamLevel?: 'varsity' | 'jv' | 'freshman' | 'none' | null; // Team level for high school athletes
  gpa?: string | null; // Database expects string for decimal fields
  satScore?: number | null;
  actScore?: number | null;
  intendedMajor?: string;
  gender?: string;
  maxprepsUrl?: string;
  hudlUrl?: string;
  instagramHandle?: string;
  twitterHandle?: string;
  personalStatement?: string;
  
  // Coach/Recruiter specific
  title?: string;
  sportCoaching?: string;
  secondarySportsRecruiting?: string[];
  division?: string;
  conference?: string;
  programWebsite?: string;
  schoolWebsite?: string;
  orgInstagramHandle?: string;
  orgTwitterHandle?: string;
  recruitingPhilosophy?: string;
  
  // Recruiting needs (for coaches - single sport)
  recruitingStudentClassifications?: string[];
  recruitingPositions?: string[];
  scholarshipsAvailable?: number | null;
  
  // Sport-specific recruiting needs (for recruiters - multi-sport)
  sportSpecificNeeds?: { [sport: string]: { studentClassifications: string[]; positions: string[]; scholarshipsAvailable: number | null; recruitingPhilosophy: string; } };
  
  whatLookingFor?: string;
}

// Helper function to convert form data to profile data
export function convertFormDataToProfileData(formData: OnboardingFormData): OnboardingProfileData {
  return {
    fullName: formData.fullName.trim(),
    sport: formData.sport,
    secondarySports: formData.secondarySports,
    sportPositions: formData.sportPositions,
    graduationYear: formData.graduationYear || undefined,
    educationLevel: formData.educationLevel,
    institutionType: formData.institutionType,
    institutionHistory: formData.institutionHistory,
    organizationName: formData.organizationName.trim(),
    city: formData.city.trim(),
    state: formData.state,
    country: formData.country,
    height: formData.heightFeet && formData.heightInches 
      ? `${formData.heightFeet}'${formData.heightInches}"` 
      : undefined,
    weight: formData.weight ? formData.weight.trim() : undefined,
    positions: formData.positions,
    teamLevel: formData.teamLevel,
    gpa: formData.gpa ? formData.gpa.toString() : null, // Convert number to string
    satScore: formData.satScore || undefined,
    actScore: formData.actScore || undefined,
    intendedMajor: formData.intendedMajor.trim(),
    gender: formData.gender,
    maxprepsUrl: formData.maxprepsUrl.trim(),
    hudlUrl: formData.hudlUrl.trim(),
    instagramHandle: formData.instagramHandle.trim(),
    twitterHandle: formData.twitterHandle.trim(),
    personalStatement: formData.personalStatement.trim(),
    title: formData.title.trim(),
    sportCoaching: formData.sportCoaching,
    secondarySportsRecruiting: formData.secondarySportsRecruiting,
    division: formData.division,
    conference: formData.conference.trim(),
    programWebsite: formData.programWebsite.trim(),
    schoolWebsite: formData.schoolWebsite.trim(),
    orgInstagramHandle: (formData.orgInstagramHandle || formData.instagramHandle).trim(),
    orgTwitterHandle: (formData.orgTwitterHandle || formData.twitterHandle).trim(),
    recruitingPhilosophy: formData.recruitingPhilosophy.trim(),
    recruitingStudentClassifications: formData.recruitingStudentClassifications,
    recruitingPositions: formData.recruitingPositions,
    scholarshipsAvailable: formData.scholarshipsAvailable ?? undefined,
    sportSpecificNeeds: formData.sportSpecificNeeds,
    whatLookingFor: formData.whatLookingFor.trim(),
  };
} 
