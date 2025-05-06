-- Add new styling vendors to the database
-- Created: 2025-05-06

-- STYLING
INSERT INTO vendors (
  id, name, category_id, location, description, 
  pricing_tier, social_media, contact_info, is_featured, is_hidden,
  created_at, updated_at, gallery_limit, video_link
) VALUES 
-- Allison Koehler
(
  gen_random_uuid(), 'ALLISON KOEHLER',
  '66af9a48-2f3e-5f3f-a7f1-d92f7c4c3b7e', -- Styling category ID
  'NYC, NJ, Hudson Valley and LI',
  'Professional styling services for weddings and events.',
  '{"tier": "premium", "avg_price": null}'::jsonb,
  '{"instagram": "allisonokoehler", "facebook": "", "website": ""}'::jsonb,
  '{"email": "", "phone": "", "website": ""}'::jsonb,
  false, false,
  NOW(), NOW(),
  10, null
);
