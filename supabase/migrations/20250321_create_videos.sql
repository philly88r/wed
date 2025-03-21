-- Drop the table if it exists
DROP TABLE IF EXISTS videos;

-- Create the videos table
CREATE TABLE videos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    youtube_id text NOT NULL,
    thumbnail_url text NOT NULL,
    category text NOT NULL,
    duration text NOT NULL,
    has_journal_prompt boolean DEFAULT false,
    related_feature text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert initial video data
INSERT INTO videos (title, description, youtube_id, thumbnail_url, category, duration, has_journal_prompt, related_feature)
VALUES 
    (
        'Your Why?',
        'Discover the deeper meaning behind your wedding planning journey and how to create a celebration that truly reflects your values.',
        '-0gAzhbt2TM',
        'https://img.youtube.com/vi/-0gAzhbt2TM/maxresdefault.jpg',
        'Getting Started',
        '8:24',
        true,
        null
    ),
    (
        'Let''s Get Started',
        'Begin your wedding planning journey by creating your ideal guest list and organizing your contacts.',
        'dQw4w9WgXcQ',
        'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        'Planning Basics',
        '12:00',
        true,
        'address-book'
    ),
    (
        'Securing Your Vendor Team',
        'Learn how to build your perfect vendor team and manage vendor relationships effectively.',
        'dQw4w9WgXcQ',
        'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        'Vendors',
        '15:00',
        true,
        'vendor-directory'
    ),
    (
        'Dividing Your Day',
        'Master the art of timeline planning to create a perfectly paced wedding day.',
        'dQw4w9WgXcQ',
        'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        'Timeline',
        '13:30',
        true,
        'planning-timeline'
    ),
    (
        'Loose Ends',
        'Address final planning details and reflect on your wedding planning journey.',
        'dQw4w9WgXcQ',
        'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        'Planning Basics',
        '11:45',
        true,
        null
    );

-- Create RLS policies
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
ON videos FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated insert"
ON videos FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update"
ON videos FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
