import { AthleteProfileWrapper, CoachProfileWrapper } from '@/components';
import type { AthleteProfileData, CoachProfileData } from '@/components';

// Mock data for testing
const mockAthleteData: AthleteProfileData = {
  id: "athlete-test",
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
  maxPrepsUrl: "https://www.maxpreps.com/test",
  maxPrepsVerified: true,
  hudlUrl: "https://www.hudl.com/profile/123456",
  hudlEmbedUrl: "https://www.hudl.com/embed/video/123456",
  youtubeVideos: [
    {
      title: "Junior Season Highlights",
      url: "https://youtube.com/watch?v=abc123",
      embedUrl: "https://youtube.com/embed/abc123"
    }
  ],
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
  ]
};

const mockCoachData: CoachProfileData = {
  id: "coach-test",
  fullName: "Coach Sarah Williams",
  profileImage: "/api/placeholder/120/120",
  title: "Head Coach",
  role: "coach",
  sportsCoaching: ["Basketball"],
  organizationName: "University of Texas Basketball",
  organizationLogo: "/api/placeholder/80/80",
  division: "NCAA Division I",
  conference: "Big 12",
  city: "Austin",
  state: "TX",
  isVerified: true,
  programInfo: {
    founded: 1906,
    arena: "Frank Erwin Center",
    capacity: 16734,
    facilitiesDescription: "State-of-the-art practice facility with cutting-edge training equipment.",
    academicRanking: "#38 National University",
    graduationRate: 89,
    campusLife: "Austin is consistently ranked as one of the best college towns in America, offering vibrant music scene, incredible food, and endless opportunities for personal growth."
  },
  whatWeOffer: {
    highlights: [
      "Direct path to NBA development",
      "Top 10 coaching staff in the nation",
      "Premier conference competition",
      "Academic excellence programs",
      "State-of-the-art facilities",
      "National TV exposure"
    ],
    playingTimeOpportunity: "We believe in developing our players from day one. Talented freshmen will have immediate opportunities to contribute and earn meaningful minutes based on performance and dedication.",
    academicSupport: "Our academic learning center provides personalized tutoring, study halls, and career counseling to ensure every student-athlete graduates with a valuable degree and real-world skills.",
    facilityFeatures: [
      "165M practice facility",
      "Professional-grade weight room",
      "Recovery and rehabilitation center",
      "Nutrition center with chef",
      "Film study rooms",
      "Academic learning center"
    ],
    coachingStyle: "We develop complete players through a fast-paced, defensive-minded system that emphasizes teamwork, basketball IQ, and individual skill development."
  },
  recruitingNeeds: {
    graduationYears: [2025, 2026],
    positions: ["Point Guard", "Center"],
    scholarshipsAvailable: 3,
    recruitingPhilosophy: "We're looking for student-athletes who want to compete at the highest level while earning a world-class education. Our program is built on character, work ethic, and the pursuit of excellence both on and off the court."
  },
  socialMedia: {
    twitter: "@TexasMBB",
    instagram: "@texasmbb"
  },
  programSuccess: {
    recentAchievements: [
      "Big 12 Champions (2024)",
      "NCAA Tournament Elite Eight (2023)",
      "Big 12 Coach of the Year (2024)",
      "Top 25 Ranking for 3 consecutive years"
    ],
    conferenceChampionships: 3,
    nationalChampionships: 1,
    playoffAppearances: 15
  }
};

export default function TestProfilesPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-8">Athlete Profile Test</h1>
        <AthleteProfileWrapper data={mockAthleteData} />
      </div>
      
      <hr className="my-12" />
      
      <div>
        <h1 className="text-3xl font-bold mb-8">Coach Profile Test</h1>
        <CoachProfileWrapper data={mockCoachData} />
      </div>
    </div>
  );
} 