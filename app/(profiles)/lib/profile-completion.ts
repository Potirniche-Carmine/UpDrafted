import { AthleteProfileData } from '@/app/(profiles)/components/athlete-profile';

export interface ProfileCompletionItem {
  field: string;
  label: string;
  weight: number; // Higher weight = more important
  category: 'basic' | 'academic' | 'athletic' | 'social' | 'media';
}

export const ATHLETE_PROFILE_FIELDS: ProfileCompletionItem[] = [
  // Basic Info (Essential - 40% total)
  { field: 'fullName', label: 'Full Name', weight: 8, category: 'basic' },
  { field: 'sport', label: 'Primary Sport', weight: 8, category: 'basic' },
  { field: 'positions', label: 'Positions', weight: 6, category: 'basic' },
  { field: 'graduationYear', label: 'Graduation Year', weight: 6, category: 'basic' },
  { field: 'height', label: 'Height', weight: 3, category: 'basic' },
  { field: 'weight', label: 'Weight', weight: 3, category: 'basic' },
  { field: 'highSchool', label: 'School Name', weight: 2, category: 'basic' },
  
  // Academic (Important - 20% total)
  { field: 'gpa', label: 'GPA', weight: 7, category: 'academic' },
  { field: 'satScore', label: 'SAT Score', weight: 6, category: 'academic' },
  { field: 'actScore', label: 'ACT Score', weight: 6, category: 'academic' },
  { field: 'intendedMajor', label: 'Major', weight: 6, category: 'academic' },
  
  // Athletic Performance (Important - 20% total)
  { field: 'personalStatement', label: 'Personal Statement', weight: 10, category: 'athletic' },
  { field: 'measurables', label: 'Athletic Measurables', weight: 8, category: 'athletic' },
  { field: 'maxPrepsUrl', label: 'MaxPreps Profile', weight: 7, category: 'athletic' },
  
  // Media & Highlights (Valuable - 15% total)
  { field: 'profileImage', label: 'Profile Photo', weight: 5, category: 'media' },
  { field: 'hudlUrl', label: 'Hudl Highlights', weight: 5, category: 'media' },
  { field: 'youtubeVideos', label: 'Highlight Videos', weight: 5, category: 'media' },
  
  // Social Media (Nice to have - 5% total)
  { field: 'instagramHandle', label: 'Instagram', weight: 2.5, category: 'social' },
  { field: 'twitterHandle', label: 'Twitter/X', weight: 2.5, category: 'social' },
];

export interface ProfileCompletion {
  overall: number;
  categories: {
    basic: number;
    academic: number;
    athletic: number;
    media: number;
    social: number;
  };
  missingFields: ProfileCompletionItem[];
  nextSteps: ProfileCompletionItem[];
  lastCalculated?: Date;
  profileLastUpdated?: Date;
}

export function calculateAthleteProfileCompletion(profile: AthleteProfileData): ProfileCompletion {
  let totalWeight = 0;
  let completedWeight = 0;
  const missingFields: ProfileCompletionItem[] = [];
  const categoryScores = {
    basic: { completed: 0, total: 0 },
    academic: { completed: 0, total: 0 },
    athletic: { completed: 0, total: 0 },
    media: { completed: 0, total: 0 },
    social: { completed: 0, total: 0 },
  };

  ATHLETE_PROFILE_FIELDS.forEach(field => {
    totalWeight += field.weight;
    categoryScores[field.category].total += field.weight;

    const isCompleted = checkFieldCompletion(profile, field.field);
    
    if (isCompleted) {
      completedWeight += field.weight;
      categoryScores[field.category].completed += field.weight;
    } else {
      missingFields.push(field);
    }
  });

  // Calculate category percentages
  const categories = {
    basic: categoryScores.basic.total > 0 ? Math.round((categoryScores.basic.completed / categoryScores.basic.total) * 100) : 100,
    academic: categoryScores.academic.total > 0 ? Math.round((categoryScores.academic.completed / categoryScores.academic.total) * 100) : 100,
    athletic: categoryScores.athletic.total > 0 ? Math.round((categoryScores.athletic.completed / categoryScores.athletic.total) * 100) : 100,
    media: categoryScores.media.total > 0 ? Math.round((categoryScores.media.completed / categoryScores.media.total) * 100) : 100,
    social: categoryScores.social.total > 0 ? Math.round((categoryScores.social.completed / categoryScores.social.total) * 100) : 100,
  };

  // Sort missing fields by weight (most important first)
  missingFields.sort((a, b) => b.weight - a.weight);
  
  // Get top 3 next steps (highest impact missing fields)
  const nextSteps = missingFields.slice(0, 3);

  return {
    overall: Math.round((completedWeight / totalWeight) * 100),
    categories,
    missingFields,
    nextSteps,
  };
}

function checkFieldCompletion(profile: AthleteProfileData, fieldName: string): boolean {
  switch (fieldName) {
    case 'fullName':
      return !!(profile.fullName && profile.fullName.trim().length > 0);
    case 'sport':
      return !!(profile.sport && profile.sport.trim().length > 0);
    case 'positions':
      return !!(profile.positions && profile.positions.length > 0);
    case 'graduationYear':
      return !!(profile.graduationYear && profile.graduationYear > 0);
    case 'height':
      return !!(profile.height && profile.height.trim().length > 0);
    case 'weight':
      return !!(profile.weight && profile.weight.trim().length > 0);
    case 'highSchool':
      return !!(profile.highSchool && profile.highSchool.trim().length > 0);
    case 'gpa':
      if (!profile.gpa) return false;
      const gpaValue = typeof profile.gpa === 'string' ? parseFloat(profile.gpa) : profile.gpa;
      return !isNaN(gpaValue) && gpaValue > 0;
    case 'satScore':
      return !!(profile.satScore && profile.satScore > 0);
    case 'actScore':
      return !!(profile.actScore && profile.actScore > 0);
    case 'intendedMajor':
      return !!(profile.intendedMajor && profile.intendedMajor.trim().length > 0);
    case 'personalStatement':
      return !!(profile.personalStatement && profile.personalStatement.trim().length > 50);
    case 'measurables':
      return !!(profile.measurables && profile.measurables.length > 0);
    case 'maxPrepsUrl':
      return !!(profile.maxPrepsUrl && profile.maxPrepsUrl.trim().length > 0);
    case 'profileImage':
      return !!(profile.profileImage && profile.profileImage.length > 0);
    case 'hudlUrl':
      return !!(profile.hudlUrl && profile.hudlUrl.trim().length > 0);
    case 'youtubeVideos':
      return !!(profile.youtubeVideos && profile.youtubeVideos.length > 0);
    case 'instagramHandle':
      return !!(profile.socialMedia?.instagram && profile.socialMedia.instagram.trim().length > 0);
    case 'twitterHandle':
      return !!(profile.socialMedia?.twitter && profile.socialMedia.twitter.trim().length > 0);
    default:
      return false;
  }
}

export function getProfileStrengthLabel(percentage: number): { label: string; color: string; description: string } {
  if (percentage >= 90) {
    return {
      label: 'Excellent',
      color: 'text-green-600',
      description: 'Your profile is comprehensive and highly attractive to coaches.'
    };
  } else if (percentage >= 75) {
    return {
      label: 'Very Good',
      color: 'text-[#01ae79]',
      description: 'Your profile is strong with room for minor improvements.'
    };
  } else if (percentage >= 60) {
    return {
      label: 'Good',
      color: 'text-blue-600',
      description: 'Your profile is solid but could use some key additions.'
    };
  } else if (percentage >= 40) {
    return {
      label: 'Fair',
      color: 'text-yellow-600',
      description: 'Your profile needs significant improvements to attract coaches.'
    };
  } else {
    return {
      label: 'Needs Work',
      color: 'text-red-600',
      description: 'Your profile requires major improvements to be competitive.'
    };
  }
}

/**
 * Invalidate profile completion cache when profile data is updated
 * This should be called after any profile updates to ensure fresh data
 */
export function invalidateProfileCompletionCache(userId: string, userType: 'athlete' | 'coach' | 'recruiter') {
  try {
    const cacheKey = `profile-completion-${userId}-${userType}`;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.warn('Failed to invalidate profile completion cache:', error);
  }
} 