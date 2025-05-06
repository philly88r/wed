-- Add new vendors to the database
-- Created: 2025-05-06

-- PHOTOGRAPHERS
INSERT INTO vendors (
  id, name, slug, category_id, location, description, 
  pricing_tier, social_media, contact_info, is_featured, is_hidden,
  created_at, updated_at, gallery_limit, video_link
) VALUES 
-- Khaki Bedford Photography
(
  gen_random_uuid(), 'KHAKI BEDFORD PHOTOGRAPHY', 'khaki-bedford-photography',
  '5d8f9d45-7c2e-4b3f-a7f1-d92f7c4c3b2e', -- Photographers category ID
  'NYC, NJ, Hudson Valley and LI',
  'Professional wedding photography services by Khaki Bedford.',
  '{"tier": "premium", "avg_price": null}',
  '{"instagram": "khakibedfordphoto", "facebook": "", "website": ""}',
  '{"email": "", "phone": "", "website": ""}',
  false, false,
  NOW(), NOW(),
  10, null
),
-- Walls Trimble
(
  gen_random_uuid(), 'WALLS TRIMBLE', 'walls-trimble',
  '5d8f9d45-7c2e-4b3f-a7f1-d92f7c4c3b2e', -- Photographers category ID
  'NYC, NJ, Hudson Valley and LI',
  'Wedding photography services by Walls Trimble.',
  '{"tier": "premium", "avg_price": null}',
  '{"instagram": "trimblenator", "facebook": "", "website": ""}',
  '{"email": "", "phone": "", "website": ""}',
  false, false,
  NOW(), NOW(),
  10, null
),
-- Love Framed
(
  gen_random_uuid(), 'LOVE FRAMED', 'love-framed',
  '5d8f9d45-7c2e-4b3f-a7f1-d92f7c4c3b2e', -- Photographers category ID
  'NYC, NJ, Hudson Valley and LI',
  'Capturing your special moments with Love Framed photography.',
  '{"tier": "premium", "avg_price": null}',
  '{"instagram": "loveframed_ig", "facebook": "", "website": ""}',
  '{"email": "", "phone": "", "website": ""}',
  false, false,
  NOW(), NOW(),
  10, null
),
-- Claudia Vayala
(
  gen_random_uuid(), 'CLAUDIA VAYALA', 'claudia-vayala',
  '5d8f9d45-7c2e-4b3f-a7f1-d92f7c4c3b2e', -- Photographers category ID
  'NYC, NJ, Hudson Valley and LI',
  'Wedding photography by Claudia Vayala.',
  '{"tier": "premium", "avg_price": null}',
  '{"instagram": "claudiavayala", "facebook": "", "website": ""}',
  '{"email": "", "phone": "", "website": ""}',
  false, false,
  NOW(), NOW(),
  10, null
);

-- RENTALS
INSERT INTO vendors (
  id, name, slug, category_id, location, description, 
  pricing_tier, social_media, contact_info, is_featured, is_hidden,
  created_at, updated_at, gallery_limit, video_link
) VALUES 
-- BBJ La Tavola
(
  gen_random_uuid(), 'BBJ LA TAVOLA', 'bbj-la-tavola',
  'ee4f9e46-7c2e-4b3f-a7f1-d92f7c4c3b2e', -- Rentals category ID
  'NYC, NJ, Hudson Valley and LI',
  'Premium linen rentals for weddings and special events.',
  '{"tier": "premium", "avg_price": null}',
  '{"instagram": "bbjlatavola", "facebook": "", "website": ""}',
  '{"email": "", "phone": "", "website": ""}',
  false, false,
  NOW(), NOW(),
  10, null
),
-- Something Different Party Rentals
(
  gen_random_uuid(), 'SOMETHING DIFFERENT PARTY RENTALS', 'something-different-party-rentals',
  'ee4f9e46-7c2e-4b3f-a7f1-d92f7c4c3b2e', -- Rentals category ID
  'NYC/NJ',
  'Unique and high-quality party rental items for weddings and events.',
  '{"tier": "premium", "avg_price": null}',
  '{"instagram": "sdpr_rentals", "facebook": "", "website": ""}',
  '{"email": "", "phone": "", "website": ""}',
  false, false,
  NOW(), NOW(),
  10, null
);

-- FLORALS
INSERT INTO vendors (
  id, name, slug, category_id, location, description, 
  pricing_tier, social_media, contact_info, is_featured, is_hidden,
  created_at, updated_at, gallery_limit, video_link
) VALUES 
-- East Rose Studio
(
  gen_random_uuid(), 'EAST ROSE STUDIO', 'east-rose-studio',
  '5a0d4f98-7c2e-4b3f-a7f1-d92f7c4c3b2e', -- Florals category ID
  'NYC, NJ, Hudson Valley and LI',
  'Beautiful floral designs for weddings and special events.',
  '{"tier": "premium", "avg_price": null}',
  '{"instagram": "eastrosestudio", "facebook": "", "website": ""}',
  '{"email": "", "phone": "", "website": ""}',
  false, false,
  NOW(), NOW(),
  10, null
);

-- STYLING
INSERT INTO vendors (
  id, name, slug, category_id, location, description, 
  pricing_tier, social_media, contact_info, is_featured, is_hidden,
  created_at, updated_at, gallery_limit, video_link
) VALUES 
-- Allison Koehler
(
  gen_random_uuid(), 'ALLISON KOEHLER', 'allison-koehler',
  '66af9a48-7c2e-4b3f-a7f1-d92f7c4c3b2e', -- Styling category ID
  'NYC, NJ, Hudson Valley and LI',
  'Professional styling services for weddings and events.',
  '{"tier": "premium", "avg_price": null}',
  '{"instagram": "allisonokoehler", "facebook": "", "website": ""}',
  '{"email": "", "phone": "", "website": ""}',
  false, false,
  NOW(), NOW(),
  10, null
);

-- VENUES
INSERT INTO vendors (
  id, name, slug, category_id, location, description, 
  pricing_tier, social_media, contact_info, is_featured, is_hidden,
  created_at, updated_at, gallery_limit, video_link
) VALUES 
-- Tribeca Rooftop
(
  gen_random_uuid(), 'TRIBECA ROOFTOP', 'tribeca-rooftop',
  '2d5f9a42-7c2e-4b3f-a7f1-d92f7c4c3b2e', -- Venues category ID
  'NYC',
  'Stunning rooftop venue in the heart of Tribeca.',
  '{"tier": "premium", "avg_price": null}',
  '{"instagram": "tribecarooftopand360", "facebook": "", "website": ""}',
  '{"email": "", "phone": "", "website": ""}',
  false, false,
  NOW(), NOW(),
  10, null
),
-- Stonehills
(
  gen_random_uuid(), 'STONEHILLS', 'stonehills',
  '2d5f9a42-7c2e-4b3f-a7f1-d92f7c4c3b2e', -- Venues category ID
  'Hudson Valley',
  'Charming farmhouse venue in the Hudson Valley.',
  '{"tier": "premium", "avg_price": null}',
  '{"instagram": "stonehillsfarmhouse", "facebook": "", "website": ""}',
  '{"email": "", "phone": "", "website": ""}',
  false, false,
  NOW(), NOW(),
  10, null
),
-- Balthazar
(
  gen_random_uuid(), 'BALTHAZAR', 'balthazar',
  '2d5f9a42-7c2e-4b3f-a7f1-d92f7c4c3b2e', -- Venues category ID
  'NYC',
  'Iconic NYC restaurant venue for weddings and events.',
  '{"tier": "premium", "avg_price": null}',
  '{"instagram": "balthazarny", "facebook": "", "website": ""}',
  '{"email": "", "phone": "", "website": ""}',
  false, false,
  NOW(), NOW(),
  10, null
),
-- Monkey Bar
(
  gen_random_uuid(), 'MONKEY BAR', 'monkey-bar',
  '2d5f9a42-7c2e-4b3f-a7f1-d92f7c4c3b2e', -- Venues category ID
  'NYC',
  'Historic and elegant venue in midtown Manhattan.',
  '{"tier": "premium", "avg_price": null}',
  '{"instagram": "monkeybar_ny", "facebook": "", "website": ""}',
  '{"email": "", "phone": "", "website": ""}',
  false, false,
  NOW(), NOW(),
  10, null
),
-- Shell's Loft
(
  gen_random_uuid(), 'SHELL\'S LOFT', 'shells-loft',
  '2d5f9a42-7c2e-4b3f-a7f1-d92f7c4c3b2e', -- Venues category ID
  'NYC',
  'Unique loft venue for intimate weddings and events.',
  '{"tier": "premium", "avg_price": null}',
  '{"instagram": "shellsloft", "facebook": "", "website": ""}',
  '{"email": "", "phone": "", "website": ""}',
  false, false,
  NOW(), NOW(),
  10, null
),
-- The Pool and Grill
(
  gen_random_uuid(), 'THE POOL AND GRILL', 'the-pool-and-grill',
  '2d5f9a42-7c2e-4b3f-a7f1-d92f7c4c3b2e', -- Venues category ID
  'NYC',
  'Sophisticated venue in the former Four Seasons space.',
  '{"tier": "premium", "avg_price": null}',
  '{"instagram": "thepoolnyc", "facebook": "", "website": ""}',
  '{"email": "", "phone": "", "website": ""}',
  false, false,
  NOW(), NOW(),
  10, null
),
-- Park Chateau and Estates
(
  gen_random_uuid(), 'PARK CHATEAU AND ESTATES', 'park-chateau-and-estates',
  '2d5f9a42-7c2e-4b3f-a7f1-d92f7c4c3b2e', -- Venues category ID
  'NJ',
  'Luxurious chateau venue for weddings and special events.',
  '{"tier": "premium", "avg_price": null}',
  '{"instagram": "parkchaateau", "facebook": "", "website": ""}',
  '{"email": "", "phone": "", "website": ""}',
  false, false,
  NOW(), NOW(),
  10, null
);

-- Generate credentials for the new vendors
DO $$
DECLARE
  vendor_record RECORD;
  username_val TEXT;
  password_hash_val TEXT;
BEGIN
  FOR vendor_record IN 
    SELECT id, name, slug FROM vendors 
    WHERE username IS NULL OR username = ''
  LOOP
    -- Generate username from slug
    username_val := vendor_record.slug;
    
    -- Generate password hash (using a simple hash for demonstration)
    password_hash_val := crypt(concat(vendor_record.slug, '-', md5(random()::text)), gen_salt('bf', 6));
    
    -- Update the vendor record
    UPDATE vendors 
    SET 
      username = username_val,
      password_hash = password_hash_val
    WHERE id = vendor_record.id;
    
  END LOOP;
END $$;
