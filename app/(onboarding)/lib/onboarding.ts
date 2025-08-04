export type UserRole = "athlete" | "coach" | "recruiter";
export type EducationLevel = 'high_school' | 'undergraduate' | 'graduate' | 'associate';

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
  graduationYear: number | null;
  educationLevel: EducationLevel;
  competitionLevel: string;
  organizationName: string;
  city: string;
  state: string;
  country: string; // New: athlete country (default United States)
  heightFeet: string;
  heightInches: string;
  weight: string;
  positions: string[];
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
  hudlVerified?: boolean;
  
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
  graduationYear?: number;
  educationLevel?: EducationLevel;
  competitionLevel?: string;
  organizationName?: string;
  city: string;
  state: string;
  country: string;
  height?: string; // Combined from heightFeet and heightInches
  weight?: string;
  positions?: string[];
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
  hudlVerified?: boolean;
  
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
    graduationYear: formData.graduationYear || undefined,
    educationLevel: formData.educationLevel,
    competitionLevel: formData.competitionLevel || undefined,
    organizationName: formData.organizationName.trim(),
    city: formData.city.trim(),
    state: formData.state,
    country: formData.country,
    height: formData.heightFeet && formData.heightInches 
      ? `${formData.heightFeet}'${formData.heightInches}"` 
      : undefined,
    weight: formData.weight ? formData.weight.trim() : undefined,
    positions: formData.positions,
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
    hudlVerified: formData.hudlVerified,
    title: formData.title.trim(),
    sportCoaching: formData.sportCoaching,
    secondarySportsRecruiting: formData.secondarySportsRecruiting,
    division: formData.division,
    conference: formData.conference.trim(),
    programWebsite: formData.programWebsite.trim(),
    schoolWebsite: formData.schoolWebsite.trim(),
    orgInstagramHandle: formData.orgInstagramHandle.trim(),
    orgTwitterHandle: formData.orgTwitterHandle.trim(),
    recruitingPhilosophy: formData.recruitingPhilosophy.trim(),
    recruitingStudentClassifications: formData.recruitingStudentClassifications,
    recruitingPositions: formData.recruitingPositions,
    scholarshipsAvailable: formData.scholarshipsAvailable ?? undefined,
    sportSpecificNeeds: formData.sportSpecificNeeds,
    whatLookingFor: formData.whatLookingFor.trim(),
  };
} 