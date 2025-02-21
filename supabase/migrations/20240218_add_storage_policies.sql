-- Enable RLS on venue_rooms
ALTER TABLE venue_rooms ENABLE ROW LEVEL SECURITY;

-- Policy for inserting rooms
CREATE POLICY "Users can insert rooms"
ON venue_rooms
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for updating rooms
CREATE POLICY "Users can update rooms"
ON venue_rooms
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for selecting rooms
CREATE POLICY "Users can view rooms"
ON venue_rooms
FOR SELECT
TO authenticated
USING (true);

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('floor-plans', 'floor-plans')
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload floor plans"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'floor-plans'
  AND (storage.foldername(name))[1] = 'temp' 
  OR auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Authenticated users can update floor plans"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'floor-plans')
WITH CHECK (bucket_id = 'floor-plans');

CREATE POLICY "Anyone can view floor plans"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'floor-plans');

-- Allow moving files
CREATE POLICY "Authenticated users can delete floor plans"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'floor-plans');
