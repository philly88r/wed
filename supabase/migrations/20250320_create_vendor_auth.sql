-- Create vendor authentication table
CREATE TABLE IF NOT EXISTS vendor_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    password_reset_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT fk_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- Create a secure policy for the vendor_auth table
CREATE POLICY "Vendors can only access their own auth data"
    ON vendor_auth
    FOR ALL
    USING (auth.uid() = vendor_id);

-- Enable RLS on the vendor_auth table
ALTER TABLE vendor_auth ENABLE ROW LEVEL SECURITY;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_vendor_auth_updated_at
    BEFORE UPDATE ON vendor_auth
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Create a secure function to register a new vendor
CREATE OR REPLACE FUNCTION register_vendor(
    vendor_id UUID,
    username TEXT,
    password TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_auth_id UUID;
BEGIN
    -- Insert into vendor_auth table with hashed password
    INSERT INTO vendor_auth (
        vendor_id,
        username,
        password_hash
    ) VALUES (
        vendor_id,
        username,
        crypt(password, gen_salt('bf'))
    ) RETURNING id INTO new_auth_id;

    RETURN new_auth_id;
END;
$$;

-- Create a secure function to authenticate a vendor
CREATE OR REPLACE FUNCTION authenticate_vendor(
    input_username TEXT,
    input_password TEXT
)
RETURNS TABLE (
    vendor_id UUID,
    auth_id UUID,
    is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        va.vendor_id,
        va.id as auth_id,
        va.password_hash = crypt(input_password, va.password_hash) as is_valid
    FROM vendor_auth va
    WHERE va.username = input_username
    AND va.is_active = true;
END;
$$;

-- Create a policy to allow vendors to update their own profile
CREATE POLICY "Vendors can update their own profile"
    ON vendors
    FOR UPDATE
    USING (id IN (
        SELECT vendor_id 
        FROM vendor_auth 
        WHERE auth.uid() = vendor_id
    ));
