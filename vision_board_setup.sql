-- Moodboard Database Setup

-- Create a storage bucket for moodboard images
INSERT INTO storage.buckets (id, name, public)
VALUES ('moodboard-images', 'moodboard-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create the moodboards table to store board metadata
CREATE TABLE IF NOT EXISTS moodboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    colors JSONB, -- Store the color palette
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the moodboard_images table to store individual images
CREATE TABLE IF NOT EXISTS moodboard_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moodboard_id UUID REFERENCES moodboards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    storage_path TEXT, -- Path to the image in the storage bucket
    category TEXT NOT NULL,
    source TEXT,
    position INTEGER, -- For ordering images in the board
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies to secure the data
DO $$
BEGIN
    -- Enable RLS on tables if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'moodboards' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE moodboards ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'moodboard_images' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE moodboard_images ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Create policies for moodboards if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'moodboards' 
        AND policyname = 'Users can view their own moodboards'
    ) THEN
        CREATE POLICY "Users can view their own moodboards" 
        ON moodboards FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'moodboards' 
        AND policyname = 'Users can insert their own moodboards'
    ) THEN
        CREATE POLICY "Users can insert their own moodboards" 
        ON moodboards FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'moodboards' 
        AND policyname = 'Users can update their own moodboards'
    ) THEN
        CREATE POLICY "Users can update their own moodboards" 
        ON moodboards FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'moodboards' 
        AND policyname = 'Users can delete their own moodboards'
    ) THEN
        CREATE POLICY "Users can delete their own moodboards" 
        ON moodboards FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
    
    -- Create policies for moodboard_images if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'moodboard_images' 
        AND policyname = 'Users can view their own moodboard images'
    ) THEN
        CREATE POLICY "Users can view their own moodboard images" 
        ON moodboard_images FOR SELECT 
        USING (EXISTS (
            SELECT 1 FROM moodboards
            WHERE moodboards.id = moodboard_images.moodboard_id
            AND moodboards.user_id = auth.uid()
        ));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'moodboard_images' 
        AND policyname = 'Users can insert their own moodboard images'
    ) THEN
        CREATE POLICY "Users can insert their own moodboard images" 
        ON moodboard_images FOR INSERT 
        WITH CHECK (EXISTS (
            SELECT 1 FROM moodboards
            WHERE moodboards.id = moodboard_images.moodboard_id
            AND moodboards.user_id = auth.uid()
        ));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'moodboard_images' 
        AND policyname = 'Users can update their own moodboard images'
    ) THEN
        CREATE POLICY "Users can update their own moodboard images" 
        ON moodboard_images FOR UPDATE 
        USING (EXISTS (
            SELECT 1 FROM moodboards
            WHERE moodboards.id = moodboard_images.moodboard_id
            AND moodboards.user_id = auth.uid()
        ));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'moodboard_images' 
        AND policyname = 'Users can delete their own moodboard images'
    ) THEN
        CREATE POLICY "Users can delete their own moodboard images" 
        ON moodboard_images FOR DELETE 
        USING (EXISTS (
            SELECT 1 FROM moodboards
            WHERE moodboards.id = moodboard_images.moodboard_id
            AND moodboards.user_id = auth.uid()
        ));
    END IF;
    
    -- Create storage policies if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname = 'Public users can read moodboard images'
    ) THEN
        CREATE POLICY "Public users can read moodboard images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'moodboard-images');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname = 'Authenticated users can upload moodboard images'
    ) THEN
        CREATE POLICY "Authenticated users can upload moodboard images"
        ON storage.objects FOR INSERT
        WITH CHECK (
            bucket_id = 'moodboard-images' AND
            auth.role() = 'authenticated'
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname = 'Users can update their own moodboard images'
    ) THEN
        CREATE POLICY "Users can update their own moodboard images"
        ON storage.objects FOR UPDATE
        USING (
            bucket_id = 'moodboard-images' AND
            auth.uid() = owner
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname = 'Users can delete their own moodboard images'
    ) THEN
        CREATE POLICY "Users can delete their own moodboard images"
        ON storage.objects FOR DELETE
        USING (
            bucket_id = 'moodboard-images' AND
            auth.uid() = owner
        );
    END IF;
    
    -- Create public access policy for anonymous users
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'moodboards' 
        AND policyname = 'Allow anonymous access to moodboards'
    ) THEN
        CREATE POLICY "Allow anonymous access to moodboards" 
        ON moodboards FOR SELECT 
        USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'moodboard_images' 
        AND policyname = 'Allow anonymous access to moodboard images'
    ) THEN
        CREATE POLICY "Allow anonymous access to moodboard images" 
        ON moodboard_images FOR SELECT 
        USING (true);
    END IF;
END
$$;

-- Create indexes for better performance if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'moodboards' 
        AND indexname = 'idx_moodboards_user_id'
    ) THEN
        CREATE INDEX idx_moodboards_user_id ON moodboards(user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'moodboard_images' 
        AND indexname = 'idx_moodboard_images_moodboard_id'
    ) THEN
        CREATE INDEX idx_moodboard_images_moodboard_id ON moodboard_images(moodboard_id);
    END IF;
END
$$;

-- Migration query to move data from old 'images' table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'images') THEN
        -- Create a default moodboard for each user if they don't have one already
        INSERT INTO moodboards (user_id, title, description, colors)
        SELECT DISTINCT i.user_id, 'My Wedding Mood Board', 'Inspiration for my wedding', 
               '["#054697", "#FFE8E4", "#FF5C39", "#B8BDD7"]'::jsonb
        FROM images i
        WHERE NOT EXISTS (
            SELECT 1 FROM moodboards v WHERE v.user_id = i.user_id
        );
        
        -- Move images to the new table if they haven't been moved already
        INSERT INTO moodboard_images (moodboard_id, title, description, url, category, source, position)
        SELECT 
            (SELECT id FROM moodboards WHERE user_id = i.user_id LIMIT 1),
            i.title,
            i.description,
            i.url,
            i.category,
            i.source,
            ROW_NUMBER() OVER (PARTITION BY i.user_id ORDER BY i.created_at)
        FROM images i
        WHERE NOT EXISTS (
            -- Skip images that have already been migrated (based on URL)
            SELECT 1 FROM moodboard_images vbi
            JOIN moodboards vb ON vbi.moodboard_id = vb.id
            WHERE vb.user_id = i.user_id AND vbi.url = i.url
        );
    END IF;
    
    -- Also migrate from vision_boards if they exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vision_boards') THEN
        -- Migrate vision boards to moodboards
        INSERT INTO moodboards (user_id, title, description, colors)
        SELECT DISTINCT v.user_id, 'My Wedding Mood Board', v.description, v.colors
        FROM vision_boards v
        WHERE NOT EXISTS (
            SELECT 1 FROM moodboards m WHERE m.user_id = v.user_id
        );
        
        -- Migrate vision board images to moodboard images
        INSERT INTO moodboard_images (moodboard_id, title, description, url, category, source, position)
        SELECT 
            (SELECT id FROM moodboards WHERE user_id = vb.user_id LIMIT 1),
            vbi.title,
            vbi.description,
            vbi.url,
            vbi.category,
            vbi.source,
            vbi.position
        FROM vision_board_images vbi
        JOIN vision_boards vb ON vbi.vision_board_id = vb.id
        WHERE NOT EXISTS (
            -- Skip images that have already been migrated (based on URL)
            SELECT 1 FROM moodboard_images mi
            JOIN moodboards m ON mi.moodboard_id = m.id
            WHERE m.user_id = vb.user_id AND mi.url = vbi.url
        );
    END IF;
END
$$;

-- Verification queries to check the setup
-- SELECT * FROM storage.buckets WHERE name = 'moodboard-images';
-- SELECT * FROM moodboards LIMIT 5;
-- SELECT * FROM moodboard_images LIMIT 5;
