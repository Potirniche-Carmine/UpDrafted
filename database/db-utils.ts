import { eq, and, desc } from 'drizzle-orm';
import { db } from './db';
import { 
  users, 
  athleteProfiles, 
  coachProfiles,
  recruitingProfiles,
  recruitingNeeds,
  recruitingProfileNeeds,
  connections,
  activityLog,
  type NewUser,
  type NewAthleteProfile,
  type NewCoachProfile,
  type NewRecruitingProfile,
  type NewRecruitingNeeds,
  type NewRecruitingProfileNeeds
} from './schema';
import { OnboardingProfileData } from '@/app/(onboarding)/lib/onboarding';

// User operations
export const userOperations = {
  // Get user by ID with profile
  async getUserWithProfile(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        athleteProfile: true,
        coachProfile: true,
        recruitingProfile: true
      }
    });
    return user;
  },

  // Create new user
  async createUser(userData: NewUser) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  },

  // Update user
  async updateUser(userId: string, userData: Partial<NewUser>) {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  },

  // Create or update user (for onboarding)
  async createOrUpdateUser(userId: string, userData: NewUser) {
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (existingUser.length === 0) {
      // Create new user
      return await this.createUser(userData);
    } else {
      // Update existing user
      return await this.updateUser(userId, userData);
    }
  },

  // Get users by role
  async getUsersByRole(role: 'athlete' | 'coach' | 'recruiter') {
    return await db.query.users.findMany({
      where: eq(users.role, role),
      with: {
        athleteProfile: role === 'athlete' ? true : undefined,
        coachProfile: role === 'coach' ? true : undefined,
        recruitingProfile: role === 'recruiter' ? true : undefined,
      }
    });
  }
};

// Athlete operations
export const athleteOperations = {
  // Get athlete profile with all related data
  async getAthleteProfile(userId: string) {
    return await db.query.athleteProfiles.findFirst({
      where: eq(athleteProfiles.userId, userId),
      with: {
        user: true,
        measurables: true,
        videos: true,
        connections: {
          with: {
            coach: {
              with: {
                user: true
              }
            }
          }
        }
      }
    });
  },

  // Create athlete profile
  async createAthleteProfile(profileData: NewAthleteProfile) {
    const [profile] = await db.insert(athleteProfiles).values(profileData).returning();
    return profile;
  },

  // Update athlete profile
  async updateAthleteProfile(userId: string, profileData: Partial<NewAthleteProfile>) {
    const [profile] = await db
      .update(athleteProfiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(athleteProfiles.userId, userId))
      .returning();
    return profile;
  },

  // Search athletes by criteria
  async searchAthletes(criteria: {
    sport?: string;
    graduationYear?: number;
    state?: string;
    positions?: string[];
    limit?: number;
    offset?: number;
  }) {
    const { sport, graduationYear, state, limit = 20, offset = 0 } = criteria;
    
    const whereConditions = [];
    
    if (sport) {
      whereConditions.push(eq(athleteProfiles.sport, sport));
    }
    if (graduationYear) {
      whereConditions.push(eq(athleteProfiles.graduationYear, graduationYear));
    }
    if (state) {
      whereConditions.push(eq(athleteProfiles.state, state));
    }
    
    return await db.query.athleteProfiles.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        user: true,
      },
      limit,
      offset,
      orderBy: [desc(athleteProfiles.createdAt)]
    });
  }
};

// Coach operations
export const coachOperations = {
  // Get coach profile with all related data
  async getCoachProfile(userId: string) {
    return await db.query.coachProfiles.findFirst({
      where: eq(coachProfiles.userId, userId),
      with: {
        user: true,
        recruitingNeeds: true,
        connections: {
          with: {
            athlete: {
              with: {
                user: true
              }
            }
          }
        }
      }
    });
  },

  // Create coach profile
  async createCoachProfile(profileData: NewCoachProfile) {
    const [profile] = await db.insert(coachProfiles).values(profileData).returning();
    return profile;
  },

  // Update coach profile
  async updateCoachProfile(userId: string, profileData: Partial<NewCoachProfile>) {
    const [profile] = await db
      .update(coachProfiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(coachProfiles.userId, userId))
      .returning();
    return profile;
  },

  // Search coaches by criteria
  async searchCoaches(criteria: {
    sportsCoaching?: string[];
    division?: string;
    state?: string;
    isVerified?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const { division, state, isVerified, limit = 20, offset = 0 } = criteria;
    
    const whereConditions = [];
    
    if (division) {
      whereConditions.push(eq(coachProfiles.division, division));
    }
    if (state) {
      whereConditions.push(eq(coachProfiles.state, state));
    }
    if (isVerified !== undefined) {
      whereConditions.push(eq(coachProfiles.isVerified, isVerified));
    }
    
    return await db.query.coachProfiles.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        user: true,
        recruitingNeeds: true,
      },
      limit,
      offset,
      orderBy: [desc(coachProfiles.createdAt)]
    });
  }
};

// Recruiting operations
export const recruitingOperations = {
  // Get recruiting profile with all related data
  async getRecruitingProfile(userId: string) {
    return await db.query.recruitingProfiles.findFirst({
      where: eq(recruitingProfiles.userId, userId),
      with: {
        user: true,
        recruitingNeeds: true,
      }
    });
  },

  // Create recruiting profile
  async createRecruitingProfile(profileData: NewRecruitingProfile) {
    const [profile] = await db.insert(recruitingProfiles).values(profileData).returning();
    return profile;
  },

  // Update recruiting profile
  async updateRecruitingProfile(userId: string, profileData: Partial<NewRecruitingProfile>) {
    const [profile] = await db
      .update(recruitingProfiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(recruitingProfiles.userId, userId))
      .returning();
    return profile;
  },

  // Search recruiting profiles by criteria
  async searchRecruitingProfiles(criteria: {
    sportsRecruiting?: string[];
    division?: string;
    state?: string;
    isVerified?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const { division, state, isVerified, limit = 20, offset = 0 } = criteria;
    
    const whereConditions = [];
    
    if (division) {
      whereConditions.push(eq(recruitingProfiles.division, division));
    }
    if (state) {
      whereConditions.push(eq(recruitingProfiles.state, state));
    }
    if (isVerified !== undefined) {
      whereConditions.push(eq(recruitingProfiles.isVerified, isVerified));
    }
    
    return await db.query.recruitingProfiles.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        user: true,
        recruitingNeeds: true,
      },
      limit,
      offset,
      orderBy: [desc(recruitingProfiles.createdAt)]
    });
  }
};

// Recruiting needs operations
export const recruitingNeedsOperations = {
  // Create recruiting needs for coach
  async createRecruitingNeeds(needsData: NewRecruitingNeeds) {
    const [needs] = await db.insert(recruitingNeeds).values(needsData).returning();
    return needs;
  },

  // Update recruiting needs for coach
  async updateRecruitingNeeds(coachId: number, needsData: Partial<NewRecruitingNeeds>) {
    const [needs] = await db
      .update(recruitingNeeds)
      .set({ ...needsData, updatedAt: new Date() })
      .where(eq(recruitingNeeds.coachId, coachId))
      .returning();
    return needs;
  },

  // Get recruiting needs for coach
  async getRecruitingNeedsByCoachId(coachId: number) {
    return await db.query.recruitingNeeds.findFirst({
      where: eq(recruitingNeeds.coachId, coachId)
    });
  },

  // Create recruiting profile needs for recruiter
  async createRecruitingProfileNeeds(needsData: NewRecruitingProfileNeeds) {
    const [needs] = await db.insert(recruitingProfileNeeds).values(needsData).returning();
    return needs;
  },

  // Update recruiting profile needs for recruiter
  async updateRecruitingProfileNeeds(recruitingProfileId: number, needsData: Partial<NewRecruitingProfileNeeds>) {
    const [needs] = await db
      .update(recruitingProfileNeeds)
      .set({ ...needsData, updatedAt: new Date() })
      .where(eq(recruitingProfileNeeds.recruitingProfileId, recruitingProfileId))
      .returning();
    return needs;
  },

  // Get recruiting profile needs for recruiter
  async getRecruitingProfileNeedsByProfileId(recruitingProfileId: number) {
    return await db.query.recruitingProfileNeeds.findFirst({
      where: eq(recruitingProfileNeeds.recruitingProfileId, recruitingProfileId)
    });
  }
};

// Connection operations
export const connectionOperations = {
  // Create connection between athlete and coach
  async createConnection(athleteId: number, coachId: number, initiatedBy: 'athlete' | 'coach') {
    const [connection] = await db.insert(connections).values({
      athleteId,
      coachId,
      initiatedBy,
      status: 'viewed'
    }).returning();
    return connection;
  },

  // Update connection status
  async updateConnectionStatus(athleteId: number, coachId: number, status: 'connected' | 'interested' | 'viewed') {
    const [connection] = await db
      .update(connections)
      .set({ status })
      .where(and(
        eq(connections.athleteId, athleteId),
        eq(connections.coachId, coachId)
      ))
      .returning();
    return connection;
  },

  // Get connections for athlete
  async getAthleteConnections(athleteId: number) {
    return await db.query.connections.findMany({
      where: eq(connections.athleteId, athleteId),
      with: {
        coach: {
          with: {
            user: true
          }
        }
      },
      orderBy: [desc(connections.createdAt)]
    });
  },

  // Get connections for coach
  async getCoachConnections(coachId: number) {
    return await db.query.connections.findMany({
      where: eq(connections.coachId, coachId),
      with: {
        athlete: {
          with: {
            user: true
          }
        }
      },
      orderBy: [desc(connections.createdAt)]
    });
  }
};

// Activity logging
export const activityOperations = {
  // Log activity
  async logActivity(viewerId: string, viewedUserId: string, action: string, metadata?: Record<string, unknown>) {
    const [activity] = await db.insert(activityLog).values({
      viewerId,
      viewedUserId,
      action,
      metadata
    }).returning();
    return activity;
  },

  // Get user activity
  async getUserActivity(userId: string, limit = 50) {
    return await db.query.activityLog.findMany({
      where: eq(activityLog.viewerId, userId),
      limit,
      orderBy: [desc(activityLog.createdAt)]
    });
  }
};

// Onboarding operations - High-level functions for the onboarding process
export const onboardingOperations = {
  // Complete onboarding for athlete
  async createAthleteOnboarding(userId: string, email: string, profileData: OnboardingProfileData, profileImageR3Key?: string) {
    // Create/update user
    const user = await userOperations.createOrUpdateUser(userId, {
      id: userId,
      email,
      role: 'athlete'
    });

    // Create athlete profile
    const athleteProfile = await athleteOperations.createAthleteProfile({
      userId,
      fullName: profileData.fullName,
      profileImageR3Key,
      sport: profileData.sport!,
      secondarySports: profileData.secondarySports || [],
      graduationYear: profileData.graduationYear!,
      educationLevel: profileData.educationLevel || 'high_school',
      highSchool: profileData.highSchool!,
      city: profileData.city,
      state: profileData.state,
      height: profileData.height!,
      weight: profileData.weight!,
      positions: profileData.positions!,
      gpa: profileData.gpa,
      satScore: profileData.satScore,
      actScore: profileData.actScore,
      intendedMajor: profileData.intendedMajor || undefined,
      gender: profileData.gender || undefined,
      maxprepsUrl: profileData.maxprepsUrl || undefined,
      hudlUrl: profileData.hudlUrl || undefined,
      instagramHandle: profileData.instagramHandle || undefined,
      twitterHandle: profileData.twitterHandle || undefined,
      personalStatement: profileData.personalStatement || undefined
    });

    return { user, profile: athleteProfile };
  },

  // Complete onboarding for coach
  async createCoachOnboarding(userId: string, email: string, profileData: OnboardingProfileData, profileImageR3Key?: string, organizationLogoR3Key?: string) {
    // Create/update user
    const user = await userOperations.createOrUpdateUser(userId, {
      id: userId,
      email,
      role: 'coach'
    });

    // Create coach profile
    const coachProfile = await coachOperations.createCoachProfile({
      userId,
      title: profileData.title!,
      role: 'coach',
      sportCoaching: profileData.sportCoaching!,
      organizationName: profileData.organizationName!,
      profileImageR3Key,
      organizationLogoR3Key,
      division: profileData.division!,
      conference: profileData.conference || undefined,
      city: profileData.city,
      state: profileData.state,
      programWebsite: profileData.programWebsite || undefined,
      schoolWebsite: profileData.schoolWebsite || undefined,
      instagramHandle: profileData.orgInstagramHandle || undefined,
      twitterHandle: profileData.orgTwitterHandle || undefined
    });

    // Create recruiting needs if provided
    let recruitingNeeds = null;
    if (profileData.recruitingGraduationYears && profileData.recruitingPositions) {
      recruitingNeeds = await recruitingNeedsOperations.createRecruitingNeeds({
        coachId: coachProfile.id,
        graduationYears: profileData.recruitingGraduationYears,
        positions: profileData.recruitingPositions,
        scholarshipsAvailable: profileData.scholarshipsAvailable || undefined,
        recruitingPhilosophy: profileData.recruitingPhilosophy || undefined
      });
    }

    return { user, profile: coachProfile, recruitingNeeds };
  },

  // Complete onboarding for recruiter
  async createRecruiterOnboarding(userId: string, email: string, profileData: OnboardingProfileData, profileImageR3Key?: string, organizationLogoR3Key?: string) {
    // Create/update user
    const user = await userOperations.createOrUpdateUser(userId, {
      id: userId,
      email,
      role: 'recruiter'
    });

    // Create recruiter profile
    const recruiterProfile = await recruitingOperations.createRecruitingProfile({
      userId,
      title: profileData.title!,
      sportRecruiting: profileData.sportCoaching!,
      organizationName: profileData.organizationName!,
      profileImageR3Key,
      organizationLogoR3Key,
      division: profileData.division!,
      conference: profileData.conference || undefined,
      city: profileData.city,
      state: profileData.state,
      programWebsite: profileData.programWebsite || undefined,
      schoolWebsite: profileData.schoolWebsite || undefined,
      instagramHandle: profileData.orgInstagramHandle || undefined,
      twitterHandle: profileData.orgTwitterHandle || undefined,
      recruitingPhilosophy: profileData.recruitingPhilosophy || undefined
    });

    // Create recruiting profile needs if provided
    let recruitingProfileNeeds = null;
    if (profileData.recruitingGraduationYears && profileData.recruitingPositions) {
      recruitingProfileNeeds = await recruitingNeedsOperations.createRecruitingProfileNeeds({
        recruitingProfileId: recruiterProfile.id,
        graduationYears: profileData.recruitingGraduationYears,
        positions: profileData.recruitingPositions,
        scholarshipsAvailable: profileData.scholarshipsAvailable || undefined,
        recruitingPhilosophy: profileData.whatLookingFor || undefined
      });
    }

    return { user, profile: recruiterProfile, recruitingProfileNeeds };
  }
}; 