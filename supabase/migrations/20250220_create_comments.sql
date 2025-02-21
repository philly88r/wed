-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section TEXT NOT NULL,
    content TEXT NOT NULL,
    commenter_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', NOW()) NOT NULL,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    position JSONB -- For storing x,y coordinates if needed for positioning
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read comments
CREATE POLICY "Anyone can read comments" ON comments
    FOR SELECT
    USING (true);

-- Create policy to allow anyone to insert comments
CREATE POLICY "Anyone can insert comments" ON comments
    FOR INSERT
    WITH CHECK (true);

-- Create policy to allow anyone to update comments (for resolving)
CREATE POLICY "Anyone can update comments" ON comments
    FOR UPDATE
    USING (true);
