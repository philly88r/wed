-- Function to create a sample vendor with authentication
CREATE OR REPLACE FUNCTION create_sample_vendor()
RETURNS void AS $$
DECLARE
  v_vendor_id uuid := 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  v_temp_password text := 'Welcome2024!';
BEGIN
  -- 1. Create the vendor
  INSERT INTO vendors (
    id,
    name,
    category_id,
    location,
    description,
    contact_info,
    social_media,
    business_hours,
    is_featured,
    is_hidden
  ) VALUES (
    v_vendor_id,
    'Melody Masters Entertainment',
    '051803d5-52fc-4b1d-916d-710c758b9df8',
    'Philadelphia, PA',
    'Professional DJ and live music entertainment services for weddings and special events.',
    jsonb_build_object(
      'email', 'contact@melodymastersent.com',
      'phone', '(215) 555-0123',
      'whatsapp', '12155550123',
      'contact_name', 'John Smith'
    ),
    jsonb_build_object(
      'instagram', '@melodymastersent',
      'facebook', 'melodymastersent',
      'twitter', '@melodymastersent',
      'website', 'https://melodymastersent.com'
    ),
    jsonb_build_object(
      'monday', '9:00 AM - 5:00 PM',
      'tuesday', '9:00 AM - 5:00 PM',
      'wednesday', '9:00 AM - 5:00 PM',
      'thursday', '9:00 AM - 5:00 PM',
      'friday', '9:00 AM - 5:00 PM',
      'saturday', 'By Appointment',
      'sunday', 'By Appointment',
      'notes', 'Available for evening consultations by appointment'
    ),
    true,
    false
  );

  -- 2. Add services
  UPDATE vendors 
  SET services_offered = jsonb_build_array(
    jsonb_build_object(
      'name', 'DJ Services',
      'description', 'Professional DJ services for weddings and events',
      'price_range', jsonb_build_object('min', 800, 'max', 2000, 'currency', 'USD')
    ),
    jsonb_build_object(
      'name', 'Live Band',
      'description', 'Live band performance for your special day',
      'price_range', jsonb_build_object('min', 2500, 'max', 5000, 'currency', 'USD')
    ),
    jsonb_build_object(
      'name', 'Ceremony Music',
      'description', 'Live instrumental music for your ceremony',
      'price_range', jsonb_build_object('min', 500, 'max', 1200, 'currency', 'USD')
    )
  )
  WHERE id = v_vendor_id;

  -- 3. Add pricing details
  UPDATE vendors 
  SET pricing_details = jsonb_build_object(
    'base_price', 800,
    'currency', 'USD',
    'packages', jsonb_build_array(
      jsonb_build_object(
        'name', 'Basic DJ Package',
        'price', 800,
        'description', '4 hours of DJ services, professional sound system, basic lighting',
        'included_services', ARRAY['Professional DJ', 'Sound System', 'Basic Lighting']
      ),
      jsonb_build_object(
        'name', 'Premium DJ Package',
        'price', 1500,
        'description', '6 hours of DJ services, premium sound system, advanced lighting, fog machine',
        'included_services', ARRAY['Professional DJ', 'Premium Sound', 'Advanced Lighting', 'Fog Machine', 'MC Services']
      ),
      jsonb_build_object(
        'name', 'Live Band Package',
        'price', 3500,
        'description', '4 hours of live band performance, includes sound system and lighting',
        'included_services', ARRAY['5-Piece Band', 'Sound System', 'Stage Lighting', 'MC Services']
      )
    )
  )
  WHERE id = v_vendor_id;

  -- 4. Register vendor authentication
  PERFORM register_vendor(v_vendor_id, 'melodymastersent', v_temp_password);
END;
$$ LANGUAGE plpgsql;

-- Create the sample vendor
SELECT create_sample_vendor();
