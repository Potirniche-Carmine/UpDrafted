export interface SportPosition {
  sport: string;
  positions: string[];
  gender: 'male' | 'female' | 'coed';
}

export type SportCategory = 'mens' | 'females'; // | 'coed';

export interface CategorizedSportData {
  mens: SportPosition[];
  females: SportPosition[];
  // coed: SportPosition[];
}

export const SPORTS_DATA: SportPosition[] = [
  // Baseball
  {
    sport: 'Baseball',
    gender: 'male',
    positions: [
      'Pitcher', 'Catcher', 'First Base', 'Second Base', 'Third Base',
      'Shortstop', 'Left Field', 'Center Field', 'Right Field',
      'Designated Hitter'
    ]
  },
  // Basketball (Men's)
  {
    sport: 'Basketball (M)',
    gender: 'male',
    positions: [
      'Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'
    ]
  },
  // Basketball (Women's)
  {
    sport: 'Basketball (W)',
    gender: 'female',
    positions: [
      'Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'
    ]
  },
  // Flag Football (Women's)
  {
    sport: 'Flag Football (W)',
    gender: 'female',
    positions: [
      'Quarterback', 'Running Back', 'Wide Receiver', 'Center',
      'Guard', 'Defensive Back', 'Linebacker', 'Rusher'
    ]
  },
  // Flag Footbal (Men's)
  {
    sport: 'Flag Football (M)',
    gender: 'male',
    positions: [
      'Quarterback', 'Running Back', 'Wide Receiver', 'Center',
      'Guard', 'Defensive Back', 'Linebacker', 'Rusher'
    ]
  },
  // Cross Country (Men's)
  {
    sport: 'Cross Country (M)',
    gender: 'male',
    positions: ['Distance Runner']
  },
  // Cross Country (Women's)
  {
    sport: 'Cross Country (W)',
    gender: 'female',
    positions: ['Distance Runner']
  },
  // Football
  {
    sport: 'Football',
    gender: 'male',
    positions: [
      'Quarterback', 'Running Back', 'Fullback', 'Wide Receiver', 'Tight End',
      'Offensive Line', 'Center', 'Guard', 'Tackle',
      'Defensive End', 'Defensive Tackle', 'Nose Tackle', 'Outside Linebacker',
      'Middle Linebacker', 'Inside Linebacker', 'Cornerback', 'Safety',
      'Free Safety', 'Strong Safety', 'Kicker', 'Punter', 'Long Snapper'
    ]
  },
  // Golf (Men's)
  {
    sport: 'Golf (M)',
    gender: 'male',
    positions: ['Individual']
  },
  // Golf (Women's)
  {
    sport: 'Golf (W)',
    gender: 'female',
    positions: ['Individual']
  },
  // Ice Hockey (Men's)
  {
    sport: 'Ice Hockey (M)',
    gender: 'male',
    positions: [
      'Goalkeeper', 'Left Defense', 'Right Defense', 'Left Wing',
      'Right Wing', 'Center'
    ]
  },
  // Ice Hockey (Women's)
  {
    sport: 'Ice Hockey (W)',
    gender: 'female',
    positions: [
      'Goalkeeper', 'Left Defense', 'Right Defense', 'Left Wing',
      'Right Wing', 'Center'
    ]
  },
  // Lacrosse (Men's)
  {
    sport: 'Lacrosse (M)',
    gender: 'male',
    positions: [
      'Goalkeeper', 'Defender', 'Long Stick Midfielder', 'Midfielder',
      'Attackman', 'Face-off Specialist'
    ]
  },
  // Lacrosse (Women's)
  {
    sport: 'Lacrosse (W)',
    gender: 'female',
    positions: [
      'Goalkeeper', 'Defender', 'Midfielder', 'Attacker'
    ]
  },
  // Rugby (Men's)
  {
    sport: 'Rugby (M)',
    gender: 'male',
    positions: [
      'Prop', 'Hooker', 'Lock', 'Flanker', 'Number 8',
      'Scrum-half', 'Fly-half', 'Center', 'Wing', 'Fullback'
    ]
  },
  // Rugby (Women's)
  {
    sport: 'Rugby (W)',
    gender: 'female',
    positions: [
      'Prop', 'Hooker', 'Lock', 'Flanker', 'Number 8',
      'Scrum-half', 'Fly-half', 'Center', 'Wing', 'Fullback'
    ]
  },
  // Ski and Snowboard (Men's)
  {
    sport: 'Ski and Snowboard (M)',
    gender: 'male',
    positions: [
      'Alpine Skiing', 'Cross Country Skiing', 'Freestyle Skiing',
      'Snowboarding', 'Ski Jumping', 'Nordic Combined'
    ]
  },
  // Ski and Snowboard (Women's)
  {
    sport: 'Ski and Snowboard (W)',
    gender: 'female',
    positions: [
      'Alpine Skiing', 'Cross Country Skiing', 'Freestyle Skiing',
      'Snowboarding', 'Ski Jumping', 'Nordic Combined'
    ]
  },
  // Soccer (Men's)
  {
    sport: 'Soccer (M)',
    gender: 'male',
    positions: [
      'Goalkeeper', 'Center Back', 'Left Back', 'Right Back', 'Sweeper',
      'Defensive Midfielder', 'Central Midfielder', 'Attacking Midfielder',
      'Left Midfielder', 'Right Midfielder', 'Left Wing', 'Right Wing',
      'Striker', 'Center Forward'
    ]
  },
  // Soccer (Women's)
  {
    sport: 'Soccer (W)',
    gender: 'female',
    positions: [
      'Goalkeeper', 'Center Back', 'Left Back', 'Right Back', 'Sweeper',
      'Defensive Midfielder', 'Central Midfielder', 'Attacking Midfielder',
      'Left Midfielder', 'Right Midfielder', 'Left Wing', 'Right Wing',
      'Striker', 'Center Forward'
    ]
  },
  // Swimming (Men's)
  {
    sport: 'Swimming (M)',
    gender: 'male',
    positions: [
      'Freestyle (Sprint)', 'Freestyle (Distance)', 'Backstroke', 'Breaststroke',
      'Butterfly', 'Individual Medley', 'Relay'
    ]
  },
  // Swimming (Women's)
  {
    sport: 'Swimming (W)',
    gender: 'female',
    positions: [
      'Freestyle (Sprint)', 'Freestyle (Distance)', 'Backstroke', 'Breaststroke',
      'Butterfly', 'Individual Medley', 'Relay'
    ]
  },
  // Tennis (Men's)
  {
    sport: 'Tennis (M)',
    gender: 'male',
    positions: ['Singles', 'Doubles']
  },
  // Tennis (Women's)
  {
    sport: 'Tennis (W)',
    gender: 'female',
    positions: ['Singles', 'Doubles']
  },
  // Track and Field (Men's)
  {
    sport: 'Track and Field (M)',
    gender: 'male',
    positions: [
      'Sprints (100m, 200m)', 'Middle Distance (400m, 800m)', 
      'Distance (1500m, 5000m, 10000m)', 'Hurdles', 'Steeplechase',
      'Relay', 'High Jump', 'Pole Vault', 'Long Jump', 'Triple Jump',
      'Shot Put', 'Discus', 'Hammer', 'Javelin', 'Decathlon'
    ]
  },
  // Track and Field (Women's)
  {
    sport: 'Track and Field (W)',
    gender: 'female',
    positions: [
      'Sprints (100m, 200m)', 'Middle Distance (400m, 800m)', 
      'Distance (1500m, 5000m, 10000m)', 'Hurdles', 'Steeplechase',
      'Relay', 'High Jump', 'Pole Vault', 'Long Jump', 'Triple Jump',
      'Shot Put', 'Discus', 'Hammer', 'Javelin', 'Heptathlon'
    ]
  },
  // Volleyball
  {
    sport: 'Volleyball (W)',
    gender: 'female',
    positions: [
      'Outside Hitter', 'Middle Blocker', 'Opposite Hitter', 'Setter',
      'Libero', 'Defensive Specialist'
    ]
  }
];

export const DIVISIONS = [
  'NCAA Division I',
  'NCAA Division II', 
  'NCAA Division III',
  'NAIA',
  'NJCAA Division I',
  'NJCAA Division II',
  'NJCAA Division III',
  'Junior College',
  'Community College',
  'High School',
  'Club Sports'
];

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
  // U.S. Territories
  'American Samoa', 'Guam', 'Northern Mariana Islands', 'Puerto Rico', 'U.S. Virgin Islands'
];

export const COUNTRIES = [
  'United States',
  'Canada',
  'Mexico',
  // Major Rugby Nations
  'New Zealand',
  'Australia',
  'South Africa',
  'England',
  'Wales',
  'Scotland',
  'Ireland',
  'France',
  'Italy',
  'Argentina',
  'Japan',
  'Fiji',
  'Samoa',
  'Tonga',
  'Georgia',
  'Romania',
  'Uruguay',
  // Other Major Sports Nations
  'Germany',
  'Netherlands',
  'Spain',
  'Portugal',
  'Brazil',
  'Chile',
  'Colombia',
  'Ecuador',
  'Peru',
  'Venezuela',
  'United Kingdom',
  'Belgium',
  'Switzerland',
  'Austria',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Poland',
  'Czech Republic',
  'Hungary',
  'Slovakia',
  'Slovenia',
  'Croatia',
  'Serbia',
  'Bulgaria',
  'Greece',
  'Turkey',
  'Russia',
  'Ukraine',
  'Kenya',
  'Ethiopia',
  'Morocco',
  'Nigeria',
  'Ghana',
  'Egypt',
  'Tunisia',
  'Algeria',
  'China',
  'South Korea',
  'Thailand',
  'Malaysia',
  'Singapore',
  'Philippines',
  'Indonesia',
  'Vietnam',
  'India',
  'Pakistan',
  'Bangladesh',
  'Sri Lanka',
  'Other'
];

// Graduation years for athlete profiles (not recruiting needs)
export const GRADUATION_YEARS = Array.from(
  { length: 8 }, 
  (_, i) => new Date().getFullYear() + i
);

// Get graduation years that are valid for high school athletes (juniors and above)
export function getValidHighSchoolGraduationYears(): number[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  
  // Use June 15th as the cutoff date when coaches can start talking to players
  // This simplifies the logic and aligns with NCAA recruiting calendar
  const isAfterJune15 = currentMonth > 5 || (currentMonth === 5 && currentDay >= 15); // June 15th and after
  
  if (isAfterJune15) {
    // After June 15th: Show rising seniors and rising juniors
    // Remove current year graduates, add next cohort
    return [currentYear + 1, currentYear + 2];
  } else {
    // Before June 15th: Show current seniors and juniors  
    return [currentYear, currentYear + 1];
  }
}

// Check if a graduation year is valid for high school athletes
export function isValidHighSchoolGraduationYear(year: number): boolean {
  const validYears = getValidHighSchoolGraduationYears();
  return validYears.includes(year);
}

// Get error message for invalid high school graduation years
export function getHighSchoolGraduationYearErrorMessage(): string {
  const validYears = getValidHighSchoolGraduationYears();
  return `High school athletes must be juniors or above (Class of ${validYears.join(', ')})`;
}

// Get filtered graduation years for high school athletes
export function getGraduationYearsForEducationLevel(educationLevel: string): number[] {
  if (educationLevel === 'high_school') {
    return getValidHighSchoolGraduationYears();
  }
  return GRADUATION_YEARS;
}

// Student Classification Options
export const STUDENT_CLASSIFICATIONS = [
  'high_school',
  'university_transfers', 
  'juco_students',
  'graduate_transfers',
  'international_students'
] as const;

export type StudentClassification = typeof STUDENT_CLASSIFICATIONS[number];

// Get display names for student classifications
export function getStudentClassificationDisplayName(classification: StudentClassification): string {
  const displayNames: Record<StudentClassification, string> = {
    'high_school': 'High School',
    'university_transfers': 'University Transfers',
    'juco_students': 'JUCO Students',
    'graduate_transfers': 'Graduate Transfers',
    'international_students': 'International Students'
  };
  
  return displayNames[classification];
}

// Get all student classification display options
export function getStudentClassificationOptions(): Array<{ value: StudentClassification; label: string }> {
  return STUDENT_CLASSIFICATIONS.map(classification => ({
    value: classification,
    label: getStudentClassificationDisplayName(classification)
  }));
}

export function getPositionsForSport(sport: string): string[] {
  const sportData = SPORTS_DATA.find(s => s.sport === sport);
  return sportData?.positions || [];
}

export function getSportsList(): string[] {
  return SPORTS_DATA.map(sport => sport.sport);
}

// Get sports categorized by gender
export function getCategorizedSports(): CategorizedSportData {
  const categorized: CategorizedSportData = {
    mens: [],
    females: []
    // coed: []
  };

  SPORTS_DATA.forEach(sport => {
    switch (sport.gender) {
      case 'male':
        categorized.mens.push(sport);
        break;
      case 'female':
        categorized.females.push(sport);
        break;
      // case 'coed':
      //   categorized.coed.push(sport);
      //   break;
    }
  });

  return categorized;
}

// Get sports list ordered by user's gender preference (their sport category appears first)
export function getSportsListByGenderPreference(userGender?: 'male' | 'female' | null, userSport?: string): string[] {
  const categorized = getCategorizedSports();
  
  // If user has a sport, determine their gender category from it
  let preferredCategory: SportCategory | null = null;
  if (userSport) {
    const sportData = SPORTS_DATA.find(s => s.sport === userSport);
    if (sportData) {
      preferredCategory = sportData.gender === 'male' ? 'mens' : 'females';
      // sportData.gender === 'female' ? 'females' : 'coed';
    }
  }
  
  // If no sport but have gender, use that
  if (!preferredCategory && userGender) {
    preferredCategory = userGender === 'male' ? 'mens' : 'females';
  }

  // Order sports based on preference
  let orderedSports: string[] = [];
  
  if (preferredCategory === 'mens') {
    orderedSports = [
      ...categorized.mens.map(s => s.sport),
      // ...categorized.coed.map(s => s.sport),
      ...categorized.females.map(s => s.sport)
    ];
  } else if (preferredCategory === 'females') {
    orderedSports = [
      ...categorized.females.map(s => s.sport),
      // ...categorized.coed.map(s => s.sport),
      ...categorized.mens.map(s => s.sport)
    ];
  } else {
    // Default order: coed first, then alphabetical by gender
    // Default order: mens first, then females
    orderedSports = [
      // ...categorized.coed.map(s => s.sport),
      ...categorized.mens.map(s => s.sport),
      ...categorized.females.map(s => s.sport)
    ];
  }

  return orderedSports;
}

// Get sports for a specific category
export function getSportsForCategory(category: SportCategory): SportPosition[] {
  const categorized = getCategorizedSports();
  return categorized[category];
}

// Get sport category from sport name
export function getSportCategory(sport: string): SportCategory | null {
  const sportData = SPORTS_DATA.find(s => s.sport === sport);
  if (!sportData) return null;
  
  return sportData.gender === 'male' ? 'mens' : 'females';
  // sportData.gender === 'female' ? 'females' : 'coed';
}

// Check if user can select a sport based on their gender/role
export function canUserSelectSport(sport: string, userGender?: 'male' | 'female' | null, userRole?: string): boolean {
  const sportData = SPORTS_DATA.find(s => s.sport === sport);
  if (!sportData) return false;
  
  // Recruiters can select any sport
  if (userRole === 'recruiter') return true;
  
  // Coed sports can be selected by anyone
  if (sportData.gender === 'coed') return true;
  
  // Gender-specific sports require matching gender
  if (!userGender) return true; // Allow if gender not specified
  
  return (sportData.gender === 'male' && userGender === 'male') ||
         (sportData.gender === 'female' && userGender === 'female');
}

export const PERFORMANCE_MEASURABLES: { [key: string]: string[] } = {
  'Baseball': [
    '60 Yard Dash', 'Exit Velocity', 'Pop Time (C)', 'Throwing Velocity',
    'Batting Average', 'On Base %', 'Slugging %', 'Home Runs', 'RBIs',
    'ERA', 'WHIP', 'Strikeouts', 'Wins', 'Saves'
  ],
  'Basketball (M)': [
    'Vertical Jump', 'Lane Agility', 'Three Quarter Sprint', 'Standing Reach',
    'Points Per Game', 'Rebounds Per Game', 'Assists Per Game', 'Field Goal %',
    'Free Throw %', '3-Point %', 'Steals Per Game', 'Blocks Per Game'
  ],
  'Basketball (W)': [
    'Vertical Jump', 'Lane Agility', 'Three Quarter Sprint', 'Standing Reach',
    'Points Per Game', 'Rebounds Per Game', 'Assists Per Game', 'Field Goal %',
    'Free Throw %', '3-Point %', 'Steals Per Game', 'Blocks Per Game'
  ],
  'Flag Football (W)': [
    '40 Yard Dash', 'Agility T-Test', 'Vertical Jump', 'Broad Jump',
    'Passing Accuracy', 'Passing Yards', 'Rushing Yards', 'Touchdowns',
    'Interceptions', 'Flag Pulls', 'Receptions', 'Receiving Yards'
  ],
  'Flag Football (M)': [
    '40 Yard Dash', 'Agility T-Test', 'Vertical Jump', 'Broad Jump',
    'Passing Accuracy', 'Passing Yards', 'Rushing Yards', 'Touchdowns',
    'Interceptions', 'Flag Pulls', 'Receptions', 'Receiving Yards'
  ],
  'Cross Country (M)': [
    '5K Time', '8K Time', '10K Time', 'Mile Time', '3200m Time', 
    'Half Marathon Time', 'VO2 Max', 'Lactate Threshold'
  ],
  'Cross Country (W)': [
    '5K Time', '6K Time', '8K Time', 'Mile Time', '3200m Time', 
    'Half Marathon Time', 'VO2 Max', 'Lactate Threshold'
  ],
  'Football': [
    '40 Yard Dash', 'Bench Press', 'Squat', 'Vertical Jump', 'Broad Jump',
    '20 Yard Shuttle', '3-Cone Drill', 'Standing Long Jump', 'Pro Agility',
    'Hand Size', 'Arm Length', 'Wing Span'
  ],
  'Golf (M)': [
    'Handicap Index', 'Scoring Average', 'Driving Distance', 'Driving Accuracy %',
    'Greens in Regulation %', 'Putting Average', 'Sand Save %', 'Tournament Wins',
    'Top 10 Finishes', 'Lowest Round'
  ],
  'Golf (W)': [
    'Handicap Index', 'Scoring Average', 'Driving Distance', 'Driving Accuracy %',
    'Greens in Regulation %', 'Putting Average', 'Sand Save %', 'Tournament Wins',
    'Top 10 Finishes', 'Lowest Round'
  ],
  'Ice Hockey (M)': [
    'Skating Speed', 'Shot Speed', 'Goals Per Game', 'Assists Per Game', 'Points Per Game',
    'Plus/Minus', 'Penalty Minutes', 'Face-off %', 'Save %', 'Goals Against Average'
  ],
  'Ice Hockey (W)': [
    'Skating Speed', 'Shot Speed', 'Goals Per Game', 'Assists Per Game', 'Points Per Game',
    'Plus/Minus', 'Penalty Minutes', 'Face-off %', 'Save %', 'Goals Against Average'
  ],
  'Lacrosse (M)': [
    'Shot Speed', 'Goals Per Game', 'Assists Per Game', 'Saves %', 'Face-off %',
    'Ground Balls Per Game', 'Turnovers Per Game', 'Clear %', 'Man-up %'
  ],
  'Lacrosse (W)': [
    'Shot Speed', 'Goals Per Game', 'Assists Per Game', 'Saves %', 'Draw Controls',
    'Ground Balls Per Game', 'Turnovers Per Game', 'Free Position %'
  ],
  'Rugby (M)': [
    'Sprint Speed (40m)', 'Tackle Success %', 'Lineout Success %', 'Scrum Success %',
    'Tries Scored', 'Meters Gained', 'Turnovers Won', 'Penalties Conceded',
    'Conversions %', 'Penalty Kicks %'
  ],
  'Rugby (W)': [
    'Sprint Speed (40m)', 'Tackle Success %', 'Lineout Success %', 'Scrum Success %',
    'Tries Scored', 'Meters Gained', 'Turnovers Won', 'Penalties Conceded',
    'Conversions %', 'Penalty Kicks %'
  ],
  'Ski and Snowboard (M)': [
    'Downhill Time', 'Slalom Time', 'Giant Slalom Time', 'Super-G Time',
    'Jump Distance', 'Style Points', 'Halfpipe Score', 'Slopestyle Score',
    'Cross Country Time', 'Biathlon Accuracy'
  ],
  'Ski and Snowboard (W)': [
    'Downhill Time', 'Slalom Time', 'Giant Slalom Time', 'Super-G Time',
    'Jump Distance', 'Style Points', 'Halfpipe Score', 'Slopestyle Score',
    'Cross Country Time', 'Biathlon Accuracy'
  ],
  'Soccer (M)': [
    'Sprint Speed (40m)', 'Agility T-Test', 'Cooper Test (12 min)', 'Juggling',
    'Goals Per Season', 'Assists Per Season', 'Pass Accuracy %', 'Shots on Goal',
    'Minutes Played', 'Yellow Cards', 'Red Cards'
  ],
  'Soccer (W)': [
    'Sprint Speed (40m)', 'Agility T-Test', 'Cooper Test (12 min)', 'Juggling',
    'Goals Per Season', 'Assists Per Season', 'Pass Accuracy %', 'Shots on Goal',
    'Minutes Played', 'Yellow Cards', 'Red Cards'
  ],
  'Swimming (M)': [
    '50m Freestyle', '100m Freestyle', '200m Freestyle', '400m Freestyle', '800m Freestyle',
    '1500m Freestyle', '50m Backstroke', '100m Backstroke', '200m Backstroke',
    '50m Breaststroke', '100m Breaststroke', '200m Breaststroke', '50m Butterfly',
    '100m Butterfly', '200m Butterfly', '200m IM', '400m IM'
  ],
  'Swimming (W)': [
    '50m Freestyle', '100m Freestyle', '200m Freestyle', '400m Freestyle', '800m Freestyle',
    '1500m Freestyle', '50m Backstroke', '100m Backstroke', '200m Backstroke',
    '50m Breaststroke', '100m Breaststroke', '200m Breaststroke', '50m Butterfly',
    '100m Butterfly', '200m Butterfly', '200m IM', '400m IM'
  ],
  'Tennis (M)': [
    'Serve Speed', 'First Serve %', 'Win %', 'UTR Rating', 'Tournament Wins',
    'Sets Won', 'Games Won', 'Aces Per Match', 'Double Faults Per Match'
  ],
  'Tennis (W)': [
    'Serve Speed', 'First Serve %', 'Win %', 'UTR Rating', 'Tournament Wins',
    'Sets Won', 'Games Won', 'Aces Per Match', 'Double Faults Per Match'
  ],
  'Track and Field (M)': [
    '100m Dash', '200m Dash', '400m Dash', '800m Run', '1500m Run', '3000m Run',
    '5000m Run', '10000m Run', '110m Hurdles', '400m Hurdles', 'High Jump',
    'Pole Vault', 'Long Jump', 'Triple Jump', 'Shot Put', 'Discus', 'Hammer', 'Javelin', 'Decathlon'
  ],
  'Track and Field (W)': [
    '100m Dash', '200m Dash', '400m Dash', '800m Run', '1500m Run', '3000m Run',
    '5000m Run', '10000m Run', '100m Hurdles', '400m Hurdles', 'High Jump',
    'Pole Vault', 'Long Jump', 'Triple Jump', 'Shot Put', 'Discus', 'Hammer', 'Javelin', 'Heptathlon'
  ],
  'Volleyball (W)': [
    'Vertical Jump', 'Approach Jump', 'Block Jump', 'Kills Per Set', 'Attack %',
    'Blocks Per Set', 'Digs Per Set', 'Aces Per Set', 'Passing %', 'Serve Receive %'
  ]
};

export function getMeasurablesForSport(sport: string): string[] {
  return PERFORMANCE_MEASURABLES[sport] || ['Speed', 'Strength', 'Agility', 'Endurance'];
} 