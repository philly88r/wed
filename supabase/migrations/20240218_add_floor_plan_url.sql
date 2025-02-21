-- Add floor plan URL to venue_rooms table
ALTER TABLE venue_rooms 
ADD COLUMN IF NOT EXISTS floor_plan_url TEXT;
