-- Add new floral vendors to the database
-- Created: 2025-05-06

-- FLORALS
INSERT INTO vendors (
  id, name, category_id, location, description, 
  pricing_tier, social_media, contact_info, is_featured, is_hidden,
  created_at, updated_at, gallery_limit, video_link
) VALUES 
-- East Rose Studio
(
  gen_random_uuid(), 'EAST ROSE STUDIO',
  '5a0d4f98-3a7c-6e1f-da04-a3f5d9c0e1a2', -- Florals category ID
  'NYC, NJ, Hudson Valley and LI',
  'Beautiful floral designs for weddings and special events.',
  '{"tier": "premium", "avg_price": null}'::jsonb,
  '{"instagram": "eastrosestudio", "facebook": "", "website": ""}'::jsonb,
  '{"email": "", "phone": "", "website": ""}'::jsonb,
  false, false,
  NOW(), NOW(),
  10, null
);
