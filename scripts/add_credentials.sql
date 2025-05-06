-- Generate credentials for the new vendors
DO $$
DECLARE
  vendor_record RECORD;
  username_val TEXT;
  password_hash_val TEXT;
BEGIN
  FOR vendor_record IN 
    SELECT id, name, slug FROM vendors 
    WHERE username IS NULL OR username = ''
  LOOP
    -- Generate username from slug
    username_val := vendor_record.slug;
    
    -- Generate password hash
    password_hash_val := crypt(concat(vendor_record.slug, '-', md5(random()::text)), gen_salt('bf', 6));
    
    -- Update the vendor record
    UPDATE vendors 
    SET 
      username = username_val,
      password_hash = password_hash_val
    WHERE id = vendor_record.id;
    
  END LOOP;
END $$;
