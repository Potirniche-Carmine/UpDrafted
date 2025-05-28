import { eq, and, desc } from 'drizzle-orm';
import { db } from './db';
import { 
  users, 
  athleteProfiles, 
  coachProfiles, 
  connections,
  activityLog,
  type NewUser,
  type NewAthleteProfile,
  type NewCoachProfile
} from './schema';

// User operations
export const userOperations = {
  // Get user by ID with profile
  async getUserWithProfile(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        athleteProfile: true,
        coachProfile: {
          with: {
            recruitingNeeds: true,
          }
        }
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

  // Get users by role
  async getUsersByRole(role: 'athlete' | 'coach' | 'recruiter') {
    return await db.query.users.findMany({
      where: eq(users.role, role),
      with: {
        athleteProfile: role === 'athlete' ? true : undefined,
        coachProfile: role === 'coach' || role === 'recruiter' ? true : undefined,
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