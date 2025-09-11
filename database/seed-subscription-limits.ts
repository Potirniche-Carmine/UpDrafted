// Load environment variables first
import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { subscriptionFeatureLimits } from './schema'

// Create a direct database connection for seeding
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { 
  schema: { subscriptionFeatureLimits }
});

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
      priorityProfileRanking: false,
      priorityMessaging: false,
    },
    
    // Pro Athlete Monthly - 25 connection requests, unlimited incoming
    {
      tier: 'pro_athlete_monthly' as const,
      maxConnectionsPerMonth: 25,
      maxActiveConnections: -1, // unlimited incoming
      maxSearchesPerDay: -1, // unlimited
      advancedSearchEnabled: true, // "Advanced Search Filters to Find Your Perfect Coach"
      analyticsEnabled: false, // Not mentioned in pricing for athletes
      profileViewInsights: true, // "See Who Has Viewed Your Profile"
      priorityProfileRanking: true, // Premium feature - higher chance to be seen
      priorityMessaging: true, // "Read Receipts - Know When Coaches See Your Messages"
    },
    
    // Pro Athlete Yearly (same features as monthly)
    {
      tier: 'pro_athlete_yearly' as const,
      maxConnectionsPerMonth: 25,
      maxActiveConnections: -1,
      maxSearchesPerDay: -1,
      advancedSearchEnabled: true, // "Advanced Search Filters to Find Your Perfect Coach"
      analyticsEnabled: false,
      profileViewInsights: true, // "See Who Has Viewed Your Profile"
      priorityProfileRanking: true, // Premium feature - higher chance to be seen
      priorityMessaging: true, // "Read Receipts - Know When Coaches See Your Messages"
    },
    
    // Pro Coach Monthly - Unlimited connections
    {
      tier: 'pro_coach_monthly' as const,
      maxConnectionsPerMonth: -1, // "Unlimited Connection Requests to Athletes"
      maxActiveConnections: -1, // unlimited incoming
      maxSearchesPerDay: -1,
      advancedSearchEnabled: true, // "Advanced Search Filters to Find Perfect Athletes"
      analyticsEnabled: true, // "Advanced Analytics Dashboard"
      profileViewInsights: true, // "See Who Has Viewed Your Profile"
      priorityProfileRanking: true, // Premium feature - higher chance to be seen
      priorityMessaging: true, // "Read Receipts - Know When Athletes See Your Messages"
    },
    
    // Pro Coach Yearly (same features as monthly)
    {
      tier: 'pro_coach_yearly' as const,
      maxConnectionsPerMonth: -1,
      maxActiveConnections: -1,
      maxSearchesPerDay: -1,
      advancedSearchEnabled: true, // "Advanced Search Filters to Find Perfect Athletes"
      analyticsEnabled: true, // "Advanced Analytics Dashboard"
      profileViewInsights: true, // "See Who Has Viewed Your Profile"
      priorityProfileRanking: true, // Premium feature - higher chance to be seen
      priorityMessaging: true, // "Read Receipts - Know When Athletes See Your Messages"
    },
    
    // Pro Recruiter Monthly (same as Pro Coach)
    {
      tier: 'pro_recruiter_monthly' as const,
      maxConnectionsPerMonth: -1, // "Unlimited Connection Requests to Athletes"
      maxActiveConnections: -1, // unlimited incoming
      maxSearchesPerDay: -1,
      advancedSearchEnabled: true, // "Advanced Search & Filtering for Talent Discovery"
      analyticsEnabled: true, // "Advanced Analytics & Reporting Dashboard"
      profileViewInsights: true, // "See Who Has Viewed Your Profile"
      priorityProfileRanking: true, // Premium feature - higher chance to be seen
      priorityMessaging: true, // "Read Receipts - Know When Athletes See Your Messages"
    },
    
    // Pro Recruiter Yearly (same as monthly)
    {
      tier: 'pro_recruiter_yearly' as const,
      maxConnectionsPerMonth: -1,
      maxActiveConnections: -1,
      maxSearchesPerDay: -1,
      advancedSearchEnabled: true, // "Advanced Search & Filtering for Talent Discovery"
      analyticsEnabled: true, // "Advanced Analytics & Reporting Dashboard"
      profileViewInsights: true, // "See Who Has Viewed Your Profile"
      priorityProfileRanking: true, // Premium feature - higher chance to be seen
      priorityMessaging: true, // "Read Receipts - Know When Athletes See Your Messages"
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