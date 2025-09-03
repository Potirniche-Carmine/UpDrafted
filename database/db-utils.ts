import { eq, and, desc, or, asc, sql, count, lt, ilike, inArray } from 'drizzle-orm';
import { db } from './db';
import { parseHeightToInches, parseWeightToPounds } from '@/lib/parsing-utils';
import { 
  users, 
  athleteProfiles, 
  athleteMeasurables,
  athleteExperience,
  coachProfiles,
  recruitingProfiles,
  recruitingNeeds,
  recruitingProfileNeeds,
  connections,
  activityLog,
  reports,
  messages,
  conversations,
  notifications,
  adminRolePreferences,
  schools,
  type NewUser,
  type NewAthleteProfile,
  type NewAthleteMeasurable,
  type NewAthleteVideo,
  type NewAthleteExperience,
  type NewCoachProfile,
  type NewRecruitingProfile,
  type NewRecruitingNeeds,
  type NewRecruitingProfileNeeds,
  type NewReport,
  type NewAdminRolePreferences,
  type NewSchool,
  athleteVideos,
} from './schema';
import { OnboardingProfileData } from '@/app/(onboarding)/lib/onboarding';
import { sanitizeAndEncryptMessage } from '@/utils/encryption';
import { R2_PUBLIC_URL, constructR2Url } from './r2/config';
import { dateToStringWithErrorHandling } from '@/lib/date-utils';

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
    const athleteProfile = await db.query.athleteProfiles.findFirst({
      where: eq(athleteProfiles.userId, userId),
      with: {
        user: true,
        school: true,
        measurables: true,
        videos: {
          orderBy: [asc(athleteVideos.sortOrder)],
        },
        experience: true
      }
    });

    return athleteProfile;
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
  },

  // Create athlete measurable
  async createAthleteMeasurable(measurableData: NewAthleteMeasurable) {
    const [measurable] = await db.insert(athleteMeasurables).values(measurableData).returning();
    return measurable;
  },

  // Update athlete measurable
  async updateAthleteMeasurable(measurableId: number, measurableData: Partial<NewAthleteMeasurable>) {
    const [measurable] = await db
      .update(athleteMeasurables)
      .set({ ...measurableData })
      .where(eq(athleteMeasurables.id, measurableId))
      .returning();
    return measurable;
  },

  // Get athlete measurable
  async getAthleteMeasurable(measurableId: number) {
    return await db.query.athleteMeasurables.findFirst({
      where: eq(athleteMeasurables.id, measurableId)
    });
  },

  // Delete athlete measurable
  async deleteAthleteMeasurable(measurableId: number) {
    await db.delete(athleteMeasurables).where(eq(athleteMeasurables.id, measurableId));
  },

  // Replace all measurables for an athlete (useful for profile updates)
  async replaceAthleteMeasurables(athleteId: number, measurablesData: NewAthleteMeasurable[]) {
    // Delete existing measurables for this athlete
    await db.delete(athleteMeasurables).where(eq(athleteMeasurables.athleteId, athleteId));
    
    // Insert new measurables if any
    if (measurablesData.length > 0) {
      return await db.insert(athleteMeasurables).values(measurablesData).returning();
    }
    return [];
  },

  // Create athlete video
  async createAthleteVideo(videoData: NewAthleteVideo) {
    const [video] = await db.insert(athleteVideos).values(videoData).returning();
    return video;
  },

  // Update athlete video
  async updateAthleteVideo(videoId: number, videoData: Partial<NewAthleteVideo>) {
    const [video] = await db
      .update(athleteVideos)
      .set({ ...videoData })
      .where(eq(athleteVideos.id, videoId))
      .returning();
    return video;
  },

  // Get athlete video
  async getAthleteVideo(videoId: number) {
    return await db.query.athleteVideos.findFirst({
      where: eq(athleteVideos.id, videoId)
    });
  },

  // Delete athlete video
  async deleteAthleteVideo(videoId: number) {
    await db.delete(athleteVideos).where(eq(athleteVideos.id, videoId));
  },

  // Replace all videos for an athlete (useful for profile updates)
  async replaceAthleteVideos(athleteId: number, videosData: NewAthleteVideo[]) {
    // Delete existing videos for this athlete
    await db.delete(athleteVideos).where(eq(athleteVideos.athleteId, athleteId));
    
    // Insert new videos if any
    if (videosData.length > 0) {
      return await db.insert(athleteVideos).values(videosData).returning();
    }
    return [];
  }
};

// Athlete experience operations
export const athleteExperienceOperations = {
  // Create athlete experience
  async createAthleteExperience(experienceData: NewAthleteExperience) {
    const [experience] = await db.insert(athleteExperience).values(experienceData).returning();
    return experience;
  },

  // Update athlete experience
  async updateAthleteExperience(experienceId: number, experienceData: Partial<NewAthleteExperience>) {
    const [experience] = await db
      .update(athleteExperience)
      .set({ ...experienceData })
      .where(eq(athleteExperience.id, experienceId))
      .returning();
    return experience;
  },

  // Get athlete experience
  async getAthleteExperience(experienceId: number) {
    return await db.query.athleteExperience.findFirst({
      where: eq(athleteExperience.id, experienceId)
    });
  },

  // Delete athlete experience
  async deleteAthleteExperience(experienceId: number) {
    await db.delete(athleteExperience).where(eq(athleteExperience.id, experienceId));
  },

  // Replace all experiences for an athlete (useful for profile updates)
  async replaceAthleteExperiences(athleteId: number, experiencesData: NewAthleteExperience[]) {
    // Delete existing experiences for this athlete
    await db.delete(athleteExperience).where(eq(athleteExperience.athleteId, athleteId));
    
    // Insert new experiences if any
    if (experiencesData.length > 0) {
      return await db.insert(athleteExperience).values(experiencesData).returning();
    }
    return [];
  }
};

// Coach operations
export const coachOperations = {
  // Get coach profile with all related data
  async getCoachProfile(userId: string) {
    const coachProfile = await db.query.coachProfiles.findFirst({
      where: eq(coachProfiles.userId, userId),
      with: {
        user: true,
        school: true,
        recruitingNeeds: true
      }
    });

    return coachProfile;
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
    const profile = await db.query.recruitingProfiles.findFirst({
      where: eq(recruitingProfiles.userId, userId),
      with: {
        user: true,
        school: true,
      }
    });

    if (!profile) {
      return null;
    }

    // Get all recruiting needs for this profile
    const recruitingNeeds = await db.query.recruitingProfileNeeds.findMany({
      where: eq(recruitingProfileNeeds.recruitingProfileId, profile.id)
    });

    // Transform recruiting needs into sportSpecificNeeds object
    const sportSpecificNeeds: { [sport: string]: { studentClassifications: string[]; positions: string[]; scholarshipsAvailable?: number; recruitingPhilosophy?: string; } } = {};
    
    recruitingNeeds.forEach(need => {
      sportSpecificNeeds[need.sport] = {
        studentClassifications: need.studentClassifications,
        positions: need.positions,
        scholarshipsAvailable: need.scholarshipsAvailable ?? undefined,
        recruitingPhilosophy: need.recruitingPhilosophy || undefined
      };
    });

    return {
      ...profile,
      sportSpecificNeeds
    };
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

  // Update recruiting profile needs for recruiter (single sport)
  async updateRecruitingProfileNeeds(recruitingProfileId: number, sport: string, needsData: Partial<NewRecruitingProfileNeeds>) {
    const [needs] = await db
      .update(recruitingProfileNeeds)
      .set({ ...needsData, updatedAt: new Date() })
      .where(and(
        eq(recruitingProfileNeeds.recruitingProfileId, recruitingProfileId),
        eq(recruitingProfileNeeds.sport, sport)
      ))
      .returning();
    return needs;
  },

  // Get all recruiting profile needs for recruiter
  async getAllRecruitingProfileNeeds(recruitingProfileId: number) {
    return await db.query.recruitingProfileNeeds.findMany({
      where: eq(recruitingProfileNeeds.recruitingProfileId, recruitingProfileId)
    });
  },

  // Get recruiting profile needs for specific sport
  async getRecruitingProfileNeedsBySport(recruitingProfileId: number, sport: string) {
    return await db.query.recruitingProfileNeeds.findFirst({
      where: and(
        eq(recruitingProfileNeeds.recruitingProfileId, recruitingProfileId),
        eq(recruitingProfileNeeds.sport, sport)
      )
    });
  },

  // Delete recruiting profile needs for specific sport
  async deleteRecruitingProfileNeedsBySport(recruitingProfileId: number, sport: string) {
    return await db
      .delete(recruitingProfileNeeds)
      .where(and(
        eq(recruitingProfileNeeds.recruitingProfileId, recruitingProfileId),
        eq(recruitingProfileNeeds.sport, sport)
      ))
      .returning();
  }
};

// Connection operations
export const connectionOperations = {
  // Create connection between any two users
  async createConnection(fromUserId: string, toUserId: string, initiatedBy: 'athlete' | 'coach' | 'recruiter', notes?: string) {
    const [connection] = await db.insert(connections).values({
      fromUserId,
      toUserId,
      initiatedBy,
      status: 'pending',
      notes
    }).returning();
    return connection;
  },

  // Update connection status
  async updateConnectionStatus(fromUserId: string, toUserId: string, status: 'connected' | 'pending') {
    const [connection] = await db
      .update(connections)
      .set({ status })
      .where(or(
        and(eq(connections.fromUserId, fromUserId), eq(connections.toUserId, toUserId)),
        and(eq(connections.fromUserId, toUserId), eq(connections.toUserId, fromUserId))
      ))
      .returning();
    return connection;
  },

  // Update connection status by connection ID with authorization check
  async updateConnectionStatusById(connectionId: number, currentUserId: string, status: 'connected' | 'pending') {
    const [connection] = await db
      .update(connections)
      .set({ status })
      .where(
        and(
          eq(connections.id, connectionId),
          // Ensure the current user is the recipient (toUserId) for accepting requests
          or(
            eq(connections.toUserId, currentUserId),
            eq(connections.fromUserId, currentUserId)
          )
        )
      )
      .returning();
    return connection;
  },

  // Delete connection
  async deleteConnection(fromUserId: string, toUserId: string) {
    const [deletedConnection] = await db
      .delete(connections)
      .where(or(
        and(eq(connections.fromUserId, fromUserId), eq(connections.toUserId, toUserId)),
        and(eq(connections.fromUserId, toUserId), eq(connections.toUserId, fromUserId))
      ))
      .returning();
    return deletedConnection;
  },

  // Get connections for a user (all their connections regardless of role)
  async getUserConnections(userId: string) {
    const userConnections = await db.query.connections.findMany({
      where: or(
        eq(connections.fromUserId, userId),
        eq(connections.toUserId, userId)
      ),
      with: {
        fromUser: {
          columns: {
            id: true,
            role: true,
          },
          with: {
            athleteProfile: {
              columns: {
                fullName: true,
                profileImageR3Key: true,
                sport: true,
                city: true,
                state: true,
                graduationYear: true,
                educationLevel: true,
                isVerified: true,
                height: true,
                weight: true,
                positions: true,
              },
              with: {
                school: {
                  columns: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            coachProfile: {
              columns: {
                id: true,
                fullName: true,
                profileImageR3Key: true,
                title: true,
                sportCoaching: true,
                city: true,
                state: true,
                division: true,
                isVerified: true,
              },
              with: {
                recruitingNeeds: true,
                school: {
                  columns: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            recruitingProfile: {
              columns: {
                id: true,
                fullName: true,
                profileImageR3Key: true,
                title: true,
                sportRecruiting: true,
                city: true,
                state: true,
                division: true,
                isVerified: true,
              },
              with: {
                school: {
                  columns: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        toUser: {
          columns: {
            id: true,
            role: true,
          },
          with: {
            athleteProfile: {
              columns: {
                fullName: true,
                profileImageR3Key: true,
                sport: true,
                city: true,
                state: true,
                graduationYear: true,
                educationLevel: true,
                isVerified: true,
                height: true,
                weight: true,
                positions: true,
              },
              with: {
                school: {
                  columns: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            coachProfile: {
              columns: {
                id: true,
                fullName: true,
                profileImageR3Key: true,
                title: true,
                sportCoaching: true,
                city: true,
                state: true,
                division: true,
                isVerified: true,
              },
              with: {
                recruitingNeeds: true,
                school: {
                  columns: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            recruitingProfile: {
              columns: {
                id: true,
                fullName: true,
                profileImageR3Key: true,
                title: true,
                sportRecruiting: true,
                city: true,
                state: true,
                division: true,
                isVerified: true,
              },
              with: {
                school: {
                  columns: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [desc(connections.createdAt)],
    });

    // For recruiting profiles, we need to fetch recruiting profile needs separately
    // as they're in a different table
    const allUsers = [
      ...userConnections.map(conn => conn.fromUser),
      ...userConnections.map(conn => conn.toUser)
    ];
    
    const recruiterProfileIds = allUsers
      .filter(user => user.role === 'recruiter' && user.recruitingProfile)
      .map(user => user.recruitingProfile!.id);

    let recruiterNeeds: typeof recruitingProfileNeeds.$inferSelect[] = [];
    
    try {
      if (recruiterProfileIds.length > 0) {
        recruiterNeeds = await db.query.recruitingProfileNeeds.findMany({
          where: or(...recruiterProfileIds.map(id => eq(recruitingProfileNeeds.recruitingProfileId, id)))
        });
      }
    } catch (error) {
      console.error('Error fetching recruiter needs:', error);
      // Continue without recruiter needs if there's an error
    }

    // Create a map for quick lookup with safe data handling
    const recruiterNeedsMap = new Map<number, Array<{
      sport: string;
      studentClassifications: string[];
      positions: string[];
      scholarshipsAvailable: number | null;
      recruitingPhilosophy: string | null;
    }>>();
    
    recruiterNeeds.forEach(need => {
      if (need && typeof need.recruitingProfileId === 'number') {
        if (!recruiterNeedsMap.has(need.recruitingProfileId)) {
          recruiterNeedsMap.set(need.recruitingProfileId, []);
        }
        recruiterNeedsMap.get(need.recruitingProfileId)!.push({
          sport: need.sport || '',
          studentClassifications: Array.isArray(need.studentClassifications) ? need.studentClassifications : [],
          positions: Array.isArray(need.positions) ? need.positions : [],
          scholarshipsAvailable: typeof need.scholarshipsAvailable === 'number' ? need.scholarshipsAvailable : null,
          recruitingPhilosophy: typeof need.recruitingPhilosophy === 'string' ? need.recruitingPhilosophy : null,
        });
      }
    });

    // Attach recruiting needs to recruiting profiles
    const connectionsWithNeeds = userConnections.map(connection => ({
      ...connection,
      fromUser: {
        ...connection.fromUser,
        recruitingProfile: connection.fromUser.recruitingProfile ? {
          ...connection.fromUser.recruitingProfile,
          recruitingNeeds: recruiterNeedsMap.get(connection.fromUser.recruitingProfile.id) || []
        } : undefined
      },
      toUser: {
        ...connection.toUser,
        recruitingProfile: connection.toUser.recruitingProfile ? {
          ...connection.toUser.recruitingProfile,
          recruitingNeeds: recruiterNeedsMap.get(connection.toUser.recruitingProfile.id) || []
        } : undefined
      }
    }));

    return connectionsWithNeeds;
  },

  // Check if a connection exists between two users
  async getConnectionBetweenUsers(fromUserId: string, toUserId: string) {
    const connection = await db.query.connections.findFirst({
      where: or(
        and(eq(connections.fromUserId, fromUserId), eq(connections.toUserId, toUserId)),
        and(eq(connections.fromUserId, toUserId), eq(connections.toUserId, fromUserId))
      )
    });
    
    return connection;
  },

  // Get filtered connections with database-level optimization
  async getFilteredUserConnections(userId: string, filters: {
    sports?: string[];
    divisions?: string[];
    states?: string[];
    countries?: string[];
    positions?: string[];
    graduatingClasses?: string[];
    conferences?: string[];
    requestTypes?: string[];
    minHeight?: number;
    minWeight?: number;
  } = {}) {
    const {
      sports,
      divisions,
      states,
      countries,
      positions,
      graduatingClasses,
      conferences,
      requestTypes,
      minHeight,
      minWeight,
    } = filters;

    const hasFilters = sports?.length || divisions?.length || states?.length || countries?.length || positions?.length || graduatingClasses?.length || conferences?.length || requestTypes?.length || (minHeight && minHeight > 60) || (minWeight && minWeight > 100);

    // If no filters, use the regular getUserConnections
    if (!hasFilters) {
      return this.getUserConnections(userId);
    }

    // For simplicity, get all connections and filter them
    // This could be optimized in the future with more complex DB queries
    const allConnections = await this.getUserConnections(userId);
    
    // Apply filters on the server side
    return allConnections.filter(connection => {
      const otherUser = connection.fromUserId === userId ? connection.toUser : connection.fromUser;
      
      // Sports filter
      if (sports && sports.length > 0) {
        const userSport = otherUser.athleteProfile?.sport || 
                         otherUser.coachProfile?.sportCoaching || 
                         otherUser.recruitingProfile?.sportRecruiting;
        if (!userSport || !sports.includes(userSport)) {
          return false;
        }
      }
      
      // Divisions filter
      if (divisions && divisions.length > 0) {
        const userDivision = otherUser.coachProfile?.division || 
                            otherUser.recruitingProfile?.division;
        if (!userDivision || !divisions.includes(userDivision)) {
          return false;
        }
      }
      
      // States filter
      if (states && states.length > 0) {
        const userState = otherUser.athleteProfile?.state || 
                         otherUser.coachProfile?.state || 
                         otherUser.recruitingProfile?.state;
        if (!userState || !states.includes(userState)) {
          return false;
        }
      }

      // Countries filter - use default for now since country field isn't in all profiles
      if (countries && countries.length > 0) {
        // Default to United States since not all profiles have country field
        const userCountry = 'United States';
        if (!countries.includes(userCountry)) {
          return false;
        }
      }

      // Positions filter
      if (positions && positions.length > 0) {
        if (!otherUser.athleteProfile?.positions) {
          return false;
        }
        const hasMatchingPosition = otherUser.athleteProfile.positions.some(pos => 
          positions.includes(pos)
        );
        if (!hasMatchingPosition) {
          return false;
        }
      }

      // Graduating classes filter
      if (graduatingClasses && graduatingClasses.length > 0) {
        const graduationYear = otherUser.athleteProfile?.graduationYear;
        if (!graduationYear || !graduatingClasses.includes(graduationYear.toString())) {
          return false;
        }
      }

      // Conferences filter - skip for now since conference field isn't in all profiles
      if (conferences && conferences.length > 0) {
        // Conference filtering not implemented yet since field doesn't exist in current schema
        // This would need to be added to the profile schemas first
        return true; // Allow all for now
      }

      // Request types filter (role filter)
      if (requestTypes && requestTypes.length > 0) {
        if (!requestTypes.includes(otherUser.role)) {
          return false;
        }
      }

      // Height filter
      if (minHeight && otherUser.athleteProfile?.height) {
        const heightInches = parseHeightToInches(otherUser.athleteProfile.height);
        if (!heightInches || heightInches < minHeight) {
          return false;
        }
      }

      // Weight filter
      if (minWeight && otherUser.athleteProfile?.weight) {
        const weightPounds = parseWeightToPounds(otherUser.athleteProfile.weight);
        if (!weightPounds || weightPounds < minWeight) {
          return false;
        }
      }
      
      return true;
    });
  },

  // Delete connection and log withdrawal with cooldown tracking
  async withdrawConnection(fromUserId: string, toUserId: string) {
    // First delete the connection
    const [deletedConnection] = await db
      .delete(connections)
      .where(or(
        and(eq(connections.fromUserId, fromUserId), eq(connections.toUserId, toUserId)),
        and(eq(connections.fromUserId, toUserId), eq(connections.toUserId, fromUserId))
      ))
      .returning();

    // Log the withdrawal for cooldown tracking
    if (deletedConnection) {
      await db.insert(activityLog).values({
        viewerId: fromUserId,
        viewedUserId: toUserId,
        action: 'connectionWithdrawn',
        metadata: {
          connectionId: deletedConnection.id,
          withdrawnAt: new Date().toISOString()
        }
      });
    }

    return deletedConnection;
  },

  // Check if user can send connection request (7-day cooldown after withdrawal)
  async canSendConnectionRequest(fromUserId: string, toUserId: string): Promise<{
    canSend: boolean;
    cooldownEndsAt?: Date;
    hoursRemaining?: number;
  }> {
    // Check if there's already a connection
    const existingConnection = await db.query.connections.findFirst({
      where: or(
        and(eq(connections.fromUserId, fromUserId), eq(connections.toUserId, toUserId)),
        and(eq(connections.fromUserId, toUserId), eq(connections.toUserId, fromUserId))
      )
    });

    if (existingConnection) {
      return { canSend: false };
    }

    // Check for recent withdrawal
    const lastWithdrawal = await db.query.activityLog.findFirst({
      where: and(
        eq(activityLog.viewerId, fromUserId),
        eq(activityLog.viewedUserId, toUserId),
        eq(activityLog.action, 'connectionWithdrawn')
      ),
      orderBy: [desc(activityLog.createdAt)]
    });

    if (!lastWithdrawal) {
      return { canSend: true };
    }

    const cooldownPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const cooldownEndsAt = new Date(lastWithdrawal.createdAt.getTime() + cooldownPeriod);
    const now = new Date();

    if (now < cooldownEndsAt) {
      const hoursRemaining = Math.ceil((cooldownEndsAt.getTime() - now.getTime()) / (60 * 60 * 1000));
      return {
        canSend: false,
        cooldownEndsAt,
        hoursRemaining
      };
    }

    return { canSend: true };
  }
};

// Activity logging
export const activityOperations = {
  // Log activity - Updates existing record if same viewer/viewed/action, otherwise creates new
  async logActivity(viewerId: string, viewedUserId: string, action: string, metadata?: Record<string, unknown>) {
    // Don't log if viewer and viewed are the same (self-viewing)
    if (viewerId === viewedUserId) {
      return { action: 'skipped', reason: 'self-view' };
    }

    // Check if viewer or viewed user is an admin - skip logging for admin immunity
    const [viewer, viewedUser] = await Promise.all([
      userOperations.getUserWithProfile(viewerId),
      userOperations.getUserWithProfile(viewedUserId)
    ]);

    if (viewer?.role === 'admin' || viewedUser?.role === 'admin') {
      return { action: 'skipped', reason: 'admin-immunity' };
    }

    // Check if a record already exists for this combination
    const existingRecord = await db.query.activityLog.findFirst({
      where: and(
        eq(activityLog.viewerId, viewerId),
        eq(activityLog.viewedUserId, viewedUserId),
        eq(activityLog.action, action)
      )
    });

    if (existingRecord) {
      // Update the existing record with new timestamp and metadata
      await db
        .update(activityLog)
        .set({
          createdAt: new Date(),
          metadata
        })
        .where(eq(activityLog.id, existingRecord.id));
      
      return { action: 'updated', recordId: existingRecord.id };
    } else {
      // Create a new record
      const [newRecord] = await db.insert(activityLog).values({
        viewerId,
        viewedUserId,
        action,
        metadata
      }).returning({ id: activityLog.id });
      
      return { action: 'created', recordId: newRecord.id };
    }
  },

  // Get user activity
  async getUserActivity(userId: string, limit = 50) {
    return await db.query.activityLog.findMany({
      where: eq(activityLog.viewedUserId, userId),
      orderBy: [desc(activityLog.createdAt)],
      limit
    });
  },

  // Clean up old activity logs
  async cleanupOldActivityLogs(daysToKeep = 14) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await db
      .delete(activityLog)
      .where(lt(activityLog.createdAt, cutoffDate))
      .returning({ deletedId: activityLog.id });
    
    return {
      deletedCount: result.length,
      cutoffDate: cutoffDate.toISOString(),
      daysKept: daysToKeep
    };
  }
};

// Onboarding operations - High-level functions for the onboarding process
export const onboardingOperations = {
  // Complete onboarding for athlete
  async createAthleteOnboarding(userId: string, email: string, profileData: OnboardingProfileData, profileImageR3Key?: string) {
    // Create or update user
    const user = await userOperations.createOrUpdateUser(userId, { 
      id: userId,
      email, 
      role: 'athlete',
    });

    // Get or create school
    const educationLevelMap: { [key: string]: 'high_school' | 'college' | 'university' | 'professional' | 'other' } = {
      'high_school': 'high_school',
      'associate': 'college',
      'undergraduate': 'university',
      'graduate': 'university'
    };
    
    const educationLevel = profileData.educationLevel || 'undergraduate';
    const schoolClassification = educationLevelMap[educationLevel] || 'university';
    
    const school = await schoolOperations.getOrCreateSchool(
      profileData.organizationName || 'Unknown Institution',
      schoolClassification
    );

    // Check if this is a high school athlete with a valid Hudl URL
    const isHighSchool = educationLevel === 'high_school';
    const hasValidHudlUrl = profileData.hudlUrl && profileData.hudlUrl.trim();
    
    // Auto-verify high school athletes with valid Hudl URLs
    // Additional server-side validation to ensure URL matches profile name
    let shouldAutoVerify = false;
    if (isHighSchool && hasValidHudlUrl) {
      // Import validation here to avoid circular imports
      const { FormValidator } = await import('@/app/(onboarding)/lib/form-validation');
      const hudlValidation = FormValidator.validateHudlURL(profileData.hudlUrl!, profileData.fullName);
      shouldAutoVerify = hudlValidation.isValid;
    }

    // Create athlete profile
    const newProfile: NewAthleteProfile = {
      userId,
      fullName: profileData.fullName,
      profileImageR3Key: profileImageR3Key,
      sport: profileData.sport!,
      secondarySports: profileData.secondarySports || [],
      graduationYear: profileData.graduationYear!,
      educationLevel: profileData.educationLevel!,
      schoolId: school.id,
      city: profileData.city!,
      state: profileData.state!,
      country: profileData.country, // <-- Add this line
      height: profileData.height!,
      weight: profileData.weight!,
      positions: profileData.positions!,
      teamLevel: profileData.teamLevel,
      division: profileData.division,
      conference: profileData.conference,
      gpa: profileData.gpa ? parseFloat(profileData.gpa) : undefined,
      satScore: profileData.satScore || undefined,
      actScore: profileData.actScore || undefined,
      intendedMajor: profileData.intendedMajor || undefined,
      gender: profileData.gender || undefined,
      maxprepsUrl: profileData.maxprepsUrl || undefined,
      hudlUrl: profileData.hudlUrl || undefined,
      instagramHandle: profileData.instagramHandle || undefined,
      twitterHandle: profileData.twitterHandle || undefined,
      personalStatement: profileData.personalStatement || undefined,
      isVerified: shouldAutoVerify, // Auto-verify if high school athlete with valid Hudl URL
    };
    
    const athleteProfile = await athleteOperations.createAthleteProfile(newProfile);
    
    return { user, athleteProfile, school };
  },

  // Complete onboarding for coach
  async createCoachOnboarding(userId: string, email: string, profileData: OnboardingProfileData, profileImageR3Key?: string, organizationLogoR3Key?: string) {
    // Create/update user
    const user = await userOperations.createOrUpdateUser(userId, {
      id: userId,
      email,
      role: 'coach'
    });

    // Get or create school (coaches are typically at universities)
    const school = await schoolOperations.getOrCreateSchool(
      profileData.organizationName || 'Unknown Institution',
      'university'
    );

    // Create coach profile
    const coachProfile = await coachOperations.createCoachProfile({
      userId,
      fullName: profileData.fullName,
      title: profileData.title!,
      sportCoaching: profileData.sportCoaching!,
      schoolId: school.id,
      profileImageR3Key,
      organizationLogoR3Key,
      division: profileData.division!,
      conference: profileData.conference || undefined,
      city: profileData.city,
      state: profileData.state,
      country: profileData.country, // <-- Add this line
      programWebsite: profileData.programWebsite || undefined,
      schoolWebsite: profileData.schoolWebsite || undefined,
      instagramHandle: profileData.orgInstagramHandle || undefined,
      twitterHandle: profileData.orgTwitterHandle || undefined,
      personalStatement: profileData.personalStatement || undefined
    });

    // Create recruiting needs if provided
    let recruitingNeeds = null;
    if (profileData.recruitingPositions && profileData.recruitingPositions.length > 0) {
      recruitingNeeds = await recruitingNeedsOperations.createRecruitingNeeds({
        coachId: coachProfile.id,
        studentClassifications: (profileData.recruitingStudentClassifications as ('high_school' | 'university_transfers' | 'juco_students' | 'graduate_transfers' | 'international_students')[]) || [],
        positions: profileData.recruitingPositions,
        scholarshipsAvailable: profileData.scholarshipsAvailable ?? undefined,
        recruitingPhilosophy: profileData.recruitingPhilosophy || undefined
      });
    }

    return { user, profile: coachProfile, recruitingNeeds, school };
  },

  // Complete onboarding for recruiter
  async createRecruiterOnboarding(userId: string, email: string, profileData: OnboardingProfileData, profileImageR3Key?: string, organizationLogoR3Key?: string) {
    // Create/update user
    const user = await userOperations.createOrUpdateUser(userId, {
      id: userId,
      email,
      role: 'recruiter'
    });

    // Get or create school (recruiters are typically at universities)
    const school = await schoolOperations.getOrCreateSchool(
      profileData.organizationName || 'Unknown Institution',
      'university'
    );

    // Create recruiter profile
    const recruiterProfile = await recruitingOperations.createRecruitingProfile({
      userId,
      fullName: profileData.fullName,
      title: profileData.title!,
      sportRecruiting: profileData.sportCoaching!,
      secondarySports: profileData.secondarySportsRecruiting || [],
      schoolId: school.id,
      profileImageR3Key,
      organizationLogoR3Key,
      division: profileData.division!,
      conference: profileData.conference || undefined,
      city: profileData.city,
      state: profileData.state,
      country: profileData.country, // <-- Add this line
      programWebsite: profileData.programWebsite || undefined,
      schoolWebsite: profileData.schoolWebsite || undefined,
      instagramHandle: profileData.orgInstagramHandle || undefined,
      twitterHandle: profileData.orgTwitterHandle || undefined,
      personalStatement: profileData.personalStatement || undefined
    });

    // Create sport-specific recruiting needs if provided
    const recruitingProfileNeeds = [];
    if (profileData.sportSpecificNeeds) {
      for (const [sport, needs] of Object.entries(profileData.sportSpecificNeeds)) {
        if (needs.positions && needs.positions.length > 0) {
          const profileNeeds = await recruitingNeedsOperations.createRecruitingProfileNeeds({
            recruitingProfileId: recruiterProfile.id,
            sport: sport,
            studentClassifications: (needs.studentClassifications as ('high_school' | 'university_transfers' | 'juco_students' | 'graduate_transfers' | 'international_students')[]) || [],
            positions: needs.positions,
            scholarshipsAvailable: needs.scholarshipsAvailable ?? undefined,
            recruitingPhilosophy: needs.recruitingPhilosophy || undefined
          });
          recruitingProfileNeeds.push(profileNeeds);
        }
      }
    }

    return { user, profile: recruiterProfile, recruitingProfileNeeds, school };
  }
};

// Report operations
export const reportOperations = {
  // Create a new report
  async createReport(reportData: NewReport) {
    const [report] = await db.insert(reports).values(reportData).returning();
    return report;
  },

  // Get report by ID
  async getReportById(reportId: number) {
    return await db.query.reports.findFirst({
      where: eq(reports.id, reportId),
      with: {
        reporter: true,
        reportedUser: true,
        reviewer: true,
      }
    });
  },

  // Get reports by reporter
  async getReportsByReporter(reporterId: string) {
    return await db.query.reports.findMany({
      where: eq(reports.reporterId, reporterId),
      with: {
        reportedUser: true,
      },
      orderBy: [desc(reports.submittedAt)]
    });
  },

  // Get reports for a specific user (that were reported)
  async getReportsForUser(reportedUserId: string) {
    return await db.query.reports.findMany({
      where: eq(reports.reportedUserId, reportedUserId),
      with: {
        reporter: true,
        reviewer: true,
      },
      orderBy: [desc(reports.submittedAt)]
    });
  },

  // Update report status (for moderation)
  async updateReportStatus(
    reportId: number, 
    status: 'pending' | 'under_review' | 'resolved' | 'dismissed',
    reviewedBy?: string,
    moderatorNotes?: string,
    actionTaken?: string
  ) {
    const updateData: {
      status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
      reviewedAt: Date;
      updatedAt: Date;
      reviewedBy?: string;
      moderatorNotes?: string;
      actionTaken?: string;
    } = {
      status,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    };

    if (reviewedBy) updateData.reviewedBy = reviewedBy;
    if (moderatorNotes) updateData.moderatorNotes = moderatorNotes;
    if (actionTaken) updateData.actionTaken = actionTaken;

    const [report] = await db
      .update(reports)
      .set(updateData)
      .where(eq(reports.id, reportId))
      .returning();
    return report;
  },

  // Get all reports (for admin/moderation)
  async getAllReports(limit = 50, offset = 0) {
    return await db.query.reports.findMany({
      with: {
        reporter: true,
        reportedUser: true,
        reviewer: true,
      },
      limit,
      offset,
      orderBy: [desc(reports.submittedAt)]
    });
  },

  // Check if user has already reported another user
  async hasUserReportedUser(reporterId: string, reportedUserId: string) {
    const existingReport = await db.query.reports.findFirst({
      where: and(
        eq(reports.reporterId, reporterId),
        eq(reports.reportedUserId, reportedUserId)
      )
    });
    return !!existingReport;
  }
};

// Messaging operations
export const messageOperations = {
  // Get conversation by users
  async getConversationByUsers(user1Id: string, user2Id: string) {
    // First try with user1 and user2 in current order
    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.user1Id, user1Id),
        eq(conversations.user2Id, user2Id)
      ),
      with: {
        user1: true,
        user2: true,
      }
    });
    
    if (conversation) {
      return conversation;
    }
    
    // If not found, try with users in reverse order
    return await db.query.conversations.findFirst({
      where: and(
        eq(conversations.user1Id, user2Id),
        eq(conversations.user2Id, user1Id)
      ),
      with: {
        user1: true,
        user2: true,
      }
    });
  },
  
  // Get conversation by ID with participants
  async getConversationById(conversationId: number) {
    return await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
      with: {
        user1: true,
        user2: true,
      }
    });
  },
  
  // Create a new conversation
  async createConversation(user1Id: string, user2Id: string): Promise<{ id: number }> {
    // Prevent creating conversations with the same user
    if (user1Id === user2Id) {
      throw new Error('Cannot create conversation with yourself');
    }
    
    const [conversation] = await db.insert(conversations)
      .values({
        user1Id,
        user2Id,
        lastMessageAt: new Date(),
      })
      .returning({ id: conversations.id });
    
    return conversation;
  },

  // Get all conversations for a user 
  async getUserConversations(userId: string) {
    // Single optimized query using OR condition instead of two separate queries
    const allConversations = await db.query.conversations.findMany({
      where: or(
        eq(conversations.user1Id, userId),
        eq(conversations.user2Id, userId)
      ),
      with: {
        user1: true,
        user2: true,
        messages: {
          orderBy: [desc(messages.createdAt)],
          limit: 1,
        }
      },
      orderBy: [desc(conversations.lastMessageAt)]
    });
    
    // Filter out conversations where both users are the same person
    const filteredConversations = allConversations.filter(conversation => 
      conversation.user1Id !== conversation.user2Id
    );
    
    return filteredConversations;
  },

  // Update connection active status for a conversation
  async updateConversationConnectionStatus(conversationId: number, isActive: boolean) {
    return await db.update(conversations)
      .set({ connectionActive: isActive })
      .where(eq(conversations.id, conversationId))
      .returning();
  },

  // Get messages for a conversation with pagination (OPTIMIZED)
  async getMessages(conversationId: number, limit = 50, offset = 0) {
    return await db.query.messages.findMany({
      where: eq(messages.conversationId, conversationId),
      orderBy: [desc(messages.createdAt)],
      limit: Math.min(limit, 100), // Cap at 100 for performance
      offset,
      // Remove sender info to reduce payload size - frontend can get sender from conversation
      // with: { sender: true } // Commented out for performance
    });
  },
  
  // Send a new message (OPTIMIZED with transaction)
  async sendMessage(conversationId: number, senderId: string, content: string) {
    // Use database transaction for consistency and performance
    return await db.transaction(async (tx) => {
      // Sanitize and encrypt the message
      const { encryptedText, iv } = sanitizeAndEncryptMessage(content);
      
      // Get only what we need from conversation (optimized query)
      const conversation = await tx.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
        columns: {
          id: true,
          user1Id: true,
          user2Id: true,
        }
      });
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Determine if sender is user1 or user2
      const isUser1 = conversation.user1Id === senderId;
      
      // Insert the new message first
      const [message] = await tx.insert(messages)
        .values({
          conversationId,
          senderId,
          encryptedContent: encryptedText,
          contentIV: iv,
          messageType: 'text',
          createdAt: new Date()
        })
        .returning();
      
      // Update conversation with new last message time and increment unread count
      if (isUser1) {
        await tx.update(conversations)
          .set({ 
            lastMessageAt: new Date(),
            user2UnreadCount: sql`${conversations.user2UnreadCount} + 1`
          })
          .where(eq(conversations.id, conversationId));
      } else {
        await tx.update(conversations)
          .set({ 
            lastMessageAt: new Date(),
            user1UnreadCount: sql`${conversations.user1UnreadCount} + 1`
          })
          .where(eq(conversations.id, conversationId));
      }
      
      return message;
    });
  },
  
  // Mark messages as read (OPTIMIZED with transaction)
  async markMessagesAsRead(conversationId: number, userId: string) {
    return await db.transaction(async (tx) => {
      // Get only what we need from conversation
      const conversation = await tx.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
        columns: {
          id: true,
          user1Id: true,
          user2Id: true,
        }
      });
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      const isUser1 = conversation.user1Id === userId;
      
      // Mark messages as read where this user is NOT the sender (batch update)
      await tx.update(messages)
        .set({ 
          isRead: true,
          readAt: new Date()
        })
        .where(and(
          eq(messages.conversationId, conversationId),
          sql`${messages.senderId} != ${userId}`,
          eq(messages.isRead, false)
        ));
      
      // Reset unread count in conversation
      if (isUser1) {
        await tx.update(conversations)
          .set({ user1UnreadCount: 0 })
          .where(eq(conversations.id, conversationId));
      } else {
        await tx.update(conversations)
          .set({ user2UnreadCount: 0 })
          .where(eq(conversations.id, conversationId));
      }
    });
  },
  
  // Get total unread message count for a user (OPTIMIZED single query)
  async getUnreadMessageCount(userId: string) {
    const result = await db
      .select({
        total: sql<number>`
          COALESCE(
            SUM(
              CASE 
                WHEN ${conversations.user1Id} = ${userId} THEN ${conversations.user1UnreadCount}
                WHEN ${conversations.user2Id} = ${userId} THEN ${conversations.user2UnreadCount}
                ELSE 0
              END
            ), 
            0
          )
        `.as('total')
      })
      .from(conversations)
      .where(
        or(
          eq(conversations.user1Id, userId),
          eq(conversations.user2Id, userId)
        )
      );

    return Number(result[0]?.total || 0);
  },

  // Get the partner user ID from a conversation
  async getPartnerIdFromConversation(conversationId: number, userId: string) {
    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });

    if (!conversation) return null;

    return conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
  },

  // Create missing conversations for existing connections
  async createMissingConversationsForConnections() {
    try {
      // Get all connected connections
      const connectedConnections = await db.query.connections.findMany({
        where: eq(connections.status, 'connected'),
      });

      let createdCount = 0;
      
      for (const connection of connectedConnections) {
        // Check if a conversation already exists between these users
        const existingConversation = await this.getConversationByUsers(
          connection.fromUserId,
          connection.toUserId
        );
        
        if (!existingConversation) {
          // Create the missing conversation
          await this.createConversation(connection.fromUserId, connection.toUserId);
          createdCount++;
        }
      }
      
      return createdCount;
    } catch (error) {
      console.error('Error creating missing conversations:', error);
      throw error;
    }
  }
};

// Profile operations - for accessing user profiles
export const profileOperations = {
  // Get user with all profile types
  async getUserWithProfile(userId: string) {
    return await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        athleteProfile: true,
        coachProfile: true,
        recruitingProfile: true,
      },
    });
  },
  
  // Get user profile image and name based on their role
  async getUserProfileInfo(userId: string) {
    const user = await this.getUserWithProfile(userId);

    if (!user) return null;

    let fullName = 'Unknown User';
    let profileImageUrl = null;
    let division = undefined;
    let conference = undefined;
    let educationLevel = undefined;
    let isVerified = false;

    if (user.role === 'athlete' && user.athleteProfile) {
      fullName = user.athleteProfile.fullName;
      profileImageUrl = user.athleteProfile.profileImageR3Key;
      division = user.athleteProfile.division;
      conference = user.athleteProfile.conference;
      educationLevel = user.athleteProfile.educationLevel;
      isVerified = user.athleteProfile.isVerified ?? false;
    } else if (user.role === 'coach' && user.coachProfile) {
      fullName = user.coachProfile.fullName;
      profileImageUrl = user.coachProfile.profileImageR3Key;
      division = user.coachProfile.division;
      conference = user.coachProfile.conference;
      isVerified = user.coachProfile.isVerified ?? false;
    } else if (user.role === 'recruiter' && user.recruitingProfile) {
      fullName = user.recruitingProfile.fullName;
      profileImageUrl = user.recruitingProfile.profileImageR3Key;
      division = user.recruitingProfile.division;
      conference = user.recruitingProfile.conference;
      isVerified = user.recruitingProfile.isVerified ?? false;
    }

    return {
      fullName,
      profileImageUrl: profileImageUrl 
        ? constructR2Url(R2_PUBLIC_URL, profileImageUrl)
        : null,
      role: user.role,
      division,
      conference,
      educationLevel,
      isVerified,
    };
  }
};

// Notification operations
export const notificationOperations = {
  // Create a new notification
  async createNotification(userId: string, type: 'profileView' | 'newConnection' | 'newMessage' | 'systemUpdate' | 'premiumFeature' | 'connectionAccepted', title: string, message: string, metadata?: Record<string, unknown>) {
    const [notification] = await db.insert(notifications).values({
      userId,
      type,
      title,
      message,
      metadata,
    }).returning();
    return notification;
  },

  // Get notifications for a user
  async getUserNotifications(userId: string, limit = 20, offset = 0, unreadOnly = false) {
    const query = db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        isRead: notifications.isRead,
        metadata: notifications.metadata,
        createdAt: notifications.createdAt,
        readAt: notifications.readAt,
      })
      .from(notifications)
      .where(
        unreadOnly 
          ? and(eq(notifications.userId, userId), eq(notifications.isRead, false))
          : eq(notifications.userId, userId)
      )
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return await query;
  },

  // Mark notification as read
  async markNotificationAsRead(userId: string, notificationId: number) {
    const [notification] = await db
      .update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      )
      .returning();
    return notification;
  },

  // Mark all notifications as read for a user
  async markAllNotificationsAsRead(userId: string) {
    await db
      .update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );
  },

  // Get unread notification count
  async getUnreadNotificationCount(userId: string) {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );

    return result[0]?.count || 0;
  },

  // Delete a notification
  async deleteNotification(userId: string, notificationId: number) {
    const [deletedNotification] = await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      )
      .returning();
    return deletedNotification;
  },

  // Delete all notifications for a user (clear all)
  async deleteAllNotifications(userId: string) {
    const deletedNotifications = await db
      .delete(notifications)
      .where(eq(notifications.userId, userId))
      .returning({ id: notifications.id });
    return deletedNotifications;
  },

  // Helper function to create profile view notification (first time only)
  async createProfileViewNotification(viewedUserId: string, viewerUserId: string) {
    try {
      // Check if viewer or viewed user is an admin - skip notifications for admin immunity
      const [viewer, viewedUser] = await Promise.all([
        userOperations.getUserWithProfile(viewerUserId),
        userOperations.getUserWithProfile(viewedUserId)
      ]);

      if (viewer?.role === 'admin' || viewedUser?.role === 'admin') {
        return null; // Skip notification for admin immunity
      }

      const viewerInfo = await profileOperations.getUserProfileInfo(viewerUserId);
      if (!viewerInfo) return null;

      // Check if this viewer has EVER viewed this profile before (notification exists)
      try {
        const existingNotification = await db.query.notifications.findFirst({
          where: and(
            eq(notifications.userId, viewedUserId),
            eq(notifications.type, 'profileView'),
            sql`${notifications.metadata}->>'actorUserId' = ${viewerUserId}`
          )
        });

        // If a notification already exists, don't create a new one or update it
        // Users can see recent activity on the /activity page
        if (existingNotification) {
          return null; // No notification needed - not first time
        }
      } catch (error) {
        console.warn('Error checking for existing profile view notification, proceeding with creation:', error);
        // Continue with creation if check fails
      }

      // Only create notification for first-time profile views
      return await this.createNotification(
        viewedUserId,
        'profileView',
        'Profile View',
        'viewed your profile.',
        {
          actorUserId: viewerUserId,
          viewerName: viewerInfo.fullName,
        }
      );
    } catch (error) {
      console.error('Error creating profile view notification:', error);
      return null;
    }
  },

  // Helper function to create connection notification
  async createConnectionNotification(toUserId: string, fromUserId: string, type: 'newConnection' | 'connectionAccepted', connectionId?: number) {
    try {
      const fromUserInfo = await profileOperations.getUserProfileInfo(fromUserId);
      if (!fromUserInfo) return null;

      // For new connection requests, check if notification already exists more robustly
      if (type === 'newConnection') {
        try {
          const existingNotification = await db.query.notifications.findFirst({
            where: and(
              eq(notifications.userId, toUserId),
              eq(notifications.type, 'newConnection'),
              sql`${notifications.metadata}->>'actorUserId' = ${fromUserId}`
            )
          });

          // If notification already exists, don't create a new one
          if (existingNotification) {
    
            return null;
          }
        } catch (error) {
          console.warn('Error checking for existing connection notification, proceeding with creation:', error);
          // Continue with creation if check fails to avoid blocking legitimate notifications
        }
      }

      const title = type === 'newConnection' ? 'New Connection Request' : 'Connection Accepted';
      const message = type === 'newConnection' ? 'sent you a connection request.' : 'accepted your connection request.';

      return await this.createNotification(
        toUserId,
        type,
        title,
        message,
        {
          actorUserId: fromUserId,
          connectionId,
        }
      );
    } catch (error) {
      console.error('Error creating connection notification:', error);
      return null;
    }
  },

  // Helper function to create message notification
  async createMessageNotification(recipientUserId: string, senderUserId: string, conversationId: number) {
    try {
      const senderInfo = await profileOperations.getUserProfileInfo(senderUserId);
      if (!senderInfo) return null;

      return await this.createNotification(
        recipientUserId,
        'newMessage',
        'New Message',
        'sent you a new message.',
        {
          actorUserId: senderUserId, // Changed from senderId to actorUserId for consistency
          conversationId,
        }
      );
    } catch (error) {
      console.error('Error creating message notification:', error);
      return null;
    }
  },
};

// Admin operations
export const adminOperations = {
  // Get admin role preferences
  async getAdminRolePreferences(userId: string) {
    return await db.query.adminRolePreferences.findFirst({
      where: eq(adminRolePreferences.userId, userId),
    });
  },

  // Create or update admin role preferences
  async setAdminRolePreferences(userId: string, preferencesData: Partial<NewAdminRolePreferences>) {
    const existing = await this.getAdminRolePreferences(userId);
    
    if (existing) {
      const [updated] = await db
        .update(adminRolePreferences)
        .set({ ...preferencesData, updatedAt: new Date() })
        .where(eq(adminRolePreferences.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(adminRolePreferences)
        .values({ userId, ...preferencesData })
        .returning();
      return created;
    }
  },

  // Get demo profiles for admin
  async getDemoProfiles(userId: string) {
    const athlete = await db.query.athleteProfiles.findFirst({
      where: and(
        eq(athleteProfiles.userId, userId),
        eq(athleteProfiles.isDemoProfile, true)
      ),
      with: {
        user: true,
        school: true,
        measurables: true,
        videos: {
          orderBy: [asc(athleteVideos.sortOrder)],
        },
        experience: true
      }
    });

    const coach = await db.query.coachProfiles.findFirst({
      where: and(
        eq(coachProfiles.userId, userId),
        eq(coachProfiles.isDemoProfile, true)
      ),
      with: {
        user: true,
        school: true,
        recruitingNeeds: true,
      }
    });

    const recruiter = await db.query.recruitingProfiles.findFirst({
      where: and(
        eq(recruitingProfiles.userId, userId),
        eq(recruitingProfiles.isDemoProfile, true)
      ),
      with: {
        user: true,
      }
    });

    // If we have a demo recruiting profile, fetch and transform the recruiting needs
    let recruiterWithNeeds = recruiter;
    if (recruiter) {
      // Get all recruiting needs for this demo profile
      const recruitingNeeds = await db.query.recruitingProfileNeeds.findMany({
        where: eq(recruitingProfileNeeds.recruitingProfileId, recruiter.id)
      });

      // Transform recruiting needs into sportSpecificNeeds object
      const sportSpecificNeeds: { [sport: string]: { studentClassifications: string[]; positions: string[]; scholarshipsAvailable?: number; recruitingPhilosophy?: string; } } = {};
      
      recruitingNeeds.forEach(need => {
        sportSpecificNeeds[need.sport] = {
          studentClassifications: need.studentClassifications,
          positions: need.positions,
          scholarshipsAvailable: need.scholarshipsAvailable ?? undefined,
          recruitingPhilosophy: need.recruitingPhilosophy || undefined
        };
      });

      // Add the sportSpecificNeeds to the recruiter profile
      recruiterWithNeeds = {
        ...recruiter,
        sportSpecificNeeds
      } as typeof recruiter & { sportSpecificNeeds: typeof sportSpecificNeeds };
    }

    return { athlete, coach, recruiter: recruiterWithNeeds };
  },

  // Create demo athlete profile
  async createDemoAthleteProfile(userId: string, profileData: Omit<NewAthleteProfile, 'userId' | 'isDemoProfile'>) {
    const [profile] = await db.insert(athleteProfiles).values({
      ...profileData,
      userId,
      isDemoProfile: true,
    }).returning();
    return profile;
  },



  // Create demo coach profile
  async createDemoCoachProfile(userId: string, profileData: Omit<NewCoachProfile, 'userId' | 'isDemoProfile'>) {
    const [profile] = await db.insert(coachProfiles).values({
      ...profileData,
      userId,
      isDemoProfile: true,
    }).returning();
    return profile;
  },

  // Create demo recruiting profile
  async createDemoRecruitingProfile(userId: string, profileData: Omit<NewRecruitingProfile, 'userId' | 'isDemoProfile'>) {
    const [profile] = await db.insert(recruitingProfiles).values({
      ...profileData,
      userId,
      isDemoProfile: true,
    }).returning();
    return profile;
  },

  // Update demo profiles
  async updateDemoAthleteProfile(userId: string, profileData: Partial<NewAthleteProfile> & { campExperience?: Array<{
    id?: number; // Database ID for existing experiences
    type: 'Camp' | 'Club';
    name: string;
    city: string;
    country: string;
    state?: string;
    startDate: Date | string;
    endDate: Date | string;
    sport: string;
    description: string;
  }> }) {
    // Handle camp experiences separately since they're stored in a separate table
    const { campExperience, ...otherProfileData } = profileData;
    
    // Update the main profile
    const [profile] = await db
      .update(athleteProfiles)
      .set({ ...otherProfileData, updatedAt: new Date() })
      .where(and(
        eq(athleteProfiles.userId, userId),
        eq(athleteProfiles.isDemoProfile, true)
      ))
      .returning();
    
    // Handle camp experiences if provided
    if (campExperience !== undefined && profile) {
      // Get existing experiences from database
      const existingExperiences = await db.query.athleteExperience.findMany({
        where: eq(athleteExperience.athleteId, profile.id)
      });

      // Convert frontend camp experience format to database format
      const experiencesData: (NewAthleteExperience & { id?: number })[] = campExperience.map((exp: {
        id?: number; // Database ID for existing experiences
        type: 'Camp' | 'Club';
        name: string;
        city: string;
        country: string;
        state?: string;
        startDate: Date | string;
        endDate: Date | string;
        sport: string;
        description: string;
      }) => {
        // Handle start date conversion - handle both Date objects and strings
        const [startDateString, startDateError] = dateToStringWithErrorHandling(
          exp.startDate,
          `demo camp experience start date for "${exp.name}" (ID: ${exp.id})`,
          new Date().toISOString().split('T')[0]
        );

        // Handle end date conversion - handle both Date objects and strings, check if it's the special "Present" date
        const [endDateString, endDateError] = dateToStringWithErrorHandling(
          exp.endDate,
          `demo camp experience end date for "${exp.name}" (ID: ${exp.id})`,
          '9999-12-31'
        );

        // Log any date conversion errors for debugging
        if (startDateError || endDateError) {
          console.warn('Date conversion issues in demo camp experience update:', {
            experienceId: exp.id,
            experienceName: exp.name,
            startDateError,
            endDateError,
            originalStartDate: exp.startDate,
            originalEndDate: exp.endDate
          });
        }

        return {
          athleteId: profile.id,
          type: exp.type,
          name: exp.name,
          city: exp.city,
          country: exp.country,
          state: exp.state || null,
          startDate: startDateString,
          endDate: endDateString,
          sport: exp.sport,
          description: exp.description,
        };
      });

      // Properly separate new and existing experiences by comparing with database
      const newExperiences: NewAthleteExperience[] = [];
      const existingExperiencesToUpdate: { id: number; data: Partial<NewAthleteExperience> }[] = [];
      const experiencesToDelete: number[] = [];

      // Create a map of existing experiences by their ID for quick lookup
      const existingExperiencesMap = new Map(existingExperiences.map(exp => [exp.id, exp]));
      
      // Create a map of frontend experiences by their ID (if they have one)
      const frontendExperiencesMap = new Map();
      const frontendExperiencesWithoutId: NewAthleteExperience[] = [];

      for (const exp of experiencesData) {
        if (exp.id) {
          frontendExperiencesMap.set(exp.id, exp);
        } else {
          frontendExperiencesWithoutId.push(exp);
        }
      }

      // Find experiences to update (existing in both database and frontend)
      for (const [id, frontendExp] of frontendExperiencesMap) {
        if (existingExperiencesMap.has(id)) {
          // This experience exists in both database and frontend - update it
          const { id: expId, ...updateData } = frontendExp;
          existingExperiencesToUpdate.push({ id: expId, data: updateData });
        }
      }

      // Find experiences to delete (in database but not in frontend)
      for (const [id] of existingExperiencesMap) {
        if (!frontendExperiencesMap.has(id)) {
          experiencesToDelete.push(id);
        }
      }

      // All frontend experiences without IDs are new
      newExperiences.push(...frontendExperiencesWithoutId);

      // Wrap all operations in a transaction to ensure consistency
      await db.transaction(async (tx) => {
        // First, update existing experiences (before any deletions)
        for (const { id, data } of existingExperiencesToUpdate) {
          await tx
            .update(athleteExperience)
            .set(data)
            .where(eq(athleteExperience.id, id));
        }

        // Then, create new experiences
        for (const newExp of newExperiences) {
          await tx.insert(athleteExperience).values(newExp);
        }

        // Finally, delete experiences that are no longer in the frontend
        for (const id of experiencesToDelete) {
          await tx
            .delete(athleteExperience)
            .where(eq(athleteExperience.id, id));
        }
       });
    }
    
    return profile;
  },



  async updateDemoCoachProfile(userId: string, profileData: Partial<NewCoachProfile>) {
    const [profile] = await db
      .update(coachProfiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(and(
        eq(coachProfiles.userId, userId),
        eq(coachProfiles.isDemoProfile, true)
      ))
      .returning();
    return profile;
  },

  async updateDemoRecruitingProfile(userId: string, profileData: Partial<NewRecruitingProfile>) {
    const [profile] = await db
      .update(recruitingProfiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(and(
        eq(recruitingProfiles.userId, userId),
        eq(recruitingProfiles.isDemoProfile, true)
      ))
      .returning();
    return profile;
  }
};

// School operations
export const schoolOperations = {
  // Search schools with autocomplete functionality
  async searchSchools(query: string, limit = 15, classification?: 'high_school' | 'college' | 'university' | 'professional' | 'other') {
    if (!query.trim()) return [];
    
    const searchQuery = `%${query.toLowerCase()}%`;
    const normalizedQuery = this.normalizeSchoolName(query);
    
    // Use the composite index when classification is provided for better performance
    if (classification) {
      return await db
        .select({
          id: schools.id,
          name: schools.name,
          classification: schools.classification,
        })
        .from(schools)
        .where(
          and(
            eq(schools.classification, classification),
            or(
              // Use ilike for case-insensitive pattern matching instead of raw SQL
              ilike(schools.name, searchQuery),
              // For complex normalized matching, we'll use the simpler normalized query with ilike
              ilike(schools.name, `%${normalizedQuery}%`)
            )
          )
        )
        .orderBy(schools.name)
        .limit(limit);
    }
    
    // Fallback to general search without classification filter
    return await db
      .select({
        id: schools.id,
        name: schools.name,
        classification: schools.classification,
      })
      .from(schools)
      .where(
        or(
          // Use ilike for case-insensitive pattern matching instead of raw SQL
          ilike(schools.name, searchQuery),
          // For complex normalized matching, we'll use the simpler normalized query with ilike
          ilike(schools.name, `%${normalizedQuery}%`)
        )
      )
      .orderBy(schools.name)
      .limit(limit);
  },

  // Create a new school
  async createSchool(schoolData: NewSchool) {
    // Check if school already exists with exact name and classification to prevent duplicates
    const normalizedName = schoolData.name.toLowerCase().trim();
    const existingSchool = await db
      .select()
      .from(schools)
      .where(and(
        ilike(schools.name, normalizedName),
        eq(schools.classification, schoolData.classification)
      ))
      .limit(1);

    if (existingSchool.length > 0) {
      return existingSchool[0];
       }

    try {
      const [school] = await db.insert(schools).values(schoolData).returning();
      return school;
    } catch (error) {
      // Handle potential race condition where school was created between check and insert
      if (error instanceof Error && (error.message.includes('duplicate') || error.message.includes('unique'))) {
        // Try to fetch the school that was created by another process
        const duplicateSchool = await db
          .select()
          .from(schools)
          .where(and(
            ilike(schools.name, normalizedName),
            eq(schools.classification, schoolData.classification)
          ))
          .limit(1);
        
        if (duplicateSchool.length > 0) {
          return duplicateSchool[0];
        }
      }
      
      // Re-throw error if it's not a duplicate key issue
      throw error;
    }
  },

  // Get school by ID
  async getSchoolById(schoolId: number) {
    return await db.query.schools.findFirst({
      where: eq(schools.id, schoolId)
    });
  },

  // Normalize school name for better matching
  normalizeSchoolName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      // Remove common variations and abbreviations
      .replace(/\buniversity\b/g, 'u')
      .replace(/\buniv\b/g, 'u')
      .replace(/\bcollege\b/g, 'c')
      .replace(/\bstate\b/g, 'st')
      .replace(/\btechnology\b/g, 'tech')
      .replace(/\btechnological\b/g, 'tech')
      .replace(/\binstitute\b/g, 'inst')
      .replace(/\binst\b/g, 'inst')
      .replace(/\bacademy\b/g, 'acad')
      .replace(/\bschool\b/g, 'sch')
      .replace(/\bhigh\s+school\b/g, 'hs')
      .replace(/\bmiddle\s+school\b/g, 'ms')
      .replace(/\belementary\s+school\b/g, 'es')
      // Remove common punctuation and normalize spacing
      .replace(/[.,\-_()]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\s+$/, '')
      .replace(/^\s+/, '');
  },

  // Calculate Levenshtein distance for string similarity
  levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  },

  // Calculate similarity percentage between two strings
  calculateSimilarity(str1: string, str2: string): number {
    const normalized1 = this.normalizeSchoolName(str1);
    const normalized2 = this.normalizeSchoolName(str2);
    
    if (normalized1 === normalized2) return 100;
    
    const maxLength = Math.max(normalized1.length, normalized2.length);
    if (maxLength === 0) return 100;
    
    const distance = this.levenshteinDistance(normalized1, normalized2);
    return ((maxLength - distance) / maxLength) * 100;
  },

  // Find similar schools using fuzzy matching
  async findSimilarSchools(name: string, classification: 'high_school' | 'college' | 'university' | 'professional' | 'other'): Promise<typeof schools.$inferSelect[]> {
    const normalizedInput = this.normalizeSchoolName(name);
    
    // First try exact normalized match
    let existingSchools = await db
      .select()
      .from(schools)
      .where(and(
        eq(schools.classification, classification),
        ilike(schools.name, normalizedInput)
      ))
      .limit(5);

    if (existingSchools.length > 0) {
      return existingSchools;
    }

    // Then try similarity search using LIKE with parts of the name
    const nameParts = normalizedInput.split(' ').filter(part => part.length > 2);
    if (nameParts.length > 0) {
      const likeConditions = nameParts.map(part => 
        ilike(schools.name, `%${part}%`)
      );
      
      existingSchools = await db
        .select()
        .from(schools)
        .where(and(
          eq(schools.classification, classification),
          or(...likeConditions)
        ))
        .limit(5);
    }

    return existingSchools;
  },

  // Get or create school by name (for onboarding/profile updates)
  async getOrCreateSchool(name: string, classification: 'high_school' | 'college' | 'university' | 'professional' | 'other') {
    const trimmedName = name.trim();
    
    // First try to find existing school (case-insensitive exact match)
    const exactMatch = await db
      .select()
      .from(schools)
      .where(and(
        eq(schools.classification, classification),
        ilike(schools.name, trimmedName.toLowerCase())
      ))
      .limit(1);

    if (exactMatch.length > 0) {
      return exactMatch[0];
    }

    // Check for highly similar schools (99%+ similarity) to prevent duplicates
    const similarSchools = await this.findSimilarSchools(trimmedName, classification);
    
    for (const school of similarSchools) {
      const similarity = this.calculateSimilarity(trimmedName, school.name);
      
      // If similarity is 99% or higher, return the existing school instead of creating a duplicate
      if (similarity >= 99) {

        return school;
      }
    }

    // Log potential duplicates for monitoring if similarity is between 80-98%
    const potentialDuplicates = similarSchools.filter(school => {
      const similarity = this.calculateSimilarity(trimmedName, school.name);
      return similarity >= 80 && similarity < 99;
    });
    
    if (potentialDuplicates.length > 0) {
      console.warn(`Creating new school "${trimmedName}" despite similar existing schools:`, 
        potentialDuplicates.map(s => `${s.name} (${this.calculateSimilarity(trimmedName, s.name).toFixed(1)}% similar)`)
      );
    }

    // Create new school if no high similarity match found
    return await this.createSchool({
      name: trimmedName,
      classification,
    });
  },

  // Get schools by classification
  async getSchoolsByClassification(classification: 'high_school' | 'college' | 'university' | 'professional' | 'other', limit = 100) {
    return await db
      .select()
      .from(schools)
      .where(eq(schools.classification, classification))
      .orderBy(schools.name)
      .limit(limit);
  },

  // Get school name by ID (helper function)
  async getSchoolName(schoolId: number | null, fallbackName?: string): Promise<string> {
    if (!schoolId) {
      return fallbackName || 'Unknown School';
    }
    
    const school = await this.getSchoolById(schoolId);
    return school?.name || fallbackName || 'Unknown School';
  },

  // Bulk get school names for multiple IDs (for performance)
  async getSchoolNames(schoolIds: (number | null)[]): Promise<Map<number, string>> {
    const validIds = schoolIds.filter((id): id is number => id !== null);
    
    if (validIds.length === 0) {
      return new Map();
    }

    const schoolsData = await db
      .select({ id: schools.id, name: schools.name })
      .from(schools)
      .where(inArray(schools.id, validIds));

    return new Map(schoolsData.map(school => [school.id, school.name]));
  }
};

/**
 * Creates a secure, parameterized SQL condition for filtering athlete height.
 * This function generates a CASE statement to parse height strings (e.g., "6'2\"")
 * into total inches for comparison.
 *
 * @param minHeight - The minimum height in inches.
 * @returns A Drizzle SQL object for the height condition.
 */
export function createHeightFilter(minHeight: number) {
  return sql`(
    CASE
      -- Match "feet'inches\"" format (e.g., 6'2")
      WHEN athlete_profiles.height ~ '^[0-9]{1,2}''[0-9]{1,2}"$'
      THEN (
        CAST(SPLIT_PART(athlete_profiles.height, '''', 1) AS INTEGER) * 12 +
        CAST(REPLACE(SPLIT_PART(athlete_profiles.height, '''', 2), '"', '') AS INTEGER)
      )
      -- Match "feet'" format (e.g., 6')
      WHEN athlete_profiles.height ~ '^[0-9]{1,2}''$'
      THEN (
        CAST(REPLACE(athlete_profiles.height, '''', '') AS INTEGER) * 12
      )
      ELSE NULL
    END
  ) >= ${minHeight}`;
}

/**
 * Creates a secure, parameterized SQL condition for filtering athlete weight.
 * This function generates a CASE statement to parse weight strings into pounds.
 *
 * @param minWeight - The minimum weight in pounds.
 * @returns A Drizzle SQL object for the weight condition.
 */
export function createWeightFilter(minWeight: number) {
  return sql`(
    CASE
      -- Match numeric weight string (e.g., "180")
      WHEN athlete_profiles.weight ~ '^[0-9]{1,3}$'
      THEN CAST(athlete_profiles.weight AS INTEGER)
      ELSE NULL
    END
  ) >= ${minWeight}`;
}