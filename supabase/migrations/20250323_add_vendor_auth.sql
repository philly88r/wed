-- Create vendor_access table
CREATE TABLE vendor_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    access_token VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT vendor_access_vendor_id_unique UNIQUE (vendor_id)
);

-- Add RLS policies
ALTER TABLE vendor_access ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read vendor access
CREATE POLICY "Allow authenticated users to read vendor access"
    ON vendor_access
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to create vendor access
CREATE POLICY "Allow authenticated users to create vendor access"
    ON vendor_access
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update their own vendor access
CREATE POLICY "Allow authenticated users to update their own vendor access"
    ON vendor_access
    FOR UPDATE
    TO authenticated
    USING (auth.uid() IN (
        SELECT created_by
        FROM vendors
        WHERE id = vendor_id
    ));
