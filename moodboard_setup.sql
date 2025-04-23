-- Moodboard Database Setup Script
-- Run this script in the Supabase SQL Editor to set up the moodboard functionality

-- Create a storage bucket for moodboard images
INSERT INTO storage.buckets (id, name, public)
VALUES ('moodboard-images', 'moodboard-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create the moodboards table to store board metadata
CREATE TABLE IF NOT EXISTS moodboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    colors JSONB, -- Store the color palette
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the moodboard_images table to store individual images
CREATE TABLE IF NOT EXISTS moodboard_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moodboard_id UUID REFERENCES moodboards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    storage_path TEXT, -- Path to the image in the storage bucket
    category TEXT NOT NULL,
    source TEXT,
    position INTEGER, -- For ordering images in the board
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies to secure the data
-- Enable RLS on tables
ALTER TABLE moodboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodboard_images ENABLE ROW LEVEL SECURITY;

-- Create policies for moodboards
DROP POLICY IF EXISTS "Users can view their own moodboards" ON moodboards;
CREATE POLICY "Users can view their own moodboards" 
ON moodboards FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own moodboards" ON moodboards;
CREATE POLICY "Users can insert their own moodboards" 
ON moodboards FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own moodboards" ON moodboards;
CREATE POLICY "Users can update their own moodboards" 
ON moodboards FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own moodboards" ON moodboards;
CREATE POLICY "Users can delete their own moodboards" 
ON moodboards FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for moodboard_images
DROP POLICY IF EXISTS "Users can view their own moodboard images" ON moodboard_images;
CREATE POLICY "Users can view their own moodboard images" 
ON moodboard_images FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM moodboards
    WHERE moodboards.id = moodboard_images.moodboard_id
    AND moodboards.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can insert their own moodboard images" ON moodboard_images;
CREATE POLICY "Users can insert their own moodboard images" 
ON moodboard_images FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM moodboards
    WHERE moodboards.id = moodboard_images.moodboard_id
    AND moodboards.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can update their own moodboard images" ON moodboard_images;
CREATE POLICY "Users can update their own moodboard images" 
ON moodboard_images FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM moodboards
    WHERE moodboards.id = moodboard_images.moodboard_id
    AND moodboards.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can delete their own moodboard images" ON moodboard_images;
CREATE POLICY "Users can delete their own moodboard images" 
ON moodboard_images FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM moodboards
    WHERE moodboards.id = moodboard_images.moodboard_id
    AND moodboards.user_id = auth.uid()
));

-- Create public access policies
DROP POLICY IF EXISTS "Allow anonymous access to moodboards" ON moodboards;
CREATE POLICY "Allow anonymous access to moodboards" 
ON moodboards FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow anonymous access to moodboard images" ON moodboard_images;
CREATE POLICY "Allow anonymous access to moodboard images" 
ON moodboard_images FOR SELECT 
USING (true);

-- Create storage policies
DROP POLICY IF EXISTS "Public users can read moodboard images" ON storage.objects;
CREATE POLICY "Public users can read moodboard images"
ON storage.objects FOR SELECT
USING (bucket_id = 'moodboard-images');

DROP POLICY IF EXISTS "Authenticated users can upload moodboard images" ON storage.objects;
CREATE POLICY "Authenticated users can upload moodboard images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'moodboard-images' AND
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users can update their own moodboard images" ON storage.objects;
CREATE POLICY "Users can update their own moodboard images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'moodboard-images' AND
    auth.uid() = owner
);

DROP POLICY IF EXISTS "Users can delete their own moodboard images" ON storage.objects;
CREATE POLICY "Users can delete their own moodboard images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'moodboard-images' AND
    auth.uid() = owner
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_moodboards_user_id ON moodboards(user_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_images_moodboard_id ON moodboard_images(moodboard_id);
