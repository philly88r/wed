-- Add foreign key constraint from vendors to vendor_categories
ALTER TABLE public.vendors
    ADD CONSTRAINT vendors_category_id_fkey
    FOREIGN KEY (category_id)
    REFERENCES public.vendor_categories(id)
    ON DELETE RESTRICT;
