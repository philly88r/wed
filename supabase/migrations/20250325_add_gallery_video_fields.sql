-- Add gallery_limit and video_link fields to vendors table
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS gallery_limit INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS video_link TEXT DEFAULT NULL;

-- Create a comment to explain the gallery_limit field
COMMENT ON COLUMN vendors.gallery_limit IS 'Maximum number of photos allowed in gallery (2 for free, 10 for paid vendors)';
COMMENT ON COLUMN vendors.video_link IS 'Optional video link for paid vendors';
