export type UserRole = "athlete" | "coach" | "recruiter";

export interface OnboardingData {
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