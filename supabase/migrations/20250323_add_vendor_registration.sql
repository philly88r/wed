-- Add reset code fields to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS reset_code VARCHAR(10);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS reset_code_expires_at TIMESTAMPTZ;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_pending_approval BOOLEAN DEFAULT FALSE;

-- Create function to set vendor password
CREATE OR REPLACE FUNCTION set_vendor_password(vendor_username TEXT, vendor_password TEXT) RETURNS VOID AS $$
BEGIN
  UPDATE vendors 
  SET password_hash = hash_password(vendor_password)
  WHERE username = vendor_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
