-- Add floor plan URL to venue_rooms table if it doesn't exist
ALTER TABLE venue_rooms 
ADD COLUMN IF NOT EXISTS floor_plan_url TEXT;

-- Create storage bucket for floor plans if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('floor-plans', 'floor-plans', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload floor plans" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own floor plans" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own floor plans" ON storage.objects;

-- Create new policies for floor plan access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'floor-plans' );

CREATE POLICY "Authenticated users can upload floor plans"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'floor-plans'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own floor plans"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'floor-plans' AND auth.role() = 'authenticated' )
WITH CHECK ( bucket_id = 'floor-plans' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can delete their own floor plans"
ON storage.objects FOR DELETE
USING ( bucket_id = 'floor-plans' AND auth.role() = 'authenticated' );
