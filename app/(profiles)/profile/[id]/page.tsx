import { notFound } from 'next/navigation';
import { createClerkClient } from '@clerk/nextjs/server';
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
  isVerified: true,
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
  isVerified: true,
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

async function getUserData(userId: string) {
  try {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY
    });
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    
    if (userRole === 'athlete') {
      return { type: 'athlete' as const, data: mockAthleteData };
    } else if (userRole === 'coach') {
      return { type: 'coach' as const, data: mockCoachData };
    } else if (userRole === 'recruiter') {
      return { type: 'recruiter' as const, data: mockRecruiterData };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const userData = await getUserData(id);
  
  if (!userData) {
    notFound();
  }

  // Determine if this is the user's own profile
  // For now, we'll simulate this being the user's own profile for testing
  const isOwnProfile = true; // Change this logic based on your authentication system

  if (userData.type === 'athlete') {
    return (
      <AthleteProfileWrapper
        data={userData.data as AthleteProfileData}
        isOwnProfile={isOwnProfile}
      />
    );
  }

  if (userData.type === 'coach') {
    return (
      <CoachProfileWrapper
        data={userData.data as CoachProfileData}
        isOwnProfile={isOwnProfile}
      />
    );
  }

  if (userData.type === 'recruiter') {
    return (
      <RecruiterProfileWrapper
        data={userData.data as RecruitingProfileData}
        isOwnProfile={isOwnProfile}
      />
    );
  }

  return notFound();
} 