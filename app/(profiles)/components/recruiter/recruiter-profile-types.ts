export interface RecruiterProfileData {
  id: string;
  userId?: string;
  // Basic Information
  fullName: string;
  profileImage?: string;
  title: string;
  sportRecruiting: string;
  secondarySports?: string[];
  organizationName: string;
  organizationLogo?: string;
  organizationLogoR3Key?: string;
  city: string;
  state: string;
  
  // Division info (this contains the level information)
  division: string;
  conference?: string;

  // Verification
  isVerified: boolean;

  // About Recruiter (uses personalStatement from database)
  personalStatement?: string;

  // Websites
  programWebsite?: string;
  schoolWebsite?: string;

  // Social Media
  instagramHandle?: string;
  twitterHandle?: string;

  // Video Showcase
  showcaseVideoTitle?: string;
  showcaseVideoUrl?: string;
  showcaseVideoEmbedUrl?: string;

  // Sport-specific recruiting information (matches database structure)
  sportSpecificNeeds?: { [sport: string]: {
    graduationYears: number[];
    positions: string[];
    scholarshipsAvailable?: number;
    recruitingPhilosophy?: string;
  } };
}

export interface RecruiterProfileProps {
  data: RecruiterProfileData;
  isOwnProfile?: boolean;
  onConnect?: () => void;
  onShare?: () => void;
  hasPendingVerification?: boolean;
  pendingSubmittedAt?: string;
  hasRejectedVerification?: boolean;
  rejectionReason?: string;
  rejectedAt?: string;
  connectionStatus?: "none" | "pending" | "connected";
} 