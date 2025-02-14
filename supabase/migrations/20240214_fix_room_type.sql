-- Add room_type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE room_type AS ENUM ('ceremony', 'reception', 'cocktail', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- First, let's see what values are allowed
SELECT t.typname, e.enumlabel
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'room_type'
ORDER BY e.enumsortorder;

-- Make room_type nullable temporarily to handle existing data
ALTER TABLE venue_rooms 
ALTER COLUMN room_type DROP NOT NULL;

-- Then we'll update based on what we find
-- DO NOT RUN THIS PART until we know the correct enum value
/*
UPDATE venue_rooms 
SET room_type = '[CORRECT_VALUE]'
WHERE room_type IS NULL;

-- Make room_type not null if it isn't already
DO $$ 
BEGIN
    ALTER TABLE venue_rooms 
    ALTER COLUMN room_type SET NOT NULL;
EXCEPTION
    WHEN others THEN null;
END $$;
*/

-- Set default room_type for existing rows
UPDATE venue_rooms 
SET room_type = 'RECEPTION'
WHERE room_type IS NULL;

-- Make room_type not null if it isn't already
DO $$ 
BEGIN
    ALTER TABLE venue_rooms 
    ALTER COLUMN room_type SET NOT NULL;
EXCEPTION
    WHEN others THEN null;
END $$;
