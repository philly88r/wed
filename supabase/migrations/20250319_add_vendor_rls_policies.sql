-- Enable Row Level Security on vendors table
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to vendors
CREATE POLICY "Public can view vendors" 
ON public.vendors 
FOR SELECT 
USING (true);

-- Policy for vendors to update their own profiles
CREATE POLICY "Vendors can update their own profiles" 
ON public.vendors 
FOR UPDATE 
USING (
    auth.uid() IN (
        SELECT auth.uid() FROM auth.users WHERE auth.email() = (
            SELECT email FROM public.vendor_form_links 
            WHERE vendor_id = public.vendors.id AND is_used = true
        )
    )
);

-- Policy for admins to manage all vendors
CREATE POLICY "Admins can manage all vendors" 
ON public.vendors 
FOR ALL 
USING (
    auth.uid() IN (
        SELECT auth.uid() FROM auth.users WHERE auth.email() IN ('admin@example.com')
    )
);

-- Function to verify a vendor token is valid
CREATE OR REPLACE FUNCTION is_valid_vendor_token(p_vendor_id UUID, p_token TEXT) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.vendor_form_links 
        WHERE vendor_id = p_vendor_id 
        AND token = p_token 
        AND is_used = FALSE 
        AND expires_at > NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Policy for token-based updates (for vendors without accounts)
CREATE POLICY "Token holders can update vendor profiles" 
ON public.vendors 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.vendor_form_links 
        WHERE vendor_id = public.vendors.id 
        AND token = current_setting('app.current_token', true)::TEXT 
        AND is_used = FALSE 
        AND expires_at > NOW()
    )
);
