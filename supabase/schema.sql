-- EduNiche Database Schema
-- This file contains the complete database schema for the EduNiche application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - Core user profiles
CREATE TABLE users (
    user_id TEXT PRIMARY KEY, -- Farcaster FID
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
    rates DECIMAL(10,2) NOT NULL, -- USDC per 30 min session
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
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
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
    file_url TEXT NOT NULL, -- IPFS URL
    uploader_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    course TEXT NOT NULL,
    topic TEXT NOT NULL,
    price DECIMAL(10,2) DEFAULT 0, -- USDC, 0 for free
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
    entity_type TEXT NOT NULL CHECK (entity_type IN ('tutor', 'resource', 'study_group')),
    entity_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(entity_type, entity_id, user_id) -- Prevent duplicate ratings
);

-- Indexes for better performance
CREATE INDEX idx_users_display_name ON users(display_name);
CREATE INDEX idx_tutor_profiles_verified ON tutor_profiles(verified);
CREATE INDEX idx_tutor_profiles_ratings ON tutor_profiles(ratings DESC);
CREATE INDEX idx_tutoring_sessions_tutor_id ON tutoring_sessions(tutor_id);
CREATE INDEX idx_tutoring_sessions_student_id ON tutoring_sessions(student_id);
CREATE INDEX idx_tutoring_sessions_status ON tutoring_sessions(status);
CREATE INDEX idx_study_groups_course ON study_groups(course);
CREATE INDEX idx_study_groups_creator_id ON study_groups(creator_id);
CREATE INDEX idx_resources_course ON resources(course);
CREATE INDEX idx_resources_uploader_id ON resources(uploader_id);
CREATE INDEX idx_resources_ratings ON resources(ratings DESC);
CREATE INDEX idx_ratings_entity ON ratings(entity_type, entity_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutor_profiles_updated_at BEFORE UPDATE ON tutor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutoring_sessions_updated_at BEFORE UPDATE ON tutoring_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON study_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update tutor ratings when a new rating is added
CREATE OR REPLACE FUNCTION update_tutor_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.entity_type = 'tutor' THEN
        UPDATE tutor_profiles 
        SET ratings = (
            SELECT AVG(score)::DECIMAL(3,2) 
            FROM ratings 
            WHERE entity_type = 'tutor' AND entity_id = NEW.entity_id
        )
        WHERE user_id = NEW.entity_id;
    ELSIF NEW.entity_type = 'resource' THEN
        UPDATE resources 
        SET 
            ratings = (
                SELECT AVG(score)::DECIMAL(3,2) 
                FROM ratings 
                WHERE entity_type = 'resource' AND entity_id = NEW.entity_id
            ),
            total_ratings = (
                SELECT COUNT(*) 
                FROM ratings 
                WHERE entity_type = 'resource' AND entity_id = NEW.entity_id
            )
        WHERE resource_id::TEXT = NEW.entity_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update ratings when a new rating is inserted
CREATE TRIGGER update_entity_rating AFTER INSERT ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_tutor_rating();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles but only update their own
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Tutor profiles are publicly readable, but only the tutor can modify
CREATE POLICY "Tutor profiles are publicly readable" ON tutor_profiles FOR SELECT USING (true);
CREATE POLICY "Tutors can update own profile" ON tutor_profiles FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Tutors can create own profile" ON tutor_profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Tutoring sessions are visible to participants
CREATE POLICY "Sessions visible to participants" ON tutoring_sessions FOR SELECT 
    USING (auth.uid()::text = tutor_id OR auth.uid()::text = student_id);
CREATE POLICY "Students can create sessions" ON tutoring_sessions FOR INSERT 
    WITH CHECK (auth.uid()::text = student_id);
CREATE POLICY "Participants can update sessions" ON tutoring_sessions FOR UPDATE 
    USING (auth.uid()::text = tutor_id OR auth.uid()::text = student_id);

-- Study groups are publicly readable
CREATE POLICY "Study groups are publicly readable" ON study_groups FOR SELECT USING (true);
CREATE POLICY "Users can create study groups" ON study_groups FOR INSERT WITH CHECK (auth.uid()::text = creator_id);
CREATE POLICY "Creators can update study groups" ON study_groups FOR UPDATE USING (auth.uid()::text = creator_id);

-- Resources are publicly readable
CREATE POLICY "Resources are publicly readable" ON resources FOR SELECT USING (true);
CREATE POLICY "Users can upload resources" ON resources FOR INSERT WITH CHECK (auth.uid()::text = uploader_id);
CREATE POLICY "Uploaders can update resources" ON resources FOR UPDATE USING (auth.uid()::text = uploader_id);

-- Ratings are publicly readable
CREATE POLICY "Ratings are publicly readable" ON ratings FOR SELECT USING (true);
CREATE POLICY "Users can create ratings" ON ratings FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own ratings" ON ratings FOR UPDATE USING (auth.uid()::text = user_id);

-- Insert some sample data for development
INSERT INTO users (user_id, display_name, bio, avatar) VALUES
('1', 'Alex Chen', 'Computer Science senior passionate about algorithms and data structures', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'),
('2', 'Sarah Johnson', 'Physics PhD student specializing in quantum mechanics', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'),
('3', 'Mike Rodriguez', 'Mathematics major with expertise in calculus and linear algebra', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike');

INSERT INTO tutor_profiles (user_id, courses, rates, bio, verified, specialties, ratings, total_sessions) VALUES
('1', ARRAY['Computer Science', 'Mathematics'], 25.00, 'CS senior with expertise in algorithms and data structures. Helped 40+ students improve their grades.', true, ARRAY['Algorithms', 'Data Structures'], 4.8, 45),
('2', ARRAY['Physics', 'Mathematics'], 30.00, 'Physics PhD student specializing in quantum mechanics and thermodynamics.', true, ARRAY['Quantum Physics', 'Thermodynamics'], 4.9, 62);

INSERT INTO study_groups (name, description, course, topic, creator_id, members, tags) VALUES
('CS 161 Algorithm Study Group', 'Weekly study sessions for CS 161 - Design and Analysis of Algorithms. We cover problem-solving techniques and practice coding interviews.', 'Computer Science', 'Algorithms', '1', ARRAY['1', '2', '3'], ARRAY['algorithms', 'coding', 'interviews']),
('Organic Chemistry Lab Partners', 'Looking for lab partners for CHEM 3A. We meet before each lab to review procedures and discuss results.', 'Chemistry', 'Organic Chemistry', '2', ARRAY['2', '3'], ARRAY['chemistry', 'lab', 'organic']);

INSERT INTO resources (title, description, file_url, uploader_id, course, topic, price, file_type, file_size, ratings, total_ratings, downloads, tags) VALUES
('Complete Data Structures Cheat Sheet', 'Comprehensive guide covering all major data structures with time/space complexity analysis and implementation examples.', 'ipfs://QmExample1', '1', 'Computer Science', 'Data Structures', 5.00, 'PDF', 2048000, 4.7, 23, 156, ARRAY['data-structures', 'algorithms', 'cheat-sheet']),
('Physics 7A Practice Midterm', 'Practice problems and solutions for Physics 7A midterm exam. Covers mechanics, waves, and thermodynamics.', 'ipfs://QmExample2', '2', 'Physics', 'Mechanics', 0.00, 'PDF', 1536000, 4.9, 41, 289, ARRAY['physics', 'practice-exam', 'mechanics']);
