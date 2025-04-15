-- Add floor plan columns to venue_rooms table
ALTER TABLE venue_rooms 
ADD COLUMN IF NOT EXISTS floor_plan_url TEXT,
ADD COLUMN IF NOT EXISTS floor_plan_width INTEGER,
ADD COLUMN IF NOT EXISTS floor_plan_height INTEGER,
ADD COLUMN IF NOT EXISTS table_scale float;
