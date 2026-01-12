-- Add new columns to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS toilet_direction VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS toilet_status VARCHAR(20) DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_verified TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create contributions table for user submissions
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  contribution_type VARCHAR(30) NOT NULL,
  name TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  toilet_code VARCHAR(50),
  toilet_notes TEXT,
  toilet_direction VARCHAR(20),
  toilet_status VARCHAR(20) DEFAULT 'unknown',
  amenities JSONB,
  user_email VARCHAR(255) NOT NULL,
  description TEXT,
  rating DECIMAL(2,1),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create feedback table for quick feedback/reports
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  feedback_type VARCHAR(30) NOT NULL,
  message TEXT NOT NULL,
  rating DECIMAL(2,1),
  user_email VARCHAR(255),
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on new tables
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert contributions
CREATE POLICY "Anyone can submit contributions"
ON contributions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to view their own contributions
CREATE POLICY "Anyone can view contributions"
ON contributions FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anyone to submit feedback
CREATE POLICY "Anyone can submit feedback"
ON feedback FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to view feedback
CREATE POLICY "Anyone can view feedback"
ON feedback FOR SELECT
TO anon, authenticated
USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contributions_restaurant ON contributions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);
CREATE INDEX IF NOT EXISTS idx_feedback_restaurant ON feedback(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(toilet_status);
CREATE INDEX IF NOT EXISTS idx_restaurants_verified ON restaurants(verified);
