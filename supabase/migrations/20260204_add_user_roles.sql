-- Migration: Add User Roles and Call Review System
-- This migration adds:
-- 1. User role column (admin/advisor)
-- 2. Call review tracking columns
-- 3. Call reviews table for admin feedback

-- Create role enum type
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'advisor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'advisor';

-- Update existing admins to have admin role
UPDATE users SET role = 'admin' WHERE is_admin = true AND role IS NULL;
UPDATE users SET role = 'advisor' WHERE is_admin = false AND role IS NULL;

-- Add review tracking columns to calls table
ALTER TABLE calls ADD COLUMN IF NOT EXISTS reviewed BOOLEAN DEFAULT FALSE;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);

-- Create call reviews table for detailed admin feedback
CREATE TABLE IF NOT EXISTS call_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID UNIQUE NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feedback TEXT NOT NULL,
  notes TEXT,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_calls_reviewed ON calls(reviewed);
CREATE INDEX IF NOT EXISTS idx_calls_reviewed_by ON calls(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_call_reviews_call_id ON call_reviews(call_id);
CREATE INDEX IF NOT EXISTS idx_call_reviews_reviewer_id ON call_reviews(reviewer_id);

-- Enable RLS on call_reviews
ALTER TABLE call_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policy for call_reviews (service role has full access)
CREATE POLICY "Service role full access to call_reviews" ON call_reviews
  FOR ALL USING (true);

-- Trigger for updated_at on call_reviews
CREATE TRIGGER update_call_reviews_updated_at
  BEFORE UPDATE ON call_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
