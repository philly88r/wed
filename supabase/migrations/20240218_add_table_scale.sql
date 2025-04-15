-- Add table_scale column to venue_rooms table
ALTER TABLE venue_rooms 
ADD COLUMN IF NOT EXISTS table_scale float;
