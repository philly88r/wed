-- Add room_type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE room_type AS ENUM ('ceremony', 'reception', 'cocktail', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Make room_type nullable temporarily to handle existing data
ALTER TABLE venue_rooms 
ALTER COLUMN room_type DROP NOT NULL;

-- Set default room_type for existing rows
UPDATE venue_rooms 
SET room_type = 'other'
WHERE room_type IS NULL;

-- Make room_type not null again
ALTER TABLE venue_rooms 
ALTER COLUMN room_type SET NOT NULL;
