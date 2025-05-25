import { query } from './db';
import type { AthleteProfileData } from '@/components/athlete-profile';

// Types for database operations
export interface DatabaseUser {
  id: string;
  email: string;
  full_name: string;
  profile_image?: string;
  role: 'athlete' | 'coach' | 'recruiter';
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseAthleteProfile {
  id: number;
  user_id: string;
  sport: string;
  secondary_sports: string[];
  graduation_year: number;
  high_school: string;
  city: string;
  state: string;
  height: string;
  weight: string;
  positions: string[];
  gpa?: number;
  sat_score?: number;
  act_score?: number;
  intended_major?: string;
  ncaa_eligibility_id?: string;
  maxpreps_url?: string;
  maxpreps_verified: boolean;
  hudl_url?: string;
  hudl_embed_url?: string;
  instagram_handle?: string;
  twitter_handle?: string;
  personal_statement?: string;
  phone?: string;
}

// User operations
export async function createUser(userData: {
  id: string; // Clerk user ID
  email: string;
  full_name: string;
  profile_image?: string;
  role: 'athlete' | 'coach' | 'recruiter';
}) {
  const result = await query(`
    INSERT INTO users (id, email, full_name, profile_image, role)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      profile_image = EXCLUDED.profile_image,
      role = EXCLUDED.role,
      updated_at = NOW()
    RETURNING *
  `, [userData.id, userData.email, userData.full_name, userData.profile_image, userData.role]);
  
  return result.rows[0] as DatabaseUser;
}

export async function getUserById(userId: string) {
  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0] as DatabaseUser | undefined;
}

export async function getUserByEmail(email: string) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] as DatabaseUser | undefined;
}

// Athlete profile operations
export async function createAthleteProfile(profileData: Omit<DatabaseAthleteProfile, 'id'>) {
  const result = await query(`
    INSERT INTO athlete_profiles (
      user_id, sport, secondary_sports, graduation_year, high_school, city, state,
      height, weight, positions, gpa, sat_score, act_score, intended_major,
      ncaa_eligibility_id, maxpreps_url, maxpreps_verified, hudl_url, hudl_embed_url,
      instagram_handle, twitter_handle, personal_statement, phone
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
    ON CONFLICT (user_id) DO UPDATE SET
      sport = EXCLUDED.sport,
      secondary_sports = EXCLUDED.secondary_sports,
      graduation_year = EXCLUDED.graduation_year,
      high_school = EXCLUDED.high_school,
      city = EXCLUDED.city,
      state = EXCLUDED.state,
      height = EXCLUDED.height,
      weight = EXCLUDED.weight,
      positions = EXCLUDED.positions,
      gpa = EXCLUDED.gpa,
      sat_score = EXCLUDED.sat_score,
      act_score = EXCLUDED.act_score,
      intended_major = EXCLUDED.intended_major,
      ncaa_eligibility_id = EXCLUDED.ncaa_eligibility_id,
      maxpreps_url = EXCLUDED.maxpreps_url,
      maxpreps_verified = EXCLUDED.maxpreps_verified,
      hudl_url = EXCLUDED.hudl_url,
      hudl_embed_url = EXCLUDED.hudl_embed_url,
      instagram_handle = EXCLUDED.instagram_handle,
      twitter_handle = EXCLUDED.twitter_handle,
      personal_statement = EXCLUDED.personal_statement,
      phone = EXCLUDED.phone,
      updated_at = NOW()
    RETURNING *
  `, [
    profileData.user_id, profileData.sport, profileData.secondary_sports, profileData.graduation_year,
    profileData.high_school, profileData.city, profileData.state, profileData.height, profileData.weight,
    profileData.positions, profileData.gpa, profileData.sat_score, profileData.act_score,
    profileData.intended_major, profileData.ncaa_eligibility_id, profileData.maxpreps_url,
    profileData.maxpreps_verified, profileData.hudl_url, profileData.hudl_embed_url,
    profileData.instagram_handle, profileData.twitter_handle, profileData.personal_statement, profileData.phone
  ]);
  
  return result.rows[0] as DatabaseAthleteProfile;
}

export async function getAthleteProfileByUserId(userId: string) {
  const result = await query(`
    SELECT ap.*, u.email, u.full_name, u.profile_image
    FROM athlete_profiles ap
    JOIN users u ON ap.user_id = u.id
    WHERE ap.user_id = $1
  `, [userId]);
  
  return result.rows[0];
}

// Get full athlete data for profile display
export async function getFullAthleteData(userId: string): Promise<AthleteProfileData | null> {
  const profileResult = await query(`
    SELECT ap.*, u.email, u.full_name, u.profile_image
    FROM athlete_profiles ap
    JOIN users u ON ap.user_id = u.id
    WHERE ap.user_id = $1
  `, [userId]);

  if (profileResult.rows.length === 0) return null;
  
  const profile = profileResult.rows[0];

  // Get achievements
  const achievementsResult = await query(`
    SELECT achievement FROM athlete_achievements WHERE athlete_id = $1 ORDER BY date_achieved DESC
  `, [profile.id]);

  // Get measurables grouped by sport
  const measurablesResult = await query(`
    SELECT sport, label, value, measurement_date 
    FROM athlete_measurables 
    WHERE athlete_id = $1 
    ORDER BY sport, measurement_date DESC
  `, [profile.id]);

  // Get YouTube videos
  const videosResult = await query(`
    SELECT title, youtube_url as url, embed_url 
    FROM athlete_videos 
    WHERE athlete_id = $1 
    ORDER BY created_at DESC
  `, [profile.id]);

  // Group measurables by sport
  const measurables: { [sport: string]: { label: string; value: string; date: string }[] } = {};
  measurablesResult.rows.forEach(row => {
    if (!measurables[row.sport]) {
      measurables[row.sport] = [];
    }
    measurables[row.sport].push({
      label: row.label,
      value: row.value,
      date: row.measurement_date
    });
  });

  return {
    id: profile.user_id,
    fullName: profile.full_name,
    profileImage: profile.profile_image,
    sport: profile.sport,
    secondarySports: profile.secondary_sports || [],
    graduationYear: profile.graduation_year,
    highSchool: profile.high_school,
    city: profile.city,
    state: profile.state,
    gpa: profile.gpa,
    satScore: profile.sat_score,
    actScore: profile.act_score,
    height: profile.height,
    weight: profile.weight,
    positions: profile.positions,
    maxPrepsUrl: profile.maxpreps_url || '',
    maxPrepsVerified: profile.maxpreps_verified,
    measurables: Object.keys(measurables).length > 0 ? measurables : undefined,
    hudlUrl: profile.hudl_url,
    hudlEmbedUrl: profile.hudl_embed_url,
    youtubeVideos: videosResult.rows,
    socialMedia: {
      instagram: profile.instagram_handle,
      twitter: profile.twitter_handle
    },
    intendedMajor: profile.intended_major,
    personalStatement: profile.personal_statement,
    achievements: achievementsResult.rows.map(row => row.achievement)
  };
}

// Measurables operations
export async function addAthleteMeasurable(athleteId: number, measurable: {
  sport: string;
  label: string;
  value: string;
  measurement_date: string;
}) {
  const result = await query(`
    INSERT INTO athlete_measurables (athlete_id, sport, label, value, measurement_date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [athleteId, measurable.sport, measurable.label, measurable.value, measurable.measurement_date]);
  
  return result.rows[0];
}

// Activity logging
export async function logActivity(viewerId: string, viewedUserId: string, action: string, metadata?: object) {
  await query(`
    INSERT INTO activity_log (viewer_id, viewed_user_id, action, metadata)
    VALUES ($1, $2, $3, $4)
  `, [viewerId, viewedUserId, action, metadata ? JSON.stringify(metadata) : null]);
}

// Get recent activity for a user
export async function getRecentActivity(userId: string, limit = 10) {
  const result = await query(`
    SELECT al.*, u.full_name as viewed_user_name, u.role as viewed_user_role
    FROM activity_log al
    JOIN users u ON al.viewed_user_id = u.id
    WHERE al.viewer_id = $1
    ORDER BY al.created_at DESC
    LIMIT $2
  `, [userId, limit]);
  
  return result.rows;
} 