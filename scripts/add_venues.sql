-- Add new venue vendors to the database
-- Created: 2025-05-06

-- VENUES
INSERT INTO vendors (
  id, name, category_id, location, description, 
  pricing_tier, social_media, contact_info, is_featured, is_hidden,
  created_at, updated_at, gallery_limit, video_link
) VALUES 
-- Tribeca Rooftop
(
  gen_random_uuid(), 'TRIBECA ROOFTOP',
  '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e', -- Venues category ID
  'NYC',
  'Stunning rooftop venue in the heart of Tribeca.',
  '{"tier": "premium", "avg_price": null}'::jsonb,
  '{"instagram": "tribecarooftopand360", "facebook": "", "website": ""}'::jsonb,
  '{"email": "", "phone": "", "website": ""}'::jsonb,
  false, false,
  NOW(), NOW(),
  10, null
),
-- Stonehills
(
  gen_random_uuid(), 'STONEHILLS',
  '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e', -- Venues category ID
  'Hudson Valley',
  'Charming farmhouse venue in the Hudson Valley.',
  '{"tier": "premium", "avg_price": null}'::jsonb,
  '{"instagram": "stonehillsfarmhouse", "facebook": "", "website": ""}'::jsonb,
  '{"email": "", "phone": "", "website": ""}'::jsonb,
  false, false,
  NOW(), NOW(),
  10, null
),
-- Balthazar
(
  gen_random_uuid(), 'BALTHAZAR',
  '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e', -- Venues category ID
  'NYC',
  'Iconic NYC restaurant venue for weddings and events.',
  '{"tier": "premium", "avg_price": null}'::jsonb,
  '{"instagram": "balthazarny", "facebook": "", "website": ""}'::jsonb,
  '{"email": "", "phone": "", "website": ""}'::jsonb,
  false, false,
  NOW(), NOW(),
  10, null
),
-- Monkey Bar
(
  gen_random_uuid(), 'MONKEY BAR',
  '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e', -- Venues category ID
  'NYC',
  'Historic and elegant venue in midtown Manhattan.',
  '{"tier": "premium", "avg_price": null}'::jsonb,
  '{"instagram": "monkeybar_ny", "facebook": "", "website": ""}'::jsonb,
  '{"email": "", "phone": "", "website": ""}'::jsonb,
  false, false,
  NOW(), NOW(),
  10, null
),
-- Shell's Loft
(
  gen_random_uuid(), 'SHELL''S LOFT',
  '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e', -- Venues category ID
  'NYC',
  'Unique loft venue for intimate weddings and events.',
  '{"tier": "premium", "avg_price": null}'::jsonb,
  '{"instagram": "shellsloft", "facebook": "", "website": ""}'::jsonb,
  '{"email": "", "phone": "", "website": ""}'::jsonb,
  false, false,
  NOW(), NOW(),
  10, null
),
-- The Pool and Grill
(
  gen_random_uuid(), 'THE POOL AND GRILL',
  '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e', -- Venues category ID
  'NYC',
  'Sophisticated venue in the former Four Seasons space.',
  '{"tier": "premium", "avg_price": null}'::jsonb,
  '{"instagram": "thepoolnyc", "facebook": "", "website": ""}'::jsonb,
  '{"email": "", "phone": "", "website": ""}'::jsonb,
  false, false,
  NOW(), NOW(),
  10, null
),
-- Park Chateau and Estates
(
  gen_random_uuid(), 'PARK CHATEAU AND ESTATES',
  '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e', -- Venues category ID
  'NJ',
  'Luxurious chateau venue for weddings and special events.',
  '{"tier": "premium", "avg_price": null}'::jsonb,
  '{"instagram": "parkchaateau", "facebook": "", "website": ""}'::jsonb,
  '{"email": "", "phone": "", "website": ""}'::jsonb,
  false, false,
  NOW(), NOW(),
  10, null
);
