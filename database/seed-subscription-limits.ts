import { db } from './db'
import { subscriptionFeatureLimits } from './schema'

// Seed subscription feature limits for all tiers
export async function seedSubscriptionFeatureLimits() {
  console.log('🌱 Seeding subscription feature limits...')

  const featureLimits = [
    // Free tier - Same for all roles
    {
      tier: 'free' as const,
      maxConnectionsPerMonth: 5,
      maxActiveConnections: 5, // 5 incoming connections
      maxSearchesPerDay: -1, // unlimited basic search
      advancedSearchEnabled: false,
      analyticsEnabled: false,
      profileViewInsights: false,
      activityTracking: false,
      priorityProfileRanking: false,
      customProfileThemes: false,
      videoUploadsEnabled: false,
      maxVideoUploads: 0,
      priorityMessaging: false,
      messageRequestsEnabled: true,
      prioritySupport: false,
      dataExportEnabled: false,
    },
    
    // Pro Athlete Monthly - 25 connection requests, unlimited incoming
    {
      tier: 'pro_athlete_monthly' as const,
      maxConnectionsPerMonth: 25,
      maxActiveConnections: -1, // unlimited incoming
      maxSearchesPerDay: -1, // unlimited
      advancedSearchEnabled: true,
      analyticsEnabled: false, // Not mentioned in pricing
      profileViewInsights: true, // "See Who Has Viewed Your Profile"
      activityTracking: false, // Not mentioned in pricing
      priorityProfileRanking: false, // Not mentioned in pricing
      customProfileThemes: false, // Not mentioned in pricing
      videoUploadsEnabled: false, // Not mentioned in pricing
      maxVideoUploads: 0,
      priorityMessaging: true, // "Read Receipts"
      messageRequestsEnabled: true,
      prioritySupport: false, // Not mentioned in pricing
      dataExportEnabled: false, // Not mentioned in pricing
    },
    
    // Pro Athlete Yearly (same features as monthly)
    {
      tier: 'pro_athlete_yearly' as const,
      maxConnectionsPerMonth: 25,
      maxActiveConnections: -1,
      maxSearchesPerDay: -1,
      advancedSearchEnabled: true,
      analyticsEnabled: false,
      profileViewInsights: true,
      activityTracking: false,
      priorityProfileRanking: false,
      customProfileThemes: false,
      videoUploadsEnabled: false,
      maxVideoUploads: 0,
      priorityMessaging: true,
      messageRequestsEnabled: true,
      prioritySupport: false,
      dataExportEnabled: false,
    },
    
    // Pro Coach Monthly - Unlimited connections
    {
      tier: 'pro_coach_monthly' as const,
      maxConnectionsPerMonth: -1, // unlimited
      maxActiveConnections: -1, // unlimited incoming
      maxSearchesPerDay: -1,
      advancedSearchEnabled: true,
      analyticsEnabled: true, // "Advanced Analytics Dashboard"
      profileViewInsights: true,
      activityTracking: false,
      priorityProfileRanking: false,
      customProfileThemes: false,
      videoUploadsEnabled: false,
      maxVideoUploads: 0,
      priorityMessaging: true,
      messageRequestsEnabled: true,
      prioritySupport: false,
      dataExportEnabled: false,
    },
    
    // Pro Coach Yearly (same features as monthly)
    {
      tier: 'pro_coach_yearly' as const,
      maxConnectionsPerMonth: -1,
      maxActiveConnections: -1,
      maxSearchesPerDay: -1,
      advancedSearchEnabled: true,
      analyticsEnabled: true,
      profileViewInsights: true,
      activityTracking: false,
      priorityProfileRanking: false,
      customProfileThemes: false,
      videoUploadsEnabled: false,
      maxVideoUploads: 0,
      priorityMessaging: true,
      messageRequestsEnabled: true,
      prioritySupport: false,
      dataExportEnabled: false,
    },
    
    // Pro Recruiter Monthly (same as Pro Coach)
    {
      tier: 'pro_recruiter_monthly' as const,
      maxConnectionsPerMonth: -1, // unlimited
      maxActiveConnections: -1, // unlimited incoming
      maxSearchesPerDay: -1,
      advancedSearchEnabled: true,
      analyticsEnabled: true, // "Advanced Analytics & Reporting Dashboard"
      profileViewInsights: true,
      activityTracking: false,
      priorityProfileRanking: false,
      customProfileThemes: false,
      videoUploadsEnabled: false,
      maxVideoUploads: 0,
      priorityMessaging: true,
      messageRequestsEnabled: true,
      prioritySupport: false,
      dataExportEnabled: false,
    },
    
    // Pro Recruiter Yearly (same as monthly)
    {
      tier: 'pro_recruiter_yearly' as const,
      maxConnectionsPerMonth: -1,
      maxActiveConnections: -1,
      maxSearchesPerDay: -1,
      advancedSearchEnabled: true,
      analyticsEnabled: true,
      profileViewInsights: true,
      activityTracking: false,
      priorityProfileRanking: false,
      customProfileThemes: false,
      videoUploadsEnabled: false,
      maxVideoUploads: 0,
      priorityMessaging: true,
      messageRequestsEnabled: true,
      prioritySupport: false,
      dataExportEnabled: false,
    },
  ]

  try {
    // Clear existing limits
    await db.delete(subscriptionFeatureLimits)
    
    // Insert new limits
    await db.insert(subscriptionFeatureLimits).values(featureLimits)
    
    console.log(`✅ Successfully seeded ${featureLimits.length} subscription feature limits`)
  } catch (error) {
    console.error('❌ Error seeding subscription feature limits:', error)
    throw error
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedSubscriptionFeatureLimits()
    .then(() => {
      console.log('🎉 Subscription feature limits seeding completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error)
      process.exit(1)
    })
}