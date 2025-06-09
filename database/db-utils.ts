import { eq, and, desc, or, asc, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  users, 
  athleteProfiles, 
  athleteMeasurables,
  coachProfiles,
  recruitingProfiles,
  recruitingNeeds,
  recruitingProfileNeeds,
  connections,
  activityLog,
  reports,
  messages,
  conversations,
  type NewUser,
  type NewAthleteProfile,
  type NewAthleteMeasurable,
  type NewAthleteVideo,
  type NewCoachProfile,
  type NewRecruitingProfile,
  type NewRecruitingNeeds,
  type NewRecruitingProfileNeeds,
  type NewReport,
  athleteVideos,
} from './schema';
import { OnboardingProfileData } from '@/app/(onboarding)/lib/onboarding';
import { sanitizeAndEncryptMessage } from '@/utils/encryption';

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
        measurables: true,
        videos: {
          orderBy: [asc(athleteVideos.sortOrder)],
        }
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

// Coach operations
export const coachOperations = {
  // Get coach profile with all related data
  async getCoachProfile(userId: string) {
    const coachProfile = await db.query.coachProfiles.findFirst({
      where: eq(coachProfiles.userId, userId),
      with: {
        user: true,
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
      }
    });

    if (!profile) return null;

    // Get all recruiting needs for this profile
    const recruitingNeeds = await db.query.recruitingProfileNeeds.findMany({
      where: eq(recruitingProfileNeeds.recruitingProfileId, profile.id)
    });

    // Transform recruiting needs into sportSpecificNeeds object
    const sportSpecificNeeds: { [sport: string]: { graduationYears: number[]; positions: string[]; scholarshipsAvailable?: number; recruitingPhilosophy?: string; } } = {};
    
    recruitingNeeds.forEach(need => {
      sportSpecificNeeds[need.sport] = {
        graduationYears: need.graduationYears,
        positions: need.positions,
        scholarshipsAvailable: need.scholarshipsAvailable || undefined,
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
                organizationName: true,
                sport: true,
                city: true,
                state: true,
                graduationYear: true,
                educationLevel: true,
                isVerified: true,
              },
            },
            coachProfile: {
              columns: {
                fullName: true,
                profileImageR3Key: true,
                organizationName: true,
                title: true,
                city: true,
                state: true,
                division: true,
                isVerified: true,
              },
            },
            recruitingProfile: {
              columns: {
                fullName: true,
                profileImageR3Key: true,
                organizationName: true,
                title: true,
                city: true,
                state: true,
                division: true,
                isVerified: true,
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
                organizationName: true,
                sport: true,
                city: true,
                state: true,
                graduationYear: true,
                educationLevel: true,
                isVerified: true,
              },
            },
            coachProfile: {
              columns: {
                fullName: true,
                profileImageR3Key: true,
                organizationName: true,
                title: true,
                city: true,
                state: true,
                division: true,
                isVerified: true,
              },
            },
            recruitingProfile: {
              columns: {
                fullName: true,
                profileImageR3Key: true,
                organizationName: true,
                title: true,
                city: true,
                state: true,
                division: true,
                isVerified: true,
              },
            },
          },
        },
      },
      orderBy: [desc(connections.createdAt)],
    });

    return userConnections;
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
  }
};

// Activity logging
export const activityOperations = {
  // Log activity
  async logActivity(viewerId: string, viewedUserId: string, action: string, metadata?: Record<string, unknown>) {
    await db.insert(activityLog).values({
      viewerId,
      viewedUserId,
      action,
      metadata
    });
  },

  // Get user activity
  async getUserActivity(userId: string, limit = 50) {
    return await db.query.activityLog.findMany({
      where: eq(activityLog.viewedUserId, userId),
      orderBy: [desc(activityLog.createdAt)],
      limit
    });
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

    // Create athlete profile
    const newProfile: NewAthleteProfile = {
      userId,
      fullName: profileData.fullName,
      profileImageR3Key: profileImageR3Key,
      sport: profileData.sport!,
      secondarySports: profileData.secondarySports || [],
      graduationYear: profileData.graduationYear!,
      educationLevel: profileData.educationLevel!,
      organizationName: profileData.organizationName!,
      city: profileData.city!,
      state: profileData.state!,
      height: profileData.height!,
      weight: profileData.weight!,
      positions: profileData.positions!,
      division: profileData.division,
    };
    
    const athleteProfile = await athleteOperations.createAthleteProfile(newProfile);
    
    return { user, athleteProfile };
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
      fullName: profileData.fullName,
      title: profileData.title!,
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
      twitterHandle: profileData.orgTwitterHandle || undefined,
      personalStatement: profileData.personalStatement || undefined
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
      fullName: profileData.fullName,
      title: profileData.title!,
      sportRecruiting: profileData.sportCoaching!,
      secondarySports: profileData.secondarySportsRecruiting || [],
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
      personalStatement: profileData.personalStatement || undefined
    });

    // Create sport-specific recruiting needs if provided
    const recruitingProfileNeeds = [];
    if (profileData.sportSpecificNeeds) {
      for (const [sport, needs] of Object.entries(profileData.sportSpecificNeeds)) {
        if (needs.graduationYears && needs.positions) {
          const profileNeeds = await recruitingNeedsOperations.createRecruitingProfileNeeds({
            recruitingProfileId: recruiterProfile.id,
            sport: sport,
            graduationYears: needs.graduationYears,
            positions: needs.positions,
            scholarshipsAvailable: needs.scholarshipsAvailable || undefined,
            recruitingPhilosophy: needs.recruitingPhilosophy || undefined
          });
          recruitingProfileNeeds.push(profileNeeds);
        }
      }
    }

    return { user, profile: recruiterProfile, recruitingProfileNeeds };
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
    // Get conversations where user is either user1 or user2
    const conversationsAsUser1 = await db.query.conversations.findMany({
      where: and(
        eq(conversations.user1Id, userId),
        eq(conversations.connectionActive, true)
      ),
      with: {
        user2: true,
        messages: {
          orderBy: [desc(messages.createdAt)],
          limit: 1,
        }
      },
      orderBy: [desc(conversations.lastMessageAt)]
    });
    
    const conversationsAsUser2 = await db.query.conversations.findMany({
      where: and(
        eq(conversations.user2Id, userId),
        eq(conversations.connectionActive, true)
      ),
      with: {
        user1: true,
        messages: {
          orderBy: [desc(messages.createdAt)],
          limit: 1,
        }
      },
      orderBy: [desc(conversations.lastMessageAt)]
    });
    
    // Combine and sort all conversations by lastMessageAt
    const allConversations = [
      ...conversationsAsUser1,
      ...conversationsAsUser2
    ].sort((a, b) => {
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });
    
    return allConversations;
  },

  // Update connection active status for a conversation
  async updateConversationConnectionStatus(conversationId: number, isActive: boolean) {
    return await db.update(conversations)
      .set({ connectionActive: isActive })
      .where(eq(conversations.id, conversationId))
      .returning();
  },

  // Get messages for a conversation with pagination
  async getMessages(conversationId: number, limit = 50, offset = 0) {
    return await db.query.messages.findMany({
      where: eq(messages.conversationId, conversationId),
      orderBy: [desc(messages.createdAt)],
      limit,
      offset,
      with: {
        sender: true
      }
    });
  },
  
  // Send a new message
  async sendMessage(conversationId: number, senderId: string, content: string) {
    // Sanitize and encrypt the message
    const { encryptedText, iv } = sanitizeAndEncryptMessage(content);
    
    // Get the conversation to determine who's who
    const conversation = await this.getConversationById(conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    // Determine if sender is user1 or user2 and update unread counts accordingly
    const isUser1 = conversation.user1Id === senderId;
    
    // Update conversation with new last message time and increment unread count
    if (isUser1) {
      await db.update(conversations)
        .set({ 
          lastMessageAt: new Date(),
          user2UnreadCount: sql`${conversations.user2UnreadCount} + 1`
        })
        .where(eq(conversations.id, conversationId));
    } else {
      await db.update(conversations)
        .set({ 
          lastMessageAt: new Date(),
          user1UnreadCount: sql`${conversations.user1UnreadCount} + 1`
        })
        .where(eq(conversations.id, conversationId));
    }
    
    // Insert the new message
    const [message] = await db.insert(messages)
      .values({
        conversationId,
        senderId,
        encryptedContent: encryptedText,
        contentIV: iv,
        messageType: 'text',
        createdAt: new Date()
      })
      .returning();
    
    return message;
  },
  
  // Mark messages as read
  async markMessagesAsRead(conversationId: number, userId: string) {
    // Get the conversation to determine who's who
    const conversation = await this.getConversationById(conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    const isUser1 = conversation.user1Id === userId;
    
    // Mark messages as read where this user is NOT the sender
    await db.update(messages)
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
      await db.update(conversations)
        .set({ user1UnreadCount: 0 })
        .where(eq(conversations.id, conversationId));
    } else {
      await db.update(conversations)
        .set({ user2UnreadCount: 0 })
        .where(eq(conversations.id, conversationId));
    }
    
    return { success: true };
  },
  
  // Get total unread message count for a user
  async getUnreadMessageCount(userId: string) {
    // Check for unread messages where user is user1
    const resultAsUser1 = await db.select({
      count: sql`sum(${conversations.user1UnreadCount})`
    })
    .from(conversations)
    .where(and(
      eq(conversations.user1Id, userId),
      eq(conversations.connectionActive, true)
    ));
    
    const unreadCountAsUser1 = Number(resultAsUser1[0]?.count || 0);
    
    // Check for unread messages where user is user2
    const resultAsUser2 = await db.select({
      count: sql`sum(${conversations.user2UnreadCount})`
    })
    .from(conversations)
    .where(and(
      eq(conversations.user2Id, userId),
      eq(conversations.connectionActive, true)
    ));
    
    const unreadCountAsUser2 = Number(resultAsUser2[0]?.count || 0);
    
    // Return the total unread count
    return unreadCountAsUser1 + unreadCountAsUser2;
  },

  // Get the partner user ID from a conversation
  async getPartnerIdFromConversation(conversationId: number, userId: string) {
    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });

    if (!conversation) return null;

    return conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
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
    let educationLevel = undefined;
    let isVerified = false;

    if (user.role === 'athlete' && user.athleteProfile) {
      fullName = user.athleteProfile.fullName;
      profileImageUrl = user.athleteProfile.profileImageR3Key;
      division = user.athleteProfile.division;
      educationLevel = user.athleteProfile.educationLevel;
      isVerified = user.athleteProfile.isVerified ?? false;
    } else if (user.role === 'coach' && user.coachProfile) {
      fullName = user.coachProfile.fullName;
      profileImageUrl = user.coachProfile.profileImageR3Key;
      division = user.coachProfile.division;
      isVerified = user.coachProfile.isVerified ?? false;
    } else if (user.role === 'recruiter' && user.recruitingProfile) {
      fullName = user.recruitingProfile.fullName;
      profileImageUrl = user.recruitingProfile.profileImageR3Key;
      division = user.recruitingProfile.division;
      isVerified = user.recruitingProfile.isVerified ?? false;
    }

    return {
      fullName,
      profileImageUrl,
      role: user.role,
      division,
      educationLevel,
      isVerified,
    };
  }
}; 