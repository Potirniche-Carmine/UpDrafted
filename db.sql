CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('athlete', 'coach', 'recruiter')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE athlete_profiles (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    profile_image_r3_key TEXT,
    sport TEXT NOT NULL,
    secondary_sports TEXT[],
    graduation_year INTEGER NOT NULL,
    high_school TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    height TEXT NOT NULL,
    weight TEXT NOT NULL,
    positions TEXT[] NOT NULL,
    gpa DECIMAL(3,2),
    sat_score INTEGER,
    act_score INTEGER,
    intended_major TEXT,
    ncaa_eligibility_id TEXT,
    maxpreps_url TEXT NOT NULL,
    maxpreps_verified BOOLEAN DEFAULT FALSE,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    verification_notes TEXT,
    hudl_url TEXT,
    hudl_embed_url TEXT,
    instagram_handle TEXT,
    twitter_handle TEXT,
    personal_statement TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE athlete_achievements (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    achievement TEXT NOT NULL,
    date_achieved DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE athlete_measurables (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    sport TEXT NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    measurement_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE athlete_videos (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    embed_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE athlete_stats (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    season TEXT NOT NULL,
    stat_label TEXT NOT NULL,
    stat_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE coach_profiles (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('coach', 'recruiter')),
    sports_coaching TEXT[] NOT NULL,
    organization_name TEXT NOT NULL,
    organization_logo TEXT,
    division TEXT NOT NULL,
    conference TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    official_email TEXT,
    phone TEXT,
    website TEXT,
    instagram_handle TEXT,
    twitter_handle TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE program_info (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
    founded INTEGER,
    arena TEXT,
    capacity INTEGER,
    facilities_description TEXT,
    academic_ranking TEXT,
    graduation_rate INTEGER,
    campus_life TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(coach_id)
);

CREATE TABLE program_offerings (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
    highlights TEXT[],
    playing_time_opportunity TEXT,
    academic_support TEXT,
    facility_features TEXT[],
    coaching_style TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(coach_id)
);

CREATE TABLE recruiting_needs (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
    graduation_years INTEGER[] NOT NULL,
    positions TEXT[] NOT NULL,
    scholarships_available INTEGER,
    recruiting_philosophy TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(coach_id)
);

CREATE TABLE program_success (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
    recent_achievements TEXT[],
    nba_alumni TEXT[],
    conference_championships INTEGER DEFAULT 0,
    national_championships INTEGER DEFAULT 0,
    playoff_appearances INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(coach_id)
);

CREATE TABLE connections (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    coach_id INTEGER NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('connected', 'interested', 'viewed')) DEFAULT 'viewed',
    initiated_by TEXT NOT NULL CHECK (initiated_by IN ('athlete', 'coach')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(athlete_id, coach_id)
);

CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    viewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_athlete_profiles_user_id ON athlete_profiles(user_id);
CREATE INDEX idx_athlete_profiles_sport ON athlete_profiles(sport);
CREATE INDEX idx_athlete_profiles_graduation_year ON athlete_profiles(graduation_year);
CREATE INDEX idx_coach_profiles_user_id ON coach_profiles(user_id);
CREATE INDEX idx_coach_profiles_role ON coach_profiles(role);
CREATE INDEX idx_connections_athlete_id ON connections(athlete_id);
CREATE INDEX idx_connections_coach_id ON connections(coach_id);
CREATE INDEX idx_activity_log_viewer_id ON activity_log(viewer_id);
CREATE INDEX idx_activity_log_viewed_user_id ON activity_log(viewed_user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athlete_profiles_updated_at BEFORE UPDATE ON athlete_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coach_profiles_updated_at BEFORE UPDATE ON coach_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_info_updated_at BEFORE UPDATE ON program_info 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
