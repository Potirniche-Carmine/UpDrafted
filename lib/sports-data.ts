export interface SportPosition {
  sport: string;
  positions: string[];
  gender: 'male' | 'female' | 'coed';
}

export const SPORTS_DATA: SportPosition[] = [
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
    sport: 'Basketball (F)',
    gender: 'female',
    positions: [
      'Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'
    ]
  },
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
  // Softball
  {
    sport: 'Softball',
    gender: 'female',
    positions: [
      'Pitcher', 'Catcher', 'First Base', 'Second Base', 'Third Base',
      'Shortstop', 'Left Field', 'Center Field', 'Right Field',
      'Designated Player', 'Flex'
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
    sport: 'Soccer (F)',
    gender: 'female',
    positions: [
      'Goalkeeper', 'Center Back', 'Left Back', 'Right Back', 'Sweeper',
      'Defensive Midfielder', 'Central Midfielder', 'Attacking Midfielder',
      'Left Midfielder', 'Right Midfielder', 'Left Wing', 'Right Wing',
      'Striker', 'Center Forward'
    ]
  },
  // Track and Field
  {
    sport: 'Track and Field',
    gender: 'coed',
    positions: [
      'Sprints (100m, 200m)', 'Middle Distance (400m, 800m)', 
      'Distance (1500m, 5000m, 10000m)', 'Hurdles', 'Steeplechase',
      'Relay', 'High Jump', 'Pole Vault', 'Long Jump', 'Triple Jump',
      'Shot Put', 'Discus', 'Hammer', 'Javelin', 'Heptathlon', 'Decathlon'
    ]
  },
  // Cross Country
  {
    sport: 'Cross Country',
    gender: 'coed',
    positions: ['Distance Runner']
  },
  // Swimming
  {
    sport: 'Swimming',
    gender: 'coed',
    positions: [
      'Freestyle (Sprint)', 'Freestyle (Distance)', 'Backstroke', 'Breaststroke',
      'Butterfly', 'Individual Medley', 'Relay'
    ]
  },
  // Tennis
  {
    sport: 'Tennis',
    gender: 'coed',
    positions: ['Singles', 'Doubles']
  },
  // Golf
  {
    sport: 'Golf',
    gender: 'coed',
    positions: ['Individual']
  },
  // Volleyball (Women's)
  {
    sport: 'Volleyball',
    gender: 'female',
    positions: [
      'Outside Hitter', 'Middle Blocker', 'Opposite Hitter', 'Setter',
      'Libero', 'Defensive Specialist'
    ]
  },
  // Wrestling
  {
    sport: 'Wrestling',
    gender: 'male',
    positions: [
      '125 lbs', '133 lbs', '141 lbs', '149 lbs', '157 lbs', '165 lbs',
      '174 lbs', '184 lbs', '197 lbs', '285 lbs'
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
    sport: 'Lacrosse (F)',
    gender: 'female',
    positions: [
      'Goalkeeper', 'Defender', 'Midfielder', 'Attacker'
    ]
  },
  // Hockey
  {
    sport: 'Hockey',
    gender: 'coed',
    positions: [
      'Goalkeeper', 'Left Defense', 'Right Defense', 'Left Wing',
      'Right Wing', 'Center'
    ]
  },
  // Field Hockey
  {
    sport: 'Field Hockey',
    gender: 'female',
    positions: [
      'Goalkeeper', 'Right Back', 'Left Back', 'Center Back',
      'Right Midfielder', 'Left Midfielder', 'Center Midfielder',
      'Right Forward', 'Left Forward', 'Center Forward'
    ]
  },
  // Gymnastics
  {
    sport: 'Gymnastics',
    gender: 'coed',
    positions: [
      'All Around', 'Vault', 'Uneven Bars', 'Balance Beam', 'Floor Exercise',
      'Pommel Horse', 'Still Rings', 'Parallel Bars', 'High Bar'
    ]
  },
  // Water Polo
  {
    sport: 'Water Polo',
    gender: 'coed',
    positions: [
      'Goalkeeper', 'Center', 'Driver', 'Point', 'Flat'
    ]
  },
  // Rowing
  {
    sport: 'Rowing',
    gender: 'coed',
    positions: [
      'Stroke', 'Bow', 'Middle', 'Coxswain'
    ]
  },
  // Fencing
  {
    sport: 'Fencing',
    gender: 'coed',
    positions: ['Foil', 'Épée', 'Sabre']
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

export const GRADUATION_YEARS = Array.from(
  { length: 8 }, 
  (_, i) => new Date().getFullYear() + i
);

export function getPositionsForSport(sport: string): string[] {
  const sportData = SPORTS_DATA.find(s => s.sport === sport);
  return sportData?.positions || [];
}

export function getSportsList(): string[] {
  return SPORTS_DATA.map(sport => sport.sport);
}

export const PERFORMANCE_MEASURABLES: { [key: string]: string[] } = {
  'Football': [
    '40 Yard Dash', 'Bench Press', 'Squat', 'Vertical Jump', 'Broad Jump',
    '20 Yard Shuttle', '3-Cone Drill', 'Standing Long Jump', 'Pro Agility',
    'Hand Size', 'Arm Length', 'Wing Span'
  ],
  'Basketball (M)': [
    'Vertical Jump', 'Lane Agility', 'Three Quarter Sprint', 'Standing Reach',
    'Points Per Game', 'Rebounds Per Game', 'Assists Per Game', 'Field Goal %',
    'Free Throw %', '3-Point %', 'Steals Per Game', 'Blocks Per Game'
  ],
  'Basketball (F)': [
    'Vertical Jump', 'Lane Agility', 'Three Quarter Sprint', 'Standing Reach',
    'Points Per Game', 'Rebounds Per Game', 'Assists Per Game', 'Field Goal %',
    'Free Throw %', '3-Point %', 'Steals Per Game', 'Blocks Per Game'
  ],
  'Baseball': [
    '60 Yard Dash', 'Exit Velocity', 'Pop Time (C)', 'Throwing Velocity',
    'Batting Average', 'On Base %', 'Slugging %', 'Home Runs', 'RBIs',
    'ERA', 'WHIP', 'Strikeouts', 'Wins', 'Saves'
  ],
  'Softball': [
    '60 Yard Dash', 'Exit Velocity', 'Pop Time (C)', 'Throwing Velocity',
    'Batting Average', 'On Base %', 'Slugging %', 'Home Runs', 'RBIs',
    'ERA', 'WHIP', 'Strikeouts', 'Wins', 'Saves'
  ],
  'Soccer (M)': [
    'Sprint Speed (40m)', 'Agility T-Test', 'Cooper Test (12 min)', 'Juggling',
    'Goals Per Season', 'Assists Per Season', 'Pass Accuracy %', 'Shots on Goal',
    'Minutes Played', 'Yellow Cards', 'Red Cards'
  ],
  'Soccer (F)': [
    'Sprint Speed (40m)', 'Agility T-Test', 'Cooper Test (12 min)', 'Juggling',
    'Goals Per Season', 'Assists Per Season', 'Pass Accuracy %', 'Shots on Goal',
    'Minutes Played', 'Yellow Cards', 'Red Cards'
  ],
  'Track and Field': [
    '100m Dash', '200m Dash', '400m Dash', '800m Run', '1500m Run', '3000m Run',
    '5000m Run', '10000m Run', '110m Hurdles', '400m Hurdles', 'High Jump',
    'Pole Vault', 'Long Jump', 'Triple Jump', 'Shot Put', 'Discus', 'Hammer', 'Javelin'
  ],
  'Cross Country': [
    '5K Time', '10K Time', 'Mile Time', '3200m Time', 'Half Marathon Time',
    'Marathon Time', 'VO2 Max'
  ],
  'Swimming': [
    '50m Freestyle', '100m Freestyle', '200m Freestyle', '400m Freestyle', '800m Freestyle',
    '1500m Freestyle', '50m Backstroke', '100m Backstroke', '200m Backstroke',
    '50m Breaststroke', '100m Breaststroke', '200m Breaststroke', '50m Butterfly',
    '100m Butterfly', '200m Butterfly', '200m IM', '400m IM'
  ],
  'Tennis': [
    'Serve Speed', 'First Serve %', 'Win %', 'UTR Rating', 'Tournament Wins',
    'Sets Won', 'Games Won', 'Aces Per Match', 'Double Faults Per Match'
  ],
  'Golf': [
    'Handicap Index', 'Scoring Average', 'Driving Distance', 'Driving Accuracy %',
    'Greens in Regulation %', 'Putting Average', 'Sand Save %', 'Tournament Wins',
    'Top 10 Finishes', 'Lowest Round'
  ],
  'Volleyball': [
    'Vertical Jump', 'Approach Jump', 'Block Jump', 'Kills Per Set', 'Attack %',
    'Blocks Per Set', 'Digs Per Set', 'Aces Per Set', 'Passing %', 'Serve Receive %'
  ],
  'Wrestling': [
    'Takedowns Per Match', 'Takedown Defense %', 'Escape %', 'Reversal Rate',
    'Pin %', 'Tech Fall %', 'Win %', 'Dual Meet Record', 'Tournament Wins'
  ],
  'Lacrosse (M)': [
    'Shot Speed', 'Goals Per Game', 'Assists Per Game', 'Saves %', 'Face-off %',
    'Ground Balls Per Game', 'Turnovers Per Game', 'Clear %', 'Man-up %'
  ],
  'Lacrosse (F)': [
    'Shot Speed', 'Goals Per Game', 'Assists Per Game', 'Saves %', 'Draw Controls',
    'Ground Balls Per Game', 'Turnovers Per Game', 'Free Position %'
  ],
  'Hockey': [
    'Skating Speed', 'Shot Speed', 'Goals Per Game', 'Assists Per Game', 'Points Per Game',
    'Plus/Minus', 'Penalty Minutes', 'Face-off %', 'Save %', 'Goals Against Average'
  ],
  'Field Hockey': [
    'Sprint Speed', 'Goals Per Game', 'Assists Per Game', 'Saves %', 'Penalty Corners',
    'Green Cards', 'Yellow Cards', 'Red Cards'
  ],
  'Gymnastics': [
    'Vault Score', 'Uneven Bars Score', 'Balance Beam Score', 'Floor Exercise Score',
    'All Around Score', 'Pommel Horse Score', 'Still Rings Score', 'Parallel Bars Score',
    'High Bar Score'
  ],
  'Water Polo': [
    'Swimming Speed (50m)', 'Goals Per Game', 'Assists Per Game', 'Steals Per Game',
    'Saves %', 'Ejections Drawn', 'Field Block %', 'Sprint Speed'
  ],
  'Rowing': [
    '2000m Erg Time', '6000m Erg Time', 'Max Watts', 'Split Time', '500m Split',
    'Stroke Rate', 'Distance Per Stroke'
  ],
  'Fencing': [
    'Touches Per Bout', 'Win %', 'Tournament Ranking', 'Reaction Time',
    'Bout Duration Average', 'Rating Points'
  ]
};

export function getMeasurablesForSport(sport: string): string[] {
  return PERFORMANCE_MEASURABLES[sport] || ['Speed', 'Strength', 'Agility', 'Endurance'];
} 