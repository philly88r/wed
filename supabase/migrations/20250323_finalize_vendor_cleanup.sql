-- First, remove vendors in deprecated categories
DELETE FROM vendors 
WHERE category_id IN (
  SELECT id FROM vendor_categories 
  WHERE name IN ('Photography', 'Planning')
);

-- Then remove the deprecated categories
DELETE FROM vendor_categories 
WHERE name IN ('Photography', 'Planning');

-- Clean up any vendors without proper pricing_details
DELETE FROM vendors 
WHERE pricing_details IS NULL 
   OR pricing_details->>'packages' IS NULL;

-- Ensure all vendors have proper pricing_tier
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
)
WHERE pricing_tier->>'tier' = 'unset' 
   OR pricing_tier->>'avg_price' IS NULL;

-- Verify final vendor counts per category
SELECT 
  vc.name as category,
  COUNT(v.id) as vendor_count,
  jsonb_agg(
    jsonb_build_object(
      'name', v.name,
      'tier', v.pricing_tier->>'tier',
      'avg_price', (v.pricing_tier->>'avg_price')::numeric
    )
  ) as vendors
FROM vendor_categories vc
LEFT JOIN vendors v ON vc.id = v.category_id
GROUP BY vc.name
ORDER BY vc.name;
