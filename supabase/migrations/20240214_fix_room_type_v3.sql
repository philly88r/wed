-- Drop the existing type if it exists
DROP TYPE IF EXISTS room_type CASCADE;

-- Create the room_type enum with correct values
CREATE TYPE room_type AS ENUM ('dining', 'ceremony', 'reception');

-- Add room_type column if it doesn't exist
ALTER TABLE venue_rooms 
ADD COLUMN IF NOT EXISTS room_type room_type DEFAULT 'dining';

-- Make room_type not null
ALTER TABLE venue_rooms 
ALTER COLUMN room_type SET NOT NULL;
