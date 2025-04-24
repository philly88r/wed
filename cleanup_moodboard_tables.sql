-- Cleanup script to remove moodboard tables and policies

-- First, disable RLS on tables to avoid permission issues
ALTER TABLE IF EXISTS moodboard_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS moodboards DISABLE ROW LEVEL SECURITY;

-- Drop storage policies for moodboard images
DROP POLICY IF EXISTS "Public users can read moodboard images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload moodboard images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own moodboard images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own moodboard images" ON storage.objects;

-- Drop policies for moodboard_images
DROP POLICY IF EXISTS "Users can view their own moodboard images" ON moodboard_images;
DROP POLICY IF EXISTS "Users can insert their own moodboard images" ON moodboard_images;
DROP POLICY IF EXISTS "Users can update their own moodboard images" ON moodboard_images;
DROP POLICY IF EXISTS "Users can delete their own moodboard images" ON moodboard_images;
DROP POLICY IF EXISTS "Allow anonymous access to moodboard images" ON moodboard_images;

-- Drop policies for moodboards
DROP POLICY IF EXISTS "Users can view their own moodboards" ON moodboards;
DROP POLICY IF EXISTS "Users can insert their own moodboards" ON moodboards;
DROP POLICY IF EXISTS "Users can update their own moodboards" ON moodboards;
DROP POLICY IF EXISTS "Users can delete their own moodboards" ON moodboards;
DROP POLICY IF EXISTS "Allow anonymous access to moodboards" ON moodboards;

-- Drop indexes
DROP INDEX IF EXISTS idx_moodboard_images_moodboard_id;
DROP INDEX IF EXISTS idx_moodboards_user_id;

-- Drop tables (moodboard_images first due to foreign key constraint)
DROP TABLE IF EXISTS moodboard_images;
DROP TABLE IF EXISTS moodboards;

-- Remove storage bucket
-- Note: This will delete all files in the bucket
-- EXECUTE format('DROP BUCKET IF EXISTS %I', 'moodboard-images');
-- Uncomment the above line if you want to remove the storage bucket as well
