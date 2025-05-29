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
    sport: 'Basketball',
    gender: 'male',
    positions: [
      'Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'
    ]
  },
  // Basketball (Women's)
  {
    sport: "Women's Basketball",
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
    sport: 'Soccer',
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
    sport: "Women's Soccer",
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
    sport: 'Lacrosse',
    gender: 'male',
    positions: [
      'Goalkeeper', 'Defender', 'Long Stick Midfielder', 'Midfielder',
      'Attackman', 'Face-off Specialist'
    ]
  },
  // Lacrosse (Women's)
  {
    sport: "Women's Lacrosse",
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
  'Community College'
];

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
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