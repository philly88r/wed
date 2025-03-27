-- First, clean up existing data
DELETE FROM vendors WHERE pricing_details IS NULL;

-- Update pricing_tier for all vendors
UPDATE vendors
SET pricing_tier = (
  WITH package_stats AS (
    SELECT 
      AVG((p->>'price')::numeric) as avg_price
    FROM jsonb_array_elements(pricing_details->'packages') p
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
    )
  FROM package_stats
);
