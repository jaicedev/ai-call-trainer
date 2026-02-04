-- Add mock business details columns to calls table
-- These store CRM-like simulated business data for training purposes

-- Mock business information
ALTER TABLE calls ADD COLUMN IF NOT EXISTS mock_business_name VARCHAR(255);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS mock_business_state VARCHAR(50);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS mock_business_industry VARCHAR(100);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS mock_business_phone VARCHAR(20);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS mock_business_email VARCHAR(255);

-- User notes taken during the practice call
ALTER TABLE calls ADD COLUMN IF NOT EXISTS call_notes TEXT;

-- Create index for filtering by state and industry
CREATE INDEX IF NOT EXISTS idx_calls_mock_business_state ON calls(mock_business_state);
CREATE INDEX IF NOT EXISTS idx_calls_mock_business_industry ON calls(mock_business_industry);
