-- Clean existing data
TRUNCATE TABLE public.vendors CASCADE;
TRUNCATE TABLE public.vendor_categories CASCADE;

-- Add categories
INSERT INTO public.vendor_categories (id, name, icon, description) VALUES
('051803d5-52fc-4b1d-916d-710c758b9df8', 'Music', 'music_note', 'Live music and entertainment'),
('15f5c968-a43a-4b8d-a1e0-a5f4b1f7f5c8', 'Photography', 'camera_alt', 'Photography and videography'),
('2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e', 'Venues', 'location_on', 'Wedding venues and spaces'),
('3e8b2d76-1f5a-4c9d-b8e2-f1d3b7a8c9e0', 'Catering', 'restaurant', 'Food and beverage services'),
('4f9c3e87-216b-5d0e-c9f3-12e4c8b9d0f1', 'Planning', 'event', 'Wedding planning services'),
('5a0d4f98-3a7c-6e1f-da04-a3f5d9c0e1a2', 'Decor', 'palette', 'Decor and floral design');

-- Add vendors
INSERT INTO public.vendors (name, description, location, category_id, social_media, contact_info, is_featured, is_hidden, gallery_images) VALUES
-- Venues
('The Green Building', 'Historic brass foundry turned event space', 'Brooklyn', '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e', 
 '{"instagram": "@thegreenbuildingnyc", "website": "https://thegreenbuildingnyc.com"}'::jsonb,
 '{"email": "events@thegreenbuildingnyc.com", "phone": "(718) 522-3363"}'::jsonb,
 true, false, '["/venues/green-building.jpg"]'),
('Brooklyn Winery', 'Urban winery and event space', 'Brooklyn', '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e',
 '{"instagram": "@brooklynwinery", "website": "https://bkwinery.com"}'::jsonb,
 '{"email": "events@bkwinery.com", "phone": "(347) 763-1506"}'::jsonb,
 false, false, '["/venues/brooklyn-winery.jpg"]'),
('26 Bridge', 'Historic metal factory with exposed brick', 'DUMBO', '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e',
 '{"instagram": "@26bridgenyc", "website": "https://26bridge.com"}'::jsonb,
 '{"email": "info@26bridge.com", "phone": "(718) 310-3040"}'::jsonb,
 false, false, '["/venues/26-bridge.jpg"]'),

-- Photography
('Emma Davis Photography', 'Fine art wedding photography', 'NYC', '15f5c968-a43a-4b8d-a1e0-a5f4b1f7f5c8',
 '{"instagram": "@emmadavisphoto", "website": "https://emmadavisphotography.com"}'::jsonb,
 '{"email": "emma@emmadavisphotography.com", "phone": "(917) 555-0123"}'::jsonb,
 true, false, '["/photography/emma-davis.jpg"]'),
('Captured Moments', 'Documentary style photography', 'Manhattan', '15f5c968-a43a-4b8d-a1e0-a5f4b1f7f5c8',
 '{"instagram": "@capturedmoments", "website": "https://capturedmoments.com"}'::jsonb,
 '{"email": "info@capturedmoments.com", "phone": "(212) 555-0124"}'::jsonb,
 false, false, '["/photography/captured-moments.jpg"]'),
('Visual Stories', 'Cinematic wedding films', 'Brooklyn', '15f5c968-a43a-4b8d-a1e0-a5f4b1f7f5c8',
 '{"instagram": "@visualstoriesnyc", "website": "https://visualstories.com"}'::jsonb,
 '{"email": "hello@visualstories.com", "phone": "(718) 555-0125"}'::jsonb,
 false, false, '["/photography/visual-stories.jpg"]'),

-- Planning
('Modern Events', 'Full-service wedding planning', 'Manhattan', '4f9c3e87-216b-5d0e-c9f3-12e4c8b9d0f1',
 '{"instagram": "@moderneventsnyc", "website": "https://moderneventsnyc.com"}'::jsonb,
 '{"email": "plan@moderneventsnyc.com", "phone": "(212) 555-0126"}'::jsonb,
 true, false, '["/planning/modern-events.jpg"]'),
('Perfect Plans', 'Luxury wedding planning', 'NYC', '4f9c3e87-216b-5d0e-c9f3-12e4c8b9d0f1',
 '{"instagram": "@perfectplansnyc", "website": "https://perfectplansnyc.com"}'::jsonb,
 '{"email": "info@perfectplansnyc.com", "phone": "(917) 555-0127"}'::jsonb,
 false, false, '["/planning/perfect-plans.jpg"]'),
('Day Of Coordination', 'Wedding day management', 'Brooklyn', '4f9c3e87-216b-5d0e-c9f3-12e4c8b9d0f1',
 '{"instagram": "@dayofnyc", "website": "https://dayofnyc.com"}'::jsonb,
 '{"email": "hello@dayofnyc.com", "phone": "(718) 555-0128"}'::jsonb,
 false, false, '["/planning/day-of.jpg"]'),

-- Catering
('Purslane Catering', 'Farm-to-table catering', 'Brooklyn', '3e8b2d76-1f5a-4c9d-b8e2-f1d3b7a8c9e0',
 '{"instagram": "@purslanecatering", "website": "https://purslanecatering.com"}'::jsonb,
 '{"email": "events@purslanecatering.com", "phone": "(718) 555-0129"}'::jsonb,
 true, false, '["/catering/purslane.jpg"]'),
('Real Food Catering', 'Seasonal and sustainable menus', 'NYC', '3e8b2d76-1f5a-4c9d-b8e2-f1d3b7a8c9e0',
 '{"instagram": "@realfoodnyc", "website": "https://realfoodcatering.com"}'::jsonb,
 '{"email": "eat@realfoodcatering.com", "phone": "(917) 555-0130"}'::jsonb,
 false, false, '["/catering/real-food.jpg"]'),
('Sweet Events', 'Custom wedding cakes and desserts', 'Manhattan', '3e8b2d76-1f5a-4c9d-b8e2-f1d3b7a8c9e0',
 '{"instagram": "@sweeteventsnyc", "website": "https://sweeteventsnyc.com"}'::jsonb,
 '{"email": "desserts@sweeteventsnyc.com", "phone": "(212) 555-0131"}'::jsonb,
 false, false, '["/catering/sweet-events.jpg"]'),

-- Decor
('Stems Brooklyn', 'Modern floral design', 'Brooklyn', '5a0d4f98-3a7c-6e1f-da04-a3f5d9c0e1a2',
 '{"instagram": "@stemsbrooklyn", "website": "https://stemsbrooklyn.com"}'::jsonb,
 '{"email": "flowers@stemsbrooklyn.com", "phone": "(718) 555-0132"}'::jsonb,
 true, false, '["/decor/stems.jpg"]'),
('Wild Floral', 'Botanical installations and bouquets', 'Manhattan', '5a0d4f98-3a7c-6e1f-da04-a3f5d9c0e1a2',
 '{"instagram": "@wildfloralnyc", "website": "https://wildfloral.com"}'::jsonb,
 '{"email": "hello@wildfloral.com", "phone": "(212) 555-0133"}'::jsonb,
 false, false, '["/decor/wild-floral.jpg"]'),
('Light & Design', 'Custom lighting and decor', 'NYC', '5a0d4f98-3a7c-6e1f-da04-a3f5d9c0e1a2',
 '{"instagram": "@lightanddesignnyc", "website": "https://lightanddesign.com"}'::jsonb,
 '{"email": "info@lightanddesign.com", "phone": "(917) 555-0134"}'::jsonb,
 false, false, '["/decor/light-design.jpg"]'),

-- Music
('501 UNION', 'Industrial chic venue in Gowanus', 'NYC', '051803d5-52fc-4b1d-916d-710c758b9df8',
 '{"instagram": "@501union", "website": "https://501union.com"}'::jsonb,
 '{"email": "events@501union.com", "phone": "(347) 555-0135"}'::jsonb,
 false, false, '["/music/501-union.jpg"]');
