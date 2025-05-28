import { notFound } from 'next/navigation';
import { createClerkClient } from '@clerk/nextjs/server';
import { AthleteProfileWrapper } from '../../components/athlete-profile-wrapper';
import { CoachProfileWrapper } from '../../components/coach-profile-wrapper';
import type { AthleteProfileData } from '@/app/(profiles)/components/athlete-profile';
import type { CoachProfileData } from '@/app/(profiles)/components/coach-profile';

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

const mockCoachData = {
  id: "coach-1",
  fullName: "Coach Sarah Williams",
  profileImage: "/api/placeholder/120/120",
  title: "Head Coach",
  role: "coach" as const,
  sportsCoaching: ["Basketball"],
  organizationName: "University of Texas Basketball",
  organizationLogo: "/api/placeholder/80/80",
  division: "NCAA Division I",
  conference: "Big 12",
  city: "Austin",
  state: "TX",
  isVerified: true,
  officialEmail: "s.williams@texassports.com",
  programInfo: {
    founded: 1906,
    arena: "Frank Erwin Center",
    capacity: 16734,
    facilitiesDescription: "State-of-the-art $165M practice facility with cutting-edge training equipment and academic learning center.",
    academicRanking: "#38 National University",
    graduationRate: 89
  },
  recruitingNeeds: {
    graduationYears: [2025, 2026],
    positions: ["Point Guard", "Center"],
    scholarshipsAvailable: 3,
    recruitingPhilosophy: "We're looking for student-athletes who excel both on the court and in the classroom. Our program emphasizes character, leadership, and academic achievement alongside basketball excellence."
  },
  contact: {
    officialEmail: "recruiting@texassports.com",
    phone: "(512) 471-7437",
    website: "texassports.com/basketball",
    socialMedia: {
      twitter: "@TexasMBB",
      instagram: "@texasmbb"
    }
  },
  programSuccess: {
    recentAchievements: [
      "Big 12 Champions (2024)",
      "NCAA Tournament Elite Eight (2023)",
      "Big 12 Coach of the Year (2024)",
      "Top 25 Ranking for 3 consecutive years"
    ],
    nbaAlumni: ["Kevin Durant", "LaMarcus Aldridge", "Myles Turner"],
    conferenceChampionships: 3,
    nationalChampionships: 1,
    playoffAppearances: 15
  },
  recentActivity: [
    { athlete: "James Wilson (PG)", action: "Connected", timeAgo: "1 hour ago", location: "Dallas, TX" },
    { athlete: "Mike Rodriguez (SF)", action: "Viewed Profile", timeAgo: "3 hours ago", location: "Houston, TX" },
    { athlete: "Tyler Johnson (C)", action: "Connected", timeAgo: "1 day ago", location: "San Antonio, TX" }
  ],
  stats: {
    athletesRecruited: 89,
    mutualConnections: 23,
    profileViews: 456
  }
};

const mockRecruiterData = {
  ...mockCoachData,
  id: "recruiter-1",
  fullName: "John Davis",
  title: "Recruiting Coordinator",
  role: "recruiter" as const,
  recruitingNeeds: {
    ...mockCoachData.recruitingNeeds,
    recruitingPhilosophy: "As a recruiter, I focus on identifying talented student-athletes who fit our program's culture and academic standards. I'm here to guide you through the recruitment process and help you find the right fit."
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

  if (userData.type === 'athlete') {
    return (
      <AthleteProfileWrapper
        data={userData.data as AthleteProfileData}
      />
    );
  }

  if (userData.type === 'coach' || userData.type === 'recruiter') {
    return (
      <CoachProfileWrapper
        data={userData.data as CoachProfileData}
      />
    );
  }

  return notFound();
} 