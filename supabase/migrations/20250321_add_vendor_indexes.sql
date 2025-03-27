-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS vendors_slug_idx ON vendors (slug);
CREATE INDEX IF NOT EXISTS vendors_category_id_idx ON vendors (category_id);
CREATE INDEX IF NOT EXISTS vendors_location_idx ON vendors (location);
CREATE INDEX IF NOT EXISTS vendors_is_featured_idx ON vendors (is_featured) WHERE is_featured = true;

-- Add GIN indexes for JSONB fields that will be frequently searched
CREATE INDEX IF NOT EXISTS vendors_pricing_tier_idx ON vendors USING GIN (pricing_tier);
CREATE INDEX IF NOT EXISTS vendors_services_offered_idx ON vendors USING GIN (services_offered);
CREATE INDEX IF NOT EXISTS vendors_amenities_idx ON vendors USING GIN (amenities);
