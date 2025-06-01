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
  HIGH_SCHOOL: 50,
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
  GENERAL_URL: /^https?:\/\/.+\..+/i
};

// Social media handle patterns (allowing @ prefix or not)
const SOCIAL_PATTERNS = {
  INSTAGRAM: /^@?[a-zA-Z0-9_.]{1,30}$/,
  TWITTER: /^@?[a-zA-Z0-9_]{1,15}$/
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

  // Enhanced MaxPreps URL validation with name matching
  static validateMaxPrepsURL(url: string, profileName: string, required = false): ValidationResult {
    if (required && !url.trim()) {
      return { isValid: false, error: 'MaxPreps URL is required' };
    }
    
    if (!url) return { isValid: true };
    
    if (url.length > FIELD_LIMITS.URL) {
      return { isValid: false, error: `URL must be ${FIELD_LIMITS.URL} characters or less` };
    }
    
    // Basic MaxPreps URL pattern
    const maxprepsPattern = /^https?:\/\/(www\.)?maxpreps\.com\/.+/i;
    if (!maxprepsPattern.test(url)) {
      return { isValid: false, error: 'Please enter a valid MaxPreps URL (e.g., https://www.maxpreps.com/...)' };
    }
    
    // Extract athlete name from URL path
    // Expected format: /athletes/first-last/ or /athletes/first-lastname/
    const athletePattern = /\/athletes\/([^\/]+)/i;
    const match = url.match(athletePattern);
    
    if (!match) {
      return { isValid: false, error: 'MaxPreps URL must include an athlete profile path (/athletes/name)' };
    }
    
    const urlName = match[1];
    if (profileName) {
      // Convert profile name to expected URL format (first-last)
      const expectedUrlName = profileName.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '');
      
      // Clean up the URL name for comparison
      const cleanUrlName = urlName.toLowerCase().replace(/[^a-z0-9\-]/g, '');
      
      if (cleanUrlName !== expectedUrlName) {
        return { 
          isValid: false, 
          error: `Your MaxPreps URL name "${urlName}" doesn't match your profile name "${profileName}". The URL should contain "${expectedUrlName}".` 
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
    
    let pattern;
    let errorMessage = 'Please enter a valid URL';
    
    switch (type) {
      case 'maxpreps':
        pattern = URL_PATTERNS.MAXPREPS;
        errorMessage = 'Please enter a valid MaxPreps URL (e.g., https://www.maxpreps.com/athlete/...)';
        break;
      case 'hudl':
        pattern = URL_PATTERNS.HUDL;
        errorMessage = 'Please enter a valid Hudl URL (e.g., https://www.hudl.com/profile/...)';
        break;
      default:
        pattern = URL_PATTERNS.GENERAL_URL;
        break;
    }
    
    if (!pattern.test(value)) {
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

    // High school validation
    const hsResult = this.validateText(data.highSchool, 'High school', FIELD_LIMITS.HIGH_SCHOOL, true);
    if (!hsResult.isValid) errors.highSchool = hsResult.error!;

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

    // URLs validation
    if (data.maxprepsUrl) {
      const maxprepsResult = this.validateMaxPrepsURL(data.maxprepsUrl, data.fullName);
      if (!maxprepsResult.isValid) errors.maxprepsUrl = maxprepsResult.error!;
    }

    if (data.hudlUrl) {
      const hudlResult = this.validateURL(data.hudlUrl, 'hudl');
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

    // Recruiting philosophy validation
    const philosophyResult = this.validateText(data.recruitingPhilosophy, 'About your program', FIELD_LIMITS.RECRUITING_PHILOSOPHY, true);
    if (!philosophyResult.isValid) errors.recruitingPhilosophy = philosophyResult.error!;

    // What looking for validation
    const lookingForResult = this.validateText(data.whatLookingFor, 'What you are looking for', FIELD_LIMITS.WHAT_LOOKING_FOR, true);
    if (!lookingForResult.isValid) errors.whatLookingFor = lookingForResult.error!;

    return errors;
  }
} 