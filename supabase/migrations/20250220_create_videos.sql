-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    youtube_id TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    category TEXT NOT NULL,
    duration TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Enable read access for authenticated users" ON videos
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert/update/delete for admin users only
CREATE POLICY "Enable admin access for videos" ON videos
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@example.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@example.com');
