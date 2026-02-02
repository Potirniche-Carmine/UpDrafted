import {
  pgTable,
  pgEnum,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  unique,
  real,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['athlete', 'coach', 'recruiter', 'admin']);
export const coachRoleEnum = pgEnum('coach_role', ['coach', 'recruiter']);
export const connectionStatusEnum = pgEnum('connection_status', ['connected', 'pending']);
export const initiatedByEnum = pgEnum('initiated_by', ['athlete', 'coach', 'recruiter']);
export const genderEnum = pgEnum('gender', ['male', 'female', 'coed']);
export const reportStatusEnum = pgEnum('report_status', ['pending', 'under_review', 'resolved', 'dismissed']);
export const verificationRequestStatusEnum = pgEnum('verification_request_status', ['pending', 'approved', 'rejected', 'under_review']);
export const verificationTypeEnum = pgEnum('verification_type', ['general', 'transfer_portal']);
export const educationLevelEnum = pgEnum('education_level', ['high_school', 'undergraduate', 'graduate', 'associate']);
export const notificationTypeEnum = pgEnum('notification_type', ['profileView', 'newConnection', 'newMessage', 'systemUpdate', 'premiumFeature', 'connectionAccepted']);
export const studentClassificationEnum = pgEnum('student_classification', ['high_school', 'university_transfers', 'juco_students', 'graduate_transfers', 'international_students']);
export const schoolClassificationEnum = pgEnum('school_classification', ['high_school', 'college', 'university', 'professional', 'other']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'cancelled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid']);
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'pro_athlete_monthly', 'pro_athlete_yearly', 'pro_coach_monthly', 'pro_coach_yearly', 'pro_recruiter_monthly', 'pro_recruiter_yearly']);

export const schools = pgTable('schools', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  classification: schoolClassificationEnum('classification').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_schools_name').on(table.name),
  index('idx_schools_classification').on(table.classification),
  index('idx_schools_name_lower').on(table.name),
  index('idx_schools_classification_name').on(table.classification, table.name), // Composite index for filtered searches
]);

// Better-auth user table (singular name required by better-auth)
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  role: userRoleEnum('role'), // Nullable - null means needs onboarding
  stripeCustomerId: text('stripe_customer_id'), // Added by Stripe plugin
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_user_role').on(table.role),
  index('idx_user_email').on(table.email),
  index('idx_user_stripe_customer').on(table.stripeCustomerId),
]);

// Alias for backward compatibility
export const users = user;

// Better-auth session table
export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_session_user_id').on(table.userId),
  index('idx_session_token').on(table.token),
]);

// Better-auth account table (for OAuth providers and password)
export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_account_user_id').on(table.userId),
]);

// Better-auth verification table (email verification, password reset)
export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_verification_identifier').on(table.identifier),
]);

// Better-auth subscription table (from Stripe plugin)
export const subscription = pgTable('subscription', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripeCustomerId: text('stripe_customer_id'),
  plan: text('plan'),
  status: text('status'),
  referenceId: text('reference_id'),
  periodStart: timestamp('period_start', { withTimezone: true }),
  periodEnd: timestamp('period_end', { withTimezone: true }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end'),
  seats: integer('seats'),
  trialStart: timestamp('trial_start', { withTimezone: true }),
  trialEnd: timestamp('trial_end', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_subscription_user_id').on(table.userId),
  index('idx_subscription_stripe_id').on(table.stripeSubscriptionId),
]);

export const athleteProfiles = pgTable('athlete_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  profileImageR3Key: text('profile_image_r3_key'),
  sport: text('sport').notNull(),
  secondarySports: text('secondary_sports').array(),
  graduationYear: integer('graduation_year').notNull(),
  division: text('division'),
  conference: text('conference'),
  educationLevel: educationLevelEnum('education_level').notNull().default('high_school'),
  schoolId: integer('school_id').notNull().references(() => schools.id),
  city: text('city').notNull(),
  country: text('country').notNull().default('United States'), // Added country (required)
  state: text('state'), // Made nullable
  height: text('height').notNull(),
  weight: text('weight').notNull(),
  positions: text('positions').array().notNull(),
  teamLevel: text('team_level'), // Team level for high school athletes (varsity, jv, freshman)
  gpa: real('gpa'),
  satScore: integer('sat_score'),
  actScore: integer('act_score'),
  intendedMajor: text('intended_major'),
  gender: text('gender'),
  maxprepsUrl: text('maxpreps_url'),
  sports247Url: text('sports247_url'),
  espnUrl: text('espn_url'),
  isVerified: boolean('is_verified').default(false),
  transferPortalVerifiedAt: timestamp('transfer_portal_verified_at', { withTimezone: true }),
  isOnTransferPortal: boolean('is_on_transfer_portal').default(false),
  hudlUrl: text('hudl_url'),
  hudlEmbedUrl: text('hudl_embed_url'),
  instagramHandle: text('instagram_handle'),
  twitterHandle: text('twitter_handle'),
  personalStatement: text('personal_statement'),
  isDemoProfile: boolean('is_demo_profile').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_athlete_profiles_user_id').on(table.userId),
  index('idx_athlete_profiles_sport').on(table.sport),
  index('idx_athlete_profiles_graduation_year').on(table.graduationYear),
  index('idx_athlete_profiles_education_level').on(table.educationLevel),
  index('idx_athlete_profiles_school_id').on(table.schoolId),
  index('idx_athlete_profiles_is_demo').on(table.isDemoProfile),
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
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_athlete_videos_athlete_id').on(table.athleteId),
  index('idx_athlete_videos_sort_order').on(table.sortOrder),
]);

export const athleteExperience = pgTable('athlete_experience', {
  id: serial('id').primaryKey(),
  athleteId: integer('athlete_id').notNull().references(() => athleteProfiles.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'Camp' or 'Club'
  name: text('name').notNull(),
  city: text('city').notNull(),
  country: text('country').notNull(),
  state: text('state'),
  startDate: date('start_date').notNull(), // Store as proper date for querying/sorting
  endDate: date('end_date').notNull(), // Store as proper date for querying/sorting. Use '9999-12-31' to represent "Present"
  sport: text('sport').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_athlete_experience_athlete_id').on(table.athleteId),
  index('idx_athlete_experience_type').on(table.type),
  index('idx_athlete_experience_sport').on(table.sport),
  index('idx_athlete_experience_start_date').on(table.startDate),
  index('idx_athlete_experience_end_date').on(table.endDate),
  index('idx_athlete_experience_dates').on(table.startDate, table.endDate),
]);

export const coachProfiles = pgTable('coach_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  title: text('title').notNull(),
  sportCoaching: text('sport_coaching').notNull(),
  schoolId: integer('school_id').notNull().references(() => schools.id),
  profileImageR3Key: text('profile_image_r3_key'),
  organizationLogoR3Key: text('organization_logo_r3_key'),
  division: text('division').notNull(),
  conference: text('conference'),
  city: text('city').notNull(),
  country: text('country').notNull().default('United States'), // Added country (required)
  state: text('state'), // Made nullable
  isVerified: boolean('is_verified').default(false),
  programWebsite: text('program_website'),
  schoolWebsite: text('school_website'),
  instagramHandle: text('instagram_handle'),
  twitterHandle: text('twitter_handle'),
  programInstagram: text('program_instagram'),
  programTwitter: text('program_twitter'),
  showcaseVideoTitle: text('showcase_video_title'),
  showcaseVideoUrl: text('showcase_video_url'),
  personalStatement: text('personal_statement'),
  showcaseVideoEmbedUrl: text('showcase_video_embed_url'),
  isDemoProfile: boolean('is_demo_profile').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_coach_profiles_user_id').on(table.userId),
  index('idx_coach_profiles_school_id').on(table.schoolId),
  index('idx_coach_profiles_is_demo').on(table.isDemoProfile),
  unique('coach_profiles_user_id_unique').on(table.userId),
]);

export const recruitingProfiles = pgTable('recruiting_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  title: text('title').notNull(),
  sportRecruiting: text('sport_recruiting').notNull(),
  secondarySports: text('secondary_sports').array(),
  schoolId: integer('school_id').notNull().references(() => schools.id),
  profileImageR3Key: text('profile_image_r3_key'),
  organizationLogoR3Key: text('organization_logo_r3_key'),
  division: text('division').notNull(),
  conference: text('conference'),
  city: text('city').notNull(),
  country: text('country').notNull().default('United States'), // Added country (required)
  state: text('state'), // Made nullable
  isVerified: boolean('is_verified').default(false),
  programWebsite: text('program_website'),
  schoolWebsite: text('school_website'),
  instagramHandle: text('instagram_handle'),
  twitterHandle: text('twitter_handle'),
  programInstagram: text('program_instagram'),
  programTwitter: text('program_twitter'),
  showcaseVideoTitle: text('showcase_video_title'),
  showcaseVideoUrl: text('showcase_video_url'),
  showcaseVideoEmbedUrl: text('showcase_video_embed_url'),
  personalStatement: text('personal_statement'),
  isDemoProfile: boolean('is_demo_profile').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_recruiting_profiles_user_id').on(table.userId),
  index('idx_recruiting_profiles_school_id').on(table.schoolId),
  index('idx_recruiting_profiles_is_demo').on(table.isDemoProfile),
  unique('recruiting_profiles_user_id_unique').on(table.userId),
]);

export const recruitingNeeds = pgTable('recruiting_needs', {
  id: serial('id').primaryKey(),
  coachId: integer('coach_id').notNull().references(() => coachProfiles.id, { onDelete: 'cascade' }),
  studentClassifications: studentClassificationEnum('student_classifications').array().notNull(),
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
  sport: text('sport').notNull(),
  studentClassifications: studentClassificationEnum('student_classifications').array().notNull(),
  positions: text('positions').array().notNull(),
  scholarshipsAvailable: integer('scholarships_available'),
  recruitingPhilosophy: text('recruiting_philosophy'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_recruiting_profile_needs_recruiting_profile_id').on(table.recruitingProfileId),
  unique('recruiting_profile_needs_recruiting_profile_sport_unique').on(table.recruitingProfileId, table.sport),
]);

export const connections = pgTable('connections', {
  id: serial('id').primaryKey(),
  fromUserId: text('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toUserId: text('to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: connectionStatusEnum('status').default('pending').notNull(),
  notes: text('notes'),
  initiatedBy: initiatedByEnum('initiated_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_connections_from_user_id').on(table.fromUserId),
  index('idx_connections_to_user_id').on(table.toUserId),
  index('idx_connections_status').on(table.status),
  index('idx_connections_from_status').on(table.fromUserId, table.status),
  index('idx_connections_to_status').on(table.toUserId, table.status),
  unique('connections_users_unique').on(table.fromUserId, table.toUserId),
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

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  user1Id: text('user1_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  user2Id: text('user2_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  user1UnreadCount: integer('user1_unread_count').default(0).notNull(),
  user2UnreadCount: integer('user2_unread_count').default(0).notNull(),
  connectionActive: boolean('connection_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_conversations_user1_id').on(table.user1Id),
  index('idx_conversations_user2_id').on(table.user2Id),
  index('idx_conversations_last_message_at').on(table.lastMessageAt),
  index('idx_conversations_connection_active').on(table.connectionActive),
  index('idx_conversations_user1_lastmessage').on(table.user1Id, table.lastMessageAt.desc()),
  index('idx_conversations_user2_lastmessage').on(table.user2Id, table.lastMessageAt.desc()),
  unique('conversations_users_unique').on(table.user1Id, table.user2Id),
  // Note: Application-level validation ensures user1Id !== user2Id
]);

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  encryptedContent: text('encrypted_content').notNull(),
  contentIV: text('content_iv').notNull(),
  messageType: text('message_type').default('text').notNull(),
  attachmentUrl: text('attachment_url'),
  isRead: boolean('is_read').default(false).notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_messages_conversation_id').on(table.conversationId),
  index('idx_messages_sender_id').on(table.senderId),
  index('idx_messages_created_at').on(table.createdAt),
  index('idx_messages_is_read').on(table.isRead),
  index('idx_messages_conversation_created').on(table.conversationId, table.createdAt.desc()),
  index('idx_messages_sender_read').on(table.senderId, table.isRead),
  index('idx_messages_conversation_read').on(table.conversationId, table.isRead),
]);

export const verificationRequests = pgTable('verification_requests', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: userRoleEnum('role').notNull(),
  verificationType: verificationTypeEnum('verification_type').default('general').notNull(),
  status: verificationRequestStatusEnum('status').default('pending').notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewedBy: text('reviewed_by'),
  rejectionReason: text('rejection_reason'),
  moderatorNotes: text('moderator_notes'),
  additionalInfo: text('additional_info'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_verification_requests_user_id').on(table.userId),
  index('idx_verification_requests_status').on(table.status),
  index('idx_verification_requests_submitted_at').on(table.submittedAt),
  index('idx_verification_requests_verification_type').on(table.verificationType),
  unique('verification_requests_user_id_verification_type_unique').on(table.userId, table.verificationType),
]);

export const verificationFiles = pgTable('verification_files', {
  id: serial('id').primaryKey(),
  verificationRequestId: integer('verification_request_id').notNull().references(() => verificationRequests.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileUrl: text('file_url'),
  r2Key: text('r2_key'),
  linkUrl: text('link_url'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_verification_files_verification_request_id').on(table.verificationRequestId),
]);

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  reporterId: text('reporter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reportedUserId: text('reported_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reportReason: text('report_reason').notNull(),
  additionalDetails: text('additional_details'),
  status: reportStatusEnum('status').default('pending').notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewedBy: text('reviewed_by'),
  moderatorNotes: text('moderator_notes'),
  actionTaken: text('action_taken'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_reports_reporter_id').on(table.reporterId),
  index('idx_reports_reported_user_id').on(table.reportedUserId),
  index('idx_reports_status').on(table.status),
  index('idx_reports_submitted_at').on(table.submittedAt),
]);

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  metadata: jsonb('metadata'), // Additional data like userIds, messageIds, connectionIds
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
}, (table) => [
  index('idx_notifications_user_id').on(table.userId),
  index('idx_notifications_is_read').on(table.isRead),
  index('idx_notifications_type').on(table.type),
  index('idx_notifications_created_at').on(table.createdAt),
  // Composite index for the most common query pattern
  index('idx_notifications_user_unread').on(table.userId, table.isRead, table.createdAt),
]);

export const adminRolePreferences = pgTable('admin_role_preferences', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  currentViewingRole: userRoleEnum('current_viewing_role'),
  verificationStatusOverride: boolean('verification_status_override').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_admin_role_preferences_user_id').on(table.userId),
  unique('admin_role_preferences_user_id_unique').on(table.userId),
]);
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
  adminRolePreferences: one(adminRolePreferences, {
    fields: [users.id],
    references: [adminRolePreferences.userId],
  }),
  sentMessages: many(messages),
}));

export const adminRolePreferencesRelations = relations(adminRolePreferences, ({ one }) => ({
  user: one(users, {
    fields: [adminRolePreferences.userId],
    references: [users.id],
  }),
}));

export const schoolsRelations = relations(schools, ({ many }) => ({
  athleteProfiles: many(athleteProfiles),
  coachProfiles: many(coachProfiles),
  recruitingProfiles: many(recruitingProfiles),
}));

export const athleteProfilesRelations = relations(athleteProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [athleteProfiles.userId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [athleteProfiles.schoolId],
    references: [schools.id],
  }),
  measurables: many(athleteMeasurables),
  videos: many(athleteVideos),
  experience: many(athleteExperience),
  conversations: many(conversations),
}));

export const coachProfilesRelations = relations(coachProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [coachProfiles.userId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [coachProfiles.schoolId],
    references: [schools.id],
  }),
  recruitingNeeds: one(recruitingNeeds),
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

export const athleteExperienceRelations = relations(athleteExperience, ({ one }) => ({
  athlete: one(athleteProfiles, {
    fields: [athleteExperience.athleteId],
    references: [athleteProfiles.id],
  }),
}));

export const recruitingProfilesRelations = relations(recruitingProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [recruitingProfiles.userId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [recruitingProfiles.schoolId],
    references: [schools.id],
  }),
  recruitingNeeds: many(recruitingProfileNeeds),
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
  fromUser: one(users, {
    fields: [connections.fromUserId],
    references: [users.id],
  }),
  toUser: one(users, {
    fields: [connections.toUserId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ many, one }) => ({
  messages: many(messages),
  user1: one(users, {
    fields: [conversations.user1Id],
    references: [users.id],
  }),
  user2: one(users, {
    fields: [conversations.user2Id],
    references: [users.id],
  }),
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

export const verificationRequestsRelations = relations(verificationRequests, ({ one, many }) => ({
  user: one(users, {
    fields: [verificationRequests.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [verificationRequests.reviewedBy],
    references: [users.id],
  }),
  files: many(verificationFiles),
}));

export const verificationFilesRelations = relations(verificationFiles, ({ one }) => ({
  verificationRequest: one(verificationRequests, {
    fields: [verificationFiles.verificationRequestId],
    references: [verificationRequests.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
  }),
  reportedUser: one(users, {
    fields: [reports.reportedUserId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [reports.reviewedBy],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AthleteProfile = typeof athleteProfiles.$inferSelect;
export type NewAthleteProfile = typeof athleteProfiles.$inferInsert;
export type AthleteMeasurable = typeof athleteMeasurables.$inferSelect;
export type NewAthleteMeasurable = typeof athleteMeasurables.$inferInsert;
export type AthleteVideo = typeof athleteVideos.$inferSelect;
export type NewAthleteVideo = typeof athleteVideos.$inferInsert;
export type AthleteExperience = typeof athleteExperience.$inferSelect;
export type NewAthleteExperience = typeof athleteExperience.$inferInsert;
export type CoachProfile = typeof coachProfiles.$inferSelect;
export type NewCoachProfile = typeof coachProfiles.$inferInsert;
export type RecruitingProfile = typeof recruitingProfiles.$inferSelect;
export type NewRecruitingProfile = typeof recruitingProfiles.$inferInsert;
export type Connection = typeof connections.$inferSelect;
export type NewConnection = typeof connections.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

// Subscription and billing tables
export const userSubscriptions = pgTable('user_subscriptions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Stripe identifiers
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripePriceId: text('stripe_price_id'),

  // Subscription details
  tier: subscriptionTierEnum('tier').notNull().default('free'),
  status: subscriptionStatusEnum('status').notNull().default('active'),

  // Billing cycle
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  canceledAt: timestamp('canceled_at', { withTimezone: true }),

  // Trial information
  trialStart: timestamp('trial_start', { withTimezone: true }),
  trialEnd: timestamp('trial_end', { withTimezone: true }),

  // Metadata
  metadata: jsonb('metadata'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_user_subscriptions_user_id').on(table.userId),
  index('idx_user_subscriptions_stripe_customer_id').on(table.stripeCustomerId),
  index('idx_user_subscriptions_stripe_subscription_id').on(table.stripeSubscriptionId),
  index('idx_user_subscriptions_status').on(table.status),
  index('idx_user_subscriptions_tier').on(table.tier),
  index('idx_user_subscriptions_period_end').on(table.currentPeriodEnd),
  unique('user_subscriptions_user_id_unique').on(table.userId),
  unique('user_subscriptions_stripe_subscription_id_unique').on(table.stripeSubscriptionId),
]);

// Usage tracking for premium features
export const userUsageTracking = pgTable('user_usage_tracking', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Monthly usage counters (reset each billing cycle)
  profileViewsReceived: integer('profile_views_received').default(0),
  connectionsRequested: integer('connections_requested').default(0),
  messagesReceived: integer('messages_received').default(0),
  searchesPerformed: integer('searches_performed').default(0),
  analyticsViews: integer('analytics_views').default(0),

  // Track when usage was last reset
  lastResetAt: timestamp('last_reset_at', { withTimezone: true }).defaultNow().notNull(),

  // Current billing period tracking
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).defaultNow().notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_user_usage_user_id').on(table.userId),
  index('idx_user_usage_period_end').on(table.currentPeriodEnd),
  unique('user_usage_tracking_user_id_unique').on(table.userId),
]);

// Feature limits by subscription tier
export const subscriptionFeatureLimits = pgTable('subscription_feature_limits', {
  id: serial('id').primaryKey(),
  tier: subscriptionTierEnum('tier').notNull(),

  // Connection limits
  maxConnectionsPerMonth: integer('max_connections_per_month').default(-1), // -1 = unlimited
  maxActiveConnections: integer('max_active_connections').default(-1),

  // Search and discovery limits
  maxSearchesPerDay: integer('max_searches_per_day').default(-1),
  advancedSearchEnabled: boolean('advanced_search_enabled').default(false),

  // Analytics and insights
  analyticsEnabled: boolean('analytics_enabled').default(false),
  profileViewInsights: boolean('profile_view_insights').default(false),
  activityTracking: boolean('activity_tracking').default(false),

  // Profile features
  priorityProfileRanking: boolean('priority_profile_ranking').default(false),
  customProfileThemes: boolean('custom_profile_themes').default(false),
  videoUploadsEnabled: boolean('video_uploads_enabled').default(true),
  maxVideoUploads: integer('max_video_uploads').default(3),

  // Messaging and communication
  priorityMessaging: boolean('priority_messaging').default(false),
  messageRequestsEnabled: boolean('message_requests_enabled').default(true),

  // Support level
  prioritySupport: boolean('priority_support').default(false),

  // Export capabilities
  dataExportEnabled: boolean('data_export_enabled').default(false),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_subscription_feature_limits_tier').on(table.tier),
  unique('subscription_feature_limits_tier_unique').on(table.tier),
]);

// Payment history and billing events
export const billingEvents = pgTable('billing_events', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: integer('subscription_id').references(() => userSubscriptions.id, { onDelete: 'set null' }),

  // Stripe event details
  stripeEventId: text('stripe_event_id'),
  stripeInvoiceId: text('stripe_invoice_id'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),

  // Event information
  eventType: text('event_type').notNull(), // 'payment_succeeded', 'payment_failed', 'subscription_created', etc.
  amount: integer('amount'), // Amount in cents
  currency: text('currency').default('usd'),
  status: text('status').notNull(),

  // Event data
  eventData: jsonb('event_data'),

  // Timestamps
  eventTimestamp: timestamp('event_timestamp', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_billing_events_user_id').on(table.userId),
  index('idx_billing_events_subscription_id').on(table.subscriptionId),
  index('idx_billing_events_stripe_event_id').on(table.stripeEventId),
  index('idx_billing_events_event_type').on(table.eventType),
  index('idx_billing_events_event_timestamp').on(table.eventTimestamp),
  unique('billing_events_stripe_event_id_unique').on(table.stripeEventId),
]);

// Relations for subscription tables
export const userSubscriptionsRelations = relations(userSubscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  billingEvents: many(billingEvents),
}));

export const userUsageTrackingRelations = relations(userUsageTracking, ({ one }) => ({
  user: one(users, {
    fields: [userUsageTracking.userId],
    references: [users.id],
  }),
}));

export const billingEventsRelations = relations(billingEvents, ({ one }) => ({
  user: one(users, {
    fields: [billingEvents.userId],
    references: [users.id],
  }),
  subscription: one(userSubscriptions, {
    fields: [billingEvents.subscriptionId],
    references: [userSubscriptions.id],
  }),
}));

// Type exports
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type NewUserSubscription = typeof userSubscriptions.$inferInsert;
export type UserUsageTracking = typeof userUsageTracking.$inferSelect;
export type NewUserUsageTracking = typeof userUsageTracking.$inferInsert;
export type SubscriptionFeatureLimits = typeof subscriptionFeatureLimits.$inferSelect;
export type NewSubscriptionFeatureLimits = typeof subscriptionFeatureLimits.$inferInsert;
export type BillingEvent = typeof billingEvents.$inferSelect;
export type NewBillingEvent = typeof billingEvents.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type RecruitingNeeds = typeof recruitingNeeds.$inferSelect;
export type NewRecruitingNeeds = typeof recruitingNeeds.$inferInsert;
export type RecruitingProfileNeeds = typeof recruitingProfileNeeds.$inferSelect;
export type NewRecruitingProfileNeeds = typeof recruitingProfileNeeds.$inferInsert;
export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type NewVerificationRequest = typeof verificationRequests.$inferInsert;
export type VerificationFile = typeof verificationFiles.$inferSelect;
export type NewVerificationFile = typeof verificationFiles.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type AdminRolePreferences = typeof adminRolePreferences.$inferSelect;
export type NewAdminRolePreferences = typeof adminRolePreferences.$inferInsert;
export type School = typeof schools.$inferSelect;
export type NewSchool = typeof schools.$inferInsert;