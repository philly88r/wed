-- Add super_vendor field to vendors table
ALTER TABLE public.vendors 
ADD COLUMN is_super_vendor BOOLEAN DEFAULT false,
ADD COLUMN super_vendor_until TIMESTAMPTZ;

-- Create super_vendor_payments table to track payments
CREATE TABLE IF NOT EXISTS public.super_vendor_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    invoice_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add additional fields to vendors table for enhanced profiles
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS services_offered JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS pricing_details JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS amenities TEXT[],
ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS form_submitted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;

-- Create vendor_form_links table to store unique form links for vendors
CREATE TABLE IF NOT EXISTS public.vendor_form_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for super_vendor_payments
ALTER TABLE public.super_vendor_payments ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for vendor_form_links
ALTER TABLE public.vendor_form_links ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage payments
CREATE POLICY "Admins can manage super vendor payments" 
ON public.super_vendor_payments 
FOR ALL 
USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users WHERE auth.email() IN ('admin@example.com')
));

-- Only admins can create form links
CREATE POLICY "Admins can manage vendor form links" 
ON public.vendor_form_links 
FOR ALL 
USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users WHERE auth.email() IN ('admin@example.com')
));

-- Anyone can use a valid form link (for public form access)
CREATE POLICY "Anyone can view unexpired and unused form links" 
ON public.vendor_form_links 
FOR SELECT 
USING (is_used = false AND expires_at > NOW());

-- Add trigger for updating timestamps
CREATE TRIGGER handle_super_vendor_payments_updated_at BEFORE UPDATE
ON public.super_vendor_payments FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Add trigger for updating timestamps for vendor form links
CREATE TRIGGER handle_vendor_form_links_updated_at BEFORE UPDATE
ON public.vendor_form_links FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Add function to check if there's already a super vendor in a category
CREATE OR REPLACE FUNCTION check_super_vendor_category() RETURNS TRIGGER AS $$
BEGIN
    -- If trying to set as super vendor
    IF NEW.is_super_vendor = TRUE THEN
        -- Check if there's already a super vendor in this category with a valid date
        IF EXISTS (
            SELECT 1 FROM public.vendors 
            WHERE category_id = NEW.category_id 
            AND id != NEW.id 
            AND is_super_vendor = TRUE 
            AND (super_vendor_until IS NULL OR super_vendor_until > NOW())
        ) THEN
            RAISE EXCEPTION 'There is already a super vendor in this category';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce one super vendor per category
CREATE TRIGGER enforce_one_super_vendor_per_category
BEFORE INSERT OR UPDATE ON public.vendors
FOR EACH ROW EXECUTE PROCEDURE check_super_vendor_category();

-- Create function to generate a random token for vendor form links
CREATE OR REPLACE FUNCTION generate_random_token(length INTEGER) RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to create a new vendor form link
CREATE OR REPLACE FUNCTION create_vendor_form_link(p_vendor_id UUID, p_email TEXT, p_expires_days INTEGER DEFAULT 30) RETURNS TEXT AS $$
DECLARE
    new_token TEXT;
    link_id UUID;
BEGIN
    -- Generate a unique token
    LOOP
        new_token := generate_random_token(32);
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.vendor_form_links WHERE token = new_token);
    END LOOP;
    
    -- Insert the new link
    INSERT INTO public.vendor_form_links (vendor_id, token, email, expires_at)
    VALUES (p_vendor_id, new_token, p_email, NOW() + (p_expires_days || ' days')::INTERVAL)
    RETURNING id INTO link_id;
    
    -- Return the token
    RETURN new_token;
END;
$$ LANGUAGE plpgsql;
