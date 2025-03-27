-- Insert vendors with their categories
INSERT INTO vendors (
    name,
    category_id,
    location,
    slug,
    created_at,
    updated_at
) VALUES
-- VENUES (id: 2d5f9a42-...)
('501 UNION', '2d5f9a42-0000-0000-0000-000000000000', 'NYC', '501-union', NOW(), NOW()),
('74 WYTHE', '2d5f9a42-0000-0000-0000-000000000000', 'NYC', '74-wythe', NOW(), NOW()),
('ASBURY HOTEL', '2d5f9a42-0000-0000-0000-000000000000', 'NEW JERSEY', 'asbury-hotel', NOW(), NOW()),
('AUDREY''S FARM HOUSE', '2d5f9a42-0000-0000-0000-000000000000', 'HUDSON VALLEY', 'audreys-farm-house', NOW(), NOW()),
('BASILICA HUDSON', '2d5f9a42-0000-0000-0000-000000000000', 'HUDSON VALLEY', 'basilica-hudson', NOW(), NOW()),
-- Continue VENUES...

-- STYLING (id: 66af9a48-...)
('AGENCY 8 BRIDAL STYLIST', '66af9a48-0000-0000-0000-000000000000', 'NYC', 'agency-8-bridal-stylist', NOW(), NOW()),

-- HAIR & MAKEUP (id: dd3f9d45-...)
('BEAUTINI', 'dd3f9d45-0000-0000-0000-000000000000', 'NYC', 'beautini', NOW(), NOW()),

-- COUPLE ATTIRE (id: cc2f9c44-...)
('IVORY & VEIL BRIDAL', 'cc2f9c44-0000-0000-0000-000000000000', 'NEW JERSEY', 'ivory-and-veil-bridal', NOW(), NOW()),
('ABIGAIL BRIDE', 'cc2f9c44-0000-0000-0000-000000000000', 'NEW JERSEY', 'abigail-bride', NOW(), NOW()),

-- CAKE/DESSERTS (id: bb1f9b43-...)
('CAKE HERO', 'bb1f9b43-0000-0000-0000-000000000000', 'NYC', 'cake-hero', NOW(), NOW()),
('NINE CAKES', 'bb1f9b43-0000-0000-0000-000000000000', 'NYC', 'nine-cakes', NOW(), NOW()),

-- Continue for all vendors...

ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    location = EXCLUDED.location,
    updated_at = NOW();
