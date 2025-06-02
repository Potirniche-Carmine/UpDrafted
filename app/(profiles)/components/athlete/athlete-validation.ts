// Field limits and validation constants
export const FIELD_LIMITS = {
  FULL_NAME: 50,
  ORGANIZATION_NAME: 50,
  CITY: 50,
  INTENDED_MAJOR: 50,
  PERSONAL_STATEMENT: 400,
  INSTAGRAM_HANDLE: 50,
  TWITTER_HANDLE: 50,
  URL: 300
};

export const NUMERIC_LIMITS = {
  WEIGHT: { min: 50, max: 700 }, // in pounds
  GPA: { min: 0, max: 5.0 },
  SAT_SCORE: { min: 400, max: 1600 },
  ACT_SCORE: { min: 1, max: 36 }
};

// Helper function for MaxPreps URL validation with name matching
export const validateMaxPrepsURL = (url: string, profileName: string): { isValid: boolean; error?: string } => {
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
};

// Main validation function for athlete fields
export const validateField = (field: string, value: string | number, profileName?: string): string | null => {
  switch (field) {
    case 'fullName':
      if (!value || (typeof value === 'string' && !value.trim())) {
        return 'Full name is required';
      }
      if (typeof value === 'string' && value.length > FIELD_LIMITS.FULL_NAME) {
        return `Name must be ${FIELD_LIMITS.FULL_NAME} characters or less`;
      }
      const namePattern = /^[a-zA-Z\s\-'\.]+$/;
      if (typeof value === 'string' && !namePattern.test(value)) {
        return 'Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      break;
    
    case 'personalStatement':
      if (typeof value === 'string' && value.length > FIELD_LIMITS.PERSONAL_STATEMENT) {
        return `Personal statement must be ${FIELD_LIMITS.PERSONAL_STATEMENT} characters or less`;
      }
      break;
    
    case 'weight':
      if (typeof value === 'string') {
        const cleanedValue = value.replace(/\s*lbs?\s*/gi, '').trim();
        const numericValue = parseFloat(cleanedValue);
        if (cleanedValue && isNaN(numericValue)) {
          return 'Weight must be a valid number';
        }
        if (numericValue && (numericValue < NUMERIC_LIMITS.WEIGHT.min || numericValue > NUMERIC_LIMITS.WEIGHT.max)) {
          return `Weight must be between ${NUMERIC_LIMITS.WEIGHT.min} and ${NUMERIC_LIMITS.WEIGHT.max} pounds`;
        }
      }
      break;
    
    case 'gpa':
      if (typeof value === 'number' && (value < NUMERIC_LIMITS.GPA.min || value > NUMERIC_LIMITS.GPA.max)) {
        return `GPA must be between ${NUMERIC_LIMITS.GPA.min} and ${NUMERIC_LIMITS.GPA.max}`;
      }
      break;
    
    case 'satScore':
      if (typeof value === 'number' && (value < NUMERIC_LIMITS.SAT_SCORE.min || value > NUMERIC_LIMITS.SAT_SCORE.max)) {
        return `SAT score must be between ${NUMERIC_LIMITS.SAT_SCORE.min} and ${NUMERIC_LIMITS.SAT_SCORE.max}`;
      }
      break;
    
    case 'actScore':
      if (typeof value === 'number' && (value < NUMERIC_LIMITS.ACT_SCORE.min || value > NUMERIC_LIMITS.ACT_SCORE.max)) {
        return `ACT score must be between ${NUMERIC_LIMITS.ACT_SCORE.min} and ${NUMERIC_LIMITS.ACT_SCORE.max}`;
      }
      break;
    
    case 'maxPrepsUrl':
      if (typeof value === 'string' && value.trim() && profileName) {
        // Use the enhanced MaxPreps validation
        const validation = validateMaxPrepsURL(value, profileName);
        if (!validation.isValid) {
          return validation.error || 'Invalid MaxPreps URL';
        }
      }
      break;
  }
  return null;
};

// Helper function for metric placeholders
export const getPlaceholderForMetric = (metricName: string): string => {
  if (!metricName) return "Enter value";
  
  const lowerMetric = metricName.toLowerCase();
  
  // Time-based metrics
  if (lowerMetric.includes('dash') || lowerMetric.includes('time') || lowerMetric.includes('split')) {
    return "e.g., 4.5s";
  }
  
  // Distance metrics  
  if (lowerMetric.includes('jump') || lowerMetric.includes('distance') || lowerMetric.includes('throw')) {
    return "e.g., 6'2\"";
  }
  
  // Speed metrics
  if (lowerMetric.includes('speed') || lowerMetric.includes('velocity')) {
    return "e.g., 85 mph";
  }
  
  // Weight/strength metrics
  if (lowerMetric.includes('press') || lowerMetric.includes('squat') || lowerMetric.includes('weight')) {
    return "e.g., 225 lbs";
  }
  
  // Default
  return "Enter value";
};

// Date validation function
export const validateDate = (month: string, year: string): boolean => {
  const monthRegex = /^(0[1-9]|1[0-2])$/;
  const yearRegex = /^\d{4}$/;
  if (!monthRegex.test(month) || !yearRegex.test(year)) return false;
  
  // Check if the date is valid
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  const date = new Date(yearNum, monthNum - 1, 1);
  return date.getFullYear() === yearNum && 
         date.getMonth() === monthNum - 1 && 
         date.getDate() === 1;
};

// Format date for display (convert from ISO to month/year)
export const formatDateForInput = (isoDateString: string): { month: string, year: string } => {
  if (!isoDateString) return { month: '', year: '' };
  const date = new Date(isoDateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear().toString();
  return { month, year };
}; 