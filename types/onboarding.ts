export type UserRole = "athlete" | "coach" | "recruiter";

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
  highSchool: string;
  city: string;
  state: string;
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
  
  // Coach/Recruiter fields
  title: string;
  sportCoaching: string;
  organizationName: string;
  division: string;
  conference: string;
  programWebsite: string;
  schoolWebsite: string;
  orgInstagramHandle: string;
  orgTwitterHandle: string;
  recruitingPhilosophy: string;
  
  // Recruiting needs
  recruitingGraduationYears: number[];
  recruitingPositions: string[];
  scholarshipsAvailable: number | null;
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
  highSchool?: string;
  city: string;
  state: string;
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
  
  // Coach/Recruiter specific
  title?: string;
  sportCoaching?: string;
  organizationName?: string;
  division?: string;
  conference?: string;
  programWebsite?: string;
  schoolWebsite?: string;
  orgInstagramHandle?: string;
  orgTwitterHandle?: string;
  recruitingPhilosophy?: string;
  
  // Recruiting needs
  recruitingGraduationYears?: number[];
  recruitingPositions?: string[];
  scholarshipsAvailable?: number | null;
  whatLookingFor?: string;
}

// Helper function to convert form data to profile data
export function convertFormDataToProfileData(formData: OnboardingFormData): OnboardingProfileData {
  return {
    fullName: formData.fullName.trim(),
    sport: formData.sport,
    secondarySports: formData.secondarySports,
    graduationYear: formData.graduationYear || undefined,
    highSchool: formData.highSchool.trim(),
    city: formData.city.trim(),
    state: formData.state,
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
    title: formData.title.trim(),
    sportCoaching: formData.sportCoaching,
    organizationName: formData.organizationName.trim(),
    division: formData.division,
    conference: formData.conference.trim(),
    programWebsite: formData.programWebsite.trim(),
    schoolWebsite: formData.schoolWebsite.trim(),
    orgInstagramHandle: formData.orgInstagramHandle.trim(),
    orgTwitterHandle: formData.orgTwitterHandle.trim(),
    recruitingPhilosophy: formData.recruitingPhilosophy.trim(),
    recruitingGraduationYears: formData.recruitingGraduationYears,
    recruitingPositions: formData.recruitingPositions,
    scholarshipsAvailable: formData.scholarshipsAvailable || undefined,
    whatLookingFor: formData.whatLookingFor.trim(),
  };
} 