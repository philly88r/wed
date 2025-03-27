-- Drop existing tables to start fresh
DROP TABLE IF EXISTS public.vendor_auth CASCADE;
DROP TABLE IF EXISTS public.vendors CASCADE;
DROP TABLE IF EXISTS public.vendor_categories CASCADE;

-- Create the vendor_categories table with updated structure
CREATE TABLE public.vendor_categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    slug text GENERATED ALWAYS AS (
        lower(regexp_replace(
            regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        ))
    ) STORED,
    icon text NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create unique index on slug
CREATE UNIQUE INDEX vendor_categories_slug_idx ON vendor_categories(slug);

-- Enable Row Level Security for vendor_categories
ALTER TABLE public.vendor_categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to vendor_categories
CREATE POLICY "Allow public read access" ON public.vendor_categories
    FOR SELECT USING (true);

-- Insert standardized categories with correct UUIDs
INSERT INTO vendor_categories (id, name, icon, description, created_at, updated_at) VALUES
('2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e', 'VENUES', 'location_city', 'Wedding venues and event spaces', now(), now()),
('bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b2e', 'CAKE/DESSERTS', 'cake', 'Wedding cakes and dessert services', now(), now()),
('3e8b2d76-1f5a-4c9d-b8e2-f1d3b7a8c9e0', 'CATERING/STAFFING', 'restaurant', 'Catering and event staffing services', now(), now()),
('cc2f9c44-8d3e-4c3f-a7f1-d92f7c4c3b3e', 'COUPLE ATTIRE', 'dress', 'Wedding dresses and formal attire', now(), now()),
('99df9d51-5f3e-8f3f-a7f1-d92f7c4c3bae', 'DJ''S', 'music_note', 'Professional wedding DJs', now(), now()),
('051803d5-52fc-4b1d-916d-710c758b9df8', 'LIVE MUSIC', 'queue_music', 'Live bands and musical entertainment', now(), now()),
('5a0d4f98-3a7c-6e1f-da04-a3f5d9c0e1a2', 'FLORALS/FLORAL PRESERVATION', 'local_florist', 'Wedding flowers and preservation', now(), now()),
('dd3f9d45-9e3e-4d3f-a7f1-d92f7c4c3b4e', 'HAIR & MAKEUP', 'face', 'Bridal beauty services', now(), now()),
('4d7f9c44-9c1e-4b3f-a7f1-d92f7c4c3b2f', 'OFFICIANTS', 'person', 'Wedding ceremony officiants', now(), now()),
('5d8f9d45-9c1e-4b3f-a7f1-d92f7c4c3b3f', 'PHOTOGRAPHERS', 'photo_camera', 'Wedding photography services', now(), now()),
('ee4f9e46-0f3e-4e3f-a7f1-d92f7c4c3b5e', 'RENTALS', 'chair', 'Event furniture and decor rentals', now(), now()),
('ff5f9f47-1f3e-4f3f-a7f1-d92f7c4c3b6e', 'STATIONERY', 'mail', 'Wedding invitations and paper goods', now(), now()),
('66af9a48-2f3e-5f3f-a7f1-d92f7c4c3b7e', 'STYLING', 'style', 'Wedding styling and design services', now(), now()),
('77bf9b49-3f3e-6f3f-a7f1-d92f7c4c3b8e', 'TRANSPORTATION', 'directions_car', 'Wedding transportation services', now(), now()),
('88cf9c50-4f3e-7f3f-a7f1-d92f7c4c3b9e', 'VIDEOGRAPHERS', 'videocam', 'Wedding videography services', now(), now());
