-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    position JSONB -- For storing x,y coordinates if needed for positioning
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all authenticated users
CREATE POLICY "Enable read access for authenticated users" ON comments
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow insert for authenticated users
CREATE POLICY "Enable insert for authenticated users" ON comments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy to allow update for comment creator or admin
CREATE POLICY "Enable update for comment creator or admin" ON comments
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by OR auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
    ));
