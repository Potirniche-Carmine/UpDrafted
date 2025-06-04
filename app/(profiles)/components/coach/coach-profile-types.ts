export interface CoachProfileData {
  id: string;
  userId?: string;
  // Basic Information
  fullName: string;
  profileImage?: string;
  title: string;
  sportCoaching: string;
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

  // About Coach (uses personalStatement from database)
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

  // Recruiting Information
  recruitingNeeds?: {
    graduationYears: number[];
    positions: string[];
    scholarshipsAvailable?: number;
    recruitingPhilosophy?: string;
  };
}

export interface CoachProfileProps {
  data: CoachProfileData;
  isOwnProfile?: boolean;
  onConnect?: () => void;
  onShare?: () => void;
  hasPendingVerification?: boolean;
  pendingSubmittedAt?: string;
  connectionStatus?: "none" | "pending" | "connected";
} 