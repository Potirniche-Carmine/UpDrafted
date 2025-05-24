# Dynamic Profile System

This system provides dynamic profile components for athletes, coaches, and recruiters based on the MVP requirements for UpDrafted.

## Components

### 1. AthleteProfile Component
Located at `components/athlete-profile.tsx`

**Features:**
- Basic Information (name, sport, graduation year, location, etc.)
- Athletic Profile (height, weight, positions, high school)
- Academic Profile (GPA, SAT/ACT scores, intended major)
- Contact Information (email, phone, social media)
- Personal Statement/Bio
- MaxPreps Verification & Stats
- Hudl Profile Integration
- YouTube Video Embeds (up to 3 videos)
- Key Achievements
- Recent Connection Activity

### 2. CoachProfile Component
Located at `components/coach-profile.tsx`

**Features:**
- Basic Information (name, title, organization, location)
- Program Overview (sports, division, conference)
- Recruiting Needs (graduation years, positions, scholarships)
- Contact Information (official email, phone, website, social media)
- Recruiting Philosophy
- Program Success (championships, achievements, alumni)
- Facilities & Academics
- Recent Recruiting Activity
- Recruiting Stats

**Dynamic Role Support:**
- Supports both "coach" and "recruiter" roles
- Different button actions based on role
- Role-specific labeling and behavior

## Dynamic Profile Page

### Location
`app/profile/[id]/page.tsx`

### How It Works
1. Takes a user ID from the URL parameter
2. Fetches user data from Clerk to determine their role
3. Dynamically renders the appropriate profile component based on role:
   - `athlete` → AthleteProfile component
   - `coach` → CoachProfile component  
   - `recruiter` → CoachProfile component (with recruiter-specific behavior)

### Clerk Integration
The system uses Clerk's `publicMetadata.role` to determine which profile to render:

```typescript
const user = await clerkClient.users.getUser(userId);
const userRole = user.publicMetadata?.role as string;
```

## Usage Examples

### Setting User Roles in Clerk
When users sign up, set their role in Clerk's public metadata:

```typescript
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    role: 'athlete' // or 'coach' or 'recruiter'
  }
});
```

### Using the Components Directly

```tsx
import { AthleteProfile, CoachProfile } from '@/components';
import type { AthleteProfileData, CoachProfileData } from '@/components';

// Athlete Profile
<AthleteProfile 
  data={athleteData}
  onConnect={() => console.log('Connect clicked')}
  onMessage={() => console.log('Message clicked')}
/>

// Coach/Recruiter Profile
<CoachProfile 
  data={coachData}
  onConnect={() => console.log('Connect clicked')}
  onMessage={() => console.log('Message clicked')}
  onShowInterest={() => console.log('Show interest clicked')}
/>
```

### Accessing the Dynamic Profile
Visit `/profile/[clerk-user-id]` to see the dynamic profile based on the user's role.

## Data Structure

### AthleteProfileData Interface
```typescript
interface AthleteProfileData {
  id: string;
  fullName: string;
  profileImage?: string;
  sport: string;
  secondarySports?: string[];
  graduationYear: number;
  highSchool: string;
  city: string;
  state: string;
  gpa?: number;
  satScore?: number;
  actScore?: number;
  height: string;
  weight: string;
  positions: string[];
  maxPrepsUrl: string;
  maxPrepsVerified: boolean;
  hudlUrl?: string;
  youtubeVideos: Array<{
    title: string;
    url: string;
    embedUrl: string;
  }>;
  email: string;
  phone?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
  };
  intendedMajor?: string;
  ncaaEligibilityId?: string;
  personalStatement?: string;
  achievements: string[];
  stats?: {
    season: string;
    stats: Array<{ label: string; value: string }>;
  };
  recentActivity?: Array<{
    program: string;
    action: string;
    timeAgo: string;
  }>;
}
```

### CoachProfileData Interface
```typescript
interface CoachProfileData {
  id: string;
  fullName: string;
  profileImage?: string;
  title: string;
  role: "coach" | "recruiter";
  sportsCoaching: string[];
  organizationName: string;
  organizationLogo?: string;
  division: string;
  conference?: string;
  city: string;
  state: string;
  isVerified: boolean;
  officialEmail: string;
  programInfo?: {
    founded?: number;
    arena?: string;
    capacity?: number;
    facilitiesDescription?: string;
    academicRanking?: string;
    graduationRate?: number;
  };
  recruitingNeeds: {
    graduationYears: number[];
    positions: string[];
    scholarshipsAvailable?: number;
    recruitingPhilosophy?: string;
  };
  contact: {
    officialEmail: string;
    phone?: string;
    website?: string;
    socialMedia?: {
      twitter?: string;
      instagram?: string;
    };
  };
  programSuccess?: {
    recentAchievements: string[];
    nbaAlumni?: string[];
    conferenceChampionships?: number;
    nationalChampionships?: number;
    playoffAppearances?: number;
  };
  recentActivity?: Array<{
    athlete: string;
    action: string;
    timeAgo: string;
    location?: string;
  }>;
  stats?: {
    athletesRecruited: number;
    mutualConnections: number;
    profileViews?: number;
  };
}
```

## MVP Features Implemented

### Athlete Profile MVP Features ✅
- ✅ Basic Information (name, sport, graduation year, location)
- ✅ Profile Picture support
- ✅ Contact Information with privacy considerations
- ✅ Height, Weight, Positions
- ✅ MaxPreps Profile Link & Verification Badge
- ✅ Hudl Profile Integration
- ✅ YouTube Video Embeds (up to 3)
- ✅ Academic Information (GPA, SAT/ACT, intended major, NCAA ID)
- ✅ Personal Statement/Bio (250-500 characters)
- ✅ Key Achievements
- ✅ Recent Activity/Connections

### Coach/Recruiter Profile MVP Features ✅
- ✅ Basic Information (name, title, organization)
- ✅ Verification Badge for verified coaches/recruiters
- ✅ Contact Information (official email, phone)
- ✅ Recruiting Needs (graduation years, positions)
- ✅ Brief Program/Recruiting Philosophy
- ✅ Dynamic role-based behavior (coach vs recruiter)
- ✅ Program success metrics
- ✅ Recent recruiting activity

### Core Platform Features ✅
- ✅ Dynamic profile rendering based on user role
- ✅ Clerk integration for user authentication and metadata
- ✅ Responsive design with modern UI
- ✅ TypeScript support with proper type definitions
- ✅ Component-based architecture for reusability

## Next Steps for Production

1. **Database Integration**: Replace mock data with actual database queries
2. **Image Upload**: Implement profile image upload functionality
3. **Privacy Settings**: Add granular privacy controls for contact information
4. **Verification System**: Implement backend verification for coaches/recruiters
5. **Search & Discovery**: Add search functionality to find profiles
6. **Messaging System**: Implement the chat/messaging feature
7. **Connection System**: Add connection request/acceptance logic
8. **Premium Features**: Implement tiered access and premium features

## Dependencies

- Next.js 15+
- React 19+
- Clerk for authentication
- Tailwind CSS for styling
- Lucide React for icons
- TypeScript for type safety 