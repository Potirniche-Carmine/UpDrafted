import { notFound } from 'next/navigation';
import { createClerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { AthleteProfileWrapper } from '../../components/athlete-profile-wrapper';
import { CoachProfileWrapper } from '../../components/coach-profile-wrapper';
import { RecruiterProfileWrapper } from '../../components/recruiter-profile-wrapper';
import type { AthleteProfileData } from '../../components/athlete-profile';
import type { CoachProfileData, RecruitingProfileData } from '../../lib/base-profile-types';

// Mock data - in real implementation, this would come from your database
const mockAthleteData = {
  id: "athlete-1",
  fullName: "Marcus Johnson",
  profileImage: "/api/placeholder/120/120",
  sport: "Basketball",
  secondarySports: ["Track & Field"],
  graduationYear: 2025,
  highSchool: "Westfield High School",
  city: "Chicago",
  state: "IL",
  gpa: 3.8,
  satScore: 1320,
  height: "6'2\"",
  weight: "185 lbs",
  positions: ["Point Guard", "Shooting Guard"],
  maxPrepsUrl: "https://www.maxpreps.com/il/chicago/westfield-high-school/basketball/winter-22-23/roster/marcus-johnson",
  maxPrepsVerified: true,
  hudlUrl: "https://www.hudl.com/profile/123456",
  youtubeVideos: [
    {
      title: "Junior Season Highlights",
      url: "https://youtube.com/watch?v=abc123",
      embedUrl: "https://youtube.com/embed/abc123"
    },
    {
      title: "State Championship Game",
      url: "https://youtube.com/watch?v=def456",
      embedUrl: "https://youtube.com/embed/def456"
    }
  ],
  email: "marcus.johnson@example.com",
  phone: "(555) 123-4567",
  socialMedia: {
    instagram: "@marcus_hoops",
    twitter: "@MJ_Hoops21"
  },
  intendedMajor: "Business Administration",
  ncaaEligibilityId: "1234567890",
  personalStatement: "Dedicated point guard with strong leadership skills and a passion for the game. I've been team captain for two years and led our team to the state championship. Looking for a program that values both academic excellence and athletic achievement.",
  achievements: [
    "All-State First Team (2024)",
    "Conference MVP (2024)",
    "Team Captain (2023-24)",
    "Honor Roll Student",
    "State Championship Finalist"
  ],
  measurables: [
    // Basketball measurables
    {
      id: "1",
      sport: "Basketball",
      label: "Vertical Jump",
      value: "32 inches",
      measurementDate: "2024-03-15"
    },
    {
      id: "2",
      sport: "Basketball",
      label: "Lane Agility",
      value: "10.8 seconds",
      measurementDate: "2024-03-15"
    },
    {
      id: "3",
      sport: "Basketball",
      label: "3/4 Court Sprint",
      value: "3.2 seconds",
      measurementDate: "2024-03-15"
    },
    {
      id: "4",
      sport: "Basketball",
      label: "Bench Press",
      value: "185 lbs",
      measurementDate: "2024-02-20"
    },
    // Track & Field measurables
    {
      id: "5",
      sport: "Track & Field",
      label: "100m Dash",
      value: "11.2 seconds",
      measurementDate: "2024-04-10"
    },
    {
      id: "6",
      sport: "Track & Field",
      label: "200m Dash",
      value: "22.8 seconds",
      measurementDate: "2024-04-10"
    },
    {
      id: "7",
      sport: "Track & Field",
      label: "Long Jump",
      value: "21'3\"",
      measurementDate: "2024-04-05"
    },
    {
      id: "8",
      sport: "Track & Field",
      label: "40-Yard Dash",
      value: "4.6 seconds",
      measurementDate: "2024-03-22"
    }
  ],
  stats: {
    season: "2023-24",
    stats: [
      { label: "PPG", value: "18.5" },
      { label: "APG", value: "7.2" },
      { label: "RPG", value: "4.8" },
      { label: "FG%", value: "47%" },
      { label: "3P%", value: "38%" },
      { label: "FT%", value: "85%" }
    ]
  },
  recentActivity: [
    { program: "Duke Basketball", action: "Connected", timeAgo: "2 hours ago" },
    { program: "North Carolina Basketball", action: "Viewed Profile", timeAgo: "1 day ago" },
    { program: "Texas Basketball", action: "Connected", timeAgo: "3 days ago" }
  ]
};

const mockCoachData: CoachProfileData = {
  id: "coach-1",
  fullName: "Coach Sarah Williams",
  profileImage: "/api/placeholder/120/120",
  title: "Head Coach",
  sportCoaching: "Basketball",
  organizationName: "University of Texas Basketball",
  organizationLogo: "/api/placeholder/80/80",
  division: "NCAA Division I",
  conference: "Big 12",
  city: "Austin",
  state: "TX",
  isVerified: false,
  programWebsite: "https://texassports.com/basketball",
  schoolWebsite: "https://utexas.edu",
  instagramHandle: "@texasmbb",
  twitterHandle: "@TexasMBB",
  showcaseVideoTitle: "Inside Our Championship Training Facility",
  showcaseVideoUrl: "https://youtube.com/watch?v=facility123",
  showcaseVideoEmbedUrl: "https://youtube.com/embed/facility123",
  recruitingNeeds: {
    graduationYears: [2025, 2026],
    positions: ["Point Guard", "Center", "Power Forward"],
    scholarshipsAvailable: 3,
    recruitingPhilosophy: "We're looking for student-athletes who excel both on the court and in the classroom. Our program emphasizes character, leadership, and academic achievement alongside basketball excellence."
  }
};

const mockRecruiterData: RecruitingProfileData = {
  id: "recruiter-1",
  fullName: "John Davis",
  profileImage: "/api/placeholder/120/120",
  title: "Recruiting Coordinator",
  sportRecruiting: "Basketball",
  organizationName: "University of Texas Athletics",
  organizationLogo: "/api/placeholder/80/80",
  division: "NCAA Division I",
  conference: "Big 12",
  city: "Austin",
  state: "TX",
  isVerified: false,
  programWebsite: "https://texassports.com",
  schoolWebsite: "https://utexas.edu",
  instagramHandle: "@texasathletics",
  twitterHandle: "@TexasAthletics",
  showcaseVideoTitle: "Texas Athletics Recruiting Showcase",
  showcaseVideoUrl: "https://youtube.com/watch?v=recruiting123",
  showcaseVideoEmbedUrl: "https://youtube.com/embed/recruiting123",
  recruitingNeeds: {
    graduationYears: [2025, 2026, 2027],
    positions: ["Point Guard", "Shooting Guard", "Small Forward"],
    scholarshipsAvailable: 5,
    recruitingPhilosophy: "As a recruiter, I focus on identifying talented student-athletes who fit our program's culture and academic standards. I'm here to guide you through the recruitment process and help you find the right fit for basketball."
  }
};

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

// Add caching and optimize Clerk client creation with connection pooling
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
});

// Cache user data for better performance
interface CachedUserData {
  data: {
    type: 'athlete' | 'coach' | 'recruiter';
    data: AthleteProfileData | CoachProfileData | RecruitingProfileData;
    currentUserRole?: string | null;
    isOwnProfile: boolean;
  } | null;
  timestamp: number;
}

const userDataCache = new Map<string, CachedUserData>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getUserData(userId: string, currentUserId?: string) {
  try {
    // Validate userId format first
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.warn('Invalid userId provided:', userId);
      return null;
    }

    // Check cache first
    const cacheKey = `${userId}-${currentUserId || 'none'}`;
    const cached = userDataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Optimize: Only fetch the target user, current user only when needed
    const userPromise = clerkClient.users.getUser(userId);
    const currentUserPromise = currentUserId && currentUserId !== userId 
      ? clerkClient.users.getUser(currentUserId) 
      : null;
    
    // Use Promise.allSettled to handle potential failures gracefully
    const [userResult, currentUserResult] = await Promise.allSettled([
      userPromise,
      currentUserPromise
    ]);
    
    if (userResult.status === 'rejected') {
      console.error('Failed to fetch user:', userResult.reason);
      return null;
    }
    
    const user = userResult.value;
    const currentUser = currentUserResult?.status === 'fulfilled' 
      ? currentUserResult.value 
      : (currentUserId === userId ? user : null);
    
    const userRole = user.publicMetadata?.role as string;
    const currentUserRole = currentUser?.publicMetadata?.role as string;
    
    // Early return if user doesn't have a profile role
    if (!userRole || !['athlete', 'coach', 'recruiter'].includes(userRole)) {
      return null;
    }
    
    let profileData = null;
    if (userRole === 'athlete') {
      profileData = { type: 'athlete' as const, data: mockAthleteData };
    } else if (userRole === 'coach') {
      profileData = { type: 'coach' as const, data: mockCoachData };
    } else if (userRole === 'recruiter') {
      profileData = { type: 'recruiter' as const, data: mockRecruiterData };
    }
    
    const result = profileData ? {
      ...profileData,
      currentUserRole,
      isOwnProfile: currentUserId === userId
    } : null;

    // Cache the result
    if (result) {
      userDataCache.set(cacheKey, { data: result, timestamp: Date.now() });
    }

    return result;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Generate metadata for better SEO
export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const userData = await getUserData(id);
  
  if (!userData) {
    return {
      title: 'Profile Not Found | UpDrafted',
      description: 'The requested profile could not be found.'
    };
  }

  const { data, type } = userData;
  let title = '';
  let description = '';
  
  if (type === 'athlete') {
    const athleteData = data as AthleteProfileData;
    title = `${athleteData.fullName} - ${athleteData.sport} Athlete | UpDrafted`;
    description = `View ${athleteData.fullName}'s athletic profile. ${athleteData.positions.join(', ')} from ${athleteData.highSchool} graduating in ${athleteData.graduationYear}.`;
  } else if (type === 'coach') {
    const coachData = data as CoachProfileData;
    title = `${coachData.fullName} - ${coachData.title} | UpDrafted`;
    description = `Connect with ${coachData.fullName}, ${coachData.title} at ${coachData.organizationName}. ${coachData.division} ${coachData.sportCoaching} program.`;
  } else if (type === 'recruiter') {
    const recruiterData = data as RecruitingProfileData;
    title = `${recruiterData.fullName} - ${recruiterData.title} | UpDrafted`;
    description = `Connect with ${recruiterData.fullName}, ${recruiterData.title} at ${recruiterData.organizationName}. ${recruiterData.division} ${recruiterData.sportRecruiting} recruiting.`;
  }
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: data.profileImage ? [data.profileImage] : []
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: data.profileImage ? [data.profileImage] : []
    }
  };
}

// Loading component for better UX
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="container py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="space-y-4 md:space-y-6">
            <div className="bg-card rounded-lg p-6">
              <div className="w-32 h-32 md:w-36 md:h-36 mx-auto rounded-full bg-muted"></div>
              <div className="mt-4 space-y-2">
                <div className="h-6 bg-muted rounded mx-auto w-48"></div>
                <div className="h-4 bg-muted rounded mx-auto w-32"></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg p-6">
              <div className="h-6 bg-muted rounded w-32 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  
  // Get the current authenticated user
  const { userId: currentUserId } = await auth();
  
  // Single optimized call that fetches both users if needed
  const userData = await getUserData(id, currentUserId || undefined);
  
  if (!userData) {
    notFound();
  }

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      {userData.type === 'athlete' && (
        <AthleteProfileWrapper
          data={userData.data as AthleteProfileData}
          isOwnProfile={userData.isOwnProfile}
          currentUserRole={userData.currentUserRole}
        />
      )}

      {userData.type === 'coach' && (
        <CoachProfileWrapper
          data={userData.data as CoachProfileData}
          isOwnProfile={userData.isOwnProfile}
          currentUserRole={userData.currentUserRole}
        />
      )}

      {userData.type === 'recruiter' && (
        <RecruiterProfileWrapper
          data={userData.data as RecruitingProfileData}
          isOwnProfile={userData.isOwnProfile}
          currentUserRole={userData.currentUserRole}
        />
      )}
    </Suspense>
  );
} 