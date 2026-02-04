-- Migration: Add dynamic persona columns to calls table
-- Run this in Supabase SQL Editor to add support for dynamic personas

-- Make persona_id nullable (it was NOT NULL before)
ALTER TABLE calls ALTER COLUMN persona_id DROP NOT NULL;

-- Add dynamic persona columns
ALTER TABLE calls ADD COLUMN IF NOT EXISTS dynamic_persona_name VARCHAR(255);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS dynamic_persona_description TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS dynamic_persona_difficulty INTEGER;

-- Add constraint for difficulty level
ALTER TABLE calls ADD CONSTRAINT calls_dynamic_persona_difficulty_check
  CHECK (dynamic_persona_difficulty IS NULL OR (dynamic_persona_difficulty >= 1 AND dynamic_persona_difficulty <= 5));
