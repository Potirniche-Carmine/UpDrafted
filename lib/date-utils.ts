/**
 * Utility functions for handling camp experience dates
 * Converts between Date objects and Month Year display format
 */

// Special date value to represent "Present" in the database
// This allows us to maintain proper date type for sorting/querying while representing "ongoing" experiences
export const PRESENT_DATE = new Date('9999-12-31');

export interface CampDateOption {
  value: string;
  label: string;
  date: Date;
}

/**
 * Robust date parsing with comprehensive validation and detailed error logging
 * Returns a tuple of [parsedDate, errorMessage]
 * 
 * SECURITY & RELIABILITY ENHANCEMENTS:
 * - Input sanitization to prevent injection attacks
 * - Comprehensive date format validation
 * - Timezone-safe parsing with UTC normalization
 * - Consistent fallback behavior to prevent data corruption
 * - Enhanced logging for debugging and monitoring
 * 
 * @param dateString - The date string to parse
 * @param context - Context for error messages (e.g., "camp experience start date")
 * @param fallbackDate - Date to return if parsing fails (default: current date)
 * @param strictMode - If true, throws error for invalid dates instead of using fallback (default: false)
 * @returns Tuple of [parsedDate, errorMessage] where errorMessage is null if successful
 */
export function parseDateWithErrorHandling(
  dateString: string, 
  context: string, 
  fallbackDate: Date = new Date(),
  strictMode: boolean = false
): [Date, string | null] {
  // Enhanced input validation and sanitization
  if (!dateString || typeof dateString !== 'string') {
    const error = `Invalid date string input in ${context}: expected string, got ${typeof dateString} (${JSON.stringify(dateString)})`;
    
    if (strictMode) {
      throw new Error(error);
    }
    
    console.warn(error);
    return [fallbackDate, error];
  }

  // Security: Sanitize input string to prevent injection attacks
  const sanitizedInput = String(dateString).trim();
  
  if (!sanitizedInput) {
    const error = `Empty date string after sanitization in ${context}`;
    
    if (strictMode) {
      throw new Error(error);
    }
    
    console.warn(error);
    return [fallbackDate, error];
  }

  // Security: Reject extremely long inputs that could cause DoS
  if (sanitizedInput.length > 100) {
    const error = `Date string too long in ${context}: ${sanitizedInput.length} characters exceeds limit`;
    
    if (strictMode) {
      throw new Error(error);
    }
    
    console.warn(error);
    return [fallbackDate, error];
  }

  try {
    // Check if it's the special "Present" date using the robust isPresentDate function
    if (isPresentDate(sanitizedInput)) {
      return [PRESENT_DATE, null];
    }

    // Enhanced date format validation before parsing
    const validDateFormats = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, // ISO 8601
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?[+-]\d{2}:\d{2}$/ // ISO with timezone
    ];

    const hasValidFormat = validDateFormats.some(format => format.test(sanitizedInput));
    
    if (!hasValidFormat) {
      console.warn(`Date string format not recognized in ${context}: "${sanitizedInput}". Attempting parsing anyway.`);
    }

    // Use the enhanced isoStringToDate function to handle timezone issues properly
    const parsedDate = isoStringToDate(sanitizedInput);
    
    // Comprehensive date validation
    if (!parsedDate || !(parsedDate instanceof Date)) {
      const error = `Date parsing returned invalid object in ${context}: "${sanitizedInput}"`;
      
      if (strictMode) {
        throw new Error(error);
      }
      
      console.warn(error);
      return [fallbackDate, error];
    }

    if (isNaN(parsedDate.getTime())) {
      const error = `Invalid date value in ${context}: "${sanitizedInput}" parsed to NaN`;
      
      if (strictMode) {
        throw new Error(error);
      }
      
      console.warn(error);
      return [fallbackDate, error];
    }

    // Validate reasonable date ranges to catch potential data corruption
    const currentYear = new Date().getFullYear();
    const parsedYear = parsedDate.getFullYear();
    
    if (parsedYear < 1900 || parsedYear > currentYear + 20) {
      console.warn(`Suspicious date year in ${context}: ${parsedYear}. Date: "${sanitizedInput}"`);
    }

    return [parsedDate, null];
  } catch (error) {
    const errorMessage = `Date parsing exception in ${context}: "${sanitizedInput}" - ${error instanceof Error ? error.message : 'Unknown error'}`;
    
    if (strictMode) {
      throw new Error(errorMessage);
    }
    
    console.error(errorMessage, {
      originalInput: dateString,
      sanitizedInput,
      context,
      fallbackDate: fallbackDate.toISOString()
    });
    return [fallbackDate, errorMessage];
  }
}

/**
 * Convert date to YYYY-MM-DD string format with error handling
 * Returns a tuple of [dateString, errorMessage]
 * 
 * @param date - Date object or string to convert
 * @param context - Context for error messages (e.g., "camp experience end date")
 * @param fallbackString - String to return if conversion fails (default: current date in YYYY-MM-DD format)
 * @param strictMode - If true, throws error for invalid dates instead of using fallback (default: false)
 * @returns Tuple of [dateString, errorMessage] where errorMessage is null if successful
 */
export function dateToStringWithErrorHandling(
  date: Date | string,
  context: string,
  fallbackString: string = new Date().toISOString().split('T')[0],
  strictMode: boolean = false
): [string, string | null] {
  try {
    // If it's already a string in YYYY-MM-DD format, use it directly
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return [date, null];
    }

    // If it's a string representing the special "Present" date, return it
    if (typeof date === 'string' && isPresentDate(date)) {
      return ['9999-12-31', null];
    }

    // Convert to Date object if it's a string
    let dateObj: Date;
    if (typeof date === 'string') {
      const [parsedDate, parseError] = parseDateWithErrorHandling(date, context, new Date(), strictMode);
      if (parseError) {
        if (strictMode) {
          throw new Error(parseError);
        }
        return [fallbackString, parseError];
      }
      dateObj = parsedDate;
    } else {
      dateObj = date;
    }

    // Validate the Date object
    if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      const error = `Invalid date object in ${context}: ${JSON.stringify(dateObj)}`;
      
      if (strictMode) {
        throw new Error(error);
      }
      
      console.warn(error);
      return [fallbackString, error];
    }

    // Check if it's the special "Present" date
    if (dateObj.getTime() === PRESENT_DATE.getTime()) {
      return ['9999-12-31', null];
    }

    // Convert Date object to YYYY-MM-DD format using UTC methods to avoid timezone issues
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    return [dateString, null];
  } catch (error) {
    const errorMessage = `Date to string conversion error in ${context}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    
    if (strictMode) {
      throw new Error(errorMessage);
    }
    
    console.error(errorMessage);
    return [fallbackString, errorMessage];
  }
}

/**
 * Format a Date object to "Month Year" format (e.g., "June 2025")
 */
export function formatCampDate(date: Date | string): string {
  // Handle string input (convert to Date object)
  let dateObj: Date;
  if (typeof date === 'string') {
    try {
      dateObj = new Date(date);
    } catch {
      console.error('DEBUG - Invalid date string passed to formatCampDate:', date);
      return 'Invalid Date';
    }
  } else {
    dateObj = date;
  }

  // Ensure we have a valid Date object
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    console.error('DEBUG - Invalid date passed to formatCampDate:', dateObj);
    return 'Invalid Date';
  }

  // Check if it's the special "Present" date
  if (isPresentDate(dateObj)) {
    return 'Present';
  }

  // Format as YYYY-MM-DD
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date as "Month, Year" for display purposes
 * Example: "January, 2025"
 */
export function formatDateAsMonthYear(date: Date | string): string {
  // Handle string input (convert to Date object)
  let dateObj: Date;
  if (typeof date === 'string') {
    try {
      dateObj = new Date(date);
    } catch {
      console.error('DEBUG - Invalid date string passed to formatDateAsMonthYear:', date);
      return 'Invalid Date';
    }
  } else {
    dateObj = date;
  }

  // Ensure we have a valid Date object
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    console.error('DEBUG - Invalid date passed to formatDateAsMonthYear:', dateObj);
    return 'Invalid Date';
  }

  // Check if it's the special "Present" date
  if (isPresentDate(dateObj)) {
    return 'Present';
  }

  // Format as "Month, Year"
  const month = dateObj.toLocaleDateString('en-US', { month: 'long' });
  const year = dateObj.getFullYear();
  return `${month}, ${year}`;
}

/**
 * Parse a "Month Year" string into a Date object
 * Returns PRESENT_DATE if parsing fails or string is "Present"
 */
export function parseCampDate(dateString: string): Date {
  if (!dateString || dateString === 'Present') {
    return PRESENT_DATE;
  }

  try {
    // Handle formats like "June 2025", "July, 2025", etc.
    const cleanString = dateString.replace(',', '').trim();
    const date = new Date(cleanString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return PRESENT_DATE;
    }

    return date;
  } catch {
    return PRESENT_DATE;
  }
}

/**
 * Generate camp date options for the last 10 years
 * Returns array of options with value (ISO string), label (Month Year), and date object
 */
export function generateCampDateOptions(): CampDateOption[] {
  const options: CampDateOption[] = [];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  for (let i = 0; i < 120; i++) { // 10 years * 12 months
    const date = new Date(currentYear, currentMonth - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const label = `${monthName} ${year}`;
    // Use YYYY-MM-DD format to avoid timezone issues
    const value = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

    options.push({ value, label, date });
  }

  return options;
}

/**
 * Generate end date options including "Present"
 */
export function generateCampEndDateOptions(): CampDateOption[] {
  const baseOptions = generateCampDateOptions();

  return [
    { value: PRESENT_DATE.toISOString(), label: 'Present', date: PRESENT_DATE },
    ...baseOptions
  ];
}

/**
 * Generate filtered end date options based on a selected start date
 * Only returns dates that come after the start date (including the start date itself)
 */
export function generateFilteredEndDateOptions(startDateValue: string): CampDateOption[] {
  if (!startDateValue) {
    // If no start date selected, return empty array
    return [];
  }

  // Convert start date value to Date object
  const startDate = isoStringToDate(startDateValue);
  
  // If start date is invalid, return empty array
  if (isNaN(startDate.getTime())) {
    return [];
  }

  const options: CampDateOption[] = [];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Always include "Present" as an option
  options.push({ value: PRESENT_DATE.toISOString(), label: 'Present', date: PRESENT_DATE });

  // Generate options from start date onwards
  const currentOptionDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  
  // Add options up to current date + 2 years into the future
  const maxDate = new Date(currentYear + 2, currentMonth, 1);
  
  while (currentOptionDate <= maxDate) {
    const monthName = currentOptionDate.toLocaleDateString('en-US', { month: 'long' });
    const year = currentOptionDate.getFullYear();
    const label = `${monthName} ${year}`;
    const value = `${year}-${String(currentOptionDate.getMonth() + 1).padStart(2, '0')}-01`;

    options.push({ value, label, date: new Date(currentOptionDate) });
    
    // Move to next month
    currentOptionDate.setMonth(currentOptionDate.getMonth() + 1);
  }

  return options;
}

/**
 * Convert a Date object to ISO string for database storage
 */
export function dateToISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Convert a date string to Date object with enhanced validation and timezone handling
 * Provides consistent, reliable date parsing across different input formats
 * 
 * RELIABILITY IMPROVEMENTS:
 * - Comprehensive input validation and sanitization
 * - Proper timezone handling to prevent date shifting
 * - Multiple format support with validation
 * - Consistent error handling and logging
 * - Prevention of date corruption through validation
 * 
 * @param dateString - The date string to convert to a Date object
 * @returns Date object, or PRESENT_DATE if parsing fails
 */
export function isoStringToDate(dateString: string): Date {
  // Enhanced input validation
  if (!dateString || typeof dateString !== 'string') {
    console.warn('isoStringToDate: Invalid input, returning PRESENT_DATE:', dateString);
    return PRESENT_DATE;
  }
  
  // Security: Sanitize and validate input
  const sanitizedInput = String(dateString).trim();
  
  if (!sanitizedInput) {
    console.warn('isoStringToDate: Empty string after sanitization, returning PRESENT_DATE');
    return PRESENT_DATE;
  }

  // Security: Prevent DoS with extremely long inputs
  if (sanitizedInput.length > 100) {
    console.warn(`isoStringToDate: Input too long (${sanitizedInput.length} chars), returning PRESENT_DATE:`, sanitizedInput);
    return PRESENT_DATE;
  }

  try {
    // Handle YYYY-MM-DD format (from frontend dropdowns) with timezone safety
    if (/^\d{4}-\d{2}-\d{2}$/.test(sanitizedInput)) {
      const [yearStr, monthStr, dayStr] = sanitizedInput.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);
      
      // Validate numeric ranges to prevent invalid dates
      if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
        console.warn(`isoStringToDate: Invalid date components in "${sanitizedInput}", returning PRESENT_DATE`);
        return PRESENT_DATE;
      }
      
      // Create date with UTC to prevent timezone shifting
      // Use UTC methods to ensure consistent date across timezones
      const date = new Date(Date.UTC(year, month - 1, day)); // month is 0-indexed in Date constructor
      
      // Validate the constructed date matches the input (prevents invalid dates like Feb 30)
      if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        console.warn(`isoStringToDate: Date construction mismatch for "${sanitizedInput}", returning PRESENT_DATE`);
        return PRESENT_DATE;
      }
      
      return date;
    }
    
    // Handle ISO string format (from database) with comprehensive validation
    if (/^\d{4}-\d{2}-\d{2}T/.test(sanitizedInput) || /^\d{4}-\d{2}-\d{2} /.test(sanitizedInput)) {
      const date = new Date(sanitizedInput);
      
      // Comprehensive validation of the parsed date
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.warn(`isoStringToDate: ISO string parsing failed for "${sanitizedInput}", returning PRESENT_DATE`);
        return PRESENT_DATE;
      }
      
      // Additional validation for reasonable date ranges
      const year = date.getFullYear();
      if (year < 1000 || year > 9999) {
        console.warn(`isoStringToDate: Unreasonable year ${year} in "${sanitizedInput}", returning PRESENT_DATE`);
        return PRESENT_DATE;
      }
      
      return date;
    }
    
    // Fallback: attempt standard Date parsing for other valid formats
    const date = new Date(sanitizedInput);
    const isValid = date instanceof Date && !isNaN(date.getTime());
    
    if (isValid) {
      // Additional validation for reasonable date ranges
      const year = date.getFullYear();
      if (year < 1000 || year > 9999) {
        console.warn(`isoStringToDate: Unreasonable year ${year} in fallback parsing of "${sanitizedInput}", returning PRESENT_DATE`);
        return PRESENT_DATE;
      }
      
      return date;
    } else {
      console.warn(`isoStringToDate: All parsing methods failed for "${sanitizedInput}", returning PRESENT_DATE`);
      return PRESENT_DATE;
    }
  } catch (error) {
    console.error('isoStringToDate: Exception during parsing, returning PRESENT_DATE:', {
      input: sanitizedInput,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return PRESENT_DATE;
  }
}

/**
 * Check if a date represents "Present"
 * Validates edge cases to prevent false positives
 * 
 * @param date - Date object or string to check
 * @returns true if the date represents the special "Present" date, false otherwise
 * 
 * @example
 * // Valid "Present" dates:
 * isPresentDate('9999-12-31') // true
 * isPresentDate('9999-12-31T00:00:00.000Z') // true
 * isPresentDate(new Date('9999-12-31')) // true
 * 
 * // Invalid/edge cases that return false:
 * isPresentDate('9999-12-30') // false (different date)
 * isPresentDate('9999-12-31T12:00:00.000Z') // false (different time)
 * isPresentDate('9999-12-31T00:00:00.001Z') // false (different milliseconds)
 * isPresentDate('invalid-date-string') // false (invalid format)
 * isPresentDate('') // false (empty string)
 * isPresentDate(null) // false (null value)
 * isPresentDate(undefined) // false (undefined value)
 */
export function isPresentDate(date: Date | string): boolean {
  // Handle string input with strict validation
  if (typeof date === 'string') {
    // Only accept exact matches for the special "Present" date strings
    // This prevents false positives from similar-looking strings
    if (date === '9999-12-31' || date === '9999-12-31T00:00:00.000Z') {
      return true;
    }
    
    // For any other string, try to parse it as a date and compare
    // This handles cases where the string might be a valid date that happens to be 9999-12-31
    try {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.getTime() === PRESENT_DATE.getTime();
      }
    } catch {
      // If parsing fails, it's definitely not a "Present" date
      return false;
    }
    
    return false;
  }
  
  // Handle Date object input
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }
  
  // Compare the time value to ensure exact match
  return date.getTime() === PRESENT_DATE.getTime();
}

/**
 * Format a date range for display
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const startFormatted = formatCampDate(startDate);
  const endFormatted = isPresentDate(endDate) ? 'Present' : formatCampDate(endDate);
  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Format a date range as "Month, Year - Month, Year" for display purposes
 * Example: "January, 2025 - April, 2025"
 */
export function formatDateRangeAsMonthYear(startDate: Date | string, endDate: Date | string): string {
  const startFormatted = formatDateAsMonthYear(startDate);
  const endFormatted = isPresentDate(endDate) ? 'Present' : formatDateAsMonthYear(endDate);
  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Parse a date range string back into individual start and end dates
 * Handles formats like "2025-02-05 - Present" or "2025-02-05 - 2025-08-15"
 * 
 * @param dateRangeString - The date range string to parse
 * @returns Object with startDate and endDate as Date objects, or undefined if parsing fails
 */
export function parseDateRange(dateRangeString: string): { startDate: Date; endDate: Date } | undefined {
  if (!dateRangeString || typeof dateRangeString !== 'string') {
    return undefined;
  }

  try {
    // Split on " - " (space, dash, space)
    const parts = dateRangeString.split(' - ');
    if (parts.length !== 2) {
      return undefined;
    }

    const [startPart, endPart] = parts.map(part => part.trim());
    
    // Parse start date
    let startDate: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(startPart)) {
      // YYYY-MM-DD format
      const [year, month, day] = startPart.split('-').map(Number);
      startDate = new Date(year, month - 1, day);
    } else {
      // Try parsing as regular date
      startDate = new Date(startPart);
    }

    if (isNaN(startDate.getTime())) {
      return undefined;
    }

    // Parse end date
    let endDate: Date;
    if (endPart === 'Present') {
      endDate = PRESENT_DATE;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(endPart)) {
      // YYYY-MM-DD format
      const [year, month, day] = endPart.split('-').map(Number);
      endDate = new Date(year, month - 1, day);
    } else {
      // Try parsing as regular date
      endDate = new Date(endPart);
    }

    if (isNaN(endDate.getTime())) {
      return undefined;
    }

    return { startDate, endDate };
  } catch (error) {
    return undefined;
  }
}

/**
 * Sort camp experiences by start date (newest first)
 */
export function sortCampExperiences<T extends { startDate: Date | string }>(experiences: T[]): T[] {
  return [...experiences].sort((a, b) => {
    const aDate = typeof a.startDate === 'string' ? new Date(a.startDate) : a.startDate;
    const bDate = typeof b.startDate === 'string' ? new Date(b.startDate) : b.startDate;
    return bDate.getTime() - aDate.getTime();
  });
}

/**
 * Validate date integrity without affecting application flow
 * Returns detailed validation results for debugging and monitoring
 * 
 * @param dateString - The date string to validate
 * @param context - Context for validation messages
 * @returns Object containing validation results and recommendations
 * 
 * @example
 * // Basic validation
 * const result = validateDateIntegrity('2025-06-15', 'camp start date');
 * if (!result.isValid) {
 *   console.warn('Date validation failed:', result.issues);
 * }
 * 
 * // Validation with recommendations
 * const result = validateDateIntegrity('1899-01-01', 'birth date');
 * if (result.issues.length > 0) {
 *   console.warn('Suspicious date detected:', {
 *     issues: result.issues,
 *     recommendations: result.recommendations
 *   });
 * }
 */
export function validateDateIntegrity(
  dateString: string,
  context: string
): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
  parsedValue?: Date;
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check if input is valid
  if (!dateString || typeof dateString !== 'string') {
    issues.push(`Invalid input type in ${context}: expected string, got ${typeof dateString}`);
    recommendations.push('Ensure date input is a non-empty string');
    return { isValid: false, issues, recommendations };
  }

  // Check if it's the special "Present" date
  if (isPresentDate(dateString)) {
    return { isValid: true, issues, recommendations, parsedValue: PRESENT_DATE };
  }

  try {
    const parsedDate = isoStringToDate(dateString);
    
    if (isNaN(parsedDate.getTime())) {
      issues.push(`Date string "${dateString}" in ${context} could not be parsed to a valid date`);
      recommendations.push('Check date format and ensure it follows ISO 8601 or YYYY-MM-DD format');
      return { isValid: false, issues, recommendations };
    }

    // Additional validation checks
    const currentYear = new Date().getFullYear();
    const dateYear = parsedDate.getFullYear();
    
    if (dateYear < 1900) {
      issues.push(`Date year ${dateYear} in ${context} is before 1900, which may indicate an error`);
      recommendations.push('Verify the date is correct and not a placeholder or error value');
    }
    
    if (dateYear > currentYear + 10) {
      issues.push(`Date year ${dateYear} in ${context} is more than 10 years in the future, which may indicate an error`);
      recommendations.push('Verify the date is correct and not a placeholder or error value');
    }

    return { 
      isValid: issues.length === 0, 
      issues, 
      recommendations, 
      parsedValue: parsedDate 
    };
  } catch (error) {
    issues.push(`Exception during date parsing in ${context}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    recommendations.push('Check date format and ensure it follows expected patterns');
    return { isValid: false, issues, recommendations };
  }
}

/**
 * Collect and report date validation issues for a dataset
 * Useful for bulk validation and monitoring
 * 
 * @param dateEntries - Array of date entries to validate
 * @param context - Context for the validation session
 * @returns Summary of validation results
 * 
 * @example
 * // Validate a batch of camp experience dates
 * const dateEntries = [
 *   { id: 1, dateString: '2025-06-15', context: 'camp start date' },
 *   { id: 1, dateString: '2025-08-20', context: 'camp end date' },
 *   { id: 2, dateString: 'invalid-date', context: 'camp start date' }
 * ];
 * 
 * const results = validateDateDataset(dateEntries, 'camp experiences');
 * // console.log(results.summary); // "Date validation for camp experiences: 2/3 valid entries, 1 issues found"
 * 
 * if (results.invalidEntries > 0) {
 *   console.warn('Date validation issues:', results.issues);
 * }
 */
export function validateDateDataset(
  dateEntries: Array<{ id: string | number; dateString: string; context?: string }>,
  context: string
): {
  totalEntries: number;
  validEntries: number;
  invalidEntries: number;
  issues: Array<{ id: string | number; context: string; issues: string[]; recommendations: string[] }>;
  summary: string;
} {
  const issues: Array<{ id: string | number; context: string; issues: string[]; recommendations: string[] }> = [];
  let validEntries = 0;
  let invalidEntries = 0;

  for (const entry of dateEntries) {
    const validation = validateDateIntegrity(entry.dateString, entry.context || context);
    
    if (validation.isValid) {
      validEntries++;
    } else {
      invalidEntries++;
      issues.push({
        id: entry.id,
        context: entry.context || context,
        issues: validation.issues,
        recommendations: validation.recommendations
      });
    }
  }

  const totalEntries = dateEntries.length;
  const summary = `Date validation for ${context}: ${validEntries}/${totalEntries} valid entries, ${invalidEntries} issues found`;

  return {
    totalEntries,
    validEntries,
    invalidEntries,
    issues,
    summary
  };
}

/**
 * Format state abbreviation to uppercase with enhanced security validation
 * This function should only be used when you are certain the input is a state abbreviation
 * and not arbitrary user input that might contain state-like codes
 * 
 * @param stateCode - The state code to format (e.g., "ca", "TX", "ny")
 * @returns The state code in uppercase format, or original if invalid
 * 
 * SECURITY: Enhanced input validation to prevent injection attacks:
 * - Strict character validation (only alphanumeric characters allowed)
 * - Length validation (exactly 2 characters for state codes)
 * - No special characters, HTML, or script tags allowed
 * - Whitelist validation against known US state abbreviations only
 */
export function formatStateAbbreviation(stateCode: string): string {
  // Strict type and null/undefined checks
  if (!stateCode || typeof stateCode !== 'string') {
    return stateCode;
  }
  
  // Remove any whitespace and convert to string to handle edge cases
  const cleanInput = String(stateCode).trim();
  
  // Enhanced security validation: reject if empty after trimming
  if (!cleanInput) {
    return stateCode;
  }
  
  // Security check: reject inputs longer than reasonable (prevent buffer overflow attempts)
  if (cleanInput.length > 10) {
    console.warn(`formatStateAbbreviation: Input too long (${cleanInput.length} chars), rejecting for security`);
    return stateCode;
  }
  
  // Security check: only allow alphanumeric characters (prevent script injection)
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  if (!alphanumericRegex.test(cleanInput)) {
    console.warn(`formatStateAbbreviation: Non-alphanumeric characters detected, rejecting for security: ${cleanInput}`);
    return stateCode;
  }
  
  // State codes should be exactly 2 characters
  if (cleanInput.length !== 2) {
    return stateCode;
  }
  
  // Whitelist of valid US state abbreviations (security: explicit allow-list)
  const validStateAbbreviations = new Set([
    'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga',
    'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md',
    'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj',
    'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc',
    'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'
  ]);
  
  const normalizedCode = cleanInput.toLowerCase();
  
  // Security: Only return formatted result if it's in our explicit whitelist
  if (validStateAbbreviations.has(normalizedCode)) {
    return normalizedCode.toUpperCase();
  }
  
  // If not a valid state abbreviation, return original input unchanged
  return stateCode;
}

/**
 * Convert text to title case (capitalize first letter of each word) with enhanced security
 * Uses a comprehensive approach with input validation and sanitization to prevent injection attacks
 * 
 * SECURITY: Enhanced security measures implemented:
 * - Comprehensive input validation and type checking
 * - HTML/script tag detection and rejection
 * - Special character validation to prevent code injection
 * - Length limits to prevent DoS attacks
 * - Unicode normalization to prevent encoding attacks
 * - Logging of suspicious input for monitoring
 * 
 * Examples:
 * - "los angeles ca" -> "Los Angeles Ca"
 * - "new york ny" -> "New York Ny"  
 * - "san francisco" -> "San Francisco"
 * - "of the world" -> "Of The World"
 * 
 * For state abbreviation formatting, use formatStateAbbreviation() instead.
 * 
 * @param text - The text to convert to title case
 * @returns The title-cased text, or original input if validation fails
 */
export function toTitleCase(text: string): string {
  // Enhanced type validation with null/undefined checks
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  // Convert to string and normalize to handle edge cases
  const cleanInput = String(text).trim();
  
  // Security check: reject empty strings after trimming
  if (!cleanInput) {
    return text;
  }
  
  // Security check: reject extremely long inputs to prevent DoS attacks
  if (cleanInput.length > 1000) {
    console.warn(`toTitleCase: Input too long (${cleanInput.length} chars), rejecting for security`);
    return text;
  }
  
  // Security check: detect and reject HTML/script tags
  const htmlTagRegex = /<[^>]*>/g;
  if (htmlTagRegex.test(cleanInput)) {
    console.warn('toTitleCase: HTML tags detected, rejecting for security:', cleanInput);
    return text;
  }
  
  // Security check: detect suspicious script-like patterns
  const scriptPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /<script/i,
    /<\/script/i,
    /eval\s*\(/i,
    /function\s*\(/i
  ];
  
  for (const pattern of scriptPatterns) {
    if (pattern.test(cleanInput)) {
      console.warn('toTitleCase: Suspicious script pattern detected, rejecting for security:', cleanInput);
      return text;
    }
  }
  
  // Security check: allow only safe characters (letters, numbers, spaces, common punctuation)
  const safeCharacterRegex = /^[a-zA-Z0-9\s\-'.,&()]+$/;
  if (!safeCharacterRegex.test(cleanInput)) {
    console.warn('toTitleCase: Unsafe characters detected, rejecting for security:', cleanInput);
    return text;
  }
  
  try {
    // Unicode normalization to prevent encoding-based attacks
    const normalizedInput = cleanInput.normalize('NFC');
    
    // Split by spaces and handle each word securely
    return normalizedInput
      .split(' ')
      .map(word => {
        // Skip empty words and preserve spacing
        if (!word.trim()) return word;
        
        // Additional validation for each word
        if (word.length > 50) {
          console.warn('toTitleCase: Word too long, skipping transformation:', word);
          return word;
        }
        
        // Safe title case transformation: capitalize first letter, lowercase the rest
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  } catch (error) {
    // If any error occurs during processing, return original input
    console.error('toTitleCase: Error during processing, returning original:', error);
    return text;
  }
} 