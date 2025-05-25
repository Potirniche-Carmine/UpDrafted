import { notFound } from 'next/navigation';
import { createClerkClient } from '@clerk/nextjs/server';
import { AthleteProfileWrapper } from '@/components/athlete-profile-wrapper';
import { getFullAthleteData, getUserById } from '@/lib/database-utils';

interface ProfilePageProps {
  params: {
    id: string;
  };
}

async function getUserData(userId: string) {
  try {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY
    });
    
    // Get user from Clerk
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role as string;
    
    // Get user from our database
    const dbUser = await getUserById(userId);
    
    if (!dbUser) {
      // User exists in Clerk but not in our database - this shouldn't happen in production
      // but might during development
      return null;
    }
    
    if (userRole === 'athlete') {
      const athleteData = await getFullAthleteData(userId);
      if (!athleteData) return null;
      return { type: 'athlete' as const, data: athleteData };
    } else if (userRole === 'coach') {
      // TODO: Implement getFullCoachData similar to getFullAthleteData
      // For now, return null to trigger 404
      return null;
    } else if (userRole === 'recruiter') {
      // TODO: Implement getFullRecruiterData similar to getFullAthleteData
      // For now, return null to trigger 404
      return null;
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
        data={userData.data}
      />
    );
  }

  // For now, only athlete profiles are supported
  // Coach and recruiter profiles will be implemented later
  return notFound();
} 