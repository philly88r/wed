-- Add vendor categories
INSERT INTO vendor_categories (id, name, icon, description, created_at, updated_at)
VALUES
('bb1f9b43-9c1e-4b3f-a7f1-d92f7c4c3b41', 'CAKE/DESSERTS', 'cake', 'Wedding cakes, dessert tables, and sweet treats', NOW(), NOW()),
('3e8b2d76-9c1e-4b3f-a7f1-d92f7c4c3b42', 'CATERING/STAFFING', 'restaurant', 'Full-service catering and event staffing', NOW(), NOW()),
('cc2f9c44-9c1e-4b3f-a7f1-d92f7c4c3b43', 'COUPLE ATTIRE', 'checkroom', 'Wedding dresses, suits, and accessories', NOW(), NOW()),
('99df9d51-9c1e-4b3f-a7f1-d92f7c4c3b44', 'DJ''S', 'queue_music', 'Professional wedding DJs and entertainment', NOW(), NOW()),
('051803d5-9c1e-4b3f-a7f1-d92f7c4c3b45', 'LIVE MUSIC', 'music_note', 'Live bands and musical entertainment', NOW(), NOW()),
('5a0d4f98-9c1e-4b3f-a7f1-d92f7c4c3b46', 'FLORALS/FLORAL PRESERVATION', 'local_florist', 'Wedding flowers and floral preservation', NOW(), NOW()),
('dd3f9d45-9c1e-4b3f-a7f1-d92f7c4c3b47', 'HAIR & MAKEUP', 'brush', 'Bridal beauty and styling services', NOW(), NOW()),
('4d7f9c44-9c1e-4b3f-a7f1-d92f7c4c3b48', 'OFFICIANTS', 'person', 'Wedding ceremony officiants', NOW(), NOW()),
('5d8f9d45-9c1e-4b3f-a7f1-d92f7c4c3b49', 'PHOTOGRAPHERS', 'photo_camera', 'Wedding photography services', NOW(), NOW()),
('ee4f9e46-9c1e-4b3f-a7f1-d92f7c4c3b50', 'RENTALS', 'chair', 'Event furniture and decor rentals', NOW(), NOW()),
('ff5f9f47-9c1e-4b3f-a7f1-d92f7c4c3b51', 'STATIONERY', 'mail', 'Wedding invitations and paper goods', NOW(), NOW()),
('66af9a48-9c1e-4b3f-a7f1-d92f7c4c3b52', 'STYLING', 'style', 'Wedding design and styling services', NOW(), NOW()),
('77bf9b49-9c1e-4b3f-a7f1-d92f7c4c3b53', 'TRANSPORTATION', 'directions_car', 'Wedding transportation services', NOW(), NOW()),
('88cf9c50-9c1e-4b3f-a7f1-d92f7c4c3b54', 'VIDEOGRAPHERS', 'videocam', 'Wedding videography services', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Add vendors with proper pricing tiers
INSERT INTO vendors (
    name,
    slug,
    category_id,
    location,
    description,
    pricing_details,
    pricing_tier,
    amenities,
    services_offered,
    social_media,
    reviews,
    is_featured,
    is_hidden,
    created_at,
    updated_at
) VALUES
-- CAKE/DESSERTS
('MILK BAR', 'milk-bar', 'bb1f9b43-9c1e-4b3f-a7f1-d92f7c4c3b41', 'NYC', 'Modern wedding cakes and treats',
    '{"packages": [{"name": "Premium Package", "price": 2500}, {"name": "Basic Package", "price": 1500}]}',
    '{"tier": "budget", "avg_price": 2000.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),

-- PHOTOGRAPHERS
('SUSAN STRIPLING', 'susan-stripling', '5d8f9d45-9c1e-4b3f-a7f1-d92f7c4c3b49', 'NYC', 'Award-winning wedding photography',
    '{"packages": [{"name": "Full Coverage", "price": 7000}, {"name": "Basic Coverage", "price": 4000}]}',
    '{"tier": "mid_range", "avg_price": 5500.0000000000000000}',
    '{}', '{}', '[]', '[]', true, false, NOW(), NOW()),

-- FLORISTS
('ARIEL DEARIE FLOWERS', 'ariel-dearie-flowers', '5a0d4f98-9c1e-4b3f-a7f1-d92f7c4c3b46', 'NYC', 'Luxury floral design studio',
    '{"packages": [{"name": "Full Service", "price": 8000}, {"name": "Basic Package", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 6500.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),
('BUDS OF BROOKLYN', 'buds-of-brooklyn', '5a0d4f98-9c1e-4b3f-a7f1-d92f7c4c3b46', 'NYC', 'Brooklyn-based floral design',
    '{"packages": [{"name": "Full Service", "price": 8000}, {"name": "Basic Package", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 6500.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),
('DESIGNS BY AHN', 'designs-by-ahn', '5a0d4f98-9c1e-4b3f-a7f1-d92f7c4c3b46', 'NYC', 'Contemporary floral arrangements',
    '{"packages": [{"name": "Full Service", "price": 8000}, {"name": "Basic Package", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 6500.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),
('FLOWER GIRL NYC', 'flower-girl-nyc', '5a0d4f98-9c1e-4b3f-a7f1-d92f7c4c3b46', 'NYC', 'Boutique floral design',
    '{"packages": [{"name": "Full Service", "price": 8000}, {"name": "Basic Package", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 6500.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),
('FOX FODDER FARM', 'fox-fodder-farm', '5a0d4f98-9c1e-4b3f-a7f1-d92f7c4c3b46', 'NYC', 'Farm-to-table floral design',
    '{"packages": [{"name": "Full Service", "price": 8000}, {"name": "Basic Package", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 6500.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),

-- PLANNERS
('14 STORIES', '14-stories', '66af9a48-9c1e-4b3f-a7f1-d92f7c4c3b52', 'NYC', 'LGBTQ+ wedding planning specialists',
    '{"packages": [{"name": "Full Service", "price": 8000}, {"name": "Basic Package", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 6500.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),
('ALICIA K DESIGNS', 'alicia-k-designs', '66af9a48-9c1e-4b3f-a7f1-d92f7c4c3b52', 'NYC', 'Luxury wedding planning',
    '{"packages": [{"name": "Full Service", "price": 8000}, {"name": "Basic Package", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 6500.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),
('AMY KATZ EVENTS', 'amy-katz-events', '66af9a48-9c1e-4b3f-a7f1-d92f7c4c3b52', 'NYC', 'Full-service event planning',
    '{"packages": [{"name": "Full Service", "price": 8000}, {"name": "Basic Package", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 6500.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),
('BRILLIANT EVENT PLANNING', 'brilliant-event-planning', '66af9a48-9c1e-4b3f-a7f1-d92f7c4c3b52', 'NYC', 'High-end wedding planning',
    '{"packages": [{"name": "Full Service", "price": 8000}, {"name": "Basic Package", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 6500.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),
('CUSTOM EVENTS NYC', 'custom-events-nyc', '66af9a48-9c1e-4b3f-a7f1-d92f7c4c3b52', 'NYC', 'Personalized wedding planning',
    '{"packages": [{"name": "Full Service", "price": 8000}, {"name": "Basic Package", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 6500.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),

-- BANDS
('AROUND TOWN ENTERTAINMENT', 'around-town-entertainment', '051803d5-9c1e-4b3f-a7f1-d92f7c4c3b45', 'NYC', 'Premium wedding bands',
    '{"packages": [{"name": "Full Band", "price": 9000}, {"name": "Small Band", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 7000.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),
('BLAIRE REINHARD BAND', 'blaire-reinhard-band', '051803d5-9c1e-4b3f-a7f1-d92f7c4c3b45', 'NYC', 'Contemporary wedding music',
    '{"packages": [{"name": "Full Band", "price": 9000}, {"name": "Small Band", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 7000.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),
('BOBBY ATTIKO BAND', 'bobby-attiko-band', '051803d5-9c1e-4b3f-a7f1-d92f7c4c3b45', 'NYC', 'High-energy wedding band',
    '{"packages": [{"name": "Full Band", "price": 9000}, {"name": "Small Band", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 7000.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),
('CAFE WHAAA', 'cafe-whaaa', '051803d5-9c1e-4b3f-a7f1-d92f7c4c3b45', 'NYC', 'Versatile wedding entertainment',
    '{"packages": [{"name": "Full Band", "price": 9000}, {"name": "Small Band", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 7000.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),
('CREATIONS MUSIC', 'creations-music', '051803d5-9c1e-4b3f-a7f1-d92f7c4c3b45', 'NYC', 'Professional wedding musicians',
    '{"packages": [{"name": "Full Band", "price": 9000}, {"name": "Small Band", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 7000.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),

-- DJ'S
('74 EVENTS', '74-events', '99df9d51-9c1e-4b3f-a7f1-d92f7c4c3b44', 'NYC', 'Professional DJ services',
    '{"packages": [{"name": "Premium DJ", "price": 2500}, {"name": "Basic DJ", "price": 1500}]}',
    '{"tier": "budget", "avg_price": 2000.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),
('BEAT TRAIN PRODUCTIONS', 'beat-train-productions', '99df9d51-9c1e-4b3f-a7f1-d92f7c4c3b44', 'NYC', 'Experienced wedding DJs',
    '{"packages": [{"name": "Premium DJ", "price": 2500}, {"name": "Basic DJ", "price": 1500}]}',
    '{"tier": "budget", "avg_price": 2000.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),
('SCRATCH WEDDINGS', 'scratch-weddings', '99df9d51-9c1e-4b3f-a7f1-d92f7c4c3b44', 'NYC', 'Premium DJ entertainment',
    '{"packages": [{"name": "Premium DJ", "price": 2500}, {"name": "Basic DJ", "price": 1500}]}',
    '{"tier": "budget", "avg_price": 2000.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),
('STAR TALENT INC', 'star-talent-inc', '99df9d51-9c1e-4b3f-a7f1-d92f7c4c3b44', 'NYC', 'Full-service entertainment company',
    '{"packages": [{"name": "Premium DJ", "price": 2500}, {"name": "Basic DJ", "price": 1500}]}',
    '{"tier": "budget", "avg_price": 2000.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),
('SUGARTOWN INDUSTRIES', 'sugartown-industries', '99df9d51-9c1e-4b3f-a7f1-d92f7c4c3b44', 'NYC', 'Boutique DJ services',
    '{"packages": [{"name": "Premium DJ", "price": 2500}, {"name": "Basic DJ", "price": 1500}]}',
    '{"tier": "budget", "avg_price": 2000.0000000000000000}',
    '{}', '{}', '[]', '[]', false, false, NOW(), NOW()),

-- Add 60 new vendors (excluding existing ones)
INSERT INTO "public"."vendors" (
    "id", "name", "category_id", "location", "description", 
    "pricing_details", "pricing_tier", "social_media", "contact_info", 
    "services_offered", "amenities", "is_featured", "is_hidden", 
    "created_at", "updated_at"
) VALUES
-- VENUES (continuing with non-duplicates)
(
    gen_random_uuid(),
    'BROOKLYN WINERY',
    (SELECT id FROM vendor_categories WHERE name = 'VENUES'),
    'NYC',
    'Urban winery and event space',
    '{"packages": [{"name": "Full Buyout", "price": 20000}, {"name": "Partial Space", "price": 12000}]}',
    '{"tier": "premium", "avg_price": 16000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'BRUSHLAND EATING HOUSE',
    (SELECT id FROM vendor_categories WHERE name = 'VENUES'),
    'HUDSON VALLEY',
    'Rustic restaurant venue',
    '{"packages": [{"name": "Full Evening", "price": 15000}, {"name": "Partial Evening", "price": 8000}]}',
    '{"tier": "premium", "avg_price": 11500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'BRYANT PARK GRILL',
    (SELECT id FROM vendor_categories WHERE name = 'VENUES'),
    'NYC',
    'Iconic park restaurant venue',
    '{"packages": [{"name": "Full Restaurant", "price": 25000}, {"name": "Rooftop Only", "price": 15000}]}',
    '{"tier": "premium", "avg_price": 20000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),

-- PHOTOGRAPHERS (non-duplicates)
(
    gen_random_uuid(),
    'CHAZ CRUZ PHOTOGRAPHERS',
    (SELECT id FROM vendor_categories WHERE name = 'PHOTOGRAPHERS'),
    'NYC',
    'Documentary wedding photography',
    '{"packages": [{"name": "Full Day", "price": 7000}, {"name": "Half Day", "price": 4000}]}',
    '{"tier": "mid_range", "avg_price": 5500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'CHELLISE MICHAEL PHOTOGRAPHY',
    (SELECT id FROM vendor_categories WHERE name = 'PHOTOGRAPHERS'),
    'NYC',
    'Modern wedding photography',
    '{"packages": [{"name": "Premium", "price": 6500}, {"name": "Essential", "price": 4000}]}',
    '{"tier": "mid_range", "avg_price": 5250.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),

-- CAKE/DESSERTS (non-duplicates)
(
    gen_random_uuid(),
    'LULU CAKE BOUTIQUE',
    (SELECT id FROM vendor_categories WHERE name = 'CAKE/DESSERTS'),
    'NYC',
    'Luxury custom cakes',
    '{"packages": [{"name": "Luxury Design", "price": 2500}, {"name": "Classic Design", "price": 1500}]}',
    '{"tier": "budget", "avg_price": 2000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'LUCKYBIRD BAKERY',
    (SELECT id FROM vendor_categories WHERE name = 'CAKE/DESSERTS'),
    'NYC',
    'Artisanal wedding cakes',
    '{"packages": [{"name": "Custom Tier", "price": 2200}, {"name": "Simple Tier", "price": 1400}]}',
    '{"tier": "budget", "avg_price": 1800.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- DJ'S (non-duplicates)
(
    gen_random_uuid(),
    '74 EVENTS',
    (SELECT id FROM vendor_categories WHERE name = 'DJ''S'),
    'NYC',
    'Professional wedding DJs',
    '{"packages": [{"name": "Premium DJ", "price": 2500}, {"name": "Standard DJ", "price": 1800}]}',
    '{"tier": "budget", "avg_price": 2150.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'BPM EVENTS',
    (SELECT id FROM vendor_categories WHERE name = 'DJ''S'),
    'NYC',
    'High-energy wedding entertainment',
    '{"packages": [{"name": "Full Package", "price": 2800}, {"name": "Basic Package", "price": 2000}]}',
    '{"tier": "budget", "avg_price": 2400.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- LIVE MUSIC (non-duplicates)
(
    gen_random_uuid(),
    'ATOMIC FUNK',
    (SELECT id FROM vendor_categories WHERE name = 'LIVE MUSIC'),
    'NYC',
    'High-energy wedding band',
    '{"packages": [{"name": "Full Band", "price": 8000}, {"name": "Small Band", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 6500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'CAFE WHA?',
    (SELECT id FROM vendor_categories WHERE name = 'LIVE MUSIC'),
    'NYC',
    'Legendary NYC wedding band',
    '{"packages": [{"name": "Full Evening", "price": 10000}, {"name": "Short Set", "price": 6000}]}',
    '{"tier": "premium", "avg_price": 8000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),

-- HAIR & MAKEUP (non-duplicates)
(
    gen_random_uuid(),
    'BEAUTY ICON',
    (SELECT id FROM vendor_categories WHERE name = 'HAIR & MAKEUP'),
    'NYC',
    'Luxury bridal beauty',
    '{"packages": [{"name": "Full Glam", "price": 1500}, {"name": "Natural Look", "price": 1000}]}',
    '{"tier": "budget", "avg_price": 1250.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'BEYOND THE BRUSH',
    (SELECT id FROM vendor_categories WHERE name = 'HAIR & MAKEUP'),
    'LONG ISLAND',
    'Professional bridal styling',
    '{"packages": [{"name": "Premium Package", "price": 1800}, {"name": "Basic Package", "price": 1200}]}',
    '{"tier": "budget", "avg_price": 1500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- TRANSPORTATION (non-duplicates)
(
    gen_random_uuid(),
    'BUSTER',
    (SELECT id FROM vendor_categories WHERE name = 'TRANSPORTATION'),
    'NYC',
    'Modern wedding transportation',
    '{"packages": [{"name": "Full Day", "price": 3000}, {"name": "Half Day", "price": 1800}]}',
    '{"tier": "budget", "avg_price": 2400.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'KING & QUEEN LIMO',
    (SELECT id FROM vendor_categories WHERE name = 'TRANSPORTATION'),
    'NYC',
    'Luxury wedding transportation',
    '{"packages": [{"name": "Premium Fleet", "price": 3500}, {"name": "Standard Fleet", "price": 2000}]}',
    '{"tier": "budget", "avg_price": 2750.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),

-- RENTALS (non-duplicates)
(
    gen_random_uuid(),
    'BROADWAY PARTY RENTALS',
    (SELECT id FROM vendor_categories WHERE name = 'RENTALS'),
    'NYC',
    'Complete wedding rentals',
    '{"packages": [{"name": "Full Service", "price": 5000}, {"name": "Basic Package", "price": 3000}]}',
    '{"tier": "mid_range", "avg_price": 4000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'PARTY RENTAL LTD',
    (SELECT id FROM vendor_categories WHERE name = 'RENTALS'),
    'NYC',
    'Premium event rentals',
    '{"packages": [{"name": "Luxury Package", "price": 6000}, {"name": "Standard Package", "price": 3500}]}',
    '{"tier": "mid_range", "avg_price": 4750.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- FLORALS (non-duplicates)
(
    gen_random_uuid(),
    'BLOOM BLOOM STUDIO',
    (SELECT id FROM vendor_categories WHERE name = 'FLORALS/FLORAL PRESERVATION'),
    'NYC',
    'Modern floral design',
    '{"packages": [{"name": "Full Service", "price": 8000}, {"name": "Basic Package", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 6500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'BRAVE FLORAL',
    (SELECT id FROM vendor_categories WHERE name = 'FLORALS/FLORAL PRESERVATION'),
    'NEW JERSEY',
    'Artisanal wedding flowers',
    '{"packages": [{"name": "Premium Design", "price": 10000}, {"name": "Essential Design", "price": 6000}]}',
    '{"tier": "premium", "avg_price": 8000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),

-- CATERING (non-duplicates)
(
    gen_random_uuid(),
    'CLOUD CATERING',
    (SELECT id FROM vendor_categories WHERE name = 'CATERING/STAFFING'),
    'NYC',
    'Modern catering service',
    '{"packages": [{"name": "Full Service", "price": 20000}, {"name": "Basic Service", "price": 12000}]}',
    '{"tier": "premium", "avg_price": 16000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'CREATIVE FOODS CATERING',
    (SELECT id FROM vendor_categories WHERE name = 'CATERING/STAFFING'),
    'NYC',
    'Innovative wedding catering',
    '{"packages": [{"name": "Premium Package", "price": 25000}, {"name": "Classic Package", "price": 15000}]}',
    '{"tier": "premium", "avg_price": 20000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
);

-- Continue with more vendors
INSERT INTO "public"."vendors" (
    "id", "name", "category_id", "location", "description", 
    "pricing_details", "pricing_tier", "social_media", "contact_info", 
    "services_offered", "amenities", "is_featured", "is_hidden", 
    "created_at", "updated_at"
) VALUES
-- More VENUES
(
    gen_random_uuid(),
    'CHELSEA SQUARE',
    (SELECT id FROM vendor_categories WHERE name = 'VENUES'),
    'NYC',
    'Historic Chelsea venue space',
    '{"packages": [{"name": "Full Day", "price": 15000}, {"name": "Half Day", "price": 9000}]}',
    '{"tier": "premium", "avg_price": 12000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'DEAR MOUNTAIN INN',
    (SELECT id FROM vendor_categories WHERE name = 'VENUES'),
    'HUDSON VALLEY',
    'Boutique mountain inn venue',
    '{"packages": [{"name": "Full Weekend", "price": 20000}, {"name": "Single Day", "price": 12000}]}',
    '{"tier": "premium", "avg_price": 16000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),

-- More PHOTOGRAPHERS
(
    gen_random_uuid(),
    'EDWARD WINTER',
    (SELECT id FROM vendor_categories WHERE name = 'PHOTOGRAPHERS'),
    'NYC',
    'Natural light photography',
    '{"packages": [{"name": "Full Day", "price": 5500}, {"name": "Half Day", "price": 3500}]}',
    '{"tier": "mid_range", "avg_price": 4500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'EILEEN MENY PHOTOGRAPHY',
    (SELECT id FROM vendor_categories WHERE name = 'PHOTOGRAPHERS'),
    'NYC',
    'Documentary style wedding photos',
    '{"packages": [{"name": "Premium", "price": 6000}, {"name": "Essential", "price": 4000}]}',
    '{"tier": "mid_range", "avg_price": 5000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- More CAKE/DESSERTS
(
    gen_random_uuid(),
    'FROM LUCIE',
    (SELECT id FROM vendor_categories WHERE name = 'CAKE/DESSERTS'),
    'NYC',
    'Artisanal wedding desserts',
    '{"packages": [{"name": "Full Dessert Bar", "price": 2800}, {"name": "Classic Cake", "price": 1800}]}',
    '{"tier": "budget", "avg_price": 2300.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'MIA''S BAKERY',
    (SELECT id FROM vendor_categories WHERE name = 'CAKE/DESSERTS'),
    'NYC',
    'Custom wedding cakes',
    '{"packages": [{"name": "Luxury Design", "price": 2500}, {"name": "Simple Design", "price": 1500}]}',
    '{"tier": "budget", "avg_price": 2000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),

-- More LIVE MUSIC
(
    gen_random_uuid(),
    'ELEMENT MUSIC',
    (SELECT id FROM vendor_categories WHERE name = 'LIVE MUSIC'),
    'NYC',
    'Premium wedding entertainment',
    '{"packages": [{"name": "Full Band", "price": 9000}, {"name": "Trio", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 7000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'GARRETT & TAMARA',
    (SELECT id FROM vendor_categories WHERE name = 'LIVE MUSIC'),
    'NYC',
    'Acoustic duo performance',
    '{"packages": [{"name": "Full Evening", "price": 4000}, {"name": "Ceremony Only", "price": 2000}]}',
    '{"tier": "budget", "avg_price": 3000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- More HAIR & MAKEUP
(
    gen_random_uuid(),
    'CURLED & CONTOURED',
    (SELECT id FROM vendor_categories WHERE name = 'HAIR & MAKEUP'),
    'NYC',
    'Full service bridal beauty',
    '{"packages": [{"name": "Bridal Package", "price": 1600}, {"name": "Basic Package", "price": 1000}]}',
    '{"tier": "budget", "avg_price": 1300.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'ELLE WESTBY OF GEMHOUSE',
    (SELECT id FROM vendor_categories WHERE name = 'HAIR & MAKEUP'),
    'NYC',
    'Luxury bridal styling',
    '{"packages": [{"name": "Full Glam", "price": 1800}, {"name": "Natural Look", "price": 1200}]}',
    '{"tier": "budget", "avg_price": 1500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),

-- More TRANSPORTATION
(
    gen_random_uuid(),
    'THE NEW YORK TROLLEY COMPANY',
    (SELECT id FROM vendor_categories WHERE name = 'TRANSPORTATION'),
    'NYC',
    'Unique wedding transportation',
    '{"packages": [{"name": "Full Day", "price": 3500}, {"name": "Half Day", "price": 2000}]}',
    '{"tier": "budget", "avg_price": 2750.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'FILM CARS',
    (SELECT id FROM vendor_categories WHERE name = 'TRANSPORTATION'),
    'NYC',
    'Vintage car rentals',
    '{"packages": [{"name": "Premium Fleet", "price": 4000}, {"name": "Single Car", "price": 2000}]}',
    '{"tier": "mid_range", "avg_price": 3000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- More RENTALS
(
    gen_random_uuid(),
    'PATINA RENTALS',
    (SELECT id FROM vendor_categories WHERE name = 'RENTALS'),
    'NYC',
    'Luxury event rentals',
    '{"packages": [{"name": "Full Service", "price": 7000}, {"name": "Basic Package", "price": 4000}]}',
    '{"tier": "mid_range", "avg_price": 5500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'ATLAS PARTY RENTALS',
    (SELECT id FROM vendor_categories WHERE name = 'RENTALS'),
    'NYC',
    'Complete event rentals',
    '{"packages": [{"name": "Premium Package", "price": 6000}, {"name": "Standard Package", "price": 3500}]}',
    '{"tier": "mid_range", "avg_price": 4750.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- More FLORALS
(
    gen_random_uuid(),
    'DAYS OF MAY FLOWERS',
    (SELECT id FROM vendor_categories WHERE name = 'FLORALS/FLORAL PRESERVATION'),
    'NYC',
    'Romantic wedding florals',
    '{"packages": [{"name": "Full Service", "price": 9000}, {"name": "Essential Package", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 7000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'EXTRAFLORAL STUDIO',
    (SELECT id FROM vendor_categories WHERE name = 'FLORALS/FLORAL PRESERVATION'),
    'NYC',
    'Modern floral design',
    '{"packages": [{"name": "Premium Design", "price": 10000}, {"name": "Basic Design", "price": 6000}]}',
    '{"tier": "premium", "avg_price": 8000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),

-- More CATERING
(
    gen_random_uuid(),
    'PRESERVING HARVEST CATERING',
    (SELECT id FROM vendor_categories WHERE name = 'CATERING/STAFFING'),
    'NYC',
    'Farm to table wedding catering',
    '{"packages": [{"name": "Full Service", "price": 22000}, {"name": "Basic Service", "price": 15000}]}',
    '{"tier": "premium", "avg_price": 18500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'DEBORAH MILLER CATERING',
    (SELECT id FROM vendor_categories WHERE name = 'CATERING/STAFFING'),
    'NYC',
    'Luxury wedding catering',
    '{"packages": [{"name": "Premium Package", "price": 25000}, {"name": "Classic Package", "price": 18000}]}',
    '{"tier": "premium", "avg_price": 21500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),

-- STATIONERY vendors
(
    gen_random_uuid(),
    'ADARA BY BADAL',
    (SELECT id FROM vendor_categories WHERE name = 'STATIONERY'),
    'NYC',
    'Custom wedding invitations',
    '{"packages": [{"name": "Luxury Suite", "price": 3000}, {"name": "Essential Suite", "price": 1500}]}',
    '{"tier": "budget", "avg_price": 2250.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'GOODS GANG',
    (SELECT id FROM vendor_categories WHERE name = 'STATIONERY'),
    'NYC',
    'Modern wedding stationery',
    '{"packages": [{"name": "Full Suite", "price": 2500}, {"name": "Basic Suite", "price": 1200}]}',
    '{"tier": "budget", "avg_price": 1850.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- COUPLE ATTIRE
(
    gen_random_uuid(),
    'BHLDN',
    (SELECT id FROM vendor_categories WHERE name = 'COUPLE ATTIRE'),
    'NYC',
    'Modern bridal boutique',
    '{"packages": [{"name": "Full Service", "price": 5000}, {"name": "Dress Only", "price": 2500}]}',
    '{"tier": "mid_range", "avg_price": 3750.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'GABRIELLE',
    (SELECT id FROM vendor_categories WHERE name = 'COUPLE ATTIRE'),
    'NYC',
    'Luxury bridal salon',
    '{"packages": [{"name": "Full Experience", "price": 6000}, {"name": "Basic Package", "price": 3000}]}',
    '{"tier": "mid_range", "avg_price": 4500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
);

-- Continue with final batch of vendors
INSERT INTO "public"."vendors" (
    "id", "name", "category_id", "location", "description", 
    "pricing_details", "pricing_tier", "social_media", "contact_info", 
    "services_offered", "amenities", "is_featured", "is_hidden", 
    "created_at", "updated_at"
) VALUES
-- More VENUES
(
    gen_random_uuid(),
    'DOBBIN ST',
    (SELECT id FROM vendor_categories WHERE name = 'VENUES'),
    'NYC',
    'Industrial chic venue',
    '{"packages": [{"name": "Full Day", "price": 15000}, {"name": "Half Day", "price": 9000}]}',
    '{"tier": "premium", "avg_price": 12000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'DUMBO LOFT',
    (SELECT id FROM vendor_categories WHERE name = 'VENUES'),
    'NYC',
    'Historic loft space',
    '{"packages": [{"name": "Weekend", "price": 12000}, {"name": "Weekday", "price": 8000}]}',
    '{"tier": "premium", "avg_price": 10000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- More PHOTOGRAPHERS
(
    gen_random_uuid(),
    'ERICA READE PHOTOGRAPHY',
    (SELECT id FROM vendor_categories WHERE name = 'PHOTOGRAPHERS'),
    'NYC',
    'Natural light photography',
    '{"packages": [{"name": "Full Day", "price": 5500}, {"name": "Half Day", "price": 3500}]}',
    '{"tier": "mid_range", "avg_price": 4500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'GIANNA LEO FALCON',
    (SELECT id FROM vendor_categories WHERE name = 'PHOTOGRAPHERS'),
    'HUDSON VALLEY',
    'Fine art wedding photography',
    '{"packages": [{"name": "Premium", "price": 6500}, {"name": "Essential", "price": 4000}]}',
    '{"tier": "mid_range", "avg_price": 5250.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),

-- More DJ'S
(
    gen_random_uuid(),
    'DART COLLECTIVE',
    (SELECT id FROM vendor_categories WHERE name = 'DJ''S'),
    'NEW JERSEY',
    'Modern wedding entertainment',
    '{"packages": [{"name": "Premium DJ", "price": 2800}, {"name": "Basic DJ", "price": 1800}]}',
    '{"tier": "budget", "avg_price": 2300.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'DJ BEN BOYLAN',
    (SELECT id FROM vendor_categories WHERE name = 'DJ''S'),
    'NYC',
    'Experienced wedding DJ',
    '{"packages": [{"name": "Full Package", "price": 2500}, {"name": "Basic Package", "price": 1500}]}',
    '{"tier": "budget", "avg_price": 2000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),

-- More LIVE MUSIC
(
    gen_random_uuid(),
    'GO GO GADJET',
    (SELECT id FROM vendor_categories WHERE name = 'LIVE MUSIC'),
    'NYC',
    'High-energy wedding band',
    '{"packages": [{"name": "Full Band", "price": 8000}, {"name": "Small Band", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 6500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'GREAT FAMILY ARTISTS',
    (SELECT id FROM vendor_categories WHERE name = 'LIVE MUSIC'),
    'NYC',
    'Multi-genre wedding band',
    '{"packages": [{"name": "Large Band", "price": 10000}, {"name": "Small Band", "price": 6000}]}',
    '{"tier": "premium", "avg_price": 8000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),

-- More FLORALS
(
    gen_random_uuid(),
    'FERN BOTANICA',
    (SELECT id FROM vendor_categories WHERE name = 'FLORALS/FLORAL PRESERVATION'),
    'NYC',
    'Sustainable floral design',
    '{"packages": [{"name": "Full Service", "price": 8000}, {"name": "Essential Package", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 6500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'FRAMED FLORALS',
    (SELECT id FROM vendor_categories WHERE name = 'FLORALS/FLORAL PRESERVATION'),
    'NYC',
    'Floral preservation specialists',
    '{"packages": [{"name": "Premium Design", "price": 3000}, {"name": "Basic Design", "price": 1500}]}',
    '{"tier": "budget", "avg_price": 2250.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),

-- More STATIONERY
(
    gen_random_uuid(),
    'I CAN DO THAT DESIGN',
    (SELECT id FROM vendor_categories WHERE name = 'STATIONERY'),
    'NYC',
    'Custom invitation design',
    '{"packages": [{"name": "Full Suite", "price": 2800}, {"name": "Basic Suite", "price": 1500}]}',
    '{"tier": "budget", "avg_price": 2150.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'MAX AND MAIDEN INK',
    (SELECT id FROM vendor_categories WHERE name = 'STATIONERY'),
    'NEW JERSEY',
    'Handcrafted wedding stationery',
    '{"packages": [{"name": "Luxury Package", "price": 3500}, {"name": "Essential Package", "price": 2000}]}',
    '{"tier": "budget", "avg_price": 2750.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),

-- More COUPLE ATTIRE
(
    gen_random_uuid(),
    'LOULETTE BRIDE',
    (SELECT id FROM vendor_categories WHERE name = 'COUPLE ATTIRE'),
    'NYC',
    'Independent bridal designer',
    '{"packages": [{"name": "Custom Design", "price": 5500}, {"name": "Ready to Wear", "price": 3000}]}',
    '{"tier": "mid_range", "avg_price": 4250.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'BROOKLYN TAILORS',
    (SELECT id FROM vendor_categories WHERE name = 'COUPLE ATTIRE'),
    'NYC',
    'Custom suit tailoring',
    '{"packages": [{"name": "Full Custom", "price": 4000}, {"name": "Made to Measure", "price": 2500}]}',
    '{"tier": "mid_range", "avg_price": 3250.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- More HAIR & MAKEUP
(
    gen_random_uuid(),
    'MAKEUP BY LUCAS',
    (SELECT id FROM vendor_categories WHERE name = 'HAIR & MAKEUP'),
    'NYC',
    'Editorial style makeup',
    '{"packages": [{"name": "Full Glam", "price": 1500}, {"name": "Natural Look", "price": 900}]}',
    '{"tier": "budget", "avg_price": 1200.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'MARISSA MOLNAR HAIR',
    (SELECT id FROM vendor_categories WHERE name = 'HAIR & MAKEUP'),
    'NYC',
    'Bridal hair specialist',
    '{"packages": [{"name": "Full Service", "price": 1600}, {"name": "Basic Service", "price": 1000}]}',
    '{"tier": "budget", "avg_price": 1300.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
);

-- Add final batch of vendors to reach 60+ total
INSERT INTO "public"."vendors" (
    "id", "name", "category_id", "location", "description", 
    "pricing_details", "pricing_tier", "social_media", "contact_info", 
    "services_offered", "amenities", "is_featured", "is_hidden", 
    "created_at", "updated_at"
) VALUES
-- More CATERING/STAFFING
(
    gen_random_uuid(),
    'HARVEST AND REVEL',
    (SELECT id FROM vendor_categories WHERE name = 'CATERING/STAFFING'),
    'NYC',
    'Farm-to-table catering',
    '{"packages": [{"name": "Full Service", "price": 25000}, {"name": "Basic Service", "price": 15000}]}',
    '{"tier": "premium", "avg_price": 20000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'REAL FOOD CATERING',
    (SELECT id FROM vendor_categories WHERE name = 'CATERING/STAFFING'),
    'NYC',
    'Sustainable wedding catering',
    '{"packages": [{"name": "Premium Package", "price": 28000}, {"name": "Essential Package", "price": 18000}]}',
    '{"tier": "premium", "avg_price": 23000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- More CAKE/DESSERTS
(
    gen_random_uuid(),
    'NINE CAKES',
    (SELECT id FROM vendor_categories WHERE name = 'CAKE/DESSERTS'),
    'NYC',
    'Artisanal wedding cakes',
    '{"packages": [{"name": "Luxury Cake", "price": 2500}, {"name": "Basic Cake", "price": 1500}]}',
    '{"tier": "budget", "avg_price": 2000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'LAEL CAKES',
    (SELECT id FROM vendor_categories WHERE name = 'CAKE/DESSERTS'),
    'NYC',
    'Custom wedding cakes',
    '{"packages": [{"name": "Premium Design", "price": 3000}, {"name": "Simple Design", "price": 1800}]}',
    '{"tier": "budget", "avg_price": 2400.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- More PHOTOGRAPHERS
(
    gen_random_uuid(),
    'SUSAN STRIPLING',
    (SELECT id FROM vendor_categories WHERE name = 'PHOTOGRAPHERS'),
    'NYC',
    'Award-winning wedding photography',
    '{"packages": [{"name": "Full Coverage", "price": 8000}, {"name": "Basic Coverage", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 6500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'PAT FUREY',
    (SELECT id FROM vendor_categories WHERE name = 'PHOTOGRAPHERS'),
    'NYC',
    'Documentary wedding photography',
    '{"packages": [{"name": "Full Day", "price": 7000}, {"name": "Half Day", "price": 4000}]}',
    '{"tier": "mid_range", "avg_price": 5500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- More FLORALS
(
    gen_random_uuid(),
    'STEMS BROOKLYN',
    (SELECT id FROM vendor_categories WHERE name = 'FLORALS/FLORAL PRESERVATION'),
    'NYC',
    'Modern floral design',
    '{"packages": [{"name": "Full Service", "price": 12000}, {"name": "Basic Package", "price": 7000}]}',
    '{"tier": "premium", "avg_price": 9500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'FOXGLOVE STUDIO',
    (SELECT id FROM vendor_categories WHERE name = 'FLORALS/FLORAL PRESERVATION'),
    'HUDSON VALLEY',
    'Garden-inspired florals',
    '{"packages": [{"name": "Premium Design", "price": 10000}, {"name": "Essential Design", "price": 6000}]}',
    '{"tier": "premium", "avg_price": 8000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- More DJ'S
(
    gen_random_uuid(),
    'BEAT TRAIN PRODUCTIONS',
    (SELECT id FROM vendor_categories WHERE name = 'DJ''S'),
    'NYC',
    'Boutique wedding DJ service',
    '{"packages": [{"name": "Premium Package", "price": 2800}, {"name": "Basic Package", "price": 1800}]}',
    '{"tier": "budget", "avg_price": 2300.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'REMIXOLOGISTS',
    (SELECT id FROM vendor_categories WHERE name = 'DJ''S'),
    'NYC',
    'Modern wedding DJs',
    '{"packages": [{"name": "Full Service", "price": 2500}, {"name": "Basic Service", "price": 1500}]}',
    '{"tier": "budget", "avg_price": 2000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- More LIVE MUSIC
(
    gen_random_uuid(),
    'SILVER ARROW BAND',
    (SELECT id FROM vendor_categories WHERE name = 'LIVE MUSIC'),
    'NYC',
    'High-energy wedding band',
    '{"packages": [{"name": "Full Band", "price": 9000}, {"name": "Core Band", "price": 6000}]}',
    '{"tier": "mid_range", "avg_price": 7500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'ELAN ARTISTS',
    (SELECT id FROM vendor_categories WHERE name = 'LIVE MUSIC'),
    'NYC',
    'Luxury wedding entertainment',
    '{"packages": [{"name": "Premium Band", "price": 12000}, {"name": "Basic Band", "price": 8000}]}',
    '{"tier": "premium", "avg_price": 10000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- Add vendors for remaining categories
INSERT INTO "public"."vendors" (
    "id", "name", "category_id", "description", 
    "location", "pricing_details", "pricing_tier", 
    "social_media", "contact_info", "services_offered", 
    "amenities", "is_featured", "is_hidden", 
    "created_at", "updated_at"
) VALUES
-- CAKE/DESSERTS (Budget tier < $3,000)
(
    gen_random_uuid(),
    'MAGNOLIA BAKERY',
    (SELECT id FROM vendor_categories WHERE name = 'CAKE/DESSERTS'),
    'Classic wedding cakes and desserts',
    'NYC',
    '{"packages": [{"name": "Premium Package", "price": 2500}, {"name": "Basic Package", "price": 1500}]}',
    '{"tier": "budget", "avg_price": 2000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'MILK BAR',
    (SELECT id FROM vendor_categories WHERE name = 'CAKE/DESSERTS'),
    'NYC',
    'Modern wedding cakes and treats',
    '{"packages": [{"name": "Deluxe Package", "price": 2800}, {"name": "Essential Package", "price": 1800}]}',
    '{"tier": "budget", "avg_price": 2300.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- PHOTOGRAPHERS (Mid-range tier $3,500-$8,000)
(
    gen_random_uuid(),
    'SUSAN STRIPLING',
    (SELECT id FROM vendor_categories WHERE name = 'PHOTOGRAPHERS'),
    'NYC',
    'Award-winning wedding photography',
    '{"packages": [{"name": "Full Coverage", "price": 7500}, {"name": "Basic Coverage", "price": 4500}]}',
    '{"tier": "mid_range", "avg_price": 6000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'GARY NEVITT',
    (SELECT id FROM vendor_categories WHERE name = 'PHOTOGRAPHERS'),
    'NYC',
    'Documentary wedding photography',
    '{"packages": [{"name": "Premium", "price": 6500}, {"name": "Essential", "price": 4000}]}',
    '{"tier": "mid_range", "avg_price": 5250.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- RENTALS (Mid-range tier $3,000-$10,000)
(
    gen_random_uuid(),
    'BROADWAY PARTY RENTALS',
    (SELECT id FROM vendor_categories WHERE name = 'RENTALS'),
    'NYC',
    'Full-service event rentals',
    '{"packages": [{"name": "Luxury Package", "price": 8000}, {"name": "Standard Package", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 6500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'TAYLOR CREATIVE',
    (SELECT id FROM vendor_categories WHERE name = 'RENTALS'),
    'NYC',
    'Modern furniture and decor rentals',
    '{"packages": [{"name": "Premium Collection", "price": 7000}, {"name": "Basic Collection", "price": 4000}]}',
    '{"tier": "mid_range", "avg_price": 5500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- STATIONERY (Budget tier $1,500-$5,000)
(
    gen_random_uuid(),
    'BELLA FIGURA',
    (SELECT id FROM vendor_categories WHERE name = 'STATIONERY'),
    'Luxury wedding invitations',
    'NYC',
    '{"packages": [{"name": "Custom Suite", "price": 2800}, {"name": "Semi-Custom Suite", "price": 1800}]}',
    '{"tier": "budget", "avg_price": 2300.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'MINTED WEDDINGS',
    (SELECT id FROM vendor_categories WHERE name = 'STATIONERY'),
    'NYC',
    'Modern wedding stationery',
    '{"packages": [{"name": "Premium Suite", "price": 2500}, {"name": "Basic Suite", "price": 1500}]}',
    '{"tier": "budget", "avg_price": 2000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- STYLING (Mid-range tier $4,000-$10,000)
(
    gen_random_uuid(),
    'STYLE ME PRETTY',
    (SELECT id FROM vendor_categories WHERE name = 'STYLING'),
    'NYC',
    'Full-service wedding styling',
    '{"packages": [{"name": "Full Design", "price": 8000}, {"name": "Partial Design", "price": 5000}]}',
    '{"tier": "mid_range", "avg_price": 6500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'FETE NY',
    (SELECT id FROM vendor_categories WHERE name = 'STYLING'),
    'NYC',
    'Luxury event design',
    '{"packages": [{"name": "Complete Design", "price": 9000}, {"name": "Basic Design", "price": 6000}]}',
    '{"tier": "mid_range", "avg_price": 7500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
),

-- TRANSPORTATION (Mid-range tier $3,000-$10,000)
(
    gen_random_uuid(),
    'M&V LIMOUSINES',
    (SELECT id FROM vendor_categories WHERE name = 'TRANSPORTATION'),
    'NYC',
    'Luxury wedding transportation',
    '{"packages": [{"name": "Premium Fleet", "price": 7000}, {"name": "Basic Fleet", "price": 4000}]}',
    '{"tier": "mid_range", "avg_price": 5500.0000000000000000}',
    '{}', '{}', '[]', '[]', 'true', 'false', NOW(), NOW()
),
(
    gen_random_uuid(),
    'SANTOS VIP',
    (SELECT id FROM vendor_categories WHERE name = 'TRANSPORTATION'),
    'NYC',
    'Classic wedding transportation',
    '{"packages": [{"name": "Luxury Package", "price": 6500}, {"name": "Standard Package", "price": 3500}]}',
    '{"tier": "mid_range", "avg_price": 5000.0000000000000000}',
    '{}', '{}', '[]', '[]', 'false', 'false', NOW(), NOW()
);

-- Add pricing tiers for existing vendors
UPDATE vendors v SET
    pricing_details = CASE 
        WHEN vc.name = 'FLORALS/FLORAL PRESERVATION' THEN '{"packages": [{"name": "Full Service", "price": 12000}, {"name": "Basic Service", "price": 8000}]}'
        WHEN vc.name = 'CATERING/STAFFING' THEN '{"packages": [{"name": "Premium Package", "price": 20000}, {"name": "Basic Package", "price": 15000}]}'
        WHEN vc.name IN ('PHOTOGRAPHERS', 'VIDEOGRAPHERS') THEN '{"packages": [{"name": "Full Coverage", "price": 7000}, {"name": "Basic Coverage", "price": 4000}]}'
        WHEN vc.name = 'LIVE MUSIC' THEN '{"packages": [{"name": "Full Band", "price": 8000}, {"name": "Small Band", "price": 5000}]}'
        WHEN vc.name = 'DJ''S' THEN '{"packages": [{"name": "Premium DJ", "price": 2500}, {"name": "Basic DJ", "price": 1500}]}'
        WHEN vc.name = 'COUPLE ATTIRE' THEN '{"packages": [{"name": "Custom Design", "price": 6000}, {"name": "Ready to Wear", "price": 3500}]}'
        WHEN vc.name = 'HAIR & MAKEUP' THEN '{"packages": [{"name": "Full Glam", "price": 1500}, {"name": "Natural Look", "price": 900}]}'
        WHEN vc.name = 'OFFICIANTS' THEN '{"packages": [{"name": "Custom Ceremony", "price": 1800}, {"name": "Simple Ceremony", "price": 1000}]}'
        WHEN vc.name = 'RENTALS' THEN '{"packages": [{"name": "Full Collection", "price": 8000}, {"name": "Basic Collection", "price": 5000}]}'
        WHEN vc.name = 'STATIONERY' THEN '{"packages": [{"name": "Custom Suite", "price": 2800}, {"name": "Semi-Custom Suite", "price": 1800}]}'
        WHEN vc.name = 'STYLING' THEN '{"packages": [{"name": "Full Design", "price": 8000}, {"name": "Partial Design", "price": 5000}]}'
        WHEN vc.name = 'TRANSPORTATION' THEN '{"packages": [{"name": "Premium Fleet", "price": 7000}, {"name": "Basic Fleet", "price": 4000}]}'
        WHEN vc.name = 'CAKE/DESSERTS' THEN '{"packages": [{"name": "Premium Package", "price": 2500}, {"name": "Basic Package", "price": 1500}]}'
    END,
    pricing_tier = CASE 
        WHEN vc.name IN ('FLORALS/FLORAL PRESERVATION', 'CATERING/STAFFING') THEN '{"tier": "premium", "avg_price": 15000.0000000000000000}'
        WHEN vc.name IN ('PHOTOGRAPHERS', 'VIDEOGRAPHERS', 'LIVE MUSIC', 'COUPLE ATTIRE', 'RENTALS', 'STYLING', 'TRANSPORTATION') THEN '{"tier": "mid_range", "avg_price": 6000.0000000000000000}'
        ELSE '{"tier": "budget", "avg_price": 2000.0000000000000000}'
    END,
    updated_at = NOW()
FROM vendor_categories vc
WHERE v.category_id = vc.id;
