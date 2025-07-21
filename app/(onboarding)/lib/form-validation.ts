import { OnboardingFormData } from '@/app/(onboarding)/lib/onboarding';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationErrors {
  [fieldName: string]: string;
}

// Character limits for various fields
export const FIELD_LIMITS = {
  FULL_NAME: 50,
  ORGANIZATION_NAME: 50,
  CITY: 50,
  INTENDED_MAJOR: 50,
  TITLE: 50,
  CONFERENCE: 50,
  PERSONAL_STATEMENT: 400,
  RECRUITING_PHILOSOPHY: 400,
  WHAT_LOOKING_FOR: 400,
  INSTAGRAM_HANDLE: 50,
  TWITTER_HANDLE: 50,
  URL: 300
};

// Numeric limits
export const NUMERIC_LIMITS = {
  WEIGHT: { min: 50, max: 700 }, // in pounds
  GPA: { min: 0, max: 5.0 },
  SAT_SCORE: { min: 400, max: 1600 },
  ACT_SCORE: { min: 1, max: 36 },
  HEIGHT_FEET: { min: 4, max: 8 },
  HEIGHT_INCHES: { min: 0, max: 11 }
};

// URL validation patterns
const URL_PATTERNS = {
  MAXPREPS: /^https?:\/\/(www\.)?maxpreps\.com\/.+/i,
  HUDL: /^https?:\/\/(www\.)?hudl\.com\/.+/i,
  GENERAL_URL: /^https?:\/\/.+\..+/i,
  DOMAIN_ONLY: /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,}|[a-zA-Z]{2,}\.[a-zA-Z]{2,})([\/].*)?$/
};

// Social media handle patterns (allowing @ prefix or not)
const SOCIAL_PATTERNS = {
  INSTAGRAM: /^@?[a-zA-Z0-9_.]{1,30}$/,
  TWITTER: /^@?[a-zA-Z0-9_]{1,15}$/
};

// URL processing functions
export const URLUtils = {
  // Convert domain-only input to proper URL
  processURL(input: string): string {
    if (!input.trim()) return input;
    
    const trimmed = input.trim();
    
    // If already has protocol, return as-is
    if (trimmed.match(/^https?:\/\//i)) {
      return trimmed;
    }
    
    // If it looks like a domain, add https://
    if (URL_PATTERNS.DOMAIN_ONLY.test(trimmed)) {
      return `https://${trimmed}`;
    }
    
    // Return as-is if it doesn't look like a domain
    return trimmed;
  },

  // Clean URL input for display (remove protocol for simpler display)
  cleanForDisplay(url: string): string {
    if (!url) return url;
    return url.replace(/^https?:\/\//i, '');
  },

  // Validate URL format (accepts both with and without protocol)
  isValidURL(input: string): boolean {
    if (!input.trim()) return true;
    
    const trimmed = input.trim();
    
    // Check if it already has protocol
    if (trimmed.match(/^https?:\/\//i)) {
      return URL_PATTERNS.GENERAL_URL.test(trimmed);
    }
    
    // Check if it's a valid domain
    return URL_PATTERNS.DOMAIN_ONLY.test(trimmed);
  }
};

export class FormValidator {
  // Basic text validation with character limits
  static validateText(value: string, fieldName: string, maxLength: number, required = false): ValidationResult {
    if (required && !value.trim()) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    
    if (value.length > maxLength) {
      return { isValid: false, error: `${fieldName} must be ${maxLength} characters or less` };
    }
    
    return { isValid: true };
  }

  // Name validation (only letters, spaces, hyphens, apostrophes)
  static validateName(value: string, required = false): ValidationResult {
    if (required && !value.trim()) {
      return { isValid: false, error: 'Full name is required' };
    }
    
    if (value.length > FIELD_LIMITS.FULL_NAME) {
      return { isValid: false, error: `Name must be ${FIELD_LIMITS.FULL_NAME} characters or less` };
    }
    
    const namePattern = /^[a-zA-Z\s\-'\.]+$/;
    if (value && !namePattern.test(value)) {
      return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    
    return { isValid: true };
  }

  // Weight validation (number without "lbs")
  static validateWeight(value: string, required = false): ValidationResult {
    if (required && !value.trim()) {
      return { isValid: false, error: 'Weight is required' };
    }
    
    if (!value) return { isValid: true };
    
    // Remove "lbs" if present and any spaces
    const cleanedValue = value.replace(/\s*lbs?\s*/gi, '').trim();
    const numericValue = parseFloat(cleanedValue);
    
    if (isNaN(numericValue)) {
      return { isValid: false, error: 'Weight must be a valid number' };
    }
    
    if (numericValue < NUMERIC_LIMITS.WEIGHT.min || numericValue > NUMERIC_LIMITS.WEIGHT.max) {
      return { 
        isValid: false, 
        error: `Weight must be between ${NUMERIC_LIMITS.WEIGHT.min} and ${NUMERIC_LIMITS.WEIGHT.max} pounds` 
      };
    }
    
    return { isValid: true };
  }

  // GPA validation
  static validateGPA(value: number | null): ValidationResult {
    if (value === null || value === undefined) return { isValid: true };
    
    if (value < NUMERIC_LIMITS.GPA.min || value > NUMERIC_LIMITS.GPA.max) {
      return { 
        isValid: false, 
        error: `GPA must be between ${NUMERIC_LIMITS.GPA.min} and ${NUMERIC_LIMITS.GPA.max}` 
      };
    }
    
    return { isValid: true };
  }

  // SAT Score validation
  static validateSATScore(value: number | null): ValidationResult {
    if (value === null || value === undefined) return { isValid: true };
    
    if (value < NUMERIC_LIMITS.SAT_SCORE.min || value > NUMERIC_LIMITS.SAT_SCORE.max) {
      return { 
        isValid: false, 
        error: `SAT score must be between ${NUMERIC_LIMITS.SAT_SCORE.min} and ${NUMERIC_LIMITS.SAT_SCORE.max}` 
      };
    }
    
    return { isValid: true };
  }

  // ACT Score validation
  static validateACTScore(value: number | null): ValidationResult {
    if (value === null || value === undefined) return { isValid: true };
    
    if (value < NUMERIC_LIMITS.ACT_SCORE.min || value > NUMERIC_LIMITS.ACT_SCORE.max) {
      return { 
        isValid: false, 
        error: `ACT score must be between ${NUMERIC_LIMITS.ACT_SCORE.min} and ${NUMERIC_LIMITS.ACT_SCORE.max}` 
      };
    }
    
    return { isValid: true };
  }

  // Graduation Year validation for high school athletes
  static validateGraduationYear(value: number | null, educationLevel: string): ValidationResult {
    if (value === null || value === undefined) {
      return { isValid: false, error: 'Graduation year is required' };
    }

    // Special validation for high school athletes - only juniors and above
    if (educationLevel === 'high_school') {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      
      // If we're in the first half of the year (Jan-June), we're in the spring of the school year
      // If we're in the second half (July-Dec), we're in the fall of the new school year
      const baseYear = currentMonth < 6 ? currentYear : currentYear + 1;
      
      // Current seniors graduate this year (baseYear)
      // Current juniors graduate next year (baseYear + 1) 
      const validYears = [baseYear, baseYear + 1];
      
      if (!validYears.includes(value)) {
        return { 
          isValid: false, 
          error: `High school athletes must be juniors or above (Class of ${validYears.join(', ')})` 
        };
      }
    }

    return { isValid: true };
  }

  // Enhanced MaxPreps URL validation with name matching
  static validateMaxPrepsURL(url: string, profileName: string, required = false): ValidationResult {
    if (required && !url.trim()) {
      return { isValid: false, error: 'MaxPreps URL is required' };
    }
    if (!url) return { isValid: true };
    if (url.length > FIELD_LIMITS.URL) {
      return { isValid: false, error: `URL must be ${FIELD_LIMITS.URL} characters or less` };
    }
    // Always add https:// if missing
    let processedUrl = url.trim();
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = `https://${processedUrl}`;
    }
    // Basic MaxPreps URL pattern
    const maxprepsPattern = /^https?:\/\/(www\.)?maxpreps\.com\/.+/i;
    if (!maxprepsPattern.test(processedUrl)) {
      return { isValid: false, error: 'Please enter a valid MaxPreps URL (e.g., maxpreps.com/athlete/...)' };
    }
    // Extract athlete name from URL path
    const athletePattern = /\/athletes\/([^\/]+)/i;
    const match = processedUrl.match(athletePattern);
    if (!match) {
      return { isValid: false, error: 'MaxPreps URL must include an athlete profile path (/athletes/name)' };
    }
    const urlName = match[1];
    if (profileName) {
      const expectedUrlName = profileName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
      const cleanUrlName = urlName.toLowerCase().replace(/[^a-z0-9\-]/g, '');
      if (cleanUrlName !== expectedUrlName) {
        return {
          isValid: false,
          error: `Your MaxPreps URL must contain your name (e.g., maxpreps.com/athletes/${expectedUrlName}).`
        };
      }
    }
    return { isValid: true };
  }

  // Enhanced Hudl URL validation with name matching
  static validateHudlURL(url: string, profileName: string, required = false): ValidationResult {
    if (required && !url.trim()) {
      return { isValid: false, error: 'Hudl URL is required' };
    }
    if (!url) return { isValid: true };
    if (url.length > FIELD_LIMITS.URL) {
      return { isValid: false, error: `URL must be ${FIELD_LIMITS.URL} characters or less` };
    }
    // Always add https:// if missing
    let processedUrl = url.trim();
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = `https://${processedUrl}`;
    }
    // Basic Hudl URL pattern
    const hudlPattern = /^https?:\/\/(www\.)?hudl\.com\/.+/i;
    if (!hudlPattern.test(processedUrl)) {
      return { isValid: false, error: 'Please enter a valid Hudl URL (e.g., hudl.com/profile/...)' };
    }
    // Extract athlete name from URL path
    const profilePattern = /\/profile\/([^\/\?]+)/i;
    const match = processedUrl.match(profilePattern);
    if (!match) {
      return { isValid: false, error: 'Hudl URL must include a profile path (/profile/name)' };
    }
    const urlName = match[1];
    if (profileName) {
      const expectedUrlName = profileName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
      const cleanUrlName = urlName.toLowerCase().replace(/[^a-z0-9\-]/g, '');
      if (cleanUrlName !== expectedUrlName) {
        return {
          isValid: false,
          error: `Your Hudl URL must contain your name (e.g., hudl.com/profile/${expectedUrlName}).`
        };
      }
    }
    return { isValid: true };
  }

  // URL validation
  static validateURL(value: string, type: 'maxpreps' | 'hudl' | 'general' = 'general', required = false): ValidationResult {
    if (required && !value.trim()) {
      return { isValid: false, error: 'URL is required' };
    }
    
    if (!value) return { isValid: true };
    
    if (value.length > FIELD_LIMITS.URL) {
      return { isValid: false, error: `URL must be ${FIELD_LIMITS.URL} characters or less` };
    }

    // Process URL to add https:// if needed
    const processedURL = URLUtils.processURL(value);
    
    let pattern;
    let errorMessage = 'Please enter a valid URL or domain (e.g., example.com or https://example.com)';
    
    switch (type) {
      case 'maxpreps':
        pattern = URL_PATTERNS.MAXPREPS;
        errorMessage = 'Please enter a valid MaxPreps URL (e.g., maxpreps.com/athlete/... or https://www.maxpreps.com/athlete/...)';
        break;
      case 'hudl':
        pattern = URL_PATTERNS.HUDL;
        errorMessage = 'Please enter a valid Hudl URL (e.g., hudl.com/profile/... or https://www.hudl.com/profile/...)';
        break;
      default:
        // For general URLs, use the utility function
        if (!URLUtils.isValidURL(value)) {
          return { isValid: false, error: errorMessage };
        }
        return { isValid: true };
    }
    
    if (!pattern.test(processedURL)) {
      return { isValid: false, error: errorMessage };
    }
    
    return { isValid: true };
  }

  // Social media handle validation
  static validateSocialHandle(value: string, platform: 'instagram' | 'twitter', required = false): ValidationResult {
    if (required && !value.trim()) {
      return { isValid: false, error: `${platform.charAt(0).toUpperCase() + platform.slice(1)} handle is required` };
    }
    
    if (!value) return { isValid: true };
    
    const pattern = platform === 'instagram' ? SOCIAL_PATTERNS.INSTAGRAM : SOCIAL_PATTERNS.TWITTER;
    const maxLength = platform === 'instagram' ? 30 : 15;
    
    if (!pattern.test(value)) {
      return { 
        isValid: false, 
        error: `Please enter a valid ${platform.charAt(0).toUpperCase() + platform.slice(1)} handle (max ${maxLength} characters, letters, numbers, and underscores only)` 
      };
    }
    
    return { isValid: true };
  }

  // Helper function to clean weight input (remove "lbs")
  static cleanWeightInput(value: string): string {
    return value.replace(/\s*lbs?\s*/gi, '').trim();
  }

  // Helper function to format social handles (ensure @ prefix)
  static formatSocialHandle(value: string): string {
    if (!value) return value;
    const cleaned = value.trim();
    return cleaned.startsWith('@') ? cleaned : `@${cleaned}`;
  }

  // Comprehensive validation for athlete form
  static validateAthleteForm(data: OnboardingFormData): ValidationErrors {
    const errors: ValidationErrors = {};

    // Name validation
    const nameResult = this.validateName(data.fullName, true);
    if (!nameResult.isValid) errors.fullName = nameResult.error!;

    // Organization validation
    const orgResult = this.validateText(data.organizationName, 'Organization name', FIELD_LIMITS.ORGANIZATION_NAME, true);
    if (!orgResult.isValid) errors.organizationName = orgResult.error!;

    // City validation
    const cityResult = this.validateText(data.city, 'City', FIELD_LIMITS.CITY, true);
    if (!cityResult.isValid) errors.city = cityResult.error!;

    // Weight validation
    const weightResult = this.validateWeight(data.weight, true);
    if (!weightResult.isValid) errors.weight = weightResult.error!;

    // Academic scores validation
    const gpaResult = this.validateGPA(data.gpa);
    if (!gpaResult.isValid) errors.gpa = gpaResult.error!;

    const satResult = this.validateSATScore(data.satScore);
    if (!satResult.isValid) errors.satScore = satResult.error!;

    const actResult = this.validateACTScore(data.actScore);
    if (!actResult.isValid) errors.actScore = actResult.error!;

    // Intended major validation
    const majorResult = this.validateText(data.intendedMajor, 'Intended major', FIELD_LIMITS.INTENDED_MAJOR, true);
    if (!majorResult.isValid) errors.intendedMajor = majorResult.error!;

    // Graduation year validation
    const graduationResult = this.validateGraduationYear(data.graduationYear, data.educationLevel);
    if (!graduationResult.isValid) errors.graduationYear = graduationResult.error!;

    // URLs validation
    if (data.maxprepsUrl) {
      const maxprepsResult = this.validateMaxPrepsURL(data.maxprepsUrl, data.fullName);
      if (!maxprepsResult.isValid) errors.maxprepsUrl = maxprepsResult.error!;
    }
    // HUDL URL 
    if (data.hudlUrl) {
      const hudlResult = this.validateHudlURL(data.hudlUrl, data.fullName);
      if (!hudlResult.isValid) errors.hudlUrl = hudlResult.error!;
    }

    // Social media validation
    if (data.instagramHandle) {
      const igResult = this.validateSocialHandle(data.instagramHandle, 'instagram');
      if (!igResult.isValid) errors.instagramHandle = igResult.error!;
    }

    if (data.twitterHandle) {
      const twitterResult = this.validateSocialHandle(data.twitterHandle, 'twitter');
      if (!twitterResult.isValid) errors.twitterHandle = twitterResult.error!;
    }

    // Personal statement validation
    const statementResult = this.validateText(data.personalStatement, 'Personal statement', FIELD_LIMITS.PERSONAL_STATEMENT, true);
    if (!statementResult.isValid) errors.personalStatement = statementResult.error!;

    return errors;
  }

  // Comprehensive validation for coach/recruiter form
  static validateCoachRecruiterForm(data: OnboardingFormData): ValidationErrors {
    const errors: ValidationErrors = {};

    // Name validation
    const nameResult = this.validateName(data.fullName, true);
    if (!nameResult.isValid) errors.fullName = nameResult.error!;

    // Title validation
    const titleResult = this.validateText(data.title, 'Title', FIELD_LIMITS.TITLE, true);
    if (!titleResult.isValid) errors.title = titleResult.error!;

    // Organization name validation
    const orgResult = this.validateText(data.organizationName, 'Organization name', FIELD_LIMITS.ORGANIZATION_NAME, true);
    if (!orgResult.isValid) errors.organizationName = orgResult.error!;

    // City validation
    const cityResult = this.validateText(data.city, 'City', FIELD_LIMITS.CITY, true);
    if (!cityResult.isValid) errors.city = cityResult.error!;

    // Conference validation
    if (data.conference) {
      const confResult = this.validateText(data.conference, 'Conference', FIELD_LIMITS.CONFERENCE);
      if (!confResult.isValid) errors.conference = confResult.error!;
    }

    // URLs validation
    if (data.programWebsite) {
      const programWebResult = this.validateURL(data.programWebsite);
      if (!programWebResult.isValid) errors.programWebsite = programWebResult.error!;
    }

    if (data.schoolWebsite) {
      const schoolWebResult = this.validateURL(data.schoolWebsite);
      if (!schoolWebResult.isValid) errors.schoolWebsite = schoolWebResult.error!;
    }

    // Social media validation
    if (data.orgInstagramHandle) {
      const igResult = this.validateSocialHandle(data.orgInstagramHandle, 'instagram');
      if (!igResult.isValid) errors.orgInstagramHandle = igResult.error!;
    }

    if (data.orgTwitterHandle) {
      const twitterResult = this.validateSocialHandle(data.orgTwitterHandle, 'twitter');
      if (!twitterResult.isValid) errors.orgTwitterHandle = twitterResult.error!;
    }

    // Check that at least one contact method is provided
    const hasContact = data.programWebsite || data.schoolWebsite || data.orgInstagramHandle || data.orgTwitterHandle;
    if (!hasContact) {
      errors.contact = 'Please provide at least one: website or social media handle';
    }

    // Personal statement validation
    const personalResult = this.validateText(data.personalStatement, 'About yourself', FIELD_LIMITS.PERSONAL_STATEMENT, true);
    if (!personalResult.isValid) errors.personalStatement = personalResult.error!;

    // Determine if this is a recruiter (has secondary sports or sport-specific needs) or coach
    const isRecruiter = data.secondarySportsRecruiting && data.secondarySportsRecruiting.length > 0 || 
                       (data.sportSpecificNeeds && Object.keys(data.sportSpecificNeeds).length > 0);

    if (isRecruiter) {
      // For recruiters, validate sport-specific needs for main sport only during onboarding
      // Secondary sports can be added later on the profile
      if (data.division !== 'High School') {
        const mainSport = data.sportCoaching;
        const mainSportNeeds = data.sportSpecificNeeds?.[mainSport];
        
        if (!mainSportNeeds) {
          errors.sportSpecificNeeds = `Recruiting needs are required for your main sport (${mainSport})`;
        } else {
          // Validate main sport recruiting needs
          if (!mainSportNeeds.graduationYears || mainSportNeeds.graduationYears.length === 0) {
            errors[`sportSpecificNeeds_${mainSport}_graduationYears`] = `Graduation years for ${mainSport} are required`;
          }
          
          if (!mainSportNeeds.positions || mainSportNeeds.positions.length === 0) {
            errors[`sportSpecificNeeds_${mainSport}_positions`] = `Positions for ${mainSport} are required`;
          }
          
          if (!mainSportNeeds.recruitingPhilosophy || !mainSportNeeds.recruitingPhilosophy.trim()) {
            errors[`sportSpecificNeeds_${mainSport}_philosophy`] = `Recruiting philosophy for ${mainSport} is required`;
          } else {
            const philosophyResult = this.validateText(mainSportNeeds.recruitingPhilosophy, `${mainSport} recruiting philosophy`, FIELD_LIMITS.RECRUITING_PHILOSOPHY, true);
            if (!philosophyResult.isValid) {
              errors[`sportSpecificNeeds_${mainSport}_philosophy`] = philosophyResult.error!;
            }
          }
        }
      }
    } else {
      // For coaches, validate single recruiting philosophy and needs (only required if not high school)
      if (data.division !== 'High School') {
        const philosophyResult = this.validateText(data.recruitingPhilosophy, 'Recruiting philosophy', FIELD_LIMITS.RECRUITING_PHILOSOPHY, true);
        if (!philosophyResult.isValid) errors.recruitingPhilosophy = philosophyResult.error!;
        
        // Validate recruiting needs for coaches
        if (!data.recruitingGraduationYears || data.recruitingGraduationYears.length === 0) {
          errors.recruitingGraduationYears = 'Graduation years are required';
        }
        
        if (!data.recruitingPositions || data.recruitingPositions.length === 0) {
          errors.recruitingPositions = 'Positions are required';
        }
      }
    }

    return errors;
  }
} 