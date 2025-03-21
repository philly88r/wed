-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS update_pricing_tier ON vendors;
DROP FUNCTION IF EXISTS update_vendor_pricing_tier();

-- Add new JSON columns to vendors table for enhanced profile information
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS services_offered jsonb DEFAULT jsonb_build_array(),

ADD COLUMN IF NOT EXISTS pricing_tier jsonb DEFAULT jsonb_build_object(
  'tier', 'mid_range',
  'price_range', jsonb_build_object('min', 0, 'max', 0, 'currency', 'USD'),
  'deposit_required', jsonb_build_object('percentage', 0, 'amount', 0, 'currency', 'USD'),
  'payment_methods', ARRAY[]::text[],
  'cancellation_policy', ''
),

ADD COLUMN IF NOT EXISTS availability jsonb DEFAULT jsonb_build_object(
  'lead_time_days', 30,
  'peak_season', ARRAY[]::text[],
  'off_peak_season', ARRAY[]::text[],
  'travel_zones', jsonb_build_array(),
  'calendar_sync_enabled', false,
  'calendar_url', null
),

ADD COLUMN IF NOT EXISTS experience jsonb DEFAULT jsonb_build_object(
  'years_in_business', 0,
  'weddings_completed', 0,
  'awards', jsonb_build_array(),
  'certifications', jsonb_build_array(),
  'insurance', jsonb_build_object('has_insurance', false, 'coverage_details', ''),
  'associations', jsonb_build_array(),
  'media_features', jsonb_build_array()
),

ADD COLUMN IF NOT EXISTS portfolio jsonb DEFAULT jsonb_build_object(
  'videos', jsonb_build_array(),
  'photos', jsonb_build_array(),
  'testimonials', jsonb_build_array(),
  'featured_work', jsonb_build_array(),
  'sample_work', jsonb_build_array()
),

ADD COLUMN IF NOT EXISTS customization_options jsonb DEFAULT jsonb_build_object(
  'package_addons', jsonb_build_array(),
  'special_requests_policy', '',
  'cultural_expertise', jsonb_build_array(),
  'multi_day_events', jsonb_build_object('available', false, 'details', ''),
  'equipment', jsonb_build_array()
),

ADD COLUMN IF NOT EXISTS team_info jsonb DEFAULT jsonb_build_object(
  'size', 0,
  'roles', jsonb_build_array(),
  'backup_policy', '',
  'members', jsonb_build_array(),
  'languages', ARRAY[]::text[],
  'dress_code', ''
),

ADD COLUMN IF NOT EXISTS logistics jsonb DEFAULT jsonb_build_object(
  'setup_time_minutes', 0,
  'breakdown_time_minutes', 0,
  'space_requirements', '',
  'technical_requirements', jsonb_build_array(),
  'parking_needs', '',
  'weather_policy', ''
),

ADD COLUMN IF NOT EXISTS collaboration jsonb DEFAULT jsonb_build_object(
  'preferred_vendors', jsonb_build_array(),
  'venue_partnerships', jsonb_build_array(),
  'package_deals', jsonb_build_array(),
  'coordinator_experience', ''
);

-- Create reviews table for customer reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    verified_purchase BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    response_text TEXT,
    response_date TIMESTAMP WITH TIME ZONE
);

-- Create trigger to update reviews.updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- Create index for faster review lookups
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Create a function to update vendor pricing tier
CREATE OR REPLACE FUNCTION update_vendor_pricing_tier()
RETURNS trigger AS $$
BEGIN
  -- Calculate pricing tier based on average package price
  WITH package_stats AS (
    SELECT 
      AVG((p->>'price')::numeric) as avg_price
    FROM jsonb_array_elements(NEW.pricing_details->'packages') p
  )
  SELECT
    CASE
      WHEN avg_price < 1000 THEN 'budget'
      WHEN avg_price < 2500 THEN 'mid_range'
      ELSE 'premium'
    END INTO NEW.pricing_tier->>'tier'
  FROM package_stats;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update pricing tier
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_pricing_tier' 
    AND tgrelid = 'vendors'::regclass
  ) THEN
    CREATE TRIGGER update_pricing_tier
      BEFORE INSERT OR UPDATE OF pricing_details
      ON vendors
      FOR EACH ROW
      EXECUTE FUNCTION update_vendor_pricing_tier();
  END IF;
END $$;

-- Update sample vendor with enhanced profile information
UPDATE vendors 
SET 
  services_offered = jsonb_build_array(
    jsonb_build_object(
      'name', 'DJ Services',
      'description', 'Professional DJ services for weddings and events. Includes state-of-the-art sound system, personalized playlists, and MC services.',
      'price_range', jsonb_build_object('min', 800, 'max', 2000, 'currency', 'USD')
    ),
    jsonb_build_object(
      'name', 'Live Band',
      'description', 'Full live band performance for your special day. Available in various configurations from quartet to full ensemble.',
      'price_range', jsonb_build_object('min', 2500, 'max', 5000, 'currency', 'USD')
    ),
    jsonb_build_object(
      'name', 'Ceremony Music',
      'description', 'Live instrumental music for your ceremony. Perfect for processional, recessional, and ambient ceremony music.',
      'price_range', jsonb_build_object('min', 500, 'max', 1200, 'currency', 'USD')
    )
  ),
  
  pricing_tier = jsonb_build_object(
    'tier', 'mid_range',
    'price_range', jsonb_build_object('min', 800, 'max', 5000, 'currency', 'USD'),
    'deposit_required', jsonb_build_object('percentage', 25, 'amount', 200, 'currency', 'USD'),
    'payment_methods', ARRAY['Credit Card', 'Bank Transfer', 'Cash', 'PayPal'],
    'cancellation_policy', '50% refund up to 30 days before event, no refund after'
  ),
  
  availability = jsonb_build_object(
    'lead_time_days', 60,
    'peak_season', ARRAY['May', 'June', 'July', 'August', 'September', 'October'],
    'off_peak_season', ARRAY['November', 'December', 'January', 'February', 'March', 'April'],
    'travel_zones', jsonb_build_array(
      jsonb_build_object('zone', 'Local', 'radius_miles', 25, 'fee', 0),
      jsonb_build_object('zone', 'Regional', 'radius_miles', 50, 'fee', 100),
      jsonb_build_object('zone', 'Extended', 'radius_miles', 100, 'fee', 200)
    ),
    'calendar_sync_enabled', true,
    'calendar_url', null
  ),
  
  experience = jsonb_build_object(
    'years_in_business', 8,
    'weddings_completed', 250,
    'awards', jsonb_build_array(
      'Best Wedding DJ 2024 - Philadelphia Wedding Awards',
      'Top Entertainment Service 2023 - WeddingWire'
    ),
    'certifications', jsonb_build_array(
      'Certified Wedding DJ - American DJ Association',
      'Professional Sound Engineer - Audio Engineering Society'
    ),
    'insurance', jsonb_build_object(
      'has_insurance', true,
      'coverage_details', 'Full liability coverage up to $2 million'
    ),
    'associations', jsonb_build_array(
      'American DJ Association',
      'Wedding International Professional Association'
    ),
    'media_features', jsonb_build_array(
      'Philadelphia Wedding Magazine - Featured Vendor 2024',
      'The Knot - Best of Weddings 2023'
    )
  ),
  
  portfolio = jsonb_build_object(
    'videos', jsonb_build_array(
      jsonb_build_object(
        'url', 'https://youtube.com/example1',
        'title', 'Sarah & John''s Wedding Highlights',
        'description', 'Beautiful summer wedding at the Philadelphia Museum of Art'
      )
    ),
    'photos', jsonb_build_array(
      jsonb_build_object(
        'url', 'https://example.com/photo1.jpg',
        'caption', 'First dance at the Franklin Institute'
      )
    ),
    'testimonials', jsonb_build_array(
      jsonb_build_object(
        'client_name', 'Sarah & Mike',
        'date', '2024-02-15',
        'rating', 5,
        'text', 'Best DJ ever! Kept everyone dancing all night!',
        'photos', ARRAY['https://example.com/testimonial1.jpg']
      )
    )
  ),
  
  customization_options = jsonb_build_object(
    'package_addons', jsonb_build_array(
      jsonb_build_object(
        'name', 'Extra Hour',
        'price', 200,
        'description', 'Add an extra hour of performance time'
      ),
      jsonb_build_object(
        'name', 'Ceremony Package',
        'price', 400,
        'description', 'Additional setup for ceremony location including wireless microphones'
      )
    ),
    'special_requests_policy', 'We welcome special song requests and can accommodate most genres',
    'cultural_expertise', jsonb_build_array(
      'Indian Weddings',
      'Jewish Celebrations',
      'Latin American Music'
    ),
    'multi_day_events', jsonb_build_object(
      'available', true,
      'details', 'Custom packages available for multi-day celebrations'
    ),
    'equipment', jsonb_build_array(
      'Professional QSC K12.2 Speakers',
      'Pioneer DJ Equipment',
      'Wireless Microphones',
      'LED Dance Floor Lighting'
    )
  ),
  
  team_info = jsonb_build_object(
    'size', 5,
    'roles', jsonb_build_array(
      'Lead DJ',
      'Assistant DJ',
      'Sound Engineer',
      'MC',
      'Setup Technician'
    ),
    'backup_policy', 'Dedicated backup DJ on call for every event',
    'members', jsonb_build_array(
      jsonb_build_object(
        'name', 'John Smith',
        'role', 'Lead DJ',
        'bio', '15 years of experience in wedding entertainment',
        'photo_url', 'https://example.com/john.jpg'
      )
    ),
    'languages', ARRAY['English', 'Spanish'],
    'dress_code', 'Professional black tie attire for all events'
  ),
  
  logistics = jsonb_build_object(
    'setup_time_minutes', 90,
    'breakdown_time_minutes', 60,
    'space_requirements', '10x10 ft minimum for DJ setup, level surface required',
    'technical_requirements', jsonb_build_array(
      '2x 20-amp circuits',
      'Indoor or covered outdoor area',
      'Access to venue 2 hours before event'
    ),
    'parking_needs', 'One dedicated parking space near loading area',
    'weather_policy', 'Covered area required for outdoor events, backup indoor location recommended'
  ),
  
  collaboration = jsonb_build_object(
    'preferred_vendors', jsonb_build_array(
      jsonb_build_object(
        'name', 'Crystal Clear Photography',
        'type', 'Photographer',
        'discount', '10% package discount when booked together'
      )
    ),
    'venue_partnerships', jsonb_build_array(
      jsonb_build_object(
        'venue', 'The Franklin Institute',
        'benefits', 'Preferred vendor, familiar with venue requirements'
      )
    ),
    'package_deals', jsonb_build_array(
      jsonb_build_object(
        'name', 'Complete Entertainment Package',
        'includes', ARRAY['DJ Services', 'Photography', 'Videography'],
        'discount', '15%'
      )
    ),
    'coordinator_experience', 'Worked with all major wedding coordinators in Philadelphia area'
  )
WHERE name = 'Melody Masters Entertainment';
