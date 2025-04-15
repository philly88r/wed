-- Create vendor_access table
CREATE TABLE vendor_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    access_token VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE vendor_access ENABLE ROW LEVEL SECURITY;

-- Allow anyone to verify vendor access (needed for login)
CREATE POLICY "Allow public to verify vendor access"
    ON vendor_access
    FOR SELECT
    USING (true);

-- Insert test vendor access for Purslane Catering
INSERT INTO vendor_access (vendor_id, access_token, password_hash, expires_at)
VALUES (
  '8d3a33d0-c7f6-482c-8518-7d5f6933d57c',  -- Purslane Catering
  'PURSLANE123',                            -- Access token
  '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',  -- Hash for 'password123'
  NOW() + INTERVAL '7 days'
);
