import { EducationLevel } from '@/app/(onboarding)/lib/onboarding';

export interface Measurable {
  id: string;
  sport: string;
  label: string;
  value: string;
  measurementDate: string;
}

export interface AthleteProfileData {
  id: string;
  userId?: string; // Add userId field from database
  // Basic Information
  fullName: string;
  profileImage?: string;
  sport: string;
  secondarySports?: string[];
  graduationYear: number;
  educationLevel: EducationLevel;
  competitionLevel?: string; // 'division_1', 'division_2', 'division_3', 'naia', 'njcaa', 'club', 'intramural', 'recreational'
  division?: string;
  conference?: string;
  organizationName: string;
  city: string;
  state: string;
  gpa?: number | string;
  satScore?: number;
  actScore?: number;
  height: string;
  weight: string;
  positions: string[];
  campExperience?: Array<{
    type: 'Camp' | 'Club';
    name: string;
    city: string;
    stateCountry: string;
    startDate: Date; // Changed from string to Date
    endDate: Date; // Changed from Date | null to Date (uses special date for "Present")
    sport: string;
    description: string;
  }>;

  // Verification
  maxPrepsUrl?: string;
  isVerified: boolean;
  transferPortalVerifiedAt?: string;
  isOnTransferPortal?: boolean;

  // Media
  hudlUrl?: string;
  youtubeVideos?: {
    id?: string;
    title: string;
    url: string;
    embedUrl: string;
    sortOrder?: number;
  }[];

  // Social Media (highlighted)
  socialMedia?: {
    instagram?: string;
    twitter?: string;
  };

  // Academic Information
  intendedMajor?: string;

  // Personal Statement
  personalStatement?: string;

  // Additional Info
  achievements?: string[];

  // Measurables
  measurables?: Measurable[];
}

export interface AthleteProfileProps {
  data: AthleteProfileData;
  isOwnProfile?: boolean;
  onConnect?: () => void;
  onShare?: () => void;
  hasPendingVerification?: boolean;
  pendingSubmittedAt?: string;
  hasRejectedVerification?: boolean;
  rejectionReason?: string;
  rejectedAt?: string;
  // Transfer Portal Verification Status
  hasPendingTransferPortalVerification?: boolean;
  transferPortalPendingSubmittedAt?: string;
  hasRejectedTransferPortalVerification?: boolean;
  transferPortalRejectionReason?: string;
  transferPortalRejectedAt?: string;
  connectionStatus?: "none" | "pending" | "connected";
  connectionDirection?: "incoming" | "outgoing" | null;
}

export interface MeasurableEditData {
  label: string;
  value: string;
  customLabel: string;
  isCustom: boolean;
  measurementMonth: string;
  measurementYear: string;
  selectedMeasurableId: string;
} 