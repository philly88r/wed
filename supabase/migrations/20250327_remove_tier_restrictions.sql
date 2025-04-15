-- Remove tier restrictions by setting gallery limit to 10 for all vendors
UPDATE vendors 
SET gallery_limit = 10
WHERE gallery_limit != 10;

-- Update the comments to reflect the change
COMMENT ON COLUMN vendors.gallery_limit IS 'Maximum number of photos allowed in gallery (10 for all vendors)';
COMMENT ON COLUMN vendors.video_link IS 'Optional video link for all vendors (1 per vendor)';
