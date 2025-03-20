-- Drop the old tables if they exist
DROP TABLE IF EXISTS public.vendor_categories CASCADE;

-- Create the new vendor_categories table with updated structure
CREATE TABLE public.vendor_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE GENERATED ALWAYS AS (
        lower(regexp_replace(
            regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        ))
    ) STORED,
    icon TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security for vendor_categories
ALTER TABLE public.vendor_categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to vendor_categories
CREATE POLICY "Allow public read access" ON public.vendor_categories
    FOR SELECT USING (true);

-- Insert initial category (without slug since it's generated)
INSERT INTO public.vendor_categories (id, name, icon, description, created_at, updated_at) VALUES
('051803d5-52fc-4b1d-916d-710c758b9df8', 'Music', 'music_note', 'DJs, bands, and musicians', '2025-02-21 01:49:18.042914+00', '2025-02-21 01:49:18.042914+00');
