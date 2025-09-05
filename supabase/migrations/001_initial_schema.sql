-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE session_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE entity_type AS ENUM ('tutor', 'resource', 'study_group');

-- Users table
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    bio TEXT,
    ens_name TEXT,
    social_links TEXT[],
    tutoring_offerings TEXT[],
    courses_taken TEXT[],
    uploaded_resources TEXT[],
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutor profiles table
CREATE TABLE tutor_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    courses TEXT[] NOT NULL,
    rates DECIMAL(10,2) NOT NULL,
    availability JSONB DEFAULT '[]'::jsonb,
    ratings DECIMAL(3,2) DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    bio TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    specialties TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutoring sessions table
CREATE TABLE tutoring_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    course TEXT NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    status session_status DEFAULT 'pending',
    payment_details JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study groups table
CREATE TABLE study_groups (
    group_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    course TEXT NOT NULL,
    topic TEXT NOT NULL,
    members TEXT[] DEFAULT '{}',
    creator_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 10,
    is_private BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources table
CREATE TABLE resources (
    resource_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploader_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    course TEXT NOT NULL,
    topic TEXT NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    ratings DECIMAL(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings table
CREATE TABLE ratings (
    rating_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type entity_type NOT NULL,
    entity_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(entity_type, entity_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_tutor_profiles_courses ON tutor_profiles USING GIN (courses);
CREATE INDEX idx_tutor_profiles_specialties ON tutor_profiles USING GIN (specialties);
CREATE INDEX idx_tutoring_sessions_tutor_id ON tutoring_sessions(tutor_id);
CREATE INDEX idx_tutoring_sessions_student_id ON tutoring_sessions(student_id);
CREATE INDEX idx_tutoring_sessions_status ON tutoring_sessions(status);
CREATE INDEX idx_study_groups_course ON study_groups(course);
CREATE INDEX idx_study_groups_topic ON study_groups(topic);
CREATE INDEX idx_study_groups_creator_id ON study_groups(creator_id);
CREATE INDEX idx_study_groups_members ON study_groups USING GIN (members);
CREATE INDEX idx_resources_course ON resources(course);
CREATE INDEX idx_resources_topic ON resources(topic);
CREATE INDEX idx_resources_uploader_id ON resources(uploader_id);
CREATE INDEX idx_resources_tags ON resources USING GIN (tags);
CREATE INDEX idx_ratings_entity ON ratings(entity_type, entity_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tutor_profiles_updated_at BEFORE UPDATE ON tutor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tutoring_sessions_updated_at BEFORE UPDATE ON tutoring_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON study_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Tutor profiles policies
CREATE POLICY "Anyone can view tutor profiles" ON tutor_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage own tutor profile" ON tutor_profiles FOR ALL USING (auth.uid()::text = user_id);

-- Tutoring sessions policies
CREATE POLICY "Users can view own sessions" ON tutoring_sessions FOR SELECT USING (auth.uid()::text = tutor_id OR auth.uid()::text = student_id);
CREATE POLICY "Users can create sessions" ON tutoring_sessions FOR INSERT WITH CHECK (auth.uid()::text = student_id);
CREATE POLICY "Tutors can update their sessions" ON tutoring_sessions FOR UPDATE USING (auth.uid()::text = tutor_id);

-- Study groups policies
CREATE POLICY "Anyone can view public groups" ON study_groups FOR SELECT USING (NOT is_private OR auth.uid()::text = creator_id OR auth.uid()::text = ANY(members));
CREATE POLICY "Users can create groups" ON study_groups FOR INSERT WITH CHECK (auth.uid()::text = creator_id);
CREATE POLICY "Creators can manage their groups" ON study_groups FOR UPDATE USING (auth.uid()::text = creator_id);
CREATE POLICY "Creators can delete their groups" ON study_groups FOR DELETE USING (auth.uid()::text = creator_id);

-- Resources policies
CREATE POLICY "Anyone can view resources" ON resources FOR SELECT USING (true);
CREATE POLICY "Users can upload resources" ON resources FOR INSERT WITH CHECK (auth.uid()::text = uploader_id);
CREATE POLICY "Uploaders can manage their resources" ON resources FOR ALL USING (auth.uid()::text = uploader_id);

-- Ratings policies
CREATE POLICY "Anyone can view ratings" ON ratings FOR SELECT USING (true);
CREATE POLICY "Users can create ratings" ON ratings FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own ratings" ON ratings FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own ratings" ON ratings FOR DELETE USING (auth.uid()::text = user_id);
