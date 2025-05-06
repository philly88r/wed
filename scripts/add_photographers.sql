-- Add new photographers to the database
-- Created: 2025-05-06

-- PHOTOGRAPHERS
INSERT INTO vendors (
  id, name, category_id, location, description, 
  pricing_tier, social_media, contact_info, is_featured, is_hidden,
  created_at, updated_at, gallery_limit, video_link
) VALUES 
-- Khaki Bedford Photography
(
  gen_random_uuid(), 'KHAKI BEDFORD PHOTOGRAPHY',
  '5d8f9d45-9c1e-4b3f-a7f1-d92f7c4c3b3f', -- Photographers category ID
  'NYC, NJ, Hudson Valley and LI',
  'Professional wedding photography services by Khaki Bedford.',
  '{"tier": "premium", "avg_price": null}'::jsonb,
  '{"instagram": "khakibedfordphoto", "facebook": "", "website": ""}'::jsonb,
  '{"email": "", "phone": "", "website": ""}'::jsonb,
  false, false,
  NOW(), NOW(),
  10, null
),
-- Walls Trimble
(
  gen_random_uuid(), 'WALLS TRIMBLE',
  '5d8f9d45-9c1e-4b3f-a7f1-d92f7c4c3b3f', -- Photographers category ID
  'NYC, NJ, Hudson Valley and LI',
  'Wedding photography services by Walls Trimble.',
  '{"tier": "premium", "avg_price": null}'::jsonb,
  '{"instagram": "trimblenator", "facebook": "", "website": ""}'::jsonb,
  '{"email": "", "phone": "", "website": ""}'::jsonb,
  false, false,
  NOW(), NOW(),
  10, null
),
-- Love Framed
(
  gen_random_uuid(), 'LOVE FRAMED',
  '5d8f9d45-9c1e-4b3f-a7f1-d92f7c4c3b3f', -- Photographers category ID
  'NYC, NJ, Hudson Valley and LI',
  'Capturing your special moments with Love Framed photography.',
  '{"tier": "premium", "avg_price": null}'::jsonb,
  '{"instagram": "loveframed_ig", "facebook": "", "website": ""}'::jsonb,
  '{"email": "", "phone": "", "website": ""}'::jsonb,
  false, false,
  NOW(), NOW(),
  10, null
),
-- Claudia Vayala
(
  gen_random_uuid(), 'CLAUDIA VAYALA',
  '5d8f9d45-9c1e-4b3f-a7f1-d92f7c4c3b3f', -- Photographers category ID
  'NYC, NJ, Hudson Valley and LI',
  'Wedding photography by Claudia Vayala.',
  '{"tier": "premium", "avg_price": null}'::jsonb,
  '{"instagram": "claudiavayala", "facebook": "", "website": ""}'::jsonb,
  '{"email": "", "phone": "", "website": ""}'::jsonb,
  false, false,
  NOW(), NOW(),
  10, null
);
