-- Create analyses table for storing MedSight analysis results
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('clinical', 'research')),
  patient_age INTEGER,
  patient_sex TEXT,
  patient_condition TEXT,
  safety_tier TEXT CHECK (safety_tier IN ('safe', 'caution', 'not-recommended', 'contraindicated')),
  summary TEXT NOT NULL,
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  full_results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);

-- Enable Row Level Security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own analyses
CREATE POLICY "Users can view their own analyses"
  ON analyses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own analyses
CREATE POLICY "Users can insert their own analyses"
  ON analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own analyses
CREATE POLICY "Users can delete their own analyses"
  ON analyses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policy: Users can update their own analyses
CREATE POLICY "Users can update their own analyses"
  ON analyses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
