import { db } from './db'
import { subscriptionFeatureLimits } from './schema'

// Seed subscription feature limits for all tiers
export async function seedSubscriptionFeatureLimits() {
  console.log('🌱 Seeding subscription feature limits...')

  const featureLimits = [
    // Free tier
    {
      tier: 'free' as const,
      maxConnectionsPerMonth: 5,
      maxActiveConnections: 20,
      maxSearchesPerDay: 10,
      advancedSearchEnabled: false,
      analyticsEnabled: false,
      profileViewInsights: false,
      activityTracking: false,
      priorityProfileRanking: false,
      customProfileThemes: false,
      videoUploadsEnabled: true,
      maxVideoUploads: 1,
      priorityMessaging: false,
      messageRequestsEnabled: true,
      prioritySupport: false,
      dataExportEnabled: false,
    },
    
    // Pro Athlete Monthly
    {
      tier: 'pro_athlete_monthly' as const,
      maxConnectionsPerMonth: 25,
      maxActiveConnections: -1, // unlimited
      maxSearchesPerDay: -1, // unlimited
      advancedSearchEnabled: true,
      analyticsEnabled: true,
      profileViewInsights: true,
      activityTracking: true,
      priorityProfileRanking: true,
      customProfileThemes: true,
      videoUploadsEnabled: true,
      maxVideoUploads: 10,
      priorityMessaging: true,
      messageRequestsEnabled: true,
      prioritySupport: true,
      dataExportEnabled: true,
    },
    
    // Pro Athlete Yearly (same features as monthly)
    {
      tier: 'pro_athlete_yearly' as const,
      maxConnectionsPerMonth: 25,
      maxActiveConnections: -1,
      maxSearchesPerDay: -1,
      advancedSearchEnabled: true,
      analyticsEnabled: true,
      profileViewInsights: true,
      activityTracking: true,
      priorityProfileRanking: true,
      customProfileThemes: true,
      videoUploadsEnabled: true,
      maxVideoUploads: 10,
      priorityMessaging: true,
      messageRequestsEnabled: true,
      prioritySupport: true,
      dataExportEnabled: true,
    },
    
    // Pro Coach Monthly
    {
      tier: 'pro_coach_monthly' as const,
      maxConnectionsPerMonth: -1, // unlimited
      maxActiveConnections: -1,
      maxSearchesPerDay: -1,
      advancedSearchEnabled: true,
      analyticsEnabled: true,
      profileViewInsights: true,
      activityTracking: true,
      priorityProfileRanking: true,
      customProfileThemes: true,
      videoUploadsEnabled: true,
      maxVideoUploads: -1, // unlimited
      priorityMessaging: true,
      messageRequestsEnabled: true,
      prioritySupport: true,
      dataExportEnabled: true,
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
      activityTracking: true,
      priorityProfileRanking: true,
      customProfileThemes: true,
      videoUploadsEnabled: true,
      maxVideoUploads: -1,
      priorityMessaging: true,
      messageRequestsEnabled: true,
      prioritySupport: true,
      dataExportEnabled: true,
    },
    
    // Pro Recruiter Monthly (same as Pro Coach)
    {
      tier: 'pro_recruiter_monthly' as const,
      maxConnectionsPerMonth: -1,
      maxActiveConnections: -1,
      maxSearchesPerDay: -1,
      advancedSearchEnabled: true,
      analyticsEnabled: true,
      profileViewInsights: true,
      activityTracking: true,
      priorityProfileRanking: true,
      customProfileThemes: true,
      videoUploadsEnabled: true,
      maxVideoUploads: -1,
      priorityMessaging: true,
      messageRequestsEnabled: true,
      prioritySupport: true,
      dataExportEnabled: true,
    },
    
    // Pro Recruiter Yearly (same as Pro Coach)
    {
      tier: 'pro_recruiter_yearly' as const,
      maxConnectionsPerMonth: -1,
      maxActiveConnections: -1,
      maxSearchesPerDay: -1,
      advancedSearchEnabled: true,
      analyticsEnabled: true,
      profileViewInsights: true,
      activityTracking: true,
      priorityProfileRanking: true,
      customProfileThemes: true,
      videoUploadsEnabled: true,
      maxVideoUploads: -1,
      priorityMessaging: true,
      messageRequestsEnabled: true,
      prioritySupport: true,
      dataExportEnabled: true,
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