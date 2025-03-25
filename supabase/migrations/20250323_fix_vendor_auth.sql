-- First, make sure pgcrypto extension is installed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add username and password columns to vendors table if they don't exist
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Create an index on the username column for faster lookups
CREATE INDEX IF NOT EXISTS vendors_username_idx ON vendors(username);

-- Add a function to hash passwords using pgcrypto
CREATE OR REPLACE FUNCTION hash_password(password TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(username TEXT, password TEXT) RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT password_hash INTO stored_hash FROM vendors WHERE vendors.username = verify_password.username;
  RETURN stored_hash = crypt(password, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
