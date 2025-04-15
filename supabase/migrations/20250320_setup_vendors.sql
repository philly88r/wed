-- Drop existing tables to start fresh
DROP TABLE IF EXISTS public.vendor_auth CASCADE;
DROP TABLE IF EXISTS public.vendors CASCADE;
DROP TABLE IF EXISTS public.vendor_categories CASCADE;

-- Create the vendor_categories table with updated structure
CREATE TABLE IF NOT EXISTS public.vendor_categories (
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
CREATE UNIQUE INDEX IF NOT EXISTS vendor_categories_slug_idx ON vendor_categories(slug);

-- Enable Row Level Security for vendor_categories
ALTER TABLE public.vendor_categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to vendor_categories
DROP POLICY IF EXISTS "Allow public read access" ON public.vendor_categories;
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

-- Create vendors table with proper structure
CREATE TABLE IF NOT EXISTS vendors (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    slug text GENERATED ALWAYS AS (
        lower(regexp_replace(
            regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        ))
    ) STORED,
    category_id uuid NOT NULL,
    location text NOT NULL,
    description text NOT NULL,
    pricing_details jsonb NOT NULL DEFAULT '{"packages": []}'::jsonb,
    pricing_tier jsonb DEFAULT '{"tier": "unset", "avg_price": null}'::jsonb,
    social_media jsonb DEFAULT '{}'::jsonb,
    contact_info jsonb DEFAULT '{}'::jsonb,
    services_offered jsonb DEFAULT '[]'::jsonb,
    amenities jsonb DEFAULT '[]'::jsonb,
    is_featured boolean DEFAULT false,
    is_hidden boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    FOREIGN KEY (category_id) REFERENCES vendor_categories(id)
);

-- Create indexes for vendor-related queries
CREATE UNIQUE INDEX IF NOT EXISTS vendors_slug_idx ON vendors (slug);
CREATE INDEX IF NOT EXISTS vendors_category_id_idx ON vendors (category_id);
CREATE INDEX IF NOT EXISTS vendors_location_idx ON vendors (location);
CREATE INDEX IF NOT EXISTS vendors_is_featured_idx ON vendors (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS vendors_pricing_tier_idx ON vendors USING GIN (pricing_tier);
CREATE INDEX IF NOT EXISTS vendors_services_offered_idx ON vendors USING GIN (services_offered);
CREATE INDEX IF NOT EXISTS vendors_amenities_idx ON vendors USING GIN (amenities);

-- Create vendor_auth table for authentication
CREATE TABLE IF NOT EXISTS vendor_auth (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id uuid NOT NULL,
    auth_type text NOT NULL,
    auth_details jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- Create pricing tier update trigger
DROP TRIGGER IF EXISTS update_pricing_tier ON vendors;
DROP FUNCTION IF EXISTS update_vendor_pricing_tier();

CREATE OR REPLACE FUNCTION update_vendor_pricing_tier()
RETURNS trigger AS $$
BEGIN
  -- Calculate pricing tier based on average package price
  WITH package_stats AS (
    SELECT 
      AVG((p->>'price')::numeric) as avg_price
    FROM jsonb_array_elements(NEW.pricing_details->'packages') p
  )
  SELECT
    jsonb_build_object(
      'tier',
      CASE
        WHEN avg_price < 3000 THEN 'budget'
        WHEN avg_price < 10000 THEN 'mid_range'
        ELSE 'premium'
      END,
      'avg_price', avg_price
    ) INTO NEW.pricing_tier
  FROM package_stats;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update pricing tier
CREATE TRIGGER update_pricing_tier
    BEFORE INSERT OR UPDATE OF pricing_details
    ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_pricing_tier();

-- Add initial set of vendors
INSERT INTO vendors (
    name,
    category_id,
    location,
    description,
    pricing_details,
    is_featured,
    is_hidden,
    created_at,
    updated_at
) VALUES
-- Premium tier vendors (> $10,000)
('501 UNION', 
 '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e', 
 'NYC', 
 'Premier wedding venue in NYC', 
 '{"packages": [{"name": "Weekend Package", "price": 15000}, {"name": "Weekday Package", "price": 10000}]}'::jsonb,
 true, false, now(), now()),

('PURSLANE CATERING',
 '3e8b2d76-1f5a-4c9d-b8e2-f1d3b7a8c9e0',
 'NYC',
 'Farm-to-table wedding catering',
 '{"packages": [{"name": "Full Service", "price": 20000}, {"name": "Premium Service", "price": 15000}]}'::jsonb,
 true, false, now(), now()),

('PUTNAM & PUTNAM',
 '5a0d4f98-3a7c-6e1f-da04-a3f5d9c0e1a2',
 'NYC',
 'Luxury floral design',
 '{"packages": [{"name": "Full Design", "price": 12000}, {"name": "Premium Package", "price": 8000}]}'::jsonb,
 true, false, now(), now()),

-- Mid-range tier ($3,000-$10,000)
('NST PICTURES',
 '88cf9c50-4f3e-7f3f-a7f1-d92f7c4c3b9e',
 'NYC',
 'Cinematic wedding films',
 '{"packages": [{"name": "Feature Film", "price": 7000}, {"name": "Highlight Film", "price": 4000}]}'::jsonb,
 false, false, now(), now()),

('MELODY MASTERS',
 '051803d5-52fc-4b1d-916d-710c758b9df8',
 'NYC',
 'Professional wedding entertainment',
 '{"packages": [{"name": "Live Band", "price": 6000}, {"name": "Acoustic Trio", "price": 3500}]}'::jsonb,
 false, false, now(), now()),

('SPINA BRIDE',
 'cc2f9c44-8d3e-4c3f-a7f1-d92f7c4c3b3e',
 'NYC',
 'Luxury bridal collections',
 '{"packages": [{"name": "Full Service", "price": 5000}, {"name": "Dress Only", "price": 3000}]}'::jsonb,
 false, false, now(), now()),

-- Budget tier (< $3,000)
('SCRATCH WEDDINGS',
 '99df9d51-5f3e-8f3f-a7f1-d92f7c4c3bae',
 'NYC',
 'Professional wedding DJs',
 '{"packages": [{"name": "Premium DJ", "price": 2500}, {"name": "Basic DJ", "price": 1500}]}'::jsonb,
 false, false, now(), now()),

('BEAUTINI',
 'dd3f9d45-9e3e-4d3f-a7f1-d92f7c4c3b4e',
 'NYC',
 'Bridal beauty services',
 '{"packages": [{"name": "Full Glam", "price": 1200}, {"name": "Natural Look", "price": 800}]}'::jsonb,
 false, false, now(), now()),

('HONEYBREAK OFFICIANTS',
 '4d7f9c44-9c1e-4b3f-a7f1-d92f7c4c3b2f',
 'NYC',
 'Professional wedding officiants',
 '{"packages": [{"name": "Custom Ceremony", "price": 1500}, {"name": "Simple Ceremony", "price": 800}]}'::jsonb,
 false, false, now(), now());
