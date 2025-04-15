-- Create the vendors table with proper UUID foreign key
DROP TABLE IF EXISTS public.vendors CASCADE;

CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE GENERATED ALWAYS AS (
        lower(regexp_replace(
            regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        ))
    ) STORED,
    category_id UUID NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    social_media JSONB DEFAULT '{}'::jsonb,
    contact_info JSONB DEFAULT '{}'::jsonb,
    business_hours JSONB DEFAULT '{}'::jsonb,
    services_offered JSONB DEFAULT '[]'::jsonb,
    pricing_details JSONB DEFAULT '{}'::jsonb,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    amenities JSONB DEFAULT '[]'::jsonb,
    faq JSONB DEFAULT '[]'::jsonb,
    address JSONB DEFAULT '{}'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security for vendors
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to vendors
CREATE POLICY "Allow public read access" ON public.vendors
    FOR SELECT USING (true);

-- Add initial vendor data with Music category UUID
INSERT INTO public.vendors (name, category_id, location, description, is_featured, is_hidden) VALUES
('501 UNION', '051803d5-52fc-4b1d-916d-710c758b9df8', 'NYC', 'Industrial chic venue in Gowanus', false, false);
