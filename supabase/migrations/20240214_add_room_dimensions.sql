-- Add length and width columns to venue_rooms
ALTER TABLE venue_rooms
ADD COLUMN IF NOT EXISTS length numeric DEFAULT 20,
ADD COLUMN IF NOT EXISTS width numeric DEFAULT 20;

-- Drop the layout tables since we're not using them anymore
DROP TABLE IF EXISTS seating_layouts CASCADE;

-- Update table_instances to reference rooms instead of layouts
ALTER TABLE table_instances
DROP CONSTRAINT IF EXISTS table_instances_layout_id_fkey,
DROP COLUMN IF EXISTS layout_id,
ADD COLUMN IF NOT EXISTS room_id uuid REFERENCES venue_rooms(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_table_instances_room_id ON table_instances(room_id);

-- Add template dimensions if they don't exist
ALTER TABLE table_templates
ADD COLUMN IF NOT EXISTS length numeric DEFAULT 6,
ADD COLUMN IF NOT EXISTS width numeric DEFAULT 3;
