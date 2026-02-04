-- TalkMCA Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  profile_picture_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraint for @ccapsolution.com emails
ALTER TABLE users ADD CONSTRAINT email_domain_check
  CHECK (email LIKE '%@ccapsolution.com');

-- Verification codes for email auth
CREATE TABLE verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup
CREATE INDEX idx_verification_codes_email ON verification_codes(email);

-- Personas table
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  personality_prompt TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  common_objections JSONB DEFAULT '[]'::jsonb,
  success_criteria JSONB DEFAULT '{
    "tone_weight": 20,
    "product_knowledge_weight": 20,
    "objection_handling_weight": 25,
    "rapport_building_weight": 15,
    "closing_technique_weight": 20,
    "minimum_passing_score": 70
  }'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calls table
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES personas(id) ON DELETE RESTRICT,
  recording_url TEXT,
  transcript JSONB,
  duration_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Dynamic persona fields (used when persona_id is NULL)
  dynamic_persona_name VARCHAR(255),
  dynamic_persona_description TEXT,
  dynamic_persona_difficulty INTEGER CHECK (dynamic_persona_difficulty IS NULL OR (dynamic_persona_difficulty >= 1 AND dynamic_persona_difficulty <= 5)),
  -- Mock business details for CRM-like simulation
  mock_business_name VARCHAR(255),
  mock_business_state VARCHAR(50),
  mock_business_industry VARCHAR(100),
  mock_business_phone VARCHAR(20),
  mock_business_email VARCHAR(255),
  call_notes TEXT
);

-- Indexes for calls
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_persona_id ON calls(persona_id);
CREATE INDEX idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX idx_calls_mock_business_state ON calls(mock_business_state);
CREATE INDEX idx_calls_mock_business_industry ON calls(mock_business_industry);

-- Call scores table
CREATE TABLE call_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID UNIQUE NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  tone_score INTEGER NOT NULL CHECK (tone_score >= 0 AND tone_score <= 100),
  product_knowledge_score INTEGER NOT NULL CHECK (product_knowledge_score >= 0 AND product_knowledge_score <= 100),
  objection_handling_score INTEGER NOT NULL CHECK (objection_handling_score >= 0 AND objection_handling_score <= 100),
  rapport_building_score INTEGER NOT NULL CHECK (rapport_building_score >= 0 AND rapport_building_score <= 100),
  closing_technique_score INTEGER NOT NULL CHECK (closing_technique_score >= 0 AND closing_technique_score <= 100),
  ai_feedback TEXT,
  strengths JSONB DEFAULT '[]'::jsonb,
  improvements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for call scores
CREATE INDEX idx_call_scores_call_id ON call_scores(call_id);

-- Feed comments table
CREATE TABLE feed_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for comments
CREATE INDEX idx_feed_comments_call_id ON feed_comments(call_id);
CREATE INDEX idx_feed_comments_user_id ON feed_comments(user_id);

-- Reaction type enum
CREATE TYPE reaction_type AS ENUM ('fire', 'clap', 'lightbulb', 'star');

-- Feed reactions table
CREATE TABLE feed_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type reaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(call_id, user_id, reaction_type)
);

-- Indexes for reactions
CREATE INDEX idx_feed_reactions_call_id ON feed_reactions(call_id);
CREATE INDEX idx_feed_reactions_user_id ON feed_reactions(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personas_updated_at
  BEFORE UPDATE ON personas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feed_comments_updated_at
  BEFORE UPDATE ON feed_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for service role, we'll handle auth in app)
-- These allow the service role to do everything

CREATE POLICY "Service role full access to users" ON users
  FOR ALL USING (true);

CREATE POLICY "Service role full access to verification_codes" ON verification_codes
  FOR ALL USING (true);

CREATE POLICY "Service role full access to personas" ON personas
  FOR ALL USING (true);

CREATE POLICY "Service role full access to calls" ON calls
  FOR ALL USING (true);

CREATE POLICY "Service role full access to call_scores" ON call_scores
  FOR ALL USING (true);

CREATE POLICY "Service role full access to feed_comments" ON feed_comments
  FOR ALL USING (true);

CREATE POLICY "Service role full access to feed_reactions" ON feed_reactions
  FOR ALL USING (true);

-- Create storage bucket for recordings and avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for recordings
CREATE POLICY "Anyone can view recordings" ON storage.objects
  FOR SELECT USING (bucket_id = 'recordings');

CREATE POLICY "Authenticated can upload recordings" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'recordings');

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars');
