-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a sample vendor
DO $$ 
DECLARE
  v_vendor_id uuid;
BEGIN
  -- Insert the vendor
  INSERT INTO vendors (
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
    'Melody Masters Entertainment',
    '051803d5-52fc-4b1d-916d-710c758b9df8', -- Music category UUID
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
  )
  RETURNING id INTO v_vendor_id;

  -- Add services
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

  -- Add pricing details
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

  -- Register vendor authentication
  PERFORM register_vendor(v_vendor_id, 'melodymastersent', 'Welcome2024!');

  -- Output the login credentials
  RAISE NOTICE 'Sample vendor created successfully!';
  RAISE NOTICE 'Login credentials:';
  RAISE NOTICE 'Username: melodymastersent';
  RAISE NOTICE 'Password: Welcome2024!';
  RAISE NOTICE 'Vendor ID: %', v_vendor_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'An error occurred: %', SQLERRM;
END $$;
