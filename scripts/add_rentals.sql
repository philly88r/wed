-- Add new rental vendors to the database
-- Created: 2025-05-06

-- RENTALS
INSERT INTO vendors (
  id, name, category_id, location, description, 
  pricing_tier, social_media, contact_info, is_featured, is_hidden,
  created_at, updated_at, gallery_limit, video_link
) VALUES 
-- BBJ La Tavola
(
  gen_random_uuid(), 'BBJ LA TAVOLA',
  'ee4f9e46-0f3e-4e3f-a7f1-d92f7c4c3b5e', -- Rentals category ID
  'NYC, NJ, Hudson Valley and LI',
  'Premium linen rentals for weddings and special events.',
  '{"tier": "premium", "avg_price": null}'::jsonb,
  '{"instagram": "bbjlatavola", "facebook": "", "website": ""}'::jsonb,
  '{"email": "", "phone": "", "website": ""}'::jsonb,
  false, false,
  NOW(), NOW(),
  10, null
),
-- Something Different Party Rentals
(
  gen_random_uuid(), 'SOMETHING DIFFERENT PARTY RENTALS',
  'ee4f9e46-0f3e-4e3f-a7f1-d92f7c4c3b5e', -- Rentals category ID
  'NYC/NJ',
  'Unique and high-quality party rental items for weddings and events.',
  '{"tier": "premium", "avg_price": null}'::jsonb,
  '{"instagram": "sdpr_rentals", "facebook": "", "website": ""}'::jsonb,
  '{"email": "", "phone": "", "website": ""}'::jsonb,
  false, false,
  NOW(), NOW(),
  10, null
);
