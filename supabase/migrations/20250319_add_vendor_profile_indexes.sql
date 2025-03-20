-- Add indexes for better performance

-- Index for vendor lookup by category
CREATE INDEX IF NOT EXISTS idx_vendors_category_id ON public.vendors (category_id);

-- Index for vendor lookup by location
CREATE INDEX IF NOT EXISTS idx_vendors_location ON public.vendors (location);

-- Index for super vendor lookup
CREATE INDEX IF NOT EXISTS idx_vendors_is_super_vendor ON public.vendors (is_super_vendor) WHERE is_super_vendor = TRUE;

-- Index for form links lookup by token
CREATE UNIQUE INDEX IF NOT EXISTS idx_vendor_form_links_token ON public.vendor_form_links (token);

-- Index for form links lookup by vendor_id
CREATE INDEX IF NOT EXISTS idx_vendor_form_links_vendor_id ON public.vendor_form_links (vendor_id);

-- Index for form links lookup by expiration
CREATE INDEX IF NOT EXISTS idx_vendor_form_links_expires_at ON public.vendor_form_links (expires_at) WHERE is_used = FALSE;

-- Index for super vendor payments lookup by vendor_id
CREATE INDEX IF NOT EXISTS idx_super_vendor_payments_vendor_id ON public.super_vendor_payments (vendor_id);

-- Index for super vendor payments lookup by status
CREATE INDEX IF NOT EXISTS idx_super_vendor_payments_status ON public.super_vendor_payments (payment_status);
