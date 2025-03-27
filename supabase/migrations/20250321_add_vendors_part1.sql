-- Create vendor_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS vendor_categories (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    icon text NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    slug text GENERATED ALWAYS AS (lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))) STORED
);

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
    category_id uuid NOT NULL REFERENCES vendor_categories(id),
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
    CONSTRAINT vendors_category_id_fkey FOREIGN KEY (category_id) REFERENCES vendor_categories(id)
);

-- Create indexes for vendor-related queries
CREATE UNIQUE INDEX IF NOT EXISTS vendors_slug_idx ON vendors (slug);
CREATE INDEX IF NOT EXISTS vendors_category_id_idx ON vendors (category_id);
CREATE INDEX IF NOT EXISTS vendors_location_idx ON vendors (location);
CREATE INDEX IF NOT EXISTS vendors_is_featured_idx ON vendors (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS vendors_pricing_tier_idx ON vendors USING GIN (pricing_tier);
CREATE INDEX IF NOT EXISTS vendors_services_offered_idx ON vendors USING GIN (services_offered);
CREATE INDEX IF NOT EXISTS vendors_amenities_idx ON vendors USING GIN (amenities);

-- First clean up any vendor_auth entries for vendors we'll delete
DELETE FROM vendor_auth WHERE vendor_id IN (
  SELECT id FROM vendors WHERE category_id IN (
    SELECT id FROM vendor_categories WHERE name IN ('Photography', 'Planning')
  )
);

-- Then clean up vendors in categories we want to remove
DELETE FROM vendors WHERE category_id IN (
  SELECT id FROM vendor_categories WHERE name IN ('Photography', 'Planning')
);

-- Finally clean up duplicate categories
DELETE FROM vendor_categories WHERE name IN ('Photography', 'Planning');

-- Add vendors with proper JSONB structures
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
-- VENUES vendors
('501 UNION', 
 '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e', 
 'NYC', 
 'Premier wedding venue in NYC', 
 '{"packages": [{"name": "Weekend Package", "price": 15000}, {"name": "Weekday Package", "price": 10000}]}'::jsonb,
 false, false, now(), now()),

('The Green Building',
 '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e',
 'Brooklyn',
 'Industrial chic wedding venue',
 '{"packages": [{"name": "Full Day", "price": 12000}, {"name": "Half Day", "price": 8000}]}'::jsonb,
 false, false, now(), now()),

-- LIVE MUSIC vendors
('Melody Masters Entertainment',
 '051803d5-52fc-4b1d-916d-710c758b9df8',
 'NYC',
 'Professional wedding entertainment',
 '{"packages": [{"name": "Live Band", "price": 5000}, {"name": "DJ Service", "price": 2000}]}'::jsonb,
 false, false, now(), now()),

-- VIDEOGRAPHERS vendors
('NST PICTURES',
 '88cf9c50-4f3e-7f3f-a7f1-d92f7c4c3b9e',
 'NYC',
 'Cinematic wedding films',
 '{"packages": [{"name": "Feature Film", "price": 7000}, {"name": "Highlight Film", "price": 4000}]}'::jsonb,
 false, false, now(), now()),

('LOVE STORY FILMS',
 '88cf9c50-4f3e-7f3f-a7f1-d92f7c4c3b9e',
 'NYC',
 'Documentary wedding videography',
 '{"packages": [{"name": "Premium Coverage", "price": 8000}, {"name": "Basic Coverage", "price": 5000}]}'::jsonb,
 false, false, now(), now());
