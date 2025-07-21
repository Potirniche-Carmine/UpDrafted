export interface ConferencesByDivision {
  [division: string]: string[];
}

// Comprehensive conference data organized by division
export const CONFERENCES_BY_DIVISION: ConferencesByDivision = {
  'NCAA Division I': [
    // Power 5 Conferences
    'Atlantic Coast Conference (ACC)',
    'Big Ten Conference',
    'Big 12 Conference',
    'Pac-12 Conference',
    'Southeastern Conference (SEC)',
    
    // Group of 5 Conferences
    'American Athletic Conference (AAC)',
    'Conference USA (C-USA)',
    'Mid-American Conference (MAC)',
    'Mountain West Conference (MW)',
    'Sun Belt Conference (SBC)',
    
    // FCS Conferences
    'Big Sky Conference',
    'Big South Conference',
    'Colonial Athletic Association (CAA)',
    'Ivy League',
    'Missouri Valley Football Conference (MVFC)',
    'Northeast Conference (NEC)',
    'Ohio Valley Conference (OVC)',
    'Patriot League',
    'Pioneer Football League',
    'Southern Conference (SoCon)',
    'Southland Conference',
    'Western Athletic Conference (WAC)',
    
    // Basketball-focused
    'Atlantic 10 Conference (A-10)',
    'Big East Conference',
    'Horizon League',
    'Metro Atlantic Athletic Conference (MAAC)',
    'Summit League',
    'West Coast Conference (WCC)',
    
    // Independent
    'Independent'
  ],
  
  'NCAA Division II': [
    'Central Atlantic Collegiate Conference (CACC)',
    'Conference Carolinas',
    'Great American Conference (GAC)',
    'Great Lakes Intercollegiate Athletic Conference (GLIAC)',
    'Great Lakes Valley Conference (GLVC)',
    'Great Northwest Athletic Conference (GNAC)',
    'Gulf South Conference (GSC)',
    'Lone Star Conference (LSC)',
    'Mid-America Intercollegiate Athletics Association (MIAA)',
    'Northeast-10 Conference (NE-10)',
    'Northern Sun Intercollegiate Conference (NSIC)',
    'Pacific West Conference (PacWest)',
    'Peach Belt Conference',
    'Pennsylvania State Athletic Conference (PSAC)',
    'Rocky Mountain Athletic Conference (RMAC)',
    'South Atlantic Conference (SAC)',
    'Southern Intercollegiate Athletic Conference (SIAC)',
    'Sunshine State Conference (SSC)',
    'Independent'
  ],
  
  'NCAA Division III': [
    'Allegheny Mountain Collegiate Conference (AMCC)',
    'American Rivers Conference',
    'Centennial Conference',
    'City University of New York Athletic Conference (CUNYAC)',
    'Colonial States Athletic Conference (CSAC)',
    'Commonwealth Coast Conference (CCC)',
    'Empire 8',
    'Heartland Collegiate Athletic Conference (HCAC)',
    'Liberty League',
    'Little East Conference',
    'Massachusetts State Collegiate Athletic Conference (MASCAC)',
    'Middle Atlantic Conferences (MAC)',
    'Midwest Conference (MWC)',
    'Minnesota Intercollegiate Athletic Conference (MIAC)',
    'New England Small College Athletic Conference (NESCAC)',
    'New England Women\'s and Men\'s Athletic Conference (NEWMAC)',
    'New Jersey Athletic Conference (NJAC)',
    'North Coast Athletic Conference (NCAC)',
    'Northern Athletics Collegiate Conference (NACC)',
    'Northwest Conference (NWC)',
    'Ohio Athletic Conference (OAC)',
    'Old Dominion Athletic Conference (ODAC)',
    'Presidents\' Athletic Conference (PAC)',
    'Southern Athletic Association (SAA)',
    'Southern California Intercollegiate Athletic Conference (SCIAC)',
    'State University of New York Athletic Conference (SUNYAC)',
    'University Athletic Association (UAA)',
    'Upper Midwest Athletic Conference (UMAC)',
    'USA South Athletic Conference',
    'Wisconsin Intercollegiate Athletic Conference (WIAC)',
    'Independent'
  ],
  
  'NAIA': [
    'Appalachian Athletic Conference (AAC)',
    'Cascade Collegiate Conference',
    'Continental Athletic Conference (CAC)',
    'Crossroads League',
    'Frontier Conference',
    'Golden State Athletic Conference (GSAC)',
    'Great Plains Athletic Conference (GPAC)',
    'Heart of America Athletic Conference (HAAC)',
    'Kansas Collegiate Athletic Conference (KCAC)',
    'Mid-South Conference',
    'Midlands Collegiate Athletic Conference (MCAC)',
    'North Star Athletic Association (NSAA)',
    'Red River Athletic Conference (RRAC)',
    'River States Conference (RSC)',
    'Sooner Athletic Conference (SAC)',
    'Southern States Athletic Conference (SSAC)',
    'Sun Conference',
    'TranSouth Athletic Conference (TranSouth)',
    'Wolverine-Hoosier Athletic Conference (WHAC)',
    'Independent'
  ],
  
  'NJCAA Division I': [
    'Eastern Conference',
    'Mid-Atlantic Conference',
    'Midwest Conference',
    'Mon-Dak Conference',
    'Northeast Conference',
    'Northwest Conference',
    'Region I',
    'Region II',
    'Region III',
    'Region IV',
    'Region V',
    'Region VI',
    'Region VII',
    'Region VIII',
    'Region IX',
    'Region X',
    'Southern Conference',
    'Southwest Conference',
    'Western Conference',
    'Independent'
  ],
  
  'NJCAA Division II': [
    'Central Conference',
    'Eastern Conference',
    'Great Lakes Conference',
    'Mid-Atlantic Conference',
    'Midwest Conference',
    'Northeast Conference',
    'Pacific Conference',
    'Region I',
    'Region II',
    'Region III',
    'Region IV',
    'Region V',
    'Region VI',
    'Region VII',
    'Region VIII',
    'Southern Conference',
    'Western Conference',
    'Independent'
  ],
  
  'NJCAA Division III': [
    'Central Conference',
    'Eastern Conference',
    'Great Lakes Conference',
    'Mid-Atlantic Conference',
    'Midwest Conference',
    'Northeast Conference',
    'Region I',
    'Region II',
    'Region III',
    'Region IV',
    'Region V',
    'Region VI',
    'Southern Conference',
    'Western Conference',
    'Independent'
  ],
  
  'Junior College': [
    'California Community College Athletic Association (CCCAA)',
    'Northwest Athletic Conference (NWAC)',
    'Independent'
  ],
  
  'Community College': [
    'California Community College Athletic Association (CCCAA)',
    'Northwest Athletic Conference (NWAC)',
    'Independent'
  ],
  
  'High School': [
    // High schools typically don't have "conferences" in the same way
    // But they may have leagues or districts
    'Local League/District'
  ],
  
  'Club Sports': [
    'National Club Baseball Association (NCBA)',
    'National Intramural-Recreational Sports Association (NIRSA)',
    'College Club Sports',
    'Independent'
  ]
};

// Helper function to get conferences for a specific division
export function getConferencesForDivision(division: string): string[] {
  return CONFERENCES_BY_DIVISION[division] || [];
}

// Helper function to check if a division has conferences
export function divisionHasConferences(division: string): boolean {
  return division !== 'High School' && CONFERENCES_BY_DIVISION[division]?.length > 0;
}

// Helper function to get all unique conferences
export function getAllConferences(): string[] {
  const allConferences = new Set<string>();
  Object.values(CONFERENCES_BY_DIVISION).forEach(conferences => {
    conferences.forEach(conference => allConferences.add(conference));
  });
  return Array.from(allConferences).sort();
}

// Helper to search conferences across all divisions
export function searchConferences(searchTerm: string): { conference: string; division: string }[] {
  const results: { conference: string; division: string }[] = [];
  const lowercaseSearch = searchTerm.toLowerCase();
  
  Object.entries(CONFERENCES_BY_DIVISION).forEach(([division, conferences]) => {
    conferences.forEach(conference => {
      if (conference.toLowerCase().includes(lowercaseSearch)) {
        results.push({ conference, division });
      }
    });
  });
  
  return results.sort((a, b) => a.conference.localeCompare(b.conference));
}
