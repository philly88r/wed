-- Add floor_plan_url to rooms table
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS floor_plan_url TEXT,
ADD COLUMN IF NOT EXISTS floor_plan_width INTEGER,
ADD COLUMN IF NOT EXISTS floor_plan_height INTEGER;
