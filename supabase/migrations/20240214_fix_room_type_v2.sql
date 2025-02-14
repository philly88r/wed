-- Drop the existing type if it exists
DROP TYPE IF EXISTS room_type CASCADE;

-- Create the room_type enum with correct values
CREATE TYPE room_type AS ENUM ('dining', 'ceremony', 'reception');

-- Update the venue_rooms table to use the new type
ALTER TABLE venue_rooms
    ALTER COLUMN room_type TYPE room_type 
    USING room_type::text::room_type;
