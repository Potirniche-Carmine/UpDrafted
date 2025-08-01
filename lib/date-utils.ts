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

  return dateObj.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
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
 * Convert a date string to Date object
 */
export function isoStringToDate(dateString: string): Date {
  if (!dateString) return PRESENT_DATE;
  
  try {
    // Handle YYYY-MM-DD format (from frontend dropdowns)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed
      return date;
    }
    
    // Handle ISO string format (from database)
    const date = new Date(dateString);
    const isValid = !isNaN(date.getTime());
    
    return isValid ? date : PRESENT_DATE;
  } catch (error) {
    console.error('DEBUG - isoStringToDate error:', error);
    return PRESENT_DATE;
  }
}

/**
 * Check if a date represents "Present"
 */
export function isPresentDate(date: Date | string): boolean {
  // Handle both Date objects and strings
  if (typeof date === 'string') {
    return date === '9999-12-31' || date === '9999-12-31T00:00:00.000Z';
  }
  
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }
  
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
 * Convert text to title case (capitalize first letter of each word)
 * Handles common cases like "los angeles" -> "Los Angeles"
 * Preserves existing capitalization if already properly formatted
 */
export function toTitleCase(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Split by spaces and handle each word
  return text
    .split(' ')
    .map(word => {
      // Skip empty words
      if (!word.trim()) return word;
      
      // Handle special cases for state abbreviations and common words
      const lowerWord = word.toLowerCase();
      
      // Keep state abbreviations in uppercase
      if (['ca', 'tx', 'ny', 'fl', 'il', 'pa', 'oh', 'ga', 'nc', 'mi', 'nj', 'va', 'wa', 'az', 'ma', 'tn', 'in', 'mo', 'md', 'co', 'or', 'wi', 'mn', 'sc', 'al', 'la', 'ky', 'ct', 'ia', 'ar', 'ut', 'nv', 'ms', 'ks', 'ne', 'id', 'hi', 'nh', 'me', 'ri', 'mt', 'de', 'sd', 'nd', 'ak', 'vt', 'wy', 'wv'].includes(lowerWord)) {
        return word.toUpperCase();
      }
      
      // Handle common words that should be lowercase in titles (except first word)
      const lowercaseWords = ['of', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'within', 'without', 'against', 'toward', 'towards', 'upon', 'across', 'behind', 'beneath', 'beside', 'beyond', 'inside', 'outside', 'under', 'over'];
      
      if (lowercaseWords.includes(lowerWord)) {
        return word.toLowerCase();
      }
      
      // Capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
} 