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
  // Debug: Log the date parameter to see what's being passed
  console.log('DEBUG - formatCampDate called with:', {
    date: date,
    type: typeof date,
    isDate: date instanceof Date,
    dateValue: date?.toString()
  });

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
    const value = date.toISOString(); // Store as ISO string for database

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
 * Convert a Date object to ISO string for database storage
 */
export function dateToISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Convert an ISO string from database to Date object
 */
export function isoStringToDate(isoString: string): Date {
  // DEBUG: Log the input
  console.log('DEBUG - isoStringToDate called with:', {
    isoString: isoString,
    type: typeof isoString
  });

  if (!isoString) return PRESENT_DATE;
  try {
    const date = new Date(isoString);
    const isValid = !isNaN(date.getTime());
    
    // DEBUG: Log the result
    console.log('DEBUG - isoStringToDate result:', {
      input: isoString,
      date: date,
      isValid: isValid,
      isDate: date instanceof Date
    });
    
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