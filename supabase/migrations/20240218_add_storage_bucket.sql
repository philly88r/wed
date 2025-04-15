-- Create a new storage bucket for floor plans
INSERT INTO storage.buckets (id, name, public)
VALUES ('floor-plans', 'floor-plans', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to floor plan files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'floor-plans' );

-- Allow authenticated users to upload floor plans
CREATE POLICY "Authenticated users can upload floor plans"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'floor-plans'
  AND auth.role() = 'authenticated'
);
