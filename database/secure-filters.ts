import { sanitizeText } from '@/utils/sanitization';

// Safe height parsing helper - returns total inches or null
export function parseHeightToInches(heightStr: string | null | undefined): number | null {
  if (!heightStr || typeof heightStr !== 'string') return null;
  
  // Trim whitespace
  const trimmed = heightStr.trim();
  
  // Match format like "6'2"" - exactly digits, apostrophe, digits, quote
  const heightMatch = trimmed.match(/^(\d{1,2})'(\d{1,2})"$/);
  if (!heightMatch) return null;
  
  const feet = parseInt(heightMatch[1], 10);
  const inches = parseInt(heightMatch[2], 10);
  
  // Validate reasonable ranges
  if (feet < 3 || feet > 8 || inches < 0 || inches > 11) return null;
  
  return feet * 12 + inches;
}

// Safe weight parsing helper - returns weight in pounds or null
export function parseWeightToPounds(weightStr: string | null | undefined): number | null {
  if (!weightStr || typeof weightStr !== 'string') return null;
  
  // Trim whitespace
  const trimmed = weightStr.trim();
  
  // Match format like "180 lbs" or just "180"
  const weightMatch = trimmed.match(/^(\d{1,3})( lbs)?$/);
  if (!weightMatch) return null;
  
  const weight = parseInt(weightMatch[1], 10);
  
  // Validate reasonable ranges (50 to 500 pounds)
  if (weight < 50 || weight > 500) return null;
  
  return weight;
}

// Type for raw filter input
interface RawFilterInput {
  sports?: unknown;
  divisions?: unknown;
  countries?: unknown;
  states?: unknown;
  positions?: unknown;
  graduatingClasses?: unknown;
  conferences?: unknown;
  requestTypes?: unknown;
  minHeight?: unknown;
  minWeight?: unknown;
}

// Type for validated filters
interface ValidatedFilters {
  sports: string[];
  divisions: string[];
  countries: string[];
  states: string[];
  positions: string[];
  graduatingClasses: string[];
  conferences: string[];
  requestTypes: string[];
  minHeight: number | undefined;
  minWeight: number | undefined;
}

// Type for connection data
interface ConnectionData {
  otherUser?: {
    sport?: string;
    division?: string;
    country?: string;
    state?: string;
    role?: string;
    positions?: unknown;
    graduationYear?: number | null;
    height?: string;
    weight?: string;
  };
}

// Secure filter validation for connections
export function validateAndSanitizeFilters(filters: RawFilterInput): ValidatedFilters {
  // Validate and sanitize array filters
  const validateArray = (arr: unknown, maxLength = 50): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr
      .slice(0, maxLength) // Limit array size
      .map((item: unknown) => {
        if (typeof item !== 'string') return '';
        return sanitizeText(item);
      })
      .filter(Boolean);
  };

  // Validate numeric filters
  const validateNumber = (num: unknown, min: number, max: number): number | undefined => {
    if (typeof num !== 'number') return undefined;
    if (num < min || num > max) return undefined;
    return Math.floor(num); // Ensure integer
  };

  return {
    sports: validateArray(filters.sports),
    divisions: validateArray(filters.divisions),
    countries: validateArray(filters.countries),
    states: validateArray(filters.states),
    positions: validateArray(filters.positions),
    graduatingClasses: validateArray(filters.graduatingClasses),
    conferences: validateArray(filters.conferences),
    requestTypes: validateArray(filters.requestTypes),
    minHeight: validateNumber(filters.minHeight, 60, 96),
    minWeight: validateNumber(filters.minWeight, 100, 500),
  };
}

// Secure connection filtering function
export function secureFilterConnection(
  connection: ConnectionData,
  filters: ValidatedFilters
): boolean {
  if (!connection?.otherUser) return false;
  
  const { otherUser } = connection;

  // Sports filter - validate input
  if (filters.sports.length > 0) {
    const userSport = typeof otherUser.sport === 'string' ? sanitizeText(otherUser.sport) : '';
    if (!userSport || !filters.sports.includes(userSport)) {
      return false;
    }
  }

  // Divisions filter - validate input
  if (filters.divisions.length > 0) {
    const userDivision = typeof otherUser.division === 'string' ? sanitizeText(otherUser.division) : '';
    if (!userDivision || !filters.divisions.includes(userDivision)) {
      return false;
    }
  }

  // Countries filter - validate input
  if (filters.countries.length > 0) {
    const userCountry = typeof otherUser.country === 'string' 
      ? sanitizeText(otherUser.country) 
      : 'United States'; // Safe default
    if (!filters.countries.includes(userCountry)) {
      return false;
    }
  }

  // States filter - validate input
  if (filters.states.length > 0) {
    const userCountry = typeof otherUser.country === 'string' 
      ? sanitizeText(otherUser.country) 
      : 'United States';
    if (userCountry === 'United States') {
      const userState = typeof otherUser.state === 'string' ? sanitizeText(otherUser.state) : '';
      if (!userState || !filters.states.includes(userState)) {
        return false;
      }
    }
  }

  // Positions filter - validate input and user role
  if (filters.positions.length > 0 && otherUser.role === 'athlete') {
    if (!Array.isArray(otherUser.positions)) {
      return false;
    }
    const userPositions = otherUser.positions
      .filter((pos: unknown) => typeof pos === 'string')
      .map((pos: string) => sanitizeText(pos));
    
    if (!userPositions.some((pos: string) => filters.positions.includes(pos))) {
      return false;
    }
  }

  // Graduating classes filter - validate input and user role
  if (filters.graduatingClasses.length > 0 && otherUser.role === 'athlete') {
    const graduationYear = otherUser.graduationYear;
    if (typeof graduationYear !== 'number' || graduationYear === null ||
        !filters.graduatingClasses.includes(graduationYear.toString())) {
      return false;
    }
  }

  // Request types filter - validate input
  if (filters.requestTypes.length > 0) {
    const userRole = typeof otherUser.role === 'string' ? sanitizeText(otherUser.role) : '';
    if (!userRole || !filters.requestTypes.includes(userRole)) {
      return false;
    }
  }

  // Height filter - validate input, user role, and parse safely
  if (filters.minHeight && otherUser.role === 'athlete') {
    const userHeightInches = parseHeightToInches(otherUser.height);
    if (userHeightInches === null || userHeightInches < filters.minHeight) {
      return false;
    }
  }

  // Weight filter - validate input, user role, and parse safely
  if (filters.minWeight && otherUser.role === 'athlete') {
    const userWeightPounds = parseWeightToPounds(otherUser.weight);
    if (userWeightPounds === null || userWeightPounds < filters.minWeight) {
      return false;
    }
  }

  return true;
}
