-- First, enable RLS on the table
ALTER TABLE venue_rooms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access" ON venue_rooms;
DROP POLICY IF EXISTS "Allow public insert access" ON venue_rooms;

-- Create policies for public access
CREATE POLICY "Allow public read access"
ON venue_rooms
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access"
ON venue_rooms
FOR INSERT
WITH CHECK (true);

-- Create policy for updates and deletes (optional, add if needed)
CREATE POLICY "Allow public update access"
ON venue_rooms
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete access"
ON venue_rooms
FOR DELETE
USING (true);
