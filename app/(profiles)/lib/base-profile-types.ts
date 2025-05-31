export interface BaseProfileData {
  id: string;
  // Basic Information
  fullName: string;
  profileImage?: string;
  title: string;
  organizationName: string;
  organizationLogoR3Key?: string;
  organizationLogo?: string;
  division: string;
  conference?: string;
  city: string;
  state: string;

  // Verification
  isVerified: boolean;

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
}

export interface RecruitingNeeds {
  graduationYears: number[];
  positions: string[];
  scholarshipsAvailable?: number;
  recruitingPhilosophy?: string;
}

export interface CoachProfileData extends BaseProfileData {
  sportCoaching: string;
  recruitingNeeds?: RecruitingNeeds;
}

export interface RecruitingProfileData extends BaseProfileData {
  sportRecruiting: string;
  recruitingNeeds?: RecruitingNeeds;
} 