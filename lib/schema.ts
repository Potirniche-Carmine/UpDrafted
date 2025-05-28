import {
  pgTable,
  pgEnum,
  text,
  serial,
  integer,
  decimal,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['athlete', 'coach', 'recruiter']);
export const verificationStatusEnum = pgEnum('verification_status', ['pending', 'verified', 'rejected']);
export const coachRoleEnum = pgEnum('coach_role', ['coach', 'recruiter']);
export const connectionStatusEnum = pgEnum('connection_status', ['connected', 'interested', 'viewed']);
export const initiatedByEnum = pgEnum('initiated_by', ['athlete', 'coach']);
export const genderEnum = pgEnum('gender', ['male', 'female', 'coed']);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  role: userRoleEnum('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_users_role').on(table.role),
  index('idx_users_email').on(table.email),
]);

export const sports = pgTable('sports', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  gender: genderEnum('gender').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_sports_gender').on(table.gender),
  index('idx_sports_is_active').on(table.isActive),
]);

export const athleteProfiles = pgTable('athlete_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  profileImageR3Key: text('profile_image_r3_key'),
  sport: text('sport').notNull(),
  secondarySports: text('secondary_sports').array(),
  graduationYear: integer('graduation_year').notNull(),
  highSchool: text('high_school').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  height: text('height').notNull(),
  weight: text('weight').notNull(),
  positions: text('positions').array().notNull(),
  gpa: decimal('gpa', { precision: 3, scale: 2 }),
  satScore: integer('sat_score'),
  actScore: integer('act_score'),
  intendedMajor: text('intended_major'),
  gender: text('gender'),
  maxprepsUrl: text('maxpreps_url').notNull(),
  verificationStatus: verificationStatusEnum('verification_status').default('pending').notNull(),
  hudlUrl: text('hudl_url'),
  hudlEmbedUrl: text('hudl_embed_url'),
  instagramHandle: text('instagram_handle'),
  twitterHandle: text('twitter_handle'),
  personalStatement: text('personal_statement'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_athlete_profiles_user_id').on(table.userId),
  index('idx_athlete_profiles_sport').on(table.sport),
  index('idx_athlete_profiles_graduation_year').on(table.graduationYear),
  unique('athlete_profiles_user_id_unique').on(table.userId),
]);

export const athleteMeasurables = pgTable('athlete_measurables', {
  id: serial('id').primaryKey(),
  athleteId: integer('athlete_id').notNull().references(() => athleteProfiles.id, { onDelete: 'cascade' }),
  sport: text('sport').notNull(),
  label: text('label').notNull(),
  value: text('value').notNull(),
  measurementDate: date('measurement_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const athleteVideos = pgTable('athlete_videos', {
  id: serial('id').primaryKey(),
  athleteId: integer('athlete_id').notNull().references(() => athleteProfiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  youtubeUrl: text('youtube_url').notNull(),
  embedUrl: text('embed_url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const coachProfiles = pgTable('coach_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  role: coachRoleEnum('role').notNull(),
  sportCoaching: text('sport_coaching').notNull(),
  organizationName: text('organization_name').notNull(),
  organizationLogo: text('organization_logo'),
  division: text('division').notNull(),
  conference: text('conference'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  isVerified: boolean('is_verified').default(false),
  programWebsite: text('program_website'),
  schoolWebsite: text('school_website'),
  instagramHandle: text('instagram_handle'),
  twitterHandle: text('twitter_handle'),
  showcaseVideoTitle: text('showcase_video_title'),
  showcaseVideoUrl: text('showcase_video_url'),
  showcaseVideoEmbedUrl: text('showcase_video_embed_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_coach_profiles_user_id').on(table.userId),
  index('idx_coach_profiles_role').on(table.role),
  unique('coach_profiles_user_id_unique').on(table.userId),
]);

// Separate recruiting profiles table for future flexibility
export const recruitingProfiles = pgTable('recruiting_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  sportRecruiting: text('sport_recruiting').notNull(),
  organizationName: text('organization_name').notNull(),
  organizationLogo: text('organization_logo'),
  division: text('division').notNull(),
  conference: text('conference'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  isVerified: boolean('is_verified').default(false),
  programWebsite: text('program_website'),
  schoolWebsite: text('school_website'),
  instagramHandle: text('instagram_handle'),
  twitterHandle: text('twitter_handle'),
  showcaseVideoTitle: text('showcase_video_title'),
  showcaseVideoUrl: text('showcase_video_url'),
  showcaseVideoEmbedUrl: text('showcase_video_embed_url'),
  recruitingPhilosophy: text('recruiting_philosophy'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_recruiting_profiles_user_id').on(table.userId),
  unique('recruiting_profiles_user_id_unique').on(table.userId),
]);

export const recruitingNeeds = pgTable('recruiting_needs', {
  id: serial('id').primaryKey(),
  coachId: integer('coach_id').notNull().references(() => coachProfiles.id, { onDelete: 'cascade' }),
  graduationYears: integer('graduation_years').array().notNull(),
  positions: text('positions').array().notNull(),
  scholarshipsAvailable: integer('scholarships_available'),
  recruitingPhilosophy: text('recruiting_philosophy'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique('recruiting_needs_coach_id_unique').on(table.coachId),
]);

export const recruitingProfileNeeds = pgTable('recruiting_profile_needs', {
  id: serial('id').primaryKey(),
  recruitingProfileId: integer('recruiting_profile_id').notNull().references(() => recruitingProfiles.id, { onDelete: 'cascade' }),
  graduationYears: integer('graduation_years').array().notNull(),
  positions: text('positions').array().notNull(),
  scholarshipsAvailable: integer('scholarships_available'),
  recruitingPhilosophy: text('recruiting_philosophy'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique('recruiting_profile_needs_recruiting_profile_id_unique').on(table.recruitingProfileId),
]);

export const connections = pgTable('connections', {
  id: serial('id').primaryKey(),
  athleteId: integer('athlete_id').notNull().references(() => athleteProfiles.id, { onDelete: 'cascade' }),
  coachId: integer('coach_id').notNull().references(() => coachProfiles.id, { onDelete: 'cascade' }),
  status: connectionStatusEnum('status').default('viewed').notNull(),
  initiatedBy: initiatedByEnum('initiated_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_connections_athlete_id').on(table.athleteId),
  index('idx_connections_coach_id').on(table.coachId),
  unique('connections_athlete_coach_unique').on(table.athleteId, table.coachId),
]);

export const activityLog = pgTable('activity_log', {
  id: serial('id').primaryKey(),
  viewerId: text('viewer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  viewedUserId: text('viewed_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_activity_log_viewer_id').on(table.viewerId),
  index('idx_activity_log_viewed_user_id').on(table.viewedUserId),
  index('idx_activity_log_created_at').on(table.createdAt),
]);

// Simplified chat feature tables
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  athleteId: integer('athlete_id').notNull().references(() => athleteProfiles.id, { onDelete: 'cascade' }),
  coachId: integer('coach_id').notNull().references(() => coachProfiles.id, { onDelete: 'cascade' }),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_conversations_athlete_id').on(table.athleteId),
  index('idx_conversations_coach_id').on(table.coachId),
  index('idx_conversations_last_message_at').on(table.lastMessageAt),
  unique('conversations_athlete_coach_unique').on(table.athleteId, table.coachId),
]);

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  messageType: text('message_type').default('text').notNull(), // 'text', 'image', 'file'
  attachmentUrl: text('attachment_url'), // For files/images
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_messages_conversation_id').on(table.conversationId),
  index('idx_messages_sender_id').on(table.senderId),
  index('idx_messages_created_at').on(table.createdAt),
]);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  athleteProfile: one(athleteProfiles, {
    fields: [users.id],
    references: [athleteProfiles.userId],
  }),
  coachProfile: one(coachProfiles, {
    fields: [users.id],
    references: [coachProfiles.userId],
  }),
  recruitingProfile: one(recruitingProfiles, {
    fields: [users.id],
    references: [recruitingProfiles.userId],
  }),
  sentMessages: many(messages),
}));

export const athleteProfilesRelations = relations(athleteProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [athleteProfiles.userId],
    references: [users.id],
  }),
  measurables: many(athleteMeasurables),
  videos: many(athleteVideos),
  connections: many(connections),
  conversations: many(conversations),
}));

export const coachProfilesRelations = relations(coachProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [coachProfiles.userId],
    references: [users.id],
  }),
  recruitingNeeds: one(recruitingNeeds),
  connections: many(connections),
  conversations: many(conversations),
}));

export const athleteMeasurablesRelations = relations(athleteMeasurables, ({ one }) => ({
  athlete: one(athleteProfiles, {
    fields: [athleteMeasurables.athleteId],
    references: [athleteProfiles.id],
  }),
}));

export const athleteVideosRelations = relations(athleteVideos, ({ one }) => ({
  athlete: one(athleteProfiles, {
    fields: [athleteVideos.athleteId],
    references: [athleteProfiles.id],
  }),
}));

export const recruitingProfilesRelations = relations(recruitingProfiles, ({ one }) => ({
  user: one(users, {
    fields: [recruitingProfiles.userId],
    references: [users.id],
  }),
  recruitingNeeds: one(recruitingProfileNeeds),
}));

export const recruitingNeedsRelations = relations(recruitingNeeds, ({ one }) => ({
  coach: one(coachProfiles, {
    fields: [recruitingNeeds.coachId],
    references: [coachProfiles.id],
  }),
}));

export const recruitingProfileNeedsRelations = relations(recruitingProfileNeeds, ({ one }) => ({
  recruitingProfile: one(recruitingProfiles, {
    fields: [recruitingProfileNeeds.recruitingProfileId],
    references: [recruitingProfiles.id],
  }),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  athlete: one(athleteProfiles, {
    fields: [connections.athleteId],
    references: [athleteProfiles.id],
  }),
  coach: one(coachProfiles, {
    fields: [connections.coachId],
    references: [coachProfiles.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  athlete: one(athleteProfiles, {
    fields: [conversations.athleteId],
    references: [athleteProfiles.id],
  }),
  coach: one(coachProfiles, {
    fields: [conversations.coachId],
    references: [coachProfiles.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const sportsRelations = relations(sports, () => ({
  // No direct relations needed for now, but can be added later if needed
}));

// Export types for use in your application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Sport = typeof sports.$inferSelect;
export type NewSport = typeof sports.$inferInsert;
export type AthleteProfile = typeof athleteProfiles.$inferSelect;
export type NewAthleteProfile = typeof athleteProfiles.$inferInsert;
export type CoachProfile = typeof coachProfiles.$inferSelect;
export type NewCoachProfile = typeof coachProfiles.$inferInsert;
export type RecruitingProfile = typeof recruitingProfiles.$inferSelect;
export type NewRecruitingProfile = typeof recruitingProfiles.$inferInsert;
export type Connection = typeof connections.$inferSelect;
export type NewConnection = typeof connections.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type RecruitingNeeds = typeof recruitingNeeds.$inferSelect;
export type NewRecruitingNeeds = typeof recruitingNeeds.$inferInsert;
export type RecruitingProfileNeeds = typeof recruitingProfileNeeds.$inferSelect;
export type NewRecruitingProfileNeeds = typeof recruitingProfileNeeds.$inferInsert; 