-- Drop the old vendors table
DROP TABLE IF EXISTS public.vendors CASCADE;

-- Create the vendors table with updated category_id type
CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE GENERATED ALWAYS AS (
        lower(regexp_replace(
            regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        ))
    ) STORED,
    category_id UUID NOT NULL REFERENCES public.categories(id),
    location TEXT NOT NULL,
    description TEXT,
    address JSONB,
    contact_info JSONB,
    social_media JSONB,
    business_hours JSONB,
    services_offered JSONB,
    pricing_details JSONB,
    hero_image_url TEXT,
    gallery_images JSONB,
    amenities JSONB,
    faq JSONB,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    is_super_vendor BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security for vendors
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to vendors
CREATE POLICY "Allow public read access" ON public.vendors
    FOR SELECT USING (true);
